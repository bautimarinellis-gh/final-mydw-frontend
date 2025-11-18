import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BackgroundPattern, InterestTag, UniversityHeartIcon, ThemeToggle } from '../components';
import { authService } from '../services';
import { useAuth } from '../features/auth';
import { CARRERAS } from '../constants/carreras';
import { SEDES } from '../constants/sedes';
import {
  validateNombre,
  validateApellido,
  validateEmail,
  validatePassword,
  validateEdad,
  validateDescripcion,
  validateInteres,
  isInteresDuplicate,
  validateInteresesList,
} from '../utils/validation';
import { getErrorMessage, getValidationErrors } from '../utils/error';
import type { RegisterRequest } from '../types';
import './RegisterPage.css';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle } = useAuth();
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Datos del Paso 1
  const [step1Data, setStep1Data] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    carrera: '',
    sede: '',
    edad: '',
  });

  // Errores de validación del Paso 1
  const [step1Errors, setStep1Errors] = useState<Record<string, string>>({});

  // Datos del Paso 2
  const [step2Data, setStep2Data] = useState({
    descripcion: '',
    intereses: [] as string[],
  });

  // Estado para input de interés
  const [interesInput, setInteresInput] = useState('');
  const [interesError, setInteresError] = useState<string | null>(null);

  // Estado para foto de perfil
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [profileImageError, setProfileImageError] = useState<string | null>(null);

  // Validar y avanzar al Paso 2
  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validar todos los campos
    const errors: Record<string, string> = {};

    const nombreError = validateNombre(step1Data.nombre);
    if (nombreError) errors.nombre = nombreError;

    const apellidoError = validateApellido(step1Data.apellido);
    if (apellidoError) errors.apellido = apellidoError;

    const emailError = validateEmail(step1Data.email);
    if (emailError) errors.email = emailError;

    const passwordError = validatePassword(step1Data.password);
    if (passwordError) errors.password = passwordError;

    if (!step1Data.carrera) {
      errors.carrera = 'La carrera es requerida';
    }

    if (!step1Data.sede) {
      errors.sede = 'La sede es requerida';
    }

    const edadError = validateEdad(step1Data.edad);
    if (edadError) errors.edad = edadError;

    setStep1Errors(errors);

    // Si hay errores, no avanzar
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Avanzar al Paso 2
    setStep(2);
  };

  const handleGoogleRegister = async () => {
    setGoogleError(null);
    setSuccessMessage(null);
    const fieldErrors: Record<string, string> = {};

    if (!step1Data.carrera) {
      fieldErrors.carrera = 'La carrera es requerida';
    }

    if (!step1Data.sede) {
      fieldErrors.sede = 'La sede es requerida';
    }

    if (!step1Data.edad) {
      fieldErrors.edad = 'La edad es requerida';
    } else {
      const edadError = validateEdad(step1Data.edad);
      if (edadError) {
        fieldErrors.edad = edadError;
      }
    }

    if (Object.keys(fieldErrors).length > 0) {
      setStep1Errors((prev) => ({ ...prev, ...fieldErrors }));
      setGoogleError(fieldErrors.edad || 'Completa carrera, sede y edad para registrarte con Google.');
      return;
    }

    setGoogleLoading(true);
    try {
      await loginWithGoogle({
        carrera: step1Data.carrera,
        sede: step1Data.sede,
        edad: parseInt(step1Data.edad, 10),
      });
      setSuccessMessage('¡Registro exitoso! Redirigiendo a inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      console.error('Error al registrarse con Google:', error);
      const errorMessage = getErrorMessage(error, 'No pudimos registrarte con Google.');
      
      // Si el email ya está registrado, mostrar mensaje más claro
      if (errorMessage.includes('ya está registrado') || errorMessage.includes('ya existe')) {
        setGoogleError('Este email ya está registrado. Si ya tienes una cuenta, ve a la página de inicio de sesión.');
      } else {
        setGoogleError(errorMessage);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  // Agregar interés
  const handleAddInteres = () => {
    setInteresError(null);

    // Validar interés
    const error = validateInteres(interesInput);
    if (error) {
      setInteresError(error);
      return;
    }

    // Verificar duplicados
    if (isInteresDuplicate(interesInput, step2Data.intereses)) {
      setInteresError('Este interés ya está agregado');
      return;
    }

    // Verificar límite de 5
    if (step2Data.intereses.length >= 5) {
      setInteresError('No puedes agregar más de 5 intereses');
      return;
    }

    // Agregar interés
    setStep2Data({
      ...step2Data,
      intereses: [...step2Data.intereses, interesInput.trim()],
    });
    setInteresInput('');
  };

  // Eliminar interés
  const handleRemoveInteres = (index: number) => {
    setStep2Data({
      ...step2Data,
      intereses: step2Data.intereses.filter((_, i) => i !== index),
    });
  };

  // Manejar cambio de archivo de imagen
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setProfileImage(null);
      setProfileImagePreview(null);
      setProfileImageError(null);
      return;
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setProfileImageError('Solo se permiten archivos PNG, SVG y JPG');
      setProfileImage(null);
      setProfileImagePreview(null);
      return;
    }

    // Validar tamaño (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB en bytes
    if (file.size > maxSize) {
      setProfileImageError('El archivo es demasiado grande. Tamaño máximo: 5MB');
      setProfileImage(null);
      setProfileImagePreview(null);
      return;
    }

    setProfileImage(file);
    setProfileImageError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Validar y enviar registro
  const handleRegister = async (skipStep2: boolean = false) => {
    setGeneralError(null);
    setSuccessMessage(null);
    setStep1Errors({});
    setLoading(true);

    try {
      // Validar descripción si se proporciona
      if (!skipStep2 && step2Data.descripcion) {
        const descripcionError = validateDescripcion(step2Data.descripcion);
        if (descripcionError) {
          setGeneralError(descripcionError);
          setLoading(false);
          return;
        }
      }

      // Validar intereses si se proporcionan
      if (!skipStep2 && step2Data.intereses.length > 0) {
        const interesesError = validateInteresesList(step2Data.intereses);
        if (interesesError) {
          setGeneralError(interesesError);
          setLoading(false);
          return;
        }
      }

      // Preparar datos para enviar
      const registerData: RegisterRequest = {
        nombre: step1Data.nombre.trim(),
        apellido: step1Data.apellido.trim(),
        email: step1Data.email.trim().toLowerCase(),
        password: step1Data.password,
        carrera: step1Data.carrera,
        sede: step1Data.sede,
        edad: parseInt(step1Data.edad, 10),
        descripcion: skipStep2 || !step2Data.descripcion ? undefined : step2Data.descripcion.trim(),
        intereses: skipStep2 || step2Data.intereses.length === 0 ? undefined : step2Data.intereses.map(i => i.trim()),
      };

      // Enviar registro al backend usando el contexto
      await register(registerData);

      // Si hay una imagen seleccionada, subirla después del registro
      if (profileImage) {
        try {
          await authService.uploadProfileImage(profileImage);
        } catch (imageError) {
          console.error('Error al subir imagen de perfil:', imageError);
          // No bloquear el registro si falla la subida de imagen
          // Solo mostrar un mensaje de advertencia
          const errorMessage = getErrorMessage(imageError, 'Error al subir la imagen de perfil');
          setGeneralError(`Registro exitoso, pero ${errorMessage.toLowerCase()}. Puedes subir tu foto más tarde.`);
          setTimeout(() => {
            navigate('/login');
          }, 3000);
          return;
        }
      }

      // Mostrar mensaje de éxito y redirigir
      setSuccessMessage('¡Registro exitoso! Redirigiendo a inicio de sesión...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (error: unknown) {
      console.error('Error al registrar:', error);

      // Manejar errores de validación del servidor
      const validationErrors = getValidationErrors(error);
      if (validationErrors) {
        // Mapear errores del servidor a los campos del formulario
        setStep1Errors(validationErrors);
        setGeneralError('Por favor, corrige los errores en el formulario');
      } else {
        // Error general
        const errorMessage = getErrorMessage(error, 'Error al registrar. Intenta de nuevo.');
        setGeneralError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  // Manejar cambio en campos del Paso 1
  const handleStep1Change = (field: string, value: string) => {
    setStep1Data({ ...step1Data, [field]: value });
    // Limpiar error del campo cuando el usuario escribe
    if (step1Errors[field]) {
      setStep1Errors({ ...step1Errors, [field]: '' });
    }
  };

  // Manejar cambio en descripción
  const handleDescripcionChange = (value: string) => {
    setStep2Data({ ...step2Data, descripcion: value });
  };

  // Manejar Enter en input de interés
  const handleInteresKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddInteres();
    }
  };

  return (
    <div className="register-page">
      <BackgroundPattern />
      <ThemeToggle />

      <div className="register-container">
        {/* Indicador de paso */}
        <div className="register-step-indicator">
          <span className="register-step-text">
            Paso {step} de 2
          </span>
        </div>

        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="register-success-general">
            {successMessage}
          </div>
        )}

        {/* Error general */}
        {generalError && (
          <div className="register-error-general">
            {generalError}
          </div>
        )}

        {/* Paso 1: Datos básicos */}
        {step === 1 && (
          <form className="register-form" onSubmit={handleStep1Submit}>
            <div className="register-heart-icon">
              <UniversityHeartIcon size={48} />
            </div>
            <h1 className="register-title">Crear Cuenta</h1>
            <p className="register-subtitle">
              Completa tus datos básicos para comenzar
            </p>

            {/* Nombre */}
            <div className="register-field">
              <label htmlFor="nombre" className="register-label">
                Nombre *
              </label>
              <input
                id="nombre"
                type="text"
                className={`register-input ${step1Errors.nombre ? 'register-input-error' : ''}`}
                value={step1Data.nombre}
                onChange={(e) => handleStep1Change('nombre', e.target.value)}
                placeholder="Ingresa tu nombre"
              />
              {step1Errors.nombre && (
                <span className="register-error">{step1Errors.nombre}</span>
              )}
            </div>

            {/* Apellido */}
            <div className="register-field">
              <label htmlFor="apellido" className="register-label">
                Apellido *
              </label>
              <input
                id="apellido"
                type="text"
                className={`register-input ${step1Errors.apellido ? 'register-input-error' : ''}`}
                value={step1Data.apellido}
                onChange={(e) => handleStep1Change('apellido', e.target.value)}
                placeholder="Ingresa tu apellido"
              />
              {step1Errors.apellido && (
                <span className="register-error">{step1Errors.apellido}</span>
              )}
            </div>

            {/* Email */}
            <div className="register-field">
              <label htmlFor="email" className="register-label">
                Email *
              </label>
              <input
                id="email"
                type="email"
                className={`register-input ${step1Errors.email ? 'register-input-error' : ''}`}
                value={step1Data.email}
                onChange={(e) => handleStep1Change('email', e.target.value)}
                placeholder="tu.email@ejemplo.com"
              />
              {step1Errors.email && (
                <span className="register-error">{step1Errors.email}</span>
              )}
            </div>

            {/* Password */}
            <div className="register-field">
              <label htmlFor="password" className="register-label">
                Contraseña *
              </label>
              <input
                id="password"
                type="password"
                className={`register-input ${step1Errors.password ? 'register-input-error' : ''}`}
                value={step1Data.password}
                onChange={(e) => handleStep1Change('password', e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              {step1Errors.password && (
                <span className="register-error">{step1Errors.password}</span>
              )}
            </div>

            {/* Carrera */}
            <div className="register-field">
              <label htmlFor="carrera" className="register-label">
                Carrera *
              </label>
              <select
                id="carrera"
                className={`register-select ${step1Errors.carrera ? 'register-input-error' : ''}`}
                value={step1Data.carrera}
                onChange={(e) => handleStep1Change('carrera', e.target.value)}
              >
                <option value="">Selecciona una carrera</option>
                {CARRERAS.map((carrera) => (
                  <option key={carrera} value={carrera}>
                    {carrera}
                  </option>
                ))}
              </select>
              {step1Errors.carrera && (
                <span className="register-error">{step1Errors.carrera}</span>
              )}
            </div>

            {/* Sede */}
            <div className="register-field">
              <label htmlFor="sede" className="register-label">
                Sede *
              </label>
              <select
                id="sede"
                className={`register-select ${step1Errors.sede ? 'register-input-error' : ''}`}
                value={step1Data.sede}
                onChange={(e) => handleStep1Change('sede', e.target.value)}
              >
                <option value="">Selecciona una sede</option>
                {SEDES.map((sede) => (
                  <option key={sede} value={sede}>
                    {sede}
                  </option>
                ))}
              </select>
              {step1Errors.sede && (
                <span className="register-error">{step1Errors.sede}</span>
              )}
            </div>

            {/* Edad */}
            <div className="register-field">
              <label htmlFor="edad" className="register-label">
                Edad *
              </label>
              <input
                id="edad"
                type="number"
                min="17"
                max="99"
                className={`register-input ${step1Errors.edad ? 'register-input-error' : ''}`}
                value={step1Data.edad}
                onChange={(e) => handleStep1Change('edad', e.target.value)}
                placeholder="17-99"
              />
              {step1Errors.edad && (
                <span className="register-error">{step1Errors.edad}</span>
              )}
            </div>

            <div className="register-divider">
              <span>o continúa con</span>
            </div>

            <div className="register-google-section">
              <p className="register-google-text">
                Si prefieres, autentícate con Google. Solo necesitamos tu carrera, sede y edad para crear tu perfil universitario.
              </p>
              {googleError && (
                <div className="register-error-general register-google-error">
                  {googleError}
                  {googleError.includes('ya está registrado') && (
                    <div style={{ marginTop: '8px' }}>
                      <Link to="/login" className="register-footer-link" style={{ fontSize: '13px' }}>
                        Ir a iniciar sesión →
                      </Link>
                    </div>
                  )}
                </div>
              )}
              <button
                type="button"
                className="register-google-button"
                onClick={handleGoogleRegister}
                disabled={googleLoading}
              >
                {googleLoading ? 'Conectando con Google...' : 'Continuar con Google'}
              </button>
            </div>

            {/* Botón Continuar */}
            <button
              type="submit"
              className="register-button-primary"
              disabled={loading}
            >
              Continuar
            </button>

            {/* Link a Login */}
            <div className="register-login-link">
              <span className="register-login-text">¿Ya tienes cuenta?</span>
              <Link to="/login" className="register-login-button">
                Inicia sesión
              </Link>
            </div>
          </form>
        )}

        {/* Paso 2: Descripción e Intereses */}
        {step === 2 && (
          <div className="register-form">
            <div className="register-heart-icon">
              <UniversityHeartIcon size={48} />
            </div>
            <h1 className="register-title">Completá tu Perfil</h1>
            <p className="register-subtitle">
              Agregá información opcional sobre ti
            </p>

            {/* Foto de perfil */}
            <div className="register-field">
              <label htmlFor="profileImage" className="register-label">
                Foto de perfil
              </label>
              <div className="register-file-upload-container">
                <input
                  id="profileImage"
                  type="file"
                  accept="image/png,image/svg+xml,image/jpeg,image/jpg"
                  onChange={handleImageChange}
                  disabled={loading}
                  className="register-file-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const fileInput = document.getElementById('profileImage') as HTMLInputElement;
                    if (fileInput) {
                      fileInput.click();
                    }
                  }}
                  className="register-file-button"
                  disabled={loading}
                >
                  Seleccionar archivo
                </button>
                <span className="register-file-name">
                  {profileImage ? profileImage.name : 'Ningún archivo seleccionado'}
                </span>
              </div>
              {profileImageError && (
                <span className="register-error">{profileImageError}</span>
              )}
              {profileImagePreview && (
                <div className="register-image-preview">
                  <img 
                    src={profileImagePreview} 
                    alt="Preview" 
                    className="register-image-preview-img"
                  />
                  {profileImage && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileImage(null);
                        setProfileImagePreview(null);
                        setProfileImageError(null);
                        // Resetear el input file
                        const fileInput = document.getElementById('profileImage') as HTMLInputElement;
                        if (fileInput) {
                          fileInput.value = '';
                        }
                      }}
                      className="register-remove-image"
                    >
                      Eliminar imagen
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Descripción */}
            <div className="register-field">
              <label htmlFor="descripcion" className="register-label">
                Descripción
              </label>
              <textarea
                id="descripcion"
                className="register-textarea"
                value={step2Data.descripcion}
                onChange={(e) => handleDescripcionChange(e.target.value)}
                placeholder="Cuéntanos sobre ti (máx. 300 caracteres)"
                maxLength={300}
                rows={4}
              />
              <span className="register-char-count">
                {step2Data.descripcion.length}/300
              </span>
            </div>

            {/* Intereses */}
            <div className="register-field">
              <label htmlFor="interes" className="register-label">
                Intereses (máx. 5)
              </label>
              <div className="register-intereses-input-container">
                <input
                  id="interes"
                  type="text"
                  className={`register-input ${interesError ? 'register-input-error' : ''}`}
                  value={interesInput}
                  onChange={(e) => {
                    setInteresInput(e.target.value);
                    setInteresError(null);
                  }}
                  onKeyPress={handleInteresKeyPress}
                  placeholder="Ej: Música, Deportes, Lectura..."
                  disabled={step2Data.intereses.length >= 5}
                />
                <button
                  type="button"
                  className="register-button-add"
                  onClick={handleAddInteres}
                  disabled={step2Data.intereses.length >= 5 || loading}
                >
                  Agregar
                </button>
              </div>
              {interesError && (
                <span className="register-error">{interesError}</span>
              )}
              {step2Data.intereses.length >= 5 && (
                <span className="register-info">
                  Has alcanzado el límite de 5 intereses
                </span>
              )}

              {/* Lista de intereses */}
              {step2Data.intereses.length > 0 && (
                <div className="register-intereses-list">
                  {step2Data.intereses.map((interes, index) => (
                    <div key={index} className="register-interes-chip">
                      <InterestTag interest={interes} />
                      <button
                        type="button"
                        className="register-interes-remove"
                        onClick={() => handleRemoveInteres(index)}
                        disabled={loading}
                        aria-label={`Eliminar ${interes}`}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="register-buttons">
              <button
                type="button"
                className="register-button-secondary"
                onClick={() => setStep(1)}
                disabled={loading}
              >
                Atrás
              </button>
              <button
                type="button"
                className="register-button-secondary"
                onClick={() => handleRegister(true)}
                disabled={loading}
              >
                Omitir
              </button>
              <button
                type="button"
                className="register-button-primary"
                onClick={() => handleRegister(false)}
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar y finalizar'}
              </button>
            </div>

            {/* Link a Login */}
            <div className="register-login-link">
              <span className="register-login-text">¿Ya tienes cuenta?</span>
              <Link to="/login" className="register-login-button">
                Inicia sesión
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;

