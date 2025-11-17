import axios from 'axios';
import api from './api';
import { ACCESS_TOKEN_KEY, USER_KEY } from '../constants/storage';
import type { LoginRequest, RegisterRequest, AuthResponse, Usuario } from '../types';

// Tipo para representar el usuario tal como viene del backend (puede tener fotoPerfil)
type UsuarioBackend = Omit<Usuario, 'fotoUrl'> & {
  fotoUrl?: string;
  fotoPerfil?: string;
};

// Función helper para normalizar el usuario del backend al formato del frontend
const normalizeUser = (user: UsuarioBackend): Usuario => {
  return {
    ...user,
    fotoUrl: user.fotoUrl || user.fotoPerfil,
  };
};

const saveAuthData = (accessToken: string, user: Usuario) => {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    // refreshToken se maneja mediante cookies HTTP-only del backend
  } catch (error) {
    console.error('No se pudo guardar la sesión en localStorage:', error);
  }
};

const clearAuthData = () => {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // refreshToken se limpia automáticamente cuando el backend elimina la cookie
  } catch (error) {
    console.error('No se pudo limpiar la sesión en localStorage:', error);
  }
};

const getLocalAccessToken = (): string | null => {
  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('No se pudo leer el token desde localStorage:', error);
    return null;
  }
};

export const authService = {
  // Iniciar sesión
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    const { accessToken, user } = response.data;
    
    // Normalizar usuario del backend al formato del frontend
    const normalizedUser = normalizeUser(user as UsuarioBackend);
    
    // refreshToken se guarda automáticamente en cookie HTTP-only por el backend
    saveAuthData(accessToken, normalizedUser);
    return { ...response.data, user: normalizedUser };
  },

  // Registrar nuevo usuario
  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    // Guardar accessToken si el backend lo devuelve en el registro
    // refreshToken se guarda automáticamente en cookie HTTP-only por el backend
    const { accessToken, user } = response.data;
    
    // Normalizar usuario del backend al formato del frontend
    const normalizedUser = normalizeUser(user as UsuarioBackend);
    
    if (accessToken) {
      saveAuthData(accessToken, normalizedUser);
    }
    return { ...response.data, user: normalizedUser };
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearAuthData();
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
    const response = await api.get<{ user: UsuarioBackend }>('/api/auth/me');
    
    // Normalizar usuario del backend al formato del frontend
    const normalizedUser = normalizeUser(response.data.user);
    
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } catch (error) {
      console.error('No se pudo actualizar el usuario en localStorage:', error);
    }
    return normalizedUser;
  },

  // Verificar si el usuario está autenticado
  isAuthenticated: (): boolean => {
    return !!getLocalAccessToken();
  },

  // Obtener usuario desde localStorage
  getLocalUser: (): Usuario | null => {
    let userStr: string | null = null;

    try {
      userStr = localStorage.getItem(USER_KEY);
    } catch (error) {
      console.error('No se pudo leer el usuario desde localStorage:', error);
      return null;
    }

    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  // Actualizar perfil del usuario
  updateProfile: async (profileData: Partial<Usuario>): Promise<Usuario> => {
    const response = await api.patch<{ user: UsuarioBackend } | UsuarioBackend>('/api/auth/profile', profileData);
    
    // Manejar diferentes estructuras de respuesta
    let updatedUser: UsuarioBackend;
    if ('user' in response.data && response.data.user) {
      updatedUser = response.data.user;
    } else if (!('user' in response.data)) {
      updatedUser = response.data as UsuarioBackend;
    } else {
      throw new Error('El backend no devolvió datos del usuario actualizado');
    }
    
    // Normalizar usuario del backend al formato del frontend
    const normalizedUser = normalizeUser(updatedUser);
    
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } catch (error) {
      console.error('No se pudo actualizar el usuario en localStorage:', error);
    }
    return normalizedUser;
  },

  // Subir imagen de perfil
  uploadProfileImage: async (file: File): Promise<{ user: Usuario; imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten archivos PNG, SVG y JPG');
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Tamaño máximo: 5MB');
    }

    try {
      const response = await api.post<{ 
        message: string; 
        user: Usuario; 
        imageUrl: string;
        // El backend puede devolver fotoPerfil en lugar de fotoUrl en el objeto user
      }>('/api/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Normalizar usuario del backend al formato del frontend
      const normalizedUser = normalizeUser(response.data.user as UsuarioBackend);

      // Actualizar usuario en localStorage
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      } catch (error) {
        console.error('No se pudo actualizar el usuario en localStorage:', error);
      }

      return {
        user: normalizedUser,
        imageUrl: response.data.imageUrl || normalizedUser.fotoUrl || '',
      };
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || 'Error al subir la imagen');
      }
      throw error;
    }
  },
};

