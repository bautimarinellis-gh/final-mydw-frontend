/**
 * DiscoverPage - Pantalla principal para descubrir y hacer match con otros estudiantes.
 * Incluye swipe (like/dislike), navegación de historial, filtros avanzados y notificaciones de match.
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { StudentCard, SwipeButtons, LoadingSpinner, EmptyDiscoverState, NavigationBar, BackgroundPattern, ArrowLeftIcon, ArrowRightIcon, MatchModal, ThemeToggle } from '../components';
import { discoverService } from '../services';
import { useAuth } from '../features/auth';
import type { Usuario } from '../types';
import { getErrorMessage } from '../utils/error';
import axios from 'axios';
import './DiscoverPage.css';

const DiscoverPage = () => {
  const { user: currentUser } = useAuth();
  const [currentProfile, setCurrentProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [swipeDirection, setSwipeDirection] = useState<'like' | 'dislike' | null>(null);
  const [noMoreProfiles, setNoMoreProfiles] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileHistory, setProfileHistory] = useState<Usuario[]>([]); // Historial de perfiles vistos
  const [historyIndex, setHistoryIndex] = useState<number>(-1); // Índice actual en el historial (-1 = perfil nuevo)
  const [showMatchModal, setShowMatchModal] = useState(false);
  const [matchedUserName, setMatchedUserName] = useState('');
  const [sedeFilter, setSedeFilter] = useState<string>('');
  const [carreraFilter, setCarreraFilter] = useState<string>('');
  const [interesFilter, setInteresFilter] = useState<string>('');
  const [searchFilter, setSearchFilter] = useState<string>(''); // nombre / descripción
  const [edadMinFilter, setEdadMinFilter] = useState<string>('');
  const [edadMaxFilter, setEdadMaxFilter] = useState<string>('');
  const maxRetriesRef = useRef(0);
  const [sedeOptions, setSedeOptions] = useState<string[]>([]);
  const [carreraOptions, setCarreraOptions] = useState<string[]>([]);
  const MAX_RETRIES = 10; // Máximo de intentos para evitar loops infinitos

  // ID del usuario actual desde el contexto
  const currentUserId = currentUser?.id || null;

  // Mejora automática de calidad/tamaño para imágenes Cloudinary
  const toCloudinaryHiRes = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return url;

    const isCloudinary = url.includes('res.cloudinary.com') && url.includes('/upload/');
    if (!isCloudinary) return url;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const transform = 'f_auto,q_auto,c_fill,g_auto,w_600,h_600';
    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  };

  // Validar que el perfil no sea del usuario actual
  // NOTA: La validación de likes/dislikes previos debe estar implementada en el backend
  // Esta es solo una capa de seguridad adicional en el frontend
  const isValidProfile = (profile: Usuario | null): boolean => {
    if (!profile || !currentUserId) return true; // Si no hay perfil o no hay usuario actual, permitir
    return profile.id !== currentUserId;
  };

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const data = await discoverService.getFilterOptions();
        // Ordenar alfabéticamente para que quede prolijo
        setSedeOptions(data.sedes.sort());
        setCarreraOptions(data.carreras.sort());
      } catch (err) {
        console.error('Error al cargar opciones de filtros:', err);
      }
    };

    fetchFilterOptions();
  }, []);

  // Cargar siguiente perfil desde el backend
  // El backend debe filtrar:
  // 1. El propio perfil del usuario
  // 2. Perfiles a los que ya se les dio "like"
  // 3. Perfiles que ya fueron rechazados (dislike)
  const loadNextProfile = useCallback(async (retryCount: number = 0) => {
    try {
      setLoading(true);
      setError(null);
      setNoMoreProfiles(false);

      // Si hemos intentado muchas veces, evitar loop infinito
      if (retryCount >= MAX_RETRIES) {
        console.error('Máximo de reintentos alcanzado. El backend puede estar devolviendo el mismo perfil.');
        setCurrentProfile(null);
        setNoMoreProfiles(true);
        setLoading(false);
        return;
      }

      const response = await discoverService.getNextProfile({
        sede: sedeFilter || undefined,
        carrera: carreraFilter || undefined,
        interes: interesFilter || undefined,
        q: searchFilter || undefined,
        edadMin: edadMinFilter || undefined,
        edadMax: edadMaxFilter || undefined,
      });

      if (response.estudiante) {
        // Validar que no sea el propio perfil del usuario
        if (!isValidProfile(response.estudiante)) {
          // Intentar obtener otro perfil
          maxRetriesRef.current = retryCount + 1;
          await loadNextProfile(retryCount + 1);
          return;
        }

        // Si es válido, establecer el perfil
        maxRetriesRef.current = 0; // Resetear contador
        setCurrentProfile({
          ...response.estudiante,
          fotoUrl: toCloudinaryHiRes(response.estudiante.fotoUrl) as any,
        });
        setNoMoreProfiles(false); // Asegurar que noMoreProfiles esté en false cuando hay perfil
      } else {
        // No hay más perfiles disponibles (ya se interactuó con todos o no hay usuarios)
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
  }, [currentUserId, sedeFilter, carreraFilter, interesFilter, searchFilter, edadMinFilter, edadMaxFilter]);

  // Cargar perfil inicial cuando se tenga el ID del usuario actual
  useEffect(() => {
    // Esperar a que se cargue el ID del usuario actual antes de cargar perfiles
    // Esto asegura que la validación de "no mostrar propio perfil" funcione correctamente
    if (currentUserId !== null) {
      loadNextProfile();
    }
  }, [currentUserId, loadNextProfile]);

  // Manejar skip con flecha derecha (guardar en historial y avanzar)
  const handleSkip = () => {
    if (!currentProfile || swiping || isAnimating) return;

    // Si estamos en un perfil nuevo (no en el historial), agregarlo al historial
    if (historyIndex === -1 && currentProfile) {
      setProfileHistory(prev => [...prev, { ...currentProfile, fotoUrl: toCloudinaryHiRes(currentProfile.fotoUrl) as any }]);
    }

    // Cargar siguiente perfil
    loadNextProfile(0);
    setHistoryIndex(-1); // Resetear a perfil nuevo
  };

  // Navegar hacia atrás con flecha izquierda (volver al perfil anterior)
  const handleNavigateBack = () => {
    if (swiping || isAnimating) return;

    // Si estamos en un perfil nuevo (historyIndex === -1), ir al último del historial
    if (historyIndex === -1) {
      if (profileHistory.length > 0) {
        const newIndex = profileHistory.length - 1;
        setHistoryIndex(newIndex);
        setCurrentProfile({
          ...profileHistory[newIndex],
          fotoUrl: toCloudinaryHiRes(profileHistory[newIndex].fotoUrl) as any,
        });
        setNoMoreProfiles(false);
      }
      return;
    }

    // Si estamos en el historial, ir al anterior
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setCurrentProfile({
        ...profileHistory[newIndex],
        fotoUrl: toCloudinaryHiRes(profileHistory[newIndex].fotoUrl) as any,
      });
      setNoMoreProfiles(false);
    }
  };

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

      // Si hay match, mostrar modal
      if (response.match) {
        setMatchedUserName(`${currentProfile.nombre} ${currentProfile.apellido}`);
        setShowMatchModal(true);
      }

      // Si estábamos navegando en el historial, remover el perfil del historial
      if (historyIndex >= 0) {
        setProfileHistory(prev => prev.filter((_, idx) => idx !== historyIndex));
        setHistoryIndex(-1);
      }

      // Cargar siguiente perfil
      try {
        // Usar loadNextProfile que ya tiene la validación incorporada
        await loadNextProfile(0);
        // Resetear animación después de cargar el perfil
        setIsAnimating(false);
        setSwipeDirection(null);
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

      // Si el error es 409 (conflict), significa que ya se interactuó con este usuario
      // En este caso, ocultar el perfil actual y cargar el siguiente
      if (axios.isAxiosError(error) && error.response?.status === 409) {
        // Si estábamos navegando en el historial, remover el perfil del historial
        if (historyIndex >= 0) {
          setProfileHistory(prev => prev.filter((_, idx) => idx !== historyIndex));
          setHistoryIndex(-1);
        }

        // Ocultar el perfil actual y cargar el siguiente
        try {
          await loadNextProfile(0);
          setIsAnimating(false);
          setSwipeDirection(null);
        } catch (loadError: unknown) {
          console.error('Error al cargar siguiente perfil después de 409:', loadError);
          setIsAnimating(false);
          setSwipeDirection(null);
          setCurrentProfile(null);
        }
      } else {
        // Para otros errores, mostrar el mensaje de error
        const errorMessage = getErrorMessage(error, 'Error al procesar tu acción');
        setError(errorMessage);
        setIsAnimating(false);
        setSwipeDirection(null);
      }
    } finally {
      setSwiping(false);
    }
  };

  return (
    <div className="discover-page">
      <BackgroundPattern />
      <ThemeToggle />

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
      {/* Filtros */}
      <div className="discover-filters">
        <div className="discover-filters-row">
          <select
            value={sedeFilter}
            onChange={e => setSedeFilter(e.target.value)}
            className="discover-filter-select"
          >
            <option value="">Todas las sedes</option>
            {sedeOptions.map(sede => (
              <option key={sede} value={sede}>
                {sede}
              </option>
            ))}
          </select>

          <select
            value={carreraFilter}
            onChange={e => setCarreraFilter(e.target.value)}
            className="discover-filter-select"
          >
            <option value="">Todas las carreras</option>
            {carreraOptions.map(carrera => (
              <option key={carrera} value={carrera}>
                {carrera}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder="Buscar por nombre o descrip."
            value={searchFilter}
            onChange={e => setSearchFilter(e.target.value)}
            className="discover-filter-input"
          />
        </div>

        <div className="discover-filters-row">
          <input
            type="number"
            min={18}
            max={100}
            placeholder="Edad mín."
            value={edadMinFilter}
            onChange={e => setEdadMinFilter(e.target.value)}
            className="discover-filter-input small"
          />
          <input
            type="number"
            min={18}
            max={100}
            placeholder="Edad máx."
            value={edadMaxFilter}
            onChange={e => setEdadMaxFilter(e.target.value)}
            className="discover-filter-input small"
          />

          <input
            type="text"
            placeholder="Interés (ej: React)"
            value={interesFilter}
            onChange={e => setInteresFilter(e.target.value)}
            className="discover-filter-input"
          />

          <button
            className="discover-filter-reset"
            onClick={() => {
              setSedeFilter('');
              setCarreraFilter('');
              setInteresFilter('');
              setSearchFilter('');
              setEdadMinFilter('');
              setEdadMaxFilter('');
              loadNextProfile(0); // recargar con filtros limpios
            }}
          >
            Limpiar filtros
          </button>
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
            <div className="discover-card-container">
              {/* Botón Navegar Atrás */}
              <button
                onClick={handleNavigateBack}
                disabled={swiping || isAnimating || (historyIndex === -1 && profileHistory.length === 0) || (historyIndex >= 0 && historyIndex === 0)}
                className="discover-nav-button discover-nav-button-left"
                title="Perfil anterior"
              >
                <ArrowLeftIcon
                  size={22}
                  color="currentColor"
                />
              </button>

              <StudentCard
                key={currentProfile.id}
                usuario={currentProfile}
                isAnimating={isAnimating}
                swipeDirection={swipeDirection}
                onModalOpenChange={setIsModalOpen}
              />

              {/* Botón Skip (Flecha Derecha) */}
              <button
                onClick={handleSkip}
                disabled={swiping || isAnimating}
                className="discover-nav-button discover-nav-button-right"
                title="Skipear estudiante"
              >
                <ArrowRightIcon
                  size={22}
                  color="currentColor"
                />
              </button>
            </div>
            <SwipeButtons
              onDislike={() => handleSwipe('dislike')}
              onLike={() => handleSwipe('like')}
              disabled={swiping || isAnimating}
            />
          </>
        )}

      </div>

      <NavigationBar isModalOpen={isModalOpen || showMatchModal} />

      {/* Modal de Match */}
      <MatchModal
        isOpen={showMatchModal}
        onClose={() => setShowMatchModal(false)}
        matchName={matchedUserName}
      />
    </div>
  );
};

export default DiscoverPage;
