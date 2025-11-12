import type { Usuario } from '../types';
import InterestTag from './InterestTag';
import './ProfileCard.css';

interface ProfileCardProps {
  usuario: Usuario;
}

const ProfileCard = ({ usuario }: ProfileCardProps) => {
  // Generar iniciales para el placeholder de foto
  const getInitials = () => {
    return `${usuario.nombre[0]}${usuario.apellido[0]}`.toUpperCase();
  };

  return (
    <div className="profile-card">
      {/* Foto de perfil (placeholder) */}
      <div className="profile-photo">
        <div className="profile-initials">
          {getInitials()}
        </div>
        {/* Icono de información */}
        <div className="profile-info-icon">
          i
        </div>
      </div>

      {/* Información del perfil */}
      <div className="profile-details">
        {/* Nombre y edad */}
        <h2 className="profile-name">
          {usuario.nombre} {usuario.apellido}
          <span className="profile-age">
            , {usuario.edad}
          </span>
        </h2>

        {/* Carrera */}
        <p className="profile-carrera">
          {usuario.carrera}
        </p>

        {/* Sede */}
        <p className="profile-sede">
          {usuario.sede}
        </p>

        {/* Descripción */}
        {usuario.descripcion && (
          <p className="profile-descripcion">
            {usuario.descripcion}
          </p>
        )}

        {/* Intereses */}
        {usuario.intereses && usuario.intereses.length > 0 && (
          <div className="profile-intereses">
            <div className="profile-intereses-list">
              {usuario.intereses.map((interes, index) => (
                <InterestTag key={index} interest={interes} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;

