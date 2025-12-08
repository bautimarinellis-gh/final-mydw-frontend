/**
 * use-auth.ts - Hook personalizado para consumir el contexto de autenticación.
 * Proporciona acceso al usuario actual y métodos de autenticación desde cualquier componente.
 */

import { useContext } from 'react';
import { AuthContext } from './auth-context';
import type { AuthContextType } from './auth-context';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

