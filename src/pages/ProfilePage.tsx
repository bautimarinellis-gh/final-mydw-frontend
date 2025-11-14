import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NavigationBar, LoadingSpinner, BackgroundPattern, LocationIcon, GraduationIcon, AboutMe, Interests, EditProfileModal, BrokenHeartIcon, ConfirmModal } from '../components';
import { authService } from '../services';
import type { Usuario } from '../types';
import { getErrorMessage } from '../utils/error';
import { getProfileImageUrl } from '../utils/image';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();

  // Función para cargar usuario
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

  // Cargar información del usuario desde el backend
  useEffect(() => {
    loadUser();
  }, []);

  // Recargar usuario cuando se cierra el modal de edición (por si se subió una imagen)
  useEffect(() => {
    // Solo recargar cuando el modal se cierra (pasa de true a false)
    // y no es la carga inicial
    if (!isEditModalOpen && user) {
      // Recargar usuario cuando se cierra el modal para reflejar cambios (como nueva imagen)
      loadUser();
    }
  }, [isEditModalOpen]);

  // Manejar logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Aunque haya error, limpiar datos locales y redirigir
      navigate('/login');
    }
  };

  // Obtener iniciales
  const getInitials = () => {
    if (!user) return '??';
    return `${user.nombre[0]}${user.apellido[0]}`.toUpperCase();
  };

  // Manejar actualización de perfil
  const handleUpdateProfile = async (updatedData: Partial<Usuario>) => {
    if (!user) {
      throw new Error('No hay usuario para actualizar');
    }
    
    try {
      const updatedUser = await authService.updateProfile(updatedData);
      setUser(updatedUser);
      
      // Recargar el usuario desde el backend para asegurar que tenemos la versión más actualizada
      // Esto es especialmente importante si se subió una imagen
      const refreshedUser = await authService.getCurrentUser();
      setUser(refreshedUser);
    } catch (error: unknown) {
      console.error('Error al actualizar perfil:', error);
      
      // Manejar errores de axios
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: { message?: string } }; message?: string };
        const status = axiosError.response?.status;
        const message = axiosError.response?.data?.message || axiosError.message;
        
        if (status === 404) {
          throw new Error('El endpoint de actualización no está disponible. Verifica que el backend tenga implementado PATCH /api/auth/profile');
        }
        if (status === 401) {
          throw new Error('No estás autorizado para actualizar el perfil');
        }
        if (status === 400) {
          throw new Error(message || 'Los datos enviados no son válidos');
        }
        if (status === 500) {
          throw new Error('Error del servidor al actualizar el perfil');
        }
        throw new Error(message || `Error al actualizar perfil (${status})`);
      }
      
      // Manejar errores de red
      if (error && typeof error === 'object' && ('message' in error || 'code' in error)) {
        const networkError = error as { message?: string; code?: string };
        if (networkError.message?.includes('Network Error') || networkError.code === 'ERR_NETWORK') {
          throw new Error('Error de conexión. Verifica que el backend esté corriendo en localhost:3000');
        }
      }
      
      // Re-lanzar otros errores
      throw error instanceof Error ? error : new Error('Error desconocido al actualizar el perfil');
    }
  };

  if (loading) {
    return (
      <div className="profile-page">
        <BackgroundPattern />
        <div className="profile-content">
          <LoadingSpinner />
        </div>
        <NavigationBar />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="profile-page">
        <BackgroundPattern />
        <div className="profile-error-container">
          <div className="profile-error-content">
            <p className="profile-error-message">
              {error || 'No se pudo cargar el perfil'}
            </p>
            <button onClick={handleLogout} className="profile-error-button">
              Cerrar Sesión
            </button>
          </div>
        </div>
        <NavigationBar />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <BackgroundPattern />
      
      <div className="profile-content">
        <div className="profile-card-container">
          {/* Encabezado social */}
          <div className="profile-header-social">
            <div className="profile-avatar">
              {user.fotoUrl ? (
                <img src={getProfileImageUrl(user.fotoUrl) || ''} alt={`${user.nombre} ${user.apellido}`} />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>
            <h1 className="profile-greeting">
              ¡Hola, {user.nombre}!
            </h1>
          </div>

          {/* Datos del usuario */}
          <div className="profile-data-section">
            {/* Sede */}
            <div className="profile-data-item">
              <div className="profile-data-icon">
                <LocationIcon size={24} />
              </div>
              <div className="profile-data-content">
                <span className="profile-data-label">Sede</span>
                <span className="profile-data-value">{user.sede}</span>
              </div>
            </div>

            {/* Carrera */}
            <div className="profile-data-item">
              <div className="profile-data-icon">
                <GraduationIcon size={24} />
              </div>
              <div className="profile-data-content">
                <span className="profile-data-label">Carrera</span>
                <span className="profile-data-value">{user.carrera}</span>
              </div>
            </div>
          </div>

          {/* Acerca de mí */}
          <AboutMe descripcion={user.descripcion} />

          {/* Intereses */}
          <Interests intereses={user.intereses || []} />

          {/* CTAs principales */}
          <div className="profile-ctas-primary">
            <button 
              onClick={() => setIsEditModalOpen(true)} 
              className="profile-cta-button profile-edit-button"
            >
              Editar perfil
            </button>
            <Link 
              to="/discover" 
              className="profile-cta-button profile-discover-button"
            >
              Descubrir
            </Link>
          </div>

          {/* Botón secundario: Cerrar sesión */}
          <button onClick={() => setIsLogoutModalOpen(true)} className="profile-logout-button">
            <BrokenHeartIcon size={18} />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

      {/* Modal de edición */}
      {user && (
        <EditProfileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          user={user}
          onSave={handleUpdateProfile}
        />
      )}

      {/* Modal de confirmación de logout */}
      <ConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleLogout}
        title="Cerrar sesión"
        message="¿Estás seguro de que quieres cerrar sesión?"
        confirmText="Aceptar"
        cancelText="Cancelar"
        confirmButtonVariant="danger"
      />

      <NavigationBar isModalOpen={isEditModalOpen || isLogoutModalOpen} />
    </div>
  );
};

export default ProfilePage;

