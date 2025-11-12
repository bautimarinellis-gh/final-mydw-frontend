import api from './api';
import type { NextProfileResponse, SwipeRequest, SwipeResponse, Match } from '../types';

export const discoverService = {
  // Obtener siguiente perfil para swipe
  getNextProfile: async (): Promise<NextProfileResponse> => {
    const response = await api.get<NextProfileResponse>('/api/discover/next');
    return response.data;
  },

  // Hacer swipe (like o dislike)
  swipe: async (estudianteId: string, tipo: 'like' | 'dislike'): Promise<SwipeResponse> => {
    const data: SwipeRequest = { estudianteId, tipo };
    const response = await api.post<SwipeResponse>('/api/discover/swipe', data);
    return response.data;
  },

  // Obtener lista de matches
  getMatches: async (): Promise<Match[]> => {
    const response = await api.get<{ matches: Match[]; total: number }>('/api/discover/matches');
    return response.data.matches;
  },
};

