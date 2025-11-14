import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark';

const THEME_STORAGE_KEY = 'tinder-uai-theme';

export const useTheme = () => {
  // Obtener tema inicial desde localStorage o usar 'light' por defecto
  const getInitialTheme = (): Theme => {
    if (typeof window !== 'undefined') {
      const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme;
      if (storedTheme === 'light' || storedTheme === 'dark') {
        return storedTheme;
      }
    }
    return 'light';
  };

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

  return {
    theme,
    toggleTheme,
    isDark,
  };
};

