/**
 * ConfirmModal - Modal de confirmación para acciones importantes (eliminar cuenta, cerrar sesión, etc.).
 * Wrapper del componente Modal con botones de acción personalizables.
 */

import { Modal } from './index';
import './ConfirmModal.css';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: 'primary' | 'danger';
}

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Aceptar',
  cancelText = 'Cancelar',
  confirmButtonVariant = 'primary'
}: ConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} className="confirm-modal-content">
      <div className="confirm-modal">
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <button
            className="confirm-modal-button confirm-modal-button-cancel"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className={`confirm-modal-button confirm-modal-button-confirm confirm-modal-button-${confirmButtonVariant}`}
            onClick={handleConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;

