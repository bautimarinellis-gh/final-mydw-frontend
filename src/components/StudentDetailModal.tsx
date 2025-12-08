/**
 * StudentDetailModal - Modal con información completa del estudiante (foto, datos, descripción, intereses).
 * Se abre desde StudentCard o MatchCard para ver el perfil detallado.
 */

import { Modal, InterestTag, GraduationIcon, LocationIcon } from './index';
import { getProfileImageUrl } from '../utils/image';
import type { Usuario } from '../types';
import './StudentDetailModal.css';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  estudiante: Usuario;
}

const StudentDetailModal = ({ isOpen, onClose, estudiante }: StudentDetailModalProps) => {
  const getInitials = () => {
    return `${estudiante.nombre[0]}${estudiante.apellido[0]}`.toUpperCase();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Detalles del Estudiante">
      <div className="student-detail-modal">
        {/* Foto de perfil */}
        <div className="student-detail-photo">
          {estudiante.fotoUrl ? (
            <img 
              src={getProfileImageUrl(estudiante.fotoUrl) || ''} 
              alt={`${estudiante.nombre} ${estudiante.apellido}`}
              className="student-detail-image"
            />
          ) : (
            <div className="student-detail-initials">
              {getInitials()}
            </div>
          )}
        </div>

        {/* Información principal */}
        <div className="student-detail-info">
          <h2 className="student-detail-name">
            {estudiante.nombre} {estudiante.apellido}
            <span className="student-detail-age">, {estudiante.edad}</span>
          </h2>

          {/* Carrera */}
          <div className="student-detail-field">
            <div className="student-detail-field-icon">
              <GraduationIcon size={20} />
            </div>
            <span className="student-detail-field-label">Carrera:</span>
            <span className="student-detail-field-value">{estudiante.carrera}</span>
          </div>

          {/* Sede */}
          <div className="student-detail-field">
            <div className="student-detail-field-icon">
              <LocationIcon size={20} />
            </div>
            <span className="student-detail-field-label">Sede:</span>
            <span className="student-detail-field-value">{estudiante.sede}</span>
          </div>

          {/* Descripción */}
          {estudiante.descripcion && (
            <div className="student-detail-section">
              <h3 className="student-detail-section-title">Acerca de mí</h3>
              <p className="student-detail-description">{estudiante.descripcion}</p>
            </div>
          )}

          {/* Intereses */}
          {estudiante.intereses && estudiante.intereses.length > 0 && (
            <div className="student-detail-section">
              <h3 className="student-detail-section-title">Intereses</h3>
              <div className="student-detail-interests">
                {estudiante.intereses.map((interes, index) => (
                  <InterestTag key={index} interest={interes} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Botón Volver */}
        <button 
          className="student-detail-back-button"
          onClick={onClose}
        >
          Volver
        </button>
      </div>
    </Modal>
  );
};

export default StudentDetailModal;

