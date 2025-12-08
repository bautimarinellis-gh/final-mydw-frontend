/**
 * theme-provider.tsx - Proveedor del contexto de temas que gestiona el modo claro/oscuro.
 * Persiste la preferencia del usuario en localStorage y aplica estilos CSS correspondientes.
 */

import { useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { ThemeContext } from './theme-context';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'tinder-uai-theme';

const getInitialTheme = (): Theme => {
  if (typeof window !== 'undefined') {
    const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
    if (storedTheme === 'light' || storedTheme === 'dark') {
      return storedTheme;
    }
  }
  return 'light';
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    // Inicializar tema y aplicarlo inmediatamente al DOM
    const initialTheme = getInitialTheme();
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', initialTheme);
    }
    return initialTheme;
  });

  const isDark = theme === 'dark';

  // Aplicar tema al elemento raíz del documento cuando cambia
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

