import api from './api';
import type { LoginRequest, RegisterRequest, AuthResponse, Usuario } from '../types';

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    // Token deshabilitado - no se guarda
    // const { accessToken, user } = response.data;
    // localStorage.setItem('accessToken', accessToken);
    // localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  // Registrar nuevo usuario
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    // Token deshabilitado - no se guarda
    // const { accessToken, user } = response.data;
    // localStorage.setItem('accessToken', accessToken);
    // localStorage.setItem('user', JSON.stringify(user));
    return response.data;
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Token deshabilitado - no se limpia localStorage
      // localStorage.removeItem('accessToken');
      // localStorage.removeItem('user');
    }
  },

  // Refrescar token - DESHABILITADO
  refreshToken: async (): Promise<string> => {
    // const response = await api.post<{ accessToken: string }>('/api/auth/refresh');
    // const { accessToken } = response.data;
    // localStorage.setItem('accessToken', accessToken);
    // return accessToken;
    throw new Error('Token refresh deshabilitado');
  },

  // Obtener usuario actual desde el backend
  getCurrentUser: async (): Promise<Usuario> => {
    const response = await api.get<{ user: Usuario }>('/api/auth/me');
    return response.data.user;
  },

  // Verificar si el usuario está autenticado - DESHABILITADO
  isAuthenticated: (): boolean => {
    // return !!localStorage.getItem('accessToken');
    return true; // Siempre retorna true ya que no hay validación de token
  },

  // Obtener usuario desde localStorage
  getLocalUser: (): Usuario | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },
};

