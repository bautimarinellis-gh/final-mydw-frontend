/**
 * use-theme.ts - Hook personalizado para consumir el contexto de temas.
 * Proporciona acceso al tema actual y función para alternar entre light/dark.
 */

import { useContext } from 'react';
import { ThemeContext } from './theme-context';
import type { ThemeContextType } from './theme-context';

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme debe ser usado dentro de un ThemeProvider');
  }
  return context;
};

