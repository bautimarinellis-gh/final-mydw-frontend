import { useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../../services';
import type { Usuario, LoginRequest, RegisterRequest, GoogleLoginRequest } from '../../types';
import { AuthContext } from './auth-context';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<Usuario | null>(() => {
    // Inicializar usuario desde localStorage
    return authService.getLocalUser();
  });
  const [isLoading, setIsLoading] = useState(false);

  const isAuthenticated = !!user && authService.isAuthenticated();

  // Función para actualizar usuario desde el backend
  const refreshUser = useCallback(async () => {
    try {
      setIsLoading(true);
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
    } catch (error: unknown) {
      console.error('Error al actualizar usuario:', error);
      
      // Si la cuenta está desactivada, limpiar sesión
      const errorCode = (error as any)?.code;
      if (errorCode === 'ACCOUNT_DEACTIVATED') {
        console.warn('Cuenta desactivada detectada, limpiando sesión');
        setUser(null);
        return;
      }
      
      // Si hay error al obtener usuario, probablemente el token expiró
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de login
  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.login(credentials);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de registro
  const register = useCallback(async (userData: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.register(userData);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleData: GoogleLoginRequest) => {
    setIsLoading(true);
    try {
      const response = await authService.loginWithGoogle(googleData);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Función de logout
  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  }, []);

  // Función para actualizar perfil del usuario
  const updateUser = useCallback(async (userData: Partial<Usuario>) => {
    setIsLoading(true);
    try {
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sincronizar con localStorage cuando cambia el usuario
  useEffect(() => {
    // Este efecto es principalmente para observar cambios externos
    // El authService ya maneja la sincronización con localStorage
  }, [user]);

  // Validar que el usuario siga activo al montar el componente
  useEffect(() => {
    if (isAuthenticated) {
      // Validar usuario activo al cargar
      refreshUser();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUser,
        refreshUser,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

