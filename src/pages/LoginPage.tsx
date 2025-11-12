import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BackgroundPattern, EyeIcon, EyeOffIcon, UniversityHeartIcon } from '../components';
import { authService } from '../services';
import { validateEmail, validatePassword } from '../utils/validation';
import { getErrorMessage } from '../utils/error';
import type { LoginRequest } from '../types';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Validar formulario
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) {
      newErrors.email = emailError;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      newErrors.password = passwordError;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejar cambio en campos
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    // Limpiar error del campo cuando el usuario escribe
    if (errors[field]) {
      setErrors({ ...errors, [field]: '' });
    }
    if (generalError) {
      setGeneralError(null);
    }
  };

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralError(null);

    // Validar formulario
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Preparar datos (email en minúsculas)
      const credentials: LoginRequest = {
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      };

      // Enviar al backend
      await authService.login(credentials);

      // Redirigir a discover
      navigate('/discover');
    } catch (error: unknown) {
      console.error('Error al iniciar sesión:', error);
      const errorMessage = getErrorMessage(error, 'Error al iniciar sesión. Verifica tus credenciales.');
      setGeneralError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Manejar Enter en cualquier campo
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  // Verificar si el formulario es válido para habilitar botón
  const isFormValid = formData.email.trim() && formData.password && Object.keys(errors).length === 0;

  return (
    <div className="login-page">
      <BackgroundPattern />

      <div className="login-container">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-heart-icon">
            <UniversityHeartIcon size={48} />
          </div>
          <h1 className="login-title">Iniciar Sesión</h1>
          <p className="login-subtitle">
            Ingresa tus credenciales para continuar
          </p>

          {/* Error general */}
          {generalError && (
            <div className="login-error-general">
              {generalError}
            </div>
          )}

          {/* Email */}
          <div className="login-field">
            <label htmlFor="email" className="login-label">
              Email *
            </label>
            <input
              id="email"
              type="email"
              className={`login-input ${errors.email ? 'login-input-error' : ''}`}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="tu.email@ejemplo.com"
              disabled={loading}
              autoComplete="email"
            />
            {errors.email && (
              <span className="login-error">{errors.email}</span>
            )}
          </div>

          {/* Password */}
          <div className="login-field">
            <label htmlFor="password" className="login-label">
              Contraseña *
            </label>
            <div className="login-password-container">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className={`login-input login-input-password ${errors.password ? 'login-input-error' : ''}`}
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ingresa tu contraseña"
                disabled={loading}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOffIcon size={20} color="var(--color-text-secondary)" />
                ) : (
                  <EyeIcon size={20} color="var(--color-text-secondary)" />
                )}
              </button>
            </div>
            {errors.password && (
              <span className="login-error">{errors.password}</span>
            )}
          </div>

          {/* Botón Iniciar Sesión */}
          <button
            type="submit"
            className="login-button-primary"
            disabled={loading || !isFormValid}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>

          {/* Link a registro */}
          <div className="login-footer">
            <p className="login-footer-text">
              ¿No tienes una cuenta?{' '}
              <Link to="/register" className="login-footer-link">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;

