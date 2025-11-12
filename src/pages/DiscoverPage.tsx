import { useState, useEffect } from 'react';
import { ProfileCard, SwipeButtons, LoadingSpinner, EmptyState, NavigationBar, BackgroundPattern } from '../components';
import { discoverService } from '../services';
import type { Usuario } from '../types';
import { getErrorMessage } from '../utils/error';
import './DiscoverPage.css';

const DiscoverPage = () => {
  const [currentProfile, setCurrentProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cargar siguiente perfil desde el backend
  const loadNextProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await discoverService.getNextProfile();
      setCurrentProfile(response.estudiante);
    } catch (error: unknown) {
      console.error('Error al cargar perfil:', error);
      const errorMessage = getErrorMessage(error, 'No se pudo conectar con el servidor');
      setError(errorMessage);
      setCurrentProfile(null);
    } finally {
      setLoading(false);
    }
  };

  // Cargar perfil inicial
  useEffect(() => {
    loadNextProfile();
  }, []);

  // Manejar swipe
  const handleSwipe = async (tipo: 'like' | 'dislike') => {
    if (!currentProfile || swiping) return;

    try {
      setSwiping(true);
      setError(null);
      
      const response = await discoverService.swipe(currentProfile.id, tipo);
      
      // Si hay match, mostrar notificación
      if (response.match) {
        alert(`¡Match con ${currentProfile.nombre} ${currentProfile.apellido}! 🎉`);
      }

      // Cargar siguiente perfil sin mostrar loading (mantener perfil actual visible)
      try {
        const nextResponse = await discoverService.getNextProfile();
        // Solo actualizar cuando el nuevo perfil esté listo
        setCurrentProfile(nextResponse.estudiante);
        setLoading(false);
      } catch (error: unknown) {
        console.error('Error al cargar perfil:', error);
        const errorMessage = getErrorMessage(error, 'No se pudo conectar con el servidor');
        setError(errorMessage);
        setCurrentProfile(null);
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error('Error al hacer swipe:', error);
      const errorMessage = getErrorMessage(error, 'Error al procesar tu acción');
      setError(errorMessage);
    } finally {
      setSwiping(false);
    }
  };

  return (
    <div className="discover-page">
      <BackgroundPattern />
      
      {/* Header */}
      <div className="discover-header">
        <h1 className="discover-title">
          Descubre Estudiantes
        </h1>
        <p className="discover-subtitle">
          Conecta con personas de tu universidad
        </p>
      </div>

      {/* Contenido principal */}
      <div className="discover-content">
        {loading && !currentProfile && <LoadingSpinner />}

        {error && !currentProfile && (
          <div className="discover-error">
            {error}
          </div>
        )}

        {!loading && !currentProfile && !error && (
          <EmptyState message="No hay más perfiles disponibles" />
        )}

        {currentProfile && (
          <>
            <ProfileCard usuario={currentProfile} />
            <SwipeButtons
              onDislike={() => handleSwipe('dislike')}
              onLike={() => handleSwipe('like')}
              disabled={swiping}
            />
          </>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default DiscoverPage;

