import { useState, useEffect } from 'react';
import { StudentCard, SwipeButtons, LoadingSpinner, EmptyDiscoverState, NavigationBar, BackgroundPattern } from '../components';
import { discoverService } from '../services';
import type { Usuario } from '../types';
import { getErrorMessage } from '../utils/error';
import './DiscoverPage.css';

const DiscoverPage = () => {
  const [currentProfile, setCurrentProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Cargar siguiente perfil desde el backend
  const loadNextProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      setNoMoreProfiles(false);
      
      const response = await discoverService.getNextProfile();
      
      if (response.estudiante) {
        setCurrentProfile(response.estudiante);
      } else {
        setCurrentProfile(null);
        setNoMoreProfiles(true);
      }
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

  // Manejar swipe con animaciones
  const handleSwipe = async (tipo: 'like' | 'dislike') => {
    if (!currentProfile || swiping || isAnimating) return;

    try {
      setSwiping(true);
      setIsAnimating(true);
      setSwipeDirection(tipo);
      setError(null);
      
      // Esperar a que termine la animación antes de hacer el swipe
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const response = await discoverService.swipe(currentProfile.id, tipo);
      
      // Si hay match, mostrar notificación
      if (response.match) {
        alert(`¡Match con ${currentProfile.nombre} ${currentProfile.apellido}! 🎉`);
      }

      // Cargar siguiente perfil
      try {
        const nextResponse = await discoverService.getNextProfile();
        
        if (nextResponse.estudiante) {
          // Resetear animación y cargar nuevo perfil
          setIsAnimating(false);
          setSwipeDirection(null);
          setCurrentProfile(nextResponse.estudiante);
        } else {
          // No hay más perfiles
          setIsAnimating(false);
          setSwipeDirection(null);
          setCurrentProfile(null);
          setNoMoreProfiles(true);
        }
      } catch (error: unknown) {
        console.error('Error al cargar perfil:', error);
        const errorMessage = getErrorMessage(error, 'No se pudo conectar con el servidor');
        setError(errorMessage);
        setIsAnimating(false);
        setSwipeDirection(null);
        setCurrentProfile(null);
      }
    } catch (error: unknown) {
      console.error('Error al hacer swipe:', error);
      const errorMessage = getErrorMessage(error, 'Error al procesar tu acción');
      setError(errorMessage);
      setIsAnimating(false);
      setSwipeDirection(null);
    } finally {
      setSwiping(false);
    }
  };

  return (
    <div className="discover-page">
      <BackgroundPattern />
      
      {/* Header */}
      <div className="discover-header">
        <div className="discover-header-content">
          <h1 className="discover-title">
            Descubrí nuevos matches
          </h1>
          <p className="discover-subtitle">
            Conectá con estudiantes de tu universidad.
          </p>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="discover-content">
        {loading && !currentProfile && <LoadingSpinner />}

        {error && !currentProfile && (
          <div className="discover-error">
            {error}
          </div>
        )}

        {noMoreProfiles && !loading && (
          <EmptyDiscoverState onReload={loadNextProfile} />
        )}

        {currentProfile && (
          <>
            <StudentCard 
              key={currentProfile.id}
              usuario={currentProfile}
              isAnimating={isAnimating}
              swipeDirection={swipeDirection}
              onModalOpenChange={setIsModalOpen}
            />
            <SwipeButtons
              onDislike={() => handleSwipe('dislike')}
              onLike={() => handleSwipe('like')}
              disabled={swiping || isAnimating}
            />
          </>
        )}
      </div>

      <NavigationBar isModalOpen={isModalOpen} />
    </div>
  );
};

export default DiscoverPage;

