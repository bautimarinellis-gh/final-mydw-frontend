/**
 * ProfilePage - Pantalla de perfil del usuario autenticado.
 * Permite editar datos personales, subir foto, gestionar la cuenta (desactivar/eliminar) y cerrar sesión.
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { NavigationBar, LoadingSpinner, BackgroundPattern, LocationIcon, GraduationIcon, AboutMe, Interests, EditProfileModal, BrokenHeartIcon, ConfirmModal, ThemeToggle } from '../components';
import { useAuth } from '../features/auth';
import { authService } from '../services/authService';
import type { Usuario } from '../types';
import { getErrorMessage } from '../utils/error';
import { getProfileImageUrl } from '../utils/image';
import './ProfilePage.css';

const ProfilePage = () => {
  const { user, logout, refreshUser, updateUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isDeactivateModalOpen, setIsDeactivateModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const navigate = useNavigate();

  // Función para cargar usuario
  const loadUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obtener usuario desde el contexto (ya sincronizado con el backend)
      await refreshUser();
    } catch (error: unknown) {
      console.error('Error al cargar usuario:', error);
      const errorMessage = getErrorMessage(error, 'No se pudo cargar tu perfil');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Cargar información del usuario al montar el componente
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
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
      // Aunque haya error, limpiar datos locales y redirigir
      navigate('/login');
    }
  };

  // Manejar desactivación de cuenta
  const handleDeactivateAccount = async () => {
    try {
      setLoading(true);
      await authService.deactivateAccount();
      // Después de desactivar, redirigir al login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al desactivar cuenta:', error);
      const errorMessage = getErrorMessage(error, 'No se pudo desactivar tu cuenta');
      setError(errorMessage);
      setIsDeactivateModalOpen(false);
    } finally {
      setLoading(false);
    }
  };

  // Manejar eliminación de cuenta
  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      await authService.deleteAccount();
      // Después de eliminar, redirigir al login
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Error al eliminar cuenta:', error);
      const errorMessage = getErrorMessage(error, 'No se pudo eliminar tu cuenta');
      setError(errorMessage);
      setIsDeleteModalOpen(false);
    } finally {
      setLoading(false);
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
      // Actualizar perfil usando el contexto (ya sincroniza con el backend)
      await updateUser(updatedData);
      
      // Recargar el usuario desde el backend para asegurar que tenemos la versión más actualizada
      // Esto es especialmente importante si se subió una imagen
      await refreshUser();
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
        <ThemeToggle />
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
        <ThemeToggle />
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
      <ThemeToggle />
      
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
                <LocationIcon size={20} />
              </div>
              <div className="profile-data-content">
                <span className="profile-data-label">Sede</span>
                <span className="profile-data-value">{user.sede}</span>
              </div>
            </div>

            {/* Carrera */}
            <div className="profile-data-item">
              <div className="profile-data-icon">
                <GraduationIcon size={20} />
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
            <BrokenHeartIcon size={16} />
            <span>Cerrar sesión</span>
          </button>

          {/* Botones de cuenta */}
          <div className="profile-account-actions">
            <button 
              onClick={() => setIsDeactivateModalOpen(true)} 
              className="profile-account-button profile-deactivate-button"
            >
              Desactivar cuenta
            </button>
            <button 
              onClick={() => setIsDeleteModalOpen(true)} 
              className="profile-account-button profile-delete-button"
            >
              Eliminar cuenta
            </button>
          </div>
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

      {/* Modal de confirmación de desactivación */}
      <ConfirmModal
        isOpen={isDeactivateModalOpen}
        onClose={() => setIsDeactivateModalOpen(false)}
        onConfirm={handleDeactivateAccount}
        title="Desactivar cuenta"
        message="¿Estás seguro de que quieres desactivar tu cuenta? Podrás reactivarla iniciando sesión más tarde."
        confirmText="Desactivar"
        cancelText="Cancelar"
        confirmButtonVariant="danger"
      />

      {/* Modal de confirmación de eliminación */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteAccount}
        title="Eliminar cuenta"
        message="¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer. Se eliminarán todos tus datos, mensajes y matches."
        confirmText="Eliminar permanentemente"
        cancelText="Cancelar"
        confirmButtonVariant="danger"
      />

      <NavigationBar isModalOpen={isEditModalOpen || isLogoutModalOpen || isDeactivateModalOpen || isDeleteModalOpen} />
    </div>
  );
};

export default ProfilePage;

