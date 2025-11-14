import api from './api';
import type { NextProfileResponse, SwipeRequest, SwipeResponse, Match, Usuario } from '../types';

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

export const discoverService = {
  // Obtener siguiente perfil para swipe
  getNextProfile: async (): Promise<NextProfileResponse> => {
    const response = await api.get<NextProfileResponse>('/api/discover/next');
    
    // Mapear fotoPerfil a fotoUrl si existe
    if (response.data.estudiante) {
      response.data.estudiante = mapFotoPerfilToFotoUrl(response.data.estudiante);
    }
    
    return response.data;
  },

  // Hacer swipe (like o dislike)
  swipe: async (estudianteId: string, tipo: 'like' | 'dislike'): Promise<SwipeResponse> => {
    const data: SwipeRequest = { estudianteId, tipo };
    const response = await api.post<SwipeResponse>('/api/discover/swipe', data);
    
    // Mapear fotoPerfil a fotoUrl en el matchData si existe
    if (response.data.matchData?.estudiante) {
      response.data.matchData.estudiante = mapFotoPerfilToFotoUrl(response.data.matchData.estudiante);
    }
    
    return response.data;
  },

  // Obtener lista de matches
  getMatches: async (): Promise<Match[]> => {
    const response = await api.get<{ matches: Match[]; total: number }>('/api/discover/matches');
    
    // Mapear fotoPerfil a fotoUrl en cada match
    const matches = response.data.matches.map(match => ({
      ...match,
      estudiante: mapFotoPerfilToFotoUrl(match.estudiante),
    }));
    
    return matches;
  },
};

