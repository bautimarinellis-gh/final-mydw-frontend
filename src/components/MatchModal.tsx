/**
 * MatchModal - Modal de celebración que se muestra cuando hay un nuevo match.
 * Incluye animaciones con framer-motion y cierre con Escape/click fuera.
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GraduationIcon from './icons/GraduationIcon';
import './MatchModal.css';

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  matchName: string;
}

const MatchModal = ({ isOpen, onClose, matchName }: MatchModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="match-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="match-modal-content"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ 
              type: "spring", 
              damping: 25, 
              stiffness: 300
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icono decorativo */}
            <div className="match-modal-icons">
              {/* Birrete académico */}
              <motion.div
                className="match-icon match-icon-center"
                initial={{ y: -50, opacity: 0, scale: 0 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ 
                  delay: 0.1,
                  type: "spring",
                  damping: 12,
                  stiffness: 200
                }}
              >
                <GraduationIcon size={64} />
              </motion.div>
            </div>

            {/* Título */}
            <motion.h2 
              className="match-modal-title"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              ¡Nuevo match!
            </motion.h2>

            {/* Mensaje */}
            <motion.p 
              className="match-modal-message"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Conectaste con <strong>{matchName}</strong>. ¡Hora de conocerse!
            </motion.p>

            {/* Botón */}
            <motion.button
              className="match-modal-button"
              onClick={onClose}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Aceptar
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MatchModal;

