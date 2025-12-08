/**
 * EmptyDiscoverState - Estado vacío específico de DiscoverPage cuando no hay más perfiles por ver.
 * Incluye ilustración, mensaje amigable y botón de recarga.
 */

import './EmptyDiscoverState.css';

interface EmptyDiscoverStateProps {
  onReload: () => void;
}

const EmptyDiscoverState = ({ onReload }: EmptyDiscoverStateProps) => {
  return (
    <div className="empty-discover-state">
      {/* Ilustración SVG - Favicon */}
      <div className="empty-discover-illustration">
        <svg
          width="120"
          height="120"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Favicon - Birrete */}
          <path
            d="M12 3L1 9L12 15L21 10.09V17H23V9M5 13.18V17.18L12 21L19 17.18V13.18L12 17L5 13.18Z"
            fill="#8B1538"
          />
        </svg>
      </div>

      {/* Texto principal */}
      <h2 className="empty-discover-title">
        ¡Ya viste a todos por ahora{' '}
        <span className="sparkle-icon">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10 2 L11.5 7.5 L17 9 L11.5 10.5 L10 16 L8.5 10.5 L3 9 L8.5 7.5 Z"
              fill="#C72C5B"
            />
          </svg>
        </span>
        !
      </h2>

      {/* Subtexto */}
      <p className="empty-discover-subtitle">
        Volvé pronto, nuevos estudiantes te esperan.
      </p>

      {/* Botón Recargar */}
      <button 
        className="empty-discover-reload-button"
        onClick={onReload}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="reload-icon"
        >
          <path
            d="M9 2 C5.13 2 2 5.13 2 9 C2 12.87 5.13 16 9 16 C12.87 16 16 12.87 16 9"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M12 5 L16 2 L16 6"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        Recargar
      </button>
    </div>
  );
};

export default EmptyDiscoverState;

