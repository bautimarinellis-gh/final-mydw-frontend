import { useState, useEffect } from 'react';
import { z, type ZodIssue } from 'zod';
import Modal from '../Modal';
import { profileUpdateSchema, validateUniqueInterests } from '../../validators/profile';
import { authService } from '../../services';
import { useAuth } from '../../contexts';
import { getProfileImageUrl } from '../../utils/image';
import type { Usuario } from '../../types';
import { CameraIcon, TrashIcon } from '../icons';
import './EditProfileModal.css';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: Usuario;
  onSave: (updatedData: Partial<Usuario>) => Promise<void>;
}

const EditProfileModal = ({ isOpen, onClose, user, onSave }: EditProfileModalProps) => {
  const { refreshUser } = useAuth();
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [descripcion, setDescripcion] = useState(user.descripcion || '');
  const [intereses, setIntereses] = useState<string[]>(user.intereses || []);
  const [nuevoInteres, setNuevoInteres] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProfileImage(null);
      setProfileImagePreview(null);
      setDescripcion(user.descripcion || '');
      setIntereses(user.intereses || []);
      setNuevoInteres('');
      setErrors({});
    }
  }, [isOpen, user]);

  const handleAddInteres = () => {
    const trimmed = nuevoInteres.trim();
    if (!trimmed) return;

    const validation = z.string()
      .min(1, 'El interés debe tener al menos 1 carácter')
      .max(30, 'El interés no puede tener más de 30 caracteres')
      .safeParse(trimmed);

    if (!validation.success) {
      setErrors({ nuevoInteres: validation.error.issues[0].message });
      return;
    }

    const newIntereses = [...intereses, trimmed];
    const uniqueValidation = validateUniqueInterests(newIntereses);
    
    if (!uniqueValidation.isValid) {
      setErrors({ nuevoInteres: uniqueValidation.error || 'Interés duplicado' });
      return;
    }

    if (newIntereses.length > 5) {
      setErrors({ nuevoInteres: 'No puedes tener más de 5 intereses' });
      return;
    }

    setIntereses(newIntereses);
    setNuevoInteres('');
    setErrors({ ...errors, nuevoInteres: '' });
  };

  const handleRemoveInteres = (index: number) => {
    setIntereses(intereses.filter((_, i) => i !== index));
  };

  // Manejar cambio de archivo de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfileImage(null);
      setProfileImagePreview(null);
      if (errors.profileImage) {
        setErrors({ ...errors, profileImage: '' });
      }
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setErrors({ ...errors, profileImage: 'Solo se permiten archivos PNG, SVG y JPG' });
      setProfileImage(null);
      setProfileImagePreview(null);
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      setErrors({ ...errors, profileImage: 'El archivo es demasiado grande. Tamaño máximo: 5MB' });
      setProfileImage(null);
      setProfileImagePreview(null);
      return;
    }

    setProfileImage(file);
    setErrors({ ...errors, profileImage: '' });

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    setIsSaving(true);

    // Si hay una imagen nueva, subirla primero
    if (profileImage) {
      try {
        await authService.uploadProfileImage(profileImage);
        // Recargar el usuario desde el contexto para actualizar la imagen
        await refreshUser();
      } catch (imageError) {
        console.error('Error al subir imagen:', imageError);
        setErrors({ 
          profileImage: imageError instanceof Error 
            ? imageError.message 
            : 'Error al subir la imagen' 
        });
        setIsSaving(false);
        return;
      }
    }

    const data = {
      descripcion: descripcion || undefined,
      intereses: intereses.length > 0 ? intereses : undefined,
    };

    const validation = profileUpdateSchema.safeParse(data);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((err: ZodIssue) => {
        if (err.path[0]) {
          newErrors[String(err.path[0])] = err.message;
        }
      });
      setErrors(newErrors);
      setIsSaving(false);
      return;
    }

    const uniqueValidation = validateUniqueInterests(intereses);
    if (!uniqueValidation.isValid) {
      setErrors({ intereses: uniqueValidation.error || 'Intereses duplicados' });
      setIsSaving(false);
      return;
    }

    try {
      await onSave(data);
      
      // El parent (ProfilePage) ya maneja el refresh del usuario
      // No necesitamos llamar a refreshUser aquí
      
      onClose();
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      // No cerrar el modal si hay error para que el usuario pueda corregir
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Editar perfil">
      <form onSubmit={handleSubmit} className="edit-profile-form">
        {/* Foto de perfil */}
        <div className="form-field">
          <label htmlFor="profileImage" className="form-label">
            Foto de perfil
          </label>
          
          {/* Input file oculto */}
          <input
            id="profileImage"
            type="file"
            accept="image/png,image/svg+xml,image/jpeg,image/jpg"
            onChange={handleImageChange}
            disabled={isSaving}
            className="file-input-hidden"
          />
          
          {/* Botón personalizado para subir archivo */}
          <div className="file-upload-wrapper">
            <button
              type="button"
              onClick={() => {
                const fileInput = document.getElementById('profileImage') as HTMLInputElement;
                fileInput?.click();
              }}
              disabled={isSaving}
              className="file-upload-button"
            >
              <span className="file-upload-icon">
                <CameraIcon size={20} color="currentColor" />
              </span>
              <span className="file-upload-text">
                {profileImage ? profileImage.name : 'Seleccionar archivo'}
              </span>
            </button>
            {!profileImage && (
              <span className="file-upload-hint">
                PNG, SVG o JPG (máx. 5MB)
              </span>
            )}
          </div>
          
          {errors.profileImage && <span className="form-error">{errors.profileImage}</span>}
          
          {/* Mostrar imagen actual si existe y no hay preview nuevo */}
          {!profileImagePreview && user.fotoUrl && (
            <div className="profile-image-preview-container">
              <img 
                src={getProfileImageUrl(user.fotoUrl) || ''}
                alt="Foto actual" 
                className="profile-image-preview"
              />
            </div>
          )}
          
          {/* Mostrar preview de nueva imagen */}
          {profileImagePreview && (
            <div className="profile-image-preview-container">
              <img 
                src={profileImagePreview} 
                alt="Preview" 
                className="profile-image-preview"
              />
              <button
                type="button"
                onClick={() => {
                  setProfileImage(null);
                  setProfileImagePreview(null);
                  const fileInput = document.getElementById('profileImage') as HTMLInputElement;
                  if (fileInput) {
                    fileInput.value = '';
                  }
                }}
                className="remove-image-button"
                disabled={isSaving}
              >
                <span className="remove-image-icon">
                  <TrashIcon size={16} color="currentColor" />
                </span>
                Eliminar imagen
              </button>
            </div>
          )}
        </div>

        {/* Descripción */}
        <div className="form-field">
          <label htmlFor="descripcion" className="form-label">
            Acerca de mí
          </label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            placeholder="Contá algo sobre vos..."
            maxLength={300}
            rows={4}
            className={`form-textarea ${errors.descripcion ? 'error' : ''}`}
          />
          <div className="form-char-count">
            {descripcion.length}/300
          </div>
          {errors.descripcion && <span className="form-error">{errors.descripcion}</span>}
        </div>

        {/* Intereses */}
        <div className="form-field">
          <label htmlFor="nuevoInteres" className="form-label">
            Intereses ({intereses.length}/5)
          </label>
          <div className="intereses-input-group">
            <input
              id="nuevoInteres"
              type="text"
              value={nuevoInteres}
              onChange={(e) => {
                setNuevoInteres(e.target.value);
                if (errors.nuevoInteres) {
                  setErrors({ ...errors, nuevoInteres: '' });
                }
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddInteres();
                }
              }}
              placeholder="Agregar interés..."
              maxLength={30}
              className={`form-input ${errors.nuevoInteres ? 'error' : ''}`}
              disabled={intereses.length >= 5}
            />
            <button
              type="button"
              onClick={handleAddInteres}
              className="add-interes-button"
              disabled={intereses.length >= 5 || !nuevoInteres.trim()}
            >
              Agregar
            </button>
          </div>
          {errors.nuevoInteres && <span className="form-error">{errors.nuevoInteres}</span>}
          
          {intereses.length > 0 && (
            <div className="intereses-list">
              {intereses.map((interes, index) => (
                <div key={index} className="interes-chip-edit">
                  <span>{interes}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveInteres(index)}
                    className="remove-interes-button"
                    aria-label="Eliminar interés"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botones */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="form-button cancel-button"
            disabled={isSaving}
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="form-button save-button"
            disabled={isSaving}
          >
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditProfileModal;

