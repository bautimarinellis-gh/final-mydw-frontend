/**
 * theme-context.ts - Define el contexto para el sistema de temas (light/dark).
 * Contiene la interfaz para alternar entre modo claro y oscuro.
 */

import { createContext } from 'react';

type Theme = 'light' | 'dark';

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

