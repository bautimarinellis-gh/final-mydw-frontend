/**
 * MatchesPage - Pantalla que muestra matches confirmados y likes enviados.
 * Ofrece dos tabs para ver conexiones mutuas (matches) y likes pendientes (sin respuesta).
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  NavigationBar, 
  LoadingSpinner, 
  BackgroundPattern, 
  MatchCard, 
  HeartIcon, 
  ThemeToggle 
} from '../components';
import { discoverService } from '../services';
import './MatchesPage.css';
import type { Match, Usuario } from '../types';

type LikeHistoryItem = {
  id: string;
  createdAt: string;
  estudiante: Usuario;
};

const MatchesPage = () => {
  const [likes, setLikes] = useState<LikeHistoryItem[]>([]);
  const [activeTab, setActiveTab] = useState<'matches' | 'likes'>('matches');
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openModalId, setOpenModalId] = useState<string | null>(null);

  const toCloudinaryHiRes = (url?: string | null): string | undefined => {
    if (!url) return undefined;
    if (!url.startsWith('http://') && !url.startsWith('https://')) return url;

    const isCloudinary =
      url.includes('res.cloudinary.com') && url.includes('/upload/');
    if (!isCloudinary) return url;

    const parts = url.split('/upload/');
    if (parts.length !== 2) return url;

    const transform = 'f_auto,q_auto,c_fill,g_auto,w_300,h_300';
    return `${parts[0]}/upload/${transform}/${parts[1]}`;
  };

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [matchesData, likesData] = await Promise.all([
          discoverService.getMatches(),
          discoverService.getLikeHistory(),
        ]);

        setMatches(matchesData);
        setLikes(likesData);
      } catch (err: any) {
        console.error('Error cargando matches/likes:', err);
        const msg =
          err?.response?.data?.message ||
          'No se pudieron cargar tus conexiones.';
        setError(msg);
        setMatches([]);
        setLikes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="matches-page">
      <BackgroundPattern />
      <ThemeToggle />
      
      <div className="matches-header">
        <div className="matches-header-content">
          <h1 className="matches-title">
            Tus Conexiones
          </h1>
          
          {loading ? (
            <p className="matches-subtitle">Cargando...</p>
          ) : matches.length > 0 ? (
            <p className="matches-subtitle">
              Tenés {matches.length}{' '}
              {matches.length === 1 ? 'match listo' : 'matches listos'} para chatear
            </p>
          ) : (
            <p className="matches-subtitle">
              Todavía no hay conexiones… pero nunca es tarde
            </p>
          )}
        </div>
      </div>

      <div className="matches-tabs">
        <button
          className={`matches-tab ${activeTab === 'matches' ? 'active' : ''}`}
          onClick={() => setActiveTab('matches')}
        >
          Matches
        </button>
        <button
          className={`matches-tab ${activeTab === 'likes' ? 'active' : ''}`}
          onClick={() => setActiveTab('likes')}
        >
          Likes enviados
        </button>
      </div>

      <div className="matches-content">
        {loading && <LoadingSpinner />}

        {error && (
          <div className="matches-error">
            {error}
          </div>
        )}

        {!loading && !error && activeTab === 'matches' && (
          <>
            {matches.length === 0 ? (
              <div className="matches-empty">
                <div className="matches-empty-icon">
                  <HeartIcon size={64} color="var(--color-text-tertiary)" filled={false} />
                </div>
                <h2 className="matches-empty-title">No hay matches aún</h2>
                <p className="matches-empty-text">
                  Seguí descubriendo perfiles para encontrar tu próxima conexión.
                </p>
              </div>
            ) : (
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
          </>
        )}

        {!loading && !error && activeTab === 'likes' && (
          <>
            {likes.length === 0 ? (
              <div className="matches-empty">
                <div className="matches-empty-icon">
                  <HeartIcon size={64} color="var(--color-text-tertiary)" filled={false} />
                </div>
                <h2 className="matches-empty-title">Todavía no diste like</h2>
                <p className="matches-empty-text">
                  Deslizá hacia la derecha en Descubrir para empezar a conectar.
                </p>
              </div>
            ) : (
              <motion.div
                className="matches-grid"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                {likes.map((like, index) => (
                  <motion.div
                    key={like.id}
                    className="match-like-card"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 * index }}
                  >
                    <div className="match-like-avatar-wrapper">
                      <img
                        src={
                          toCloudinaryHiRes(like.estudiante.fotoUrl) ||
                          '/default-avatar.png'
                        }
                        alt={`${like.estudiante.nombre} ${like.estudiante.apellido}`}
                        className="match-like-avatar"
                      />
                    </div>
                    <div className="match-like-info">
                      <div className="match-like-name">
                        {like.estudiante.nombre} {like.estudiante.apellido}
                      </div>
                      <div className="match-like-meta">
                        {like.estudiante.carrera} · {like.estudiante.sede}
                      </div>
                      <div className="match-like-date">
                        Like enviado el{' '}
                        {new Date(like.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </>
        )}
      </div>

      <NavigationBar isModalOpen={openModalId !== null} />
    </div>
  );
};

export default MatchesPage;