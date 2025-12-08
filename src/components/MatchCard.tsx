/**
 * MatchCard - Tarjeta de match con foto, información y acciones (chatear/ver perfil).
 * Incluye badge "Nuevo" para matches recientes y animaciones con framer-motion.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Match } from '../types';
import { getProfileImageUrl } from '../utils/image';
import { StudentDetailModal, ChatIcon, EyeIcon, SparkleIcon } from './index';
import './MatchCard.css';

interface MatchCardProps {
  match: Match;
  index?: number;
  onModalOpenChange?: (isOpen: boolean) => void;
}

const MatchCard = ({ match, index = 0, onModalOpenChange }: MatchCardProps) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Obtener iniciales para foto
  const getInitials = () => {
    return `${match.estudiante.nombre[0]}${match.estudiante.apellido[0]}`.toUpperCase();
  };

  // Verificar si el match es reciente (últimas 24 horas)
  const isRecent = () => {
    const matchDate = new Date(match.createdAt);
    const now = new Date();
    const diffInHours = (now.getTime() - matchDate.getTime()) / (1000 * 60 * 60);
    return diffInHours < 24;
  };

  const handleChatClick = () => {
    navigate(`/chat/${match.id}`);
  };

  const handleViewProfile = () => {
    setIsModalOpen(true);
    onModalOpenChange?.(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    onModalOpenChange?.(false);
  };

  return (
    <>
      <motion.div
        className="match-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.1 }}
      >
        {/* Etiqueta "Nuevo" si es reciente */}
        {isRecent() && (
          <div className="match-new-badge">
            <SparkleIcon size={14} color="currentColor" />
            <span>Nuevo</span>
          </div>
        )}

        {/* Foto de perfil */}
        <div className="match-card-photo">
          {match.estudiante.fotoUrl ? (
            <img
              src={getProfileImageUrl(match.estudiante.fotoUrl) || ''}
              alt={`${match.estudiante.nombre} ${match.estudiante.apellido}`}
              className="match-card-image"
            />
          ) : (
            <div className="match-card-initials">
              {getInitials()}
            </div>
          )}
          
          {/* Overlay al hover */}
          <div className="match-card-overlay">
            <div className="match-card-buttons">
              <button
                className="match-card-button match-card-button-primary"
                onClick={handleChatClick}
              >
                <ChatIcon size={18} color="currentColor" />
                <span>Chatear</span>
              </button>
              <button
                className="match-card-button match-card-button-secondary"
                onClick={handleViewProfile}
              >
                <EyeIcon size={18} color="currentColor" />
                <span>Ver perfil</span>
              </button>
            </div>
          </div>
        </div>

        {/* Información */}
        <div className="match-card-info">
          <h3 className="match-card-name">
            {match.estudiante.nombre} {match.estudiante.apellido}
          </h3>
          <p className="match-card-carrera">{match.estudiante.carrera}</p>
          <p className="match-card-sede">{match.estudiante.sede}</p>
        </div>
      </motion.div>

      {/* Modal de detalles */}
      <StudentDetailModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        estudiante={match.estudiante}
      />
    </>
  );
};

export default MatchCard;

