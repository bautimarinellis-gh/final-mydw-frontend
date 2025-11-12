import type { Usuario } from './usuario';
import type { Match } from './match';

export interface SwipeRequest {
  estudianteId: string;
  tipo: 'like' | 'dislike';
}

export interface SwipeResponse {
  message: string;
  match: boolean;
  matchData?: Match;
}

export interface NextProfileResponse {
  estudiante: Usuario | null;
  message?: string;
}

