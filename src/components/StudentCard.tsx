import { useState } from 'react';
import type { Usuario } from '../types';
import { getProfileImageUrl } from '../utils/image';
import { InterestTag, StudentDetailModal, GraduationIcon, LocationIcon } from './index';
import './StudentCard.css';

interface StudentCardProps {
  usuario: Usuario;
  isAnimating?: boolean;
  swipeDirection?: 'like' | 'dislike' | null;
  onModalOpenChange?: (isOpen: boolean) => void;
}

const StudentCard = ({ usuario, isAnimating = false, swipeDirection = null, onModalOpenChange }: StudentCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleModalOpen = () => {
    setIsModalOpen(true);
    onModalOpenChange?.(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    onModalOpenChange?.(false);
  };

  // Generar iniciales para el placeholder de foto
  const getInitials = () => {
    return `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase();
  };

  // Determinar clases de animación
  const getAnimationClass = () => {
    if (isAnimating && swipeDirection === 'dislike') {
      return 'student-card-slide-left';
    }
    if (isAnimating && swipeDirection === 'like') {
      return 'student-card-scale';
    }
    return 'student-card-fade-up';
  };

  return (
    <>
      <div className={`student-card ${getAnimationClass()}`}>
        {/* Foto de perfil */}
        <div className="student-card-photo">
          {usuario.fotoUrl ? (
            <img 
              src={getProfileImageUrl(usuario.fotoUrl) || ''} 
              alt={`${usuario.nombre} ${usuario.apellido}`}
              className="student-card-image"
            />
          ) : (
            <div className="student-card-initials">
              {getInitials()}
            </div>
          )}
        </div>

        {/* Información del perfil */}
        <div className="student-card-details">
          {/* Nombre y edad */}
          <h2 className="student-card-name">
            {usuario.nombre} {usuario.apellido}
            <span className="student-card-age">
              , {usuario.edad}
            </span>
          </h2>

          {/* Carrera */}
          <div className="student-card-field">
            <span className="student-card-field-icon">
              <GraduationIcon size={16} />
            </span>
            <span className="student-card-field-text">{usuario.carrera}</span>
          </div>

          {/* Sede */}
          <div className="student-card-field">
            <span className="student-card-field-icon">
              <LocationIcon size={16} />
            </span>
            <span className="student-card-field-text">{usuario.sede}</span>
          </div>

          {/* Descripción */}
          {usuario.descripcion && (
            <p className="student-card-description">
              {usuario.descripcion}
            </p>
          )}

          {/* Intereses */}
          {usuario.intereses && usuario.intereses.length > 0 && (
            <div className="student-card-interests">
              <div className="student-card-interests-list">
                {usuario.intereses.slice(0, 3).map((interes, index) => (
                  <InterestTag key={index} interest={interes} />
                ))}
                {usuario.intereses.length > 3 && (
                  <span className="student-card-interests-more">
                    +{usuario.intereses.length - 3}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Botón Ver más */}
          <button 
            className="student-card-view-more"
            onClick={handleModalOpen}
          >
            Ver más
          </button>
        </div>
      </div>

      {/* Modal de detalles */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        estudiante={usuario}
      />
    </>
  );
};

export default StudentCard;

