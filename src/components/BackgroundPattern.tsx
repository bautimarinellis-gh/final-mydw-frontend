/**
 * BackgroundPattern - Patrón de fondo decorativo con iconos universitarios (libros, corazones, cafés).
 * Se utiliza como fondo visual en varias páginas de la aplicación.
 */

import './BackgroundPattern.css';

const BackgroundPattern = () => {
  return (
    <div className="background-pattern">
      {/* Libros */}
      <svg className="pattern-icon book-1" width="40" height="40" viewBox="0 0 24 24" fill="none">
        <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 20H6V4H18V20Z" fill="currentColor" opacity="0.30" className="pattern-icon-path"/>
        <path d="M8 6H16V8H8V6ZM8 10H16V12H8V10ZM8 14H13V16H8V14Z" fill="currentColor" opacity="0.30" className="pattern-icon-path"/>
      </svg>

      <svg className="pattern-icon book-2" width="35" height="35" viewBox="0 0 24 24" fill="none">
        <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 20H6V4H18V20Z" fill="currentColor" opacity="0.28" className="pattern-icon-path"/>
      </svg>

      <svg className="pattern-icon book-3" width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M18 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V4C20 2.9 19.1 2 18 2ZM18 20H6V4H18V20Z" fill="currentColor" opacity="0.26" className="pattern-icon-path"/>
      </svg>

      {/* Corazones */}
      <svg className="pattern-icon heart-1" width="32" height="32" viewBox="0 0 24 24" fill="none">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" opacity="0.30" className="pattern-icon-path"/>
      </svg>

      <svg className="pattern-icon heart-2" width="28" height="28" viewBox="0 0 24 24" fill="none">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" opacity="0.28" className="pattern-icon-path"/>
      </svg>

      <svg className="pattern-icon heart-3" width="25" height="25" viewBox="0 0 24 24" fill="none">
        <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="currentColor" opacity="0.26" className="pattern-icon-path"/>
      </svg>

      {/* Tazas de café */}
      <svg className="pattern-icon coffee-1" width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M20 3H4V13C4 14.1 4.9 15 6 15H16C17.1 15 18 14.1 18 13V10H20C21.1 10 22 9.1 22 8V5C22 3.9 21.1 3 20 3ZM20 8H18V5H20V8Z" fill="currentColor" opacity="0.28" className="pattern-icon-path"/>
        <path d="M4 19H18V21H4V19Z" fill="currentColor" opacity="0.28" className="pattern-icon-path"/>
      </svg>

      <svg className="pattern-icon coffee-2" width="26" height="26" viewBox="0 0 24 24" fill="none">
        <path d="M20 3H4V13C4 14.1 4.9 15 6 15H16C17.1 15 18 14.1 18 13V10H20C21.1 10 22 9.1 22 8V5C22 3.9 21.1 3 20 3ZM20 8H18V5H20V8Z" fill="currentColor" opacity="0.26" className="pattern-icon-path"/>
      </svg>

      {/* Birretes */}
      <svg className="pattern-icon cap-1" width="35" height="35" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor" opacity="0.30" className="pattern-icon-path"/>
      </svg>

      <svg className="pattern-icon cap-2" width="30" height="30" viewBox="0 0 24 24" fill="none">
        <path d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z" fill="currentColor" opacity="0.28" className="pattern-icon-path"/>
      </svg>
    </div>
  );
};

export default BackgroundPattern;

