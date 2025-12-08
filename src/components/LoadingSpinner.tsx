/**
 * LoadingSpinner - Indicador de carga animado reutilizable.
 * Se muestra mientras se cargan datos del servidor.
 */

import './LoadingSpinner.css';

const LoadingSpinner = () => {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" />
    </div>
  );
};

export default LoadingSpinner;

