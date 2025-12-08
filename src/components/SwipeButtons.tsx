/**
 * SwipeButtons - Botones de acción para like/dislike en DiscoverPage.
 * Incluye animaciones visuales de feedback al hacer click.
 */

import { useState } from 'react';
import { CloseIcon, HeartIcon } from './icons';
import './SwipeButtons.css';

interface SwipeButtonsProps {
  onDislike: () => void;
  onLike: () => void;
  disabled?: boolean;
}

const SwipeButtons = ({ 
  onDislike, 
  onLike,
  disabled = false 
}: SwipeButtonsProps) => {
  const [isLiking, setIsLiking] = useState(false);
  const [isDisliking, setIsDisliking] = useState(false);

  const handleLike = () => {
    if (disabled) return;
    setIsLiking(true);
    // Animación antes de ejecutar la acción
    setTimeout(() => {
      onLike();
      setTimeout(() => setIsLiking(false), 300);
    }, 150);
  };

  const handleDislike = () => {
    if (disabled) return;
    setIsDisliking(true);
    onDislike();
    setTimeout(() => setIsDisliking(false), 300);
  };

  return (
    <div className="swipe-buttons">
      {/* Botón Dislike */}
      <button
        onClick={handleDislike}
        disabled={disabled}
        className={`swipe-button dislike-button ${isDisliking ? 'swipe-button-animating' : ''}`}
      >
        <CloseIcon size={20} color="#CCCCCC" />
      </button>

      {/* Botón Like */}
      <button
        onClick={handleLike}
        disabled={disabled}
        className={`swipe-button like-button ${isLiking ? 'swipe-button-like-animating' : ''}`}
      >
        <HeartIcon size={22} color="#FFFFFF" filled />
      </button>
    </div>
  );
};

export default SwipeButtons;

