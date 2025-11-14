import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { ACCESS_TOKEN_KEY } from '../constants/storage';
import type { Mensaje } from '../types';
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
    // Si ya hay una conexión, no crear otra
    if (socketRef.current?.connected) {
      return;
    }

    const token = getAccessToken();
    if (!token) {
      const error = new Error('No hay token de acceso disponible');
      onError?.(error);
      return;
    }

    // Crear conexión Socket.io con autenticación
    const socket = io(API_URL, {
      auth: {
        token: token,
      },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: maxReconnectAttempts,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    // Manejar conexión exitosa
    socket.on('connect', () => {
      reconnectAttemptsRef.current = 0;
      setIsConnected(true);
      
      // Unirse a la sala del match
      socket.emit('join_match', matchId);
    });

    // Manejar desconexión
    socket.on('disconnect', (reason) => {
      setIsConnected(false);
      
      if (reason === 'io server disconnect') {
        // El servidor desconectó, intentar reconectar manualmente
        socket.connect();
      }
    });

    // Manejar errores de conexión
    socket.on('connect_error', async (error) => {
      console.error('Error de conexión Socket:', error);
      
      // Si es error de autenticación, intentar renovar token
      if (error.message.includes('auth') || error.message.includes('token') || error.message.includes('401')) {
        const newToken = await refreshToken();
        
        if (newToken) {
          // Reconectar con el nuevo token
          socket.auth = { token: newToken };
          socket.connect();
        } else {
          reconnectAttemptsRef.current++;
          
          if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
            const authError = new Error('No se pudo autenticar con el servidor');
            onError?.(authError);
          }
        }
      } else {
        reconnectAttemptsRef.current++;
        
        if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
          onError?.(error);
        }
      }
    });

    // Escuchar eventos de mensajes nuevos
    socket.on('nuevo_mensaje', (mensaje: Mensaje) => {
      onNewMessage?.(mensaje);
    });

    // Escuchar confirmación de mensaje enviado
    socket.on('mensaje_enviado', (mensaje: Mensaje) => {
      onNewMessage?.(mensaje);
    });

    // Manejar errores del servidor
    socket.on('error', (error: { message: string }) => {
      console.error('Error del servidor Socket:', error);
      const serverError = new Error(error.message || 'Error del servidor');
      onError?.(serverError);
    });
  }, [matchId, getAccessToken, refreshToken, onNewMessage, onError]);

  useEffect(() => {
    connect();

    // Limpieza al desmontar
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave_match', matchId);
        socketRef.current.removeAllListeners();
        socketRef.current.disconnect();
        socketRef.current = null;
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

