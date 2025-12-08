/**
 * use-chat-socket.ts - Hook para gestionar la conexión WebSocket del chat en tiempo real.
 * Maneja conexión/reconexión automática, renovación de tokens y emisión/recepción de mensajes.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ACCESS_TOKEN_KEY } from '../../constants/storage';
import type { Mensaje } from '../../types';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface UseChatSocketOptions {
  matchId: string;
  onNewMessage?: (mensaje: Mensaje) => void;
  onError?: (error: Error) => void;
}

export const useChatSocket = ({ matchId, onNewMessage, onError }: UseChatSocketOptions) => {
  const socketRef = useRef<Socket | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const [isConnected, setIsConnected] = useState(false);
  const isConnectingRef = useRef(false);
  
  // Usar refs para los callbacks para evitar recrear la conexión
  const onNewMessageRef = useRef(onNewMessage);
  const onErrorRef = useRef(onError);
  
  // Actualizar refs cuando cambian los callbacks
  useEffect(() => {
    onNewMessageRef.current = onNewMessage;
    onErrorRef.current = onError;
  }, [onNewMessage, onError]);

  const getAccessToken = useCallback((): string | null => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      return localStorage.getItem(ACCESS_TOKEN_KEY);
    } catch (error) {
      console.error('No se pudo acceder a localStorage para obtener el token:', error);
      return null;
    }
  }, []);

  const refreshToken = useCallback(async (): Promise<string | null> => {
    try {
      const response = await axios.post(
        `${API_URL}/api/auth/refresh`,
        {},
        {
          withCredentials: true,
        }
      );

      const { accessToken } = response.data;

      if (typeof window !== 'undefined' && accessToken) {
        try {
          localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        } catch (storageError) {
          console.error('No se pudo guardar el nuevo token:', storageError);
        }
      }

      return accessToken;
    } catch (error) {
      console.error('Error al renovar token:', error);
      return null;
    }
  }, []);

  const connect = useCallback(async () => {
    // Si ya hay una conexión activa, no crear otra
    if (socketRef.current?.connected) {
      return;
    }
    
    // Si hay una conexión pendiente o ya se está conectando, esperar
    if (isConnectingRef.current || (socketRef.current && !socketRef.current.disconnected)) {
      return;
    }
    
    isConnectingRef.current = true;

    // Obtener token y verificar si está expirado
    let token = getAccessToken();
    
    // Si no hay token, intentar renovarlo
    if (!token) {
      console.log('[Socket] No hay token, intentando renovar...');
      token = await refreshToken();
      
      if (!token) {
        isConnectingRef.current = false;
        const error = new Error('No hay token de acceso disponible. Por favor, inicia sesión nuevamente.');
        onErrorRef.current?.(error);
        return;
      }
    }


    // Crear conexión Socket.io con autenticación
    // El backend espera el token en query string o en headers Authorization
    // Intentar WebSocket primero, con fallback a polling si falla
    const socket = io(API_URL, {
      query: {
        token: token,
      },
      transports: ['websocket', 'polling'], // Intentar WebSocket, fallback a polling
      upgrade: true, // Permitir upgrade de polling a WebSocket
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      // Configuración adicional
      forceNew: false, // Reutilizar conexión si existe
      timeout: 20000, // Timeout más largo para conexiones
    });

    socketRef.current = socket;

    // Manejar conexión exitosa
    socket.on('connect', () => {
      reconnectAttemptsRef.current = 0;
      isConnectingRef.current = false;
      setIsConnected(true);
      console.log(`[Socket] Conectado exitosamente. Transporte: ${socket.io.engine.transport.name}`);
    });

    // Manejar desconexión
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar manualmente
        socket.connect();
      }
    });

    // Actualizar token en cada intento de reconexión
    socket.io.on('reconnect_attempt', () => {
      const currentToken = getAccessToken();
      if (currentToken) {
        socket.io.opts.query = { token: currentToken };
      }
    });

    // Manejar errores de conexión
    socket.on('connect_error', async (error) => {
      console.error('Error de conexión Socket:', error);
      
      // Si es error de autenticación, intentar renovar token
      if (error.message.includes('auth') || error.message.includes('token') || error.message.includes('401') || error.message.includes('Unauthorized')) {
        console.log('[Socket] Error de autenticación, intentando renovar token...');
        const newToken = await refreshToken();
        
        if (newToken) {
          // Actualizar el token en la query string y reconectar
          socket.io.opts.query = { token: newToken };
          socket.disconnect();
          socketRef.current = null;
          isConnectingRef.current = false;
          
          // Esperar un momento antes de reconectar
          setTimeout(() => {
            connect();
          }, 1000);
        } else {
          reconnectAttemptsRef.current++;
          console.error('[Socket] No se pudo renovar el token');
          
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            isConnectingRef.current = false;
            const authError = new Error('No se pudo autenticar con el servidor. Por favor, inicia sesión nuevamente.');
            onErrorRef.current?.(authError);
          }
        }
      } else {
        reconnectAttemptsRef.current++;
        
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          isConnectingRef.current = false;
          onErrorRef.current?.(error);
        }
      }
    });

    // Escuchar eventos de mensajes nuevos (corregido: el backend emite 'mensaje:nuevo')
    socket.on('mensaje:nuevo', (mensaje: Mensaje) => {
      onNewMessageRef.current?.(mensaje);
    });

    // Manejar errores del servidor
    socket.on('error', (error: { message: string }) => {
      console.error('Error del servidor Socket:', error);
      const serverError = new Error(error.message || 'Error del servidor');
      onErrorRef.current?.(serverError);
    });
  }, [getAccessToken, refreshToken]);

  useEffect(() => {
    // Solo conectar si no hay conexión activa
    if (!socketRef.current?.connected && !isConnectingRef.current) {
      connect();
    }

    // Limpieza al desmontar o cuando cambia el matchId
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
        isConnectingRef.current = false;
        setIsConnected(false);
      }
    };
  }, [matchId, connect]);

  // Función para enviar mensaje vía WebSocket (opcional, ya que también se puede usar HTTP)
  const sendMessage = useCallback((contenido: string, destinatarioId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('enviar_mensaje', {
        matchId,
        destinatarioId,
        contenido,
      });
    }
  }, [matchId]);

  return {
    socket: socketRef.current,
    isConnected,
    sendMessage,
  };
};

