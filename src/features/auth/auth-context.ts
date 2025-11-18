import { createContext } from 'react';
import type { Usuario, LoginRequest, RegisterRequest, GoogleLoginRequest } from '../../types';

export interface AuthContextType {
  user: Usuario | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  loginWithGoogle: (googleData: GoogleLoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<Usuario>) => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (user: Usuario | null) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

