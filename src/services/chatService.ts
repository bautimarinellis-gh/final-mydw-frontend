import api from './api';
import type { Conversacion, ConversacionDetalle, EnviarMensajeRequest, Mensaje, Usuario } from '../types';

// Función helper para mapear fotoPerfil a fotoUrl
const mapFotoPerfilToFotoUrl = (user: Usuario | Record<string, unknown>): Usuario => {
  if (!user) return user as Usuario;
  
  const userWithFotoPerfil = user as Usuario & { fotoPerfil?: string; foto?: string; profileImage?: string; avatar?: string };
  
  // Intentar encontrar el campo de imagen con diferentes nombres posibles
  const imageField = userWithFotoPerfil.fotoPerfil || 
                     userWithFotoPerfil.foto || 
                     userWithFotoPerfil.profileImage || 
                     userWithFotoPerfil.avatar ||
                     (user as Record<string, unknown>).fotoPerfil as string ||
                     (user as Record<string, unknown>).foto as string;
  
  if (imageField && !userWithFotoPerfil.fotoUrl) {
    userWithFotoPerfil.fotoUrl = imageField;
  }
  
  return userWithFotoPerfil as Usuario;
};

export const chatService = {
  // Obtener todas las conversaciones del usuario
  getConversaciones: async (): Promise<Conversacion[]> => {
    const response = await api.get<{ conversaciones: Conversacion[] }>('/api/chat/conversaciones');
    
    // Mapear fotoPerfil a fotoUrl en cada conversación
    const conversaciones = response.data.conversaciones.map(conversacion => ({
      ...conversacion,
      usuario: mapFotoPerfilToFotoUrl(conversacion.usuario),
    }));
    
    return conversaciones;
  },

  // Obtener una conversación específica con sus mensajes
  getConversacion: async (matchId: string, limit: number = 50, before?: string): Promise<ConversacionDetalle> => {
    const params: Record<string, string> = { limit: limit.toString() };
    if (before) {
      params.before = before;
    }
    
    const response = await api.get<ConversacionDetalle>(`/api/chat/conversacion/${matchId}`, { params });
    
    // Mapear fotoPerfil a fotoUrl
    response.data.usuario = mapFotoPerfilToFotoUrl(response.data.usuario);
    
    return response.data;
  },

  // Enviar un mensaje
  enviarMensaje: async (data: EnviarMensajeRequest): Promise<Mensaje> => {
    const response = await api.post<{ message: string; mensaje: Mensaje }>('/api/chat/mensaje', data);
    return response.data.mensaje;
  },

  // Marcar mensajes como leídos
  marcarMensajesLeidos: async (matchId: string): Promise<{ message: string; cantidad: number }> => {
    const response = await api.put<{ message: string; cantidad: number }>(`/api/chat/mensajes/leidos/${matchId}`);
    return response.data;
  },
};

