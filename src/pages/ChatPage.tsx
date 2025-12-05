import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { chatService, authService } from '../services';
import { useChatSocket } from '../features/chat';
import { getProfileImageUrl } from '../utils/image';
import { getErrorMessage } from '../utils/error';
import { ArrowLeftIcon, LoadingSpinner } from '../components';
import type { Mensaje, ConversacionDetalle } from '../types';
import './ChatPage.css';

const ChatPage = () => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  
  const [conversacion, setConversacion] = useState<ConversacionDetalle | null>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [mensajesOptimistas, setMensajesOptimistas] = useState<Map<string, Mensaje>>(new Map());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mensajeTexto, setMensajeTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  
  const mensajesContainerRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number>(0);
  const isScrollingUpRef = useRef(false);
  const currentUserId = authService.getLocalUser()?.id;

  // Cargar conversación inicial
  useEffect(() => {
    if (!matchId) {
      setError('ID de conversación no válido');
      setLoading(false);
      return;
    }

    const loadConversacion = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await chatService.getConversacion(matchId);
        setConversacion(data);
        setMensajes(data.mensajes);
        setHasMore(data.mensajes.length < data.total);
        
        // Marcar mensajes como leídos
        await chatService.marcarMensajesLeidos(matchId);
      } catch (err: unknown) {
        console.error('Error al cargar conversación:', err);
        const errorMessage = getErrorMessage(err, 'No se pudo cargar la conversación');
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadConversacion();
  }, [matchId]);

  // Scroll al final cuando se cargan mensajes iniciales o se envía/recibe uno nuevo
  useEffect(() => {
    if (!loading && mensajesContainerRef.current && !isScrollingUpRef.current) {
      const container = mensajesContainerRef.current;
      container.scrollTop = container.scrollHeight;
    }
  }, [loading, mensajes]);

  // Manejar nuevos mensajes desde WebSocket
  const handleNewMessage = useCallback((mensaje: Mensaje) => {
    // Verificar si el mensaje es para esta conversación
    if (mensaje.matchId !== matchId) {
      return;
    }

    // Verificar si ya existe (evitar duplicados)
    // Usar función de actualización para tener acceso al estado más reciente
    setMensajes(prev => {
      const existe = prev.some(m => m.id === mensaje.id);
      
      if (existe) {
        // Actualizar mensaje existente (por si cambió el estado de leído, etc.)
        const actualizados = prev.map(m => m.id === mensaje.id ? mensaje : m);
        // Reordenar después de actualizar
        return actualizados.sort((a, b) => {
          const timeA = typeof a.createdAt === 'string' 
            ? new Date(a.createdAt).getTime()
            : a.createdAt.getTime();
          const timeB = typeof b.createdAt === 'string' 
            ? new Date(b.createdAt).getTime()
            : b.createdAt.getTime();
          return timeA - timeB;
        });
      } else {
        // Agregar nuevo mensaje y ordenar por timestamp
        const nuevos = [...prev, mensaje];
        return nuevos.sort((a, b) => {
          const timeA = typeof a.createdAt === 'string' 
            ? new Date(a.createdAt).getTime()
            : a.createdAt.getTime();
          const timeB = typeof b.createdAt === 'string' 
            ? new Date(b.createdAt).getTime()
            : b.createdAt.getTime();
          return timeA - timeB;
        });
      }
    });
    
    // Si era un mensaje optimista, removerlo
    setMensajesOptimistas(prev => {
      const nuevo = new Map(prev);
      nuevo.delete(mensaje.id);
      return nuevo;
    });

    // Marcar como leído si es un mensaje recibido
    if (mensaje.destinatarioId === currentUserId && !mensaje.leido) {
      chatService.marcarMensajesLeidos(matchId!);
    }
  }, [matchId, currentUserId]);

  // Manejar errores de WebSocket
  const handleSocketError = useCallback((error: Error) => {
    console.error('Error de WebSocket:', error);
    // No mostrar error al usuario a menos que sea crítico
  }, []);

  // Configurar WebSocket
  useChatSocket({
    matchId: matchId || '',
    onNewMessage: handleNewMessage,
    onError: handleSocketError,
  });

  // Cargar más mensajes antiguos (scroll infinito)
  const loadMoreMessages = useCallback(async () => {
    if (!matchId || loadingMore || !hasMore) return;

    const mensajeMasAntiguo = mensajes[0];
    if (!mensajeMasAntiguo) return;

    try {
      setLoadingMore(true);
      const before = typeof mensajeMasAntiguo.createdAt === 'string' 
        ? mensajeMasAntiguo.createdAt 
        : mensajeMasAntiguo.createdAt.toISOString();
      
      const data = await chatService.getConversacion(matchId, 50, before);
      
      if (data.mensajes.length === 0) {
        setHasMore(false);
        return;
      }

      // Guardar posición del scroll antes de agregar mensajes
      if (mensajesContainerRef.current) {
        scrollPositionRef.current = mensajesContainerRef.current.scrollHeight;
      }

      // Agregar mensajes antiguos al inicio
      setMensajes(prev => [...data.mensajes, ...prev]);
      setHasMore(data.mensajes.length + mensajes.length < data.total);
    } catch (err: unknown) {
      console.error('Error al cargar más mensajes:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [matchId, mensajes, loadingMore, hasMore]);

  // Manejar scroll para detectar cuando cargar más mensajes
  const handleScroll = useCallback(() => {
    if (!mensajesContainerRef.current) return;

    const container = mensajesContainerRef.current;
    const scrollTop = container.scrollTop;
    
    // Detectar si el usuario está haciendo scroll hacia arriba
    isScrollingUpRef.current = scrollTop < 100;

    // Si está cerca del top y hay más mensajes, cargar más
    if (scrollTop < 100 && hasMore && !loadingMore) {
      loadMoreMessages();
    }
  }, [hasMore, loadingMore, loadMoreMessages]);

  // Restaurar posición del scroll después de cargar mensajes antiguos
  useEffect(() => {
    if (loadingMore === false && scrollPositionRef.current > 0 && mensajesContainerRef.current) {
      const container = mensajesContainerRef.current;
      const newScrollHeight = container.scrollHeight;
      const scrollDifference = newScrollHeight - scrollPositionRef.current;
      container.scrollTop = scrollDifference;
      scrollPositionRef.current = 0;
    }
  }, [loadingMore, mensajes]);

  // Enviar mensaje
  const handleEnviarMensaje = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matchId || !mensajeTexto.trim() || enviando || !conversacion) return;

    const contenido = mensajeTexto.trim();
    setMensajeTexto('');
    setEnviando(true);

    // Crear mensaje optimista
    const mensajeOptimista: Mensaje = {
      id: `temp-${Date.now()}`,
      contenido,
      remitenteId: currentUserId || '',
      destinatarioId: conversacion.usuario.id,
      matchId,
      leido: false,
      createdAt: new Date().toISOString(),
    };

    // Agregar mensaje optimista
    setMensajesOptimistas(prev => {
      const nuevo = new Map(prev);
      nuevo.set(mensajeOptimista.id, mensajeOptimista);
      return nuevo;
    });
    setMensajes(prev => {
      const nuevos = [...prev, mensajeOptimista];
      // Ordenar por timestamp
      return nuevos.sort((a, b) => {
        const timeA = typeof a.createdAt === 'string' 
          ? new Date(a.createdAt).getTime()
          : a.createdAt.getTime();
        const timeB = typeof b.createdAt === 'string' 
          ? new Date(b.createdAt).getTime()
          : b.createdAt.getTime();
        return timeA - timeB;
      });
    });

    try {
      const mensajeEnviado = await chatService.enviarMensaje({
        matchId,
        destinatarioId: conversacion.usuario.id,
        contenido,
      });

      // Reemplazar mensaje optimista con el mensaje real
      setMensajesOptimistas(prev => {
        const nuevo = new Map(prev);
        nuevo.delete(mensajeOptimista.id);
        return nuevo;
      });
      setMensajes(prev => {
        const actualizados = prev.map(m => 
          m.id === mensajeOptimista.id ? mensajeEnviado : m
        );
        // Reordenar después de reemplazar
        return actualizados.sort((a, b) => {
          const timeA = typeof a.createdAt === 'string' 
            ? new Date(a.createdAt).getTime()
            : a.createdAt.getTime();
          const timeB = typeof b.createdAt === 'string' 
            ? new Date(b.createdAt).getTime()
            : b.createdAt.getTime();
          return timeA - timeB;
        });
      });
    } catch (err: unknown) {
      console.error('Error al enviar mensaje:', err);
      
      // Remover mensaje optimista en caso de error
      setMensajesOptimistas(prev => {
        const nuevo = new Map(prev);
        nuevo.delete(mensajeOptimista.id);
        return nuevo;
      });
      setMensajes(prev => prev.filter(m => m.id !== mensajeOptimista.id));
      
      // Mostrar error
      const errorMessage = getErrorMessage(err, 'No se pudo enviar el mensaje');
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setEnviando(false);
    }
  };

  // Obtener iniciales para foto
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  };

  // Formatear fecha del mensaje
  const formatMessageTime = (date: string | Date) => {
    const fecha = typeof date === 'string' ? new Date(date) : date;
    const ahora = new Date();
    const diffMs = ahora.getTime() - fecha.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins}m`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    
    return fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' });
  };

  if (loading) {
    return (
      <div className="chat-page">
        <div className="chat-loading">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error && !conversacion) {
    return (
      <div className="chat-page">
        <div className="chat-error">
          <p>{error}</p>
          <button onClick={() => navigate('/matches')} className="chat-error-button">
            Volver a Matches
          </button>
        </div>
      </div>
    );
  }

  if (!conversacion) {
    return null;
  }

  const { usuario } = conversacion;
  // Eliminar duplicados por ID para evitar keys duplicadas en React
  const mensajesUnicos = Array.from(
    new Map(mensajes.map(m => [m.id, m])).values()
  );
  const todosLosMensajes = mensajesUnicos;

  return (
    <div className="chat-page">
      {/* Header */}
      <header className="chat-header">
        <button 
          className="chat-back-button"
          onClick={() => navigate('/matches')}
          aria-label="Volver"
        >
          <ArrowLeftIcon size={24} color="currentColor" />
        </button>
        
        <div className="chat-header-user">
          {usuario.fotoUrl ? (
            <img
              src={getProfileImageUrl(usuario.fotoUrl) || ''}
              alt={`${usuario.nombre} ${usuario.apellido}`}
              className="chat-header-avatar"
            />
          ) : (
            <div className="chat-header-avatar chat-header-avatar-initials">
              {getInitials(usuario.nombre, usuario.apellido)}
            </div>
          )}
          <div className="chat-header-info">
            <h2 className="chat-header-name">
              {usuario.nombre} {usuario.apellido}
            </h2>
          </div>
        </div>
      </header>

      {/* Mensajes */}
      <div 
        className="chat-messages"
        ref={mensajesContainerRef}
        onScroll={handleScroll}
      >
        {loadingMore && (
          <div className="chat-loading-more">
            <LoadingSpinner />
          </div>
        )}
        
        {todosLosMensajes.length === 0 ? (
          <div className="chat-empty">
            <p>No hay mensajes aún. ¡Envía el primero!</p>
          </div>
        ) : (
          todosLosMensajes.map((mensaje) => {
            const esMio = mensaje.remitenteId === currentUserId;
            const esOptimista = mensajesOptimistas.has(mensaje.id);
            
            return (
              <div
                key={mensaje.id}
                className={`chat-message ${esMio ? 'chat-message-own' : 'chat-message-received'} ${esOptimista ? 'chat-message-optimistic' : ''}`}
              >
                <div className="chat-message-bubble">
                  <p className="chat-message-text">{mensaje.contenido}</p>
                  <span className="chat-message-time">
                    {formatMessageTime(mensaje.createdAt)}
                    {esMio && (
                      <span className="chat-message-status">
                        {mensaje.leido ? '✓✓' : '✓'}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Error temporal */}
      {error && (
        <div className="chat-error-banner">
          {error}
        </div>
      )}

      {/* Input de mensaje */}
      <form className="chat-input-container" onSubmit={handleEnviarMensaje}>
        <input
          type="text"
          className="chat-input"
          placeholder="Escribe un mensaje..."
          value={mensajeTexto}
          onChange={(e) => setMensajeTexto(e.target.value)}
          disabled={enviando}
        />
        <button
          type="submit"
          className="chat-send-button"
          disabled={!mensajeTexto.trim() || enviando}
          aria-label="Enviar mensaje"
        >
          {enviando ? (
            <LoadingSpinner />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </form>
    </div>
  );
};

export default ChatPage;

