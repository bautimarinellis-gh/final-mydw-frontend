/**
 * authService.ts - Servicio de autenticación con login tradicional, registro, OAuth con Google y gestión de sesión.
 * Normaliza campos de imagen del backend (fotoPerfil → fotoUrl) y maneja localStorage.
 */

import axios from 'axios';
import { signInWithPopup } from 'firebase/auth';
import api from './api';
import { ACCESS_TOKEN_KEY, USER_KEY } from '../constants/storage';
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  Usuario,
  GoogleLoginRequest,
} from '../types';
import { auth, googleProvider } from '../config/firebaseClient';

type UsuarioBackend = Omit<Usuario, 'fotoUrl'> & {
  fotoUrl?: string;
  fotoPerfil?: string;
};

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
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/login', credentials);
    const { accessToken, user } = response.data;
    const normalizedUser = normalizeUser(user as UsuarioBackend);
    saveAuthData(accessToken, normalizedUser);
    return { ...response.data, user: normalizedUser };
  },

  register: async (userData: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/api/auth/register', userData);
    const { accessToken, user } = response.data;
    const normalizedUser = normalizeUser(user as UsuarioBackend);
    
    if (accessToken) {
      saveAuthData(accessToken, normalizedUser);
    }
    return { ...response.data, user: normalizedUser };
  },

  logout: async (): Promise<void> => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      clearAuthData();
    }
  },

  refreshToken: async (): Promise<string> => {
    throw new Error('Token refresh deshabilitado');
  },

  getCurrentUser: async (): Promise<Usuario> => {
    try {
      const response = await api.get<{ user: UsuarioBackend }>('/api/auth/me');
      const normalizedUser = normalizeUser(response.data.user);
      
      try {
        localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
      } catch (error) {
        console.error('No se pudo actualizar el usuario en localStorage:', error);
      }
      return normalizedUser;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        const data = error.response.data as { code?: string; message?: string };
        if (data.code === 'ACCOUNT_DEACTIVATED') {
          clearAuthData();
          const deactivatedError = new Error('Tu cuenta ha sido desactivada');
          (deactivatedError as any).code = 'ACCOUNT_DEACTIVATED';
          throw deactivatedError;
        }
      }
      throw error;
    }
  },

  isAuthenticated: (): boolean => {
    return !!getLocalAccessToken();
  },

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

  updateProfile: async (profileData: Partial<Usuario>): Promise<Usuario> => {
    const response = await api.patch<{ user: UsuarioBackend } | UsuarioBackend>('/api/auth/profile', profileData);
    
    let updatedUser: UsuarioBackend;
    if ('user' in response.data && response.data.user) {
      updatedUser = response.data.user;
    } else if (!('user' in response.data)) {
      updatedUser = response.data as UsuarioBackend;
    } else {
      throw new Error('El backend no devolvió datos del usuario actualizado');
    }
    
    const normalizedUser = normalizeUser(updatedUser);
    
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));
    } catch (error) {
      console.error('No se pudo actualizar el usuario en localStorage:', error);
    }
    return normalizedUser;
  },

  uploadProfileImage: async (file: File): Promise<{ user: Usuario; imageUrl: string }> => {
    const formData = new FormData();
    formData.append('image', file);

    const allowedTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Solo se permiten archivos PNG, SVG y JPG');
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new Error('El archivo es demasiado grande. Tamaño máximo: 5MB');
    }

    try {
      const response = await api.post<{ 
        message: string; 
        user: Usuario; 
        imageUrl: string;
      }>('/api/auth/upload-profile-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const normalizedUser = normalizeUser(response.data.user as UsuarioBackend);

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

  deactivateAccount: async (): Promise<void> => {
    try {
      await api.patch('/api/auth/me/deactivate');
    } catch (error) {
      console.error('Error al desactivar cuenta:', error);
      throw error;
    } finally {
      clearAuthData();
    }
  },

  deleteAccount: async (): Promise<void> => {
    try {
      await api.delete('/api/auth/me');
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      throw error;
    } finally {
      clearAuthData();
    }
  },

  loginWithGoogle: async (googleData: GoogleLoginRequest = {}): Promise<AuthResponse> => {
    try {
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          await auth.signOut();
        }
      } catch (signOutError) {
        console.warn('No se pudo cerrar sesión previa de Firebase:', signOutError);
        // Continuar de todas formas
      }
      
      const result = await signInWithPopup(auth, googleProvider);
      const firebaseUser = result.user;

      if (!firebaseUser) {
        throw new Error('No se pudo obtener la cuenta de Google.');
      }

      const idToken = await firebaseUser.getIdToken();

      const displayName = firebaseUser.displayName || '';
      const photoURL = firebaseUser.photoURL || '';
      
      let nombre = '';
      let apellido = '';
      if (displayName) {
        const nameParts = displayName.trim().split(/\s+/);
        nombre = nameParts[0] || '';
        apellido = nameParts.slice(1).join(' ') || '';
      }

      const payload: {
        idToken: string;
        carrera?: string;
        sede?: string;
        edad?: number;
        nombre?: string;
        apellido?: string;
        fotoUrl?: string;
      } = {
        idToken,
      };

      // Agregar datos del formulario si están presentes (para registro)
      if (googleData.carrera) {
        payload.carrera = googleData.carrera;
      }
      if (googleData.sede) {
        payload.sede = googleData.sede;
      }
      if (googleData.edad !== undefined) {
        payload.edad = googleData.edad;
      }

      if (googleData.nombre) {
        payload.nombre = googleData.nombre;
      } else if (nombre) {
        payload.nombre = nombre;
      }

      if (googleData.apellido) {
        payload.apellido = googleData.apellido;
      } else if (apellido) {
        payload.apellido = apellido;
      }

      if (googleData.fotoUrl) {
        payload.fotoUrl = googleData.fotoUrl;
      } else if (photoURL) {
        payload.fotoUrl = photoURL;
      }

      const response = await api.post<AuthResponse>('/api/auth/google', payload);

      const normalizedUser = normalizeUser(response.data.user as UsuarioBackend);
      saveAuthData(response.data.accessToken, normalizedUser);

      return { ...response.data, user: normalizedUser };
    } catch (error: unknown) {
      try {
        await auth.signOut();
      } catch (signOutError) {
        console.warn('No se pudo cerrar sesión en Firebase:', signOutError);
      }
      
      if (error && typeof error === 'object' && 'code' in error && error.code === 'auth/configuration-not-found') {
        throw new Error('La autenticación de Google no está habilitada en Firebase Console. Por favor, habilítala en Authentication > Sign-in method > Google.');
      }
      
      throw error;
    }
  },
};

