/**
 * discoverService.ts - Servicio para descubrir perfiles, hacer swipe (like/dislike) y obtener matches/likes.
 * Incluye sistema de filtros opcionales y normalización de imágenes de perfil.
 */

import api from './api';
import type { NextProfileResponse, SwipeRequest, SwipeResponse, Match, Usuario } from '../types';

type LikeHistoryItem = {
  id: string;
  createdAt: string;
  estudiante: Usuario;
};

type DiscoverFilters = {
  sede?: string;
  carrera?: string;
  interes?: string;
  q?: string;
  edadMin?: string;
  edadMax?: string;
};

const mapFotoPerfilToFotoUrl = (user: Usuario | Record<string, unknown>): Usuario => {
  if (!user) return user as Usuario;
  
  const userWithFotoPerfil = user as Usuario & { fotoPerfil?: string; foto?: string; profileImage?: string; avatar?: string };
  
  const imageField =
    userWithFotoPerfil.fotoPerfil ||
    userWithFotoPerfil.foto ||
    userWithFotoPerfil.profileImage ||
    userWithFotoPerfil.avatar ||
    (user as any).fotoPerfil ||
    (user as any).foto;

  if (imageField && !userWithFotoPerfil.fotoUrl) {
    userWithFotoPerfil.fotoUrl = imageField;
  }
  
  return userWithFotoPerfil as Usuario;
};

type FilterOptionsResponse = {
  carreras: string[];
  sedes: string[];
};

export const discoverService = {
  // Obtener siguiente perfil para swipe
  getNextProfile: async (filters?: DiscoverFilters): Promise<NextProfileResponse> => {
    const params = new URLSearchParams();

    if (filters) {
      if (filters.sede) params.append('sede', filters.sede);
      if (filters.carrera) params.append('carrera', filters.carrera);
      if (filters.interes) params.append('interes', filters.interes);
      if (filters.q) params.append('q', filters.q);
      if (filters.edadMin) params.append('edadMin', filters.edadMin);
      if (filters.edadMax) params.append('edadMax', filters.edadMax);
    }

    const query = params.toString();
    const url = query ? `/api/discover/next?${query}` : '/api/discover/next';

    const response = await api.get<NextProfileResponse>(url);

    if (response.data.estudiante) {
      response.data.estudiante = mapFotoPerfilToFotoUrl(response.data.estudiante);
    }

    return response.data;
  },

  getFilterOptions: async (): Promise<FilterOptionsResponse> => {
    const response = await api.get<FilterOptionsResponse>('/api/discover/filters');
    return response.data;
  },

  swipe: async (estudianteId: string, tipo: 'like' | 'dislike'): Promise<SwipeResponse> => {
    const data: SwipeRequest = { estudianteId, tipo };
    const response = await api.post<SwipeResponse>('/api/discover/swipe', data);

    if (response.data.matchData?.estudiante) {
      response.data.matchData.estudiante = mapFotoPerfilToFotoUrl(response.data.matchData.estudiante);
    }

    return response.data;
  },

  getMatches: async (): Promise<Match[]> => {
    const response = await api.get<{ matches: Match[]; total: number }>('/api/discover/matches');

    const matches = response.data.matches.map(match => ({
      ...match,
      estudiante: mapFotoPerfilToFotoUrl(match.estudiante),
    }));

    return matches;
  },

  getLikeHistory: async (): Promise<LikeHistoryItem[]> => {
    const response = await api.get<{ likes: LikeHistoryItem[]; total: number }>('/api/discover/likes');

    return response.data.likes.map(item => ({
      ...item,
      estudiante: mapFotoPerfilToFotoUrl(item.estudiante),
    }));
  },
};
