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

