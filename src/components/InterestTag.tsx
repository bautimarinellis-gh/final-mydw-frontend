/**
 * InterestTag - Tag o chip para mostrar un interés individual del estudiante.
 * Componente reutilizable usado en perfiles y tarjetas de usuario.
 */

import './InterestTag.css';

interface InterestTagProps {
  interest: string;
}

const InterestTag = ({ interest }: InterestTagProps) => {
  return (
    <span className="interest-tag">
      {interest}
    </span>
  );
};

export default InterestTag;

