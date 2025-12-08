/**
 * AboutMe - Sección "Acerca de mí" del perfil de usuario con descripción o placeholder.
 * Muestra texto descriptivo o invitación a agregar información si está vacío.
 */

import { WriteIcon } from '../icons';
import './AboutMe.css';

interface AboutMeProps {
  descripcion?: string;
}

const AboutMe = ({ descripcion }: AboutMeProps) => {
  return (
    <div className="about-me-section">
      <h3 className="about-me-title">Acerca de mí</h3>
      {descripcion ? (
        <p className="about-me-content">{descripcion}</p>
      ) : (
        <p className="about-me-empty">
          <WriteIcon size={16} className="about-me-icon" />
          Contá algo sobre vos
        </p>
      )}
    </div>
  );
};

export default AboutMe;

