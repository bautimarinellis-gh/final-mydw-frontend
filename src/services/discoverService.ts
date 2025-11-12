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
    console.log('mapFotoPerfilToFotoUrl - Mapeado campo de imagen a fotoUrl:', userWithFotoPerfil.fotoUrl);
  } else if (!imageField && !userWithFotoPerfil.fotoUrl) {
    console.log('mapFotoPerfilToFotoUrl - No se encontró ningún campo de imagen');
  }
  
  return userWithFotoPerfil as Usuario;
};

export const discoverService = {
  // Obtener siguiente perfil para swipe
  getNextProfile: async (): Promise<NextProfileResponse> => {
    const response = await api.get<NextProfileResponse>('/api/discover/next');
    
    console.log('getNextProfile - Respuesta completa del backend:', JSON.stringify(response.data, null, 2));
    
    // Mapear fotoPerfil a fotoUrl si existe
    if (response.data.estudiante) {
      console.log('getNextProfile - Estudiante antes del mapeo:', JSON.stringify(response.data.estudiante, null, 2));
      console.log('getNextProfile - Campos del estudiante:', Object.keys(response.data.estudiante));
      
      // Verificar todos los campos posibles relacionados con foto
      const estudiante = response.data.estudiante as unknown as Record<string, unknown>;
      console.log('getNextProfile - Todos los campos del estudiante:');
      Object.keys(estudiante).forEach(key => {
        console.log(`  ${key}:`, estudiante[key]);
      });
      
      response.data.estudiante = mapFotoPerfilToFotoUrl(response.data.estudiante);
      console.log('getNextProfile - Estudiante después del mapeo:', JSON.stringify(response.data.estudiante, null, 2));
      console.log('getNextProfile - fotoUrl final:', response.data.estudiante.fotoUrl);
    } else {
      console.log('getNextProfile - No hay estudiante en la respuesta');
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

