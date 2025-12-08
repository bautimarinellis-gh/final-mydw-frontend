/**
 * EmptyState - Componente genérico para estados vacíos con mensaje personalizable.
 * Usado cuando no hay datos para mostrar en listas o secciones.
 */

import './EmptyState.css';

interface EmptyStateProps {
  message?: string;
}

const EmptyState = ({ 
  message = 'No hay más perfiles disponibles' 
}: EmptyStateProps) => {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">
        👀
      </div>
      <p className="empty-state-message">
        {message}
      </p>
    </div>
  );
};

export default EmptyState;

