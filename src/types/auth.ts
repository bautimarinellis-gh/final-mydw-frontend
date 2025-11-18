import type { Usuario } from './usuario';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  descripcion?: string;
  carrera: string;
  sede: string;
  edad: number;
  intereses?: string[];
}

export interface GoogleLoginRequest {
  carrera?: string;
  sede?: string;
  edad?: number;
  nombre?: string;
  apellido?: string;
  fotoUrl?: string;
}

export interface AuthResponse {
  message: string;
  accessToken: string;
  refreshToken?: string;
  user: Usuario;
}

