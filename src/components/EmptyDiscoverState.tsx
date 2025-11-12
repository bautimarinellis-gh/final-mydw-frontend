import './EmptyDiscoverState.css';

interface EmptyDiscoverStateProps {
  onReload: () => void;
}

const EmptyDiscoverState = ({ onReload }: EmptyDiscoverStateProps) => {
  return (
    <div className="empty-discover-state">
      {/* Ilustración SVG - Birrete dormido */}
      <div className="empty-discover-illustration">
        <svg
          width="120"
          height="120"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Birrete */}
          <path
            d="M30 40 L60 20 L90 40 L90 50 L30 50 Z"
            fill="#8B1538"
            opacity="0.8"
          />
          {/* Pompon */}
          <circle cx="60" cy="20" r="8" fill="#C72C5B" />
          {/* Zzz (sueño) */}
          <path
            d="M95 35 Q100 30 105 35"
            stroke="#8B1538"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M100 30 Q105 25 110 30"
            stroke="#8B1538"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M105 25 Q110 20 115 25"
            stroke="#8B1538"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Texto principal */}
      <h2 className="empty-discover-title">
        Ya viste a todos por ahora 👀
      </h2>

      {/* Subtexto */}
      <p className="empty-discover-subtitle">
        Volvé más tarde para descubrir más estudiantes.
      </p>

      {/* Botón Recargar */}
      <button 
        className="empty-discover-reload-button"
        onClick={onReload}
      >
        Recargar
      </button>
    </div>
  );
};

export default EmptyDiscoverState;

