import { useState, useEffect } from 'react';
import { NavigationBar, LoadingSpinner, EmptyState, InterestTag } from '../components';
import { discoverService } from '../services';
import type { Match } from '../types';
import './MatchesPage.css';

const MatchesPage = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  // Obtener iniciales para foto
  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre[0]}${apellido[0]}`.toUpperCase();
  };

  return (
    <div className="matches-page">
      {/* Header */}
      <div className="matches-header">
        <h1 className="matches-title">
          Matches
        </h1>
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
          <EmptyState message="Aún no tienes matches. ¡Sigue descubriendo!" />
        )}

        {!loading && matches.length > 0 && (
          <div className="matches-grid">
            {matches.map((match) => (
              <div key={match.id} className="match-card">
                {/* Foto de perfil */}
                <div className="match-photo">
                  {getInitials(match.estudiante.nombre, match.estudiante.apellido)}
                </div>

                {/* Información */}
                <div className="match-info">
                  <h3 className="match-name">
                    {match.estudiante.nombre} {match.estudiante.apellido}
                    <span className="match-age">
                      , {match.estudiante.edad}
                    </span>
                  </h3>

                  <p className="match-carrera">
                    {match.estudiante.carrera}
                  </p>

                  <p className="match-sede">
                    {match.estudiante.sede}
                  </p>

                  {match.estudiante.intereses && match.estudiante.intereses.length > 0 && (
                    <div className="match-intereses">
                      {match.estudiante.intereses.slice(0, 3).map((interes, index) => (
                        <InterestTag key={index} interest={interes} />
                      ))}
                      {match.estudiante.intereses.length > 3 && (
                        <span className="match-more-intereses">
                          +{match.estudiante.intereses.length - 3} más
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Icono de chat */}
                <div className="match-chat-icon">
                  💬
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <NavigationBar />
    </div>
  );
};

export default MatchesPage;

