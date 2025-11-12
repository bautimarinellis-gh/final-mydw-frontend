import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { NavigationBar, LoadingSpinner, InterestTag } from '../components';
import { authService } from '../services';
import type { Usuario } from '../types';
import { getErrorMessage } from '../utils/error';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Cargar información del usuario desde el backend
  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Obtener usuario del backend
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (error: unknown) {
        console.error('Error al cargar usuario:', error);
        
        // Intentar obtener de localStorage como fallback
        const localUser = authService.getLocalUser();
        if (localUser) {
          setUser(localUser);
        } else {
          const errorMessage = getErrorMessage(error, 'No se pudo cargar tu perfil');
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Manejar logout
  const handleLogout = async () => {
    if (window.confirm('¿Estás seguro de que quieres cerrar sesión?')) {
      try {
        await authService.logout();
        navigate('/discover');
      } catch (err) {
        console.error('Error al cerrar sesión:', err);
        // Token deshabilitado - no se limpia localStorage
        // localStorage.removeItem('accessToken');
        // localStorage.removeItem('user');
        navigate('/discover');
      }
    }
  };

  // Obtener iniciales
  const getInitials = () => {
    if (!user) return '??';
    return `${user.nombre[0]}${user.apellido[0]}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="profile-page">
        <LoadingSpinner />
        <NavigationBar />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-error-container">
        <div className="profile-error-content">
          <p className="profile-error-message">
            {error || 'No se pudo cargar el perfil'}
          </p>
          <button onClick={handleLogout} className="profile-error-button">
            Cerrar Sesión
          </button>
        </div>
        <NavigationBar />
      </div>
    );
  }

  return (
    <div className="profile-page">
      {/* Header con foto de perfil */}
      <div className="profile-header">
        <div className="profile-avatar">
          {getInitials()}
        </div>
        <h1 className="profile-header-name">
          {user.nombre} {user.apellido}
        </h1>
        <p className="profile-header-age">
          {user.edad} años
        </p>
      </div>

      {/* Información del perfil */}
      <div className="profile-main">
        {/* Carrera */}
        <div className="profile-section">
          <h3 className="profile-section-title">
            Carrera
          </h3>
          <p className="profile-section-content">
            {user.carrera}
          </p>
        </div>

        {/* Sede */}
        <div className="profile-section">
          <h3 className="profile-section-title">
            Sede
          </h3>
          <p className="profile-section-content">
            {user.sede}
          </p>
        </div>

        {/* Email */}
        <div className="profile-section">
          <h3 className="profile-section-title">
            Email
          </h3>
          <p className="profile-section-content-normal">
            {user.email}
          </p>
        </div>

        {/* Descripción */}
        {user.descripcion && (
          <div className="profile-section">
            <h3 className="profile-section-title">
              Sobre mí
            </h3>
            <p className="profile-section-content-normal">
              {user.descripcion}
            </p>
          </div>
        )}

        {/* Intereses */}
        {user.intereses && user.intereses.length > 0 && (
          <div className="profile-section">
            <h3 className="profile-section-title">
              Intereses
            </h3>
            <div className="profile-intereses-list">
              {user.intereses.map((interes, index) => (
                <InterestTag key={index} interest={interes} />
              ))}
            </div>
          </div>
        )}

        {/* Botón de cerrar sesión */}
        <button onClick={handleLogout} className="profile-logout-button">
          Cerrar Sesión
        </button>
      </div>

      <NavigationBar />
    </div>
  );
};

export default ProfilePage;

