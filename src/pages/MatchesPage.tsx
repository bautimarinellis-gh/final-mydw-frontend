import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { NavigationBar, LoadingSpinner, BackgroundPattern, MatchCard, HeartIcon, ThemeToggle } from '../components';
import { discoverService } from '../services';
import type { Match } from '../types';
import './MatchesPage.css';

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  // Cargar matches desde el backend
  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await discoverService.getMatches();
        setMatches(data);
      } catch (err: any) {
        console.error('Error al cargar matches:', err);
        const errorMessage = err.response?.data?.message || 'No se pudo cargar los matches';
        setError(errorMessage);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  // Variantes de animación para el contenedor
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  return (
    <div className="matches-page">
      <BackgroundPattern />
      <ThemeToggle />
      
      {/* Header */}
      <div className="matches-header">
        <div className="matches-header-content">
          <h1 className="matches-title">
            Tus Conexiones
          </h1>
          
          {loading ? (
            <p className="matches-subtitle">Cargando...</p>
          ) : matches.length > 0 ? (
            <p className="matches-subtitle">
              Tenés {matches.length} {matches.length === 1 ? 'nuevo match' : 'nuevos matches'} listos para chatear
            </p>
          ) : (
            <p className="matches-subtitle">
              Todavía no hay conexiones… pero nunca es tarde
            </p>
          )}
          
        </div>
      </div>

      {/* Contenido */}
      <div className="matches-content">
        {loading && <LoadingSpinner />}

        {error && (
          <div className="matches-error">
            {error}
          </div>
        )}

        {!loading && matches.length === 0 && (
          <div className="matches-empty">
            <div className="matches-empty-icon">
              <HeartIcon size={64} color="var(--color-text-tertiary)" filled={false} />
            </div>
            <h2 className="matches-empty-title">No hay matches aún</h2>
            <p className="matches-empty-text">
              Seguí descubriendo perfiles para encontrar tu próxima conexión
            </p>
          </div>
        )}

        {!loading && matches.length > 0 && (
          <motion.div
            className="matches-grid"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {matches.map((match, index) => (
              <MatchCard
                key={match.id}
                match={match}
                index={index}
                onModalOpenChange={(isOpen) => {
                  setOpenModalId(isOpen ? match.id : null);
                }}
              />
            ))}
          </motion.div>
        )}
      </div>

      <NavigationBar isModalOpen={openModalId !== null} />
    </div>
  );
};

export default MatchesPage;
