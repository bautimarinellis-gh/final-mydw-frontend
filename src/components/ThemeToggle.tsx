/**
 * ThemeToggle - Botón flotante para alternar entre modo claro y oscuro.
 * Se muestra en todas las páginas principales con iconos de sol/luna.
 */

import { useTheme } from '../features/theme';
import { SunIcon, MoonIcon } from './icons';
import './ThemeToggle.css';

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      className="theme-toggle"
      onClick={toggleTheme}
      aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={isDark ? 'Modo oscuro' : 'Modo claro'}
    >
      <div className="theme-toggle-icon-wrapper">
        <SunIcon
          size={20}
          className={`theme-toggle-icon ${!isDark ? 'theme-toggle-icon-active' : ''}`}
        />
        <MoonIcon
          size={20}
          className={`theme-toggle-icon ${isDark ? 'theme-toggle-icon-active' : ''}`}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;

