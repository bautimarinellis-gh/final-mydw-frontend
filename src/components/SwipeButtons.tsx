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
  return (
    <div className="swipe-buttons">
      {/* Botón Dislike */}
      <button
        onClick={onDislike}
        disabled={disabled}
        className="swipe-button dislike-button"
      >
        <CloseIcon size={20} color="#CCCCCC" />
      </button>

      {/* Botón Like */}
      <button
        onClick={onLike}
        disabled={disabled}
        className="swipe-button like-button"
      >
        <HeartIcon size={22} color="#FFFFFF" filled />
      </button>
    </div>
  );
};

export default SwipeButtons;

