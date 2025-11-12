/**
 * Funciones de validación para el formulario de registro
 */

/**
 * Valida nombre: 2-60 chars, solo letras y espacios
 */
export const validateNombre = (nombre: string): string | null => {
  const trimmed = nombre.trim();
  
  if (!trimmed) {
    return 'El nombre es requerido';
  }
  
  if (trimmed.length < 2 || trimmed.length > 60) {
    return 'El nombre debe tener entre 2 y 60 caracteres';
  }
  
  // Solo letras (incluyendo acentos) y espacios
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!regex.test(trimmed)) {
    return 'El nombre solo puede contener letras y espacios';
  }
  
  return null;
};

/**
 * Valida apellido: 2-60 chars, solo letras y espacios
 */
export const validateApellido = (apellido: string): string | null => {
  const trimmed = apellido.trim();
  
  if (!trimmed) {
    return 'El apellido es requerido';
  }
  
  if (trimmed.length < 2 || trimmed.length > 60) {
    return 'El apellido debe tener entre 2 y 60 caracteres';
  }
  
  // Solo letras (incluyendo acentos) y espacios
  const regex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]+$/;
  if (!regex.test(trimmed)) {
    return 'El apellido solo puede contener letras y espacios';
  }
  
  return null;
};

/**
 * Valida email: formato válido
 */
export const validateEmail = (email: string): string | null => {
  const trimmed = email.trim().toLowerCase();
  
  if (!trimmed) {
    return 'El email es requerido';
  }
  
  // Formato básico de email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return 'El email no tiene un formato válido';
  }
  
  return null;
};

/**
 * Valida password: mínimo 6 caracteres
 */
export const validatePassword = (password: string): string | null => {
  if (!password) {
    return 'La contraseña es requerida';
  }
  
  if (password.length < 6) {
    return 'La contraseña debe tener al menos 6 caracteres';
  }
  
  return null;
};

/**
 * Valida edad: entero, rango 17-99
 */
export const validateEdad = (edad: number | string): string | null => {
  const numEdad = typeof edad === 'string' ? parseInt(edad, 10) : edad;
  
  if (isNaN(numEdad) || !Number.isInteger(numEdad)) {
    return 'La edad debe ser un número entero';
  }
  
  if (numEdad < 17 || numEdad > 99) {
    return 'La edad debe estar entre 17 y 99 años';
  }
  
  return null;
};

/**
 * Valida descripción: máx. 300 chars (opcional)
 */
export const validateDescripcion = (descripcion: string): string | null => {
  if (!descripcion) {
    return null; // Opcional
  }
  
  const trimmed = descripcion.trim();
  
  if (trimmed.length > 300) {
    return 'La descripción no puede tener más de 300 caracteres';
  }
  
  return null;
};

/**
 * Valida un interés individual: 1-30 chars, no vacío, no solo símbolos
 */
export const validateInteres = (interes: string): string | null => {
  const trimmed = interes.trim();
  
  if (!trimmed) {
    return 'El interés no puede estar vacío';
  }
  
  if (trimmed.length < 1 || trimmed.length > 30) {
    return 'El interés debe tener entre 1 y 30 caracteres';
  }
  
  // Verificar que no sea solo símbolos (debe tener al menos una letra o número)
  const hasLettersOrNumbers = /[a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ]/.test(trimmed);
  if (!hasLettersOrNumbers) {
    return 'El interés no puede contener solo símbolos';
  }
  
  return null;
};

/**
 * Valida si un interés ya existe en la lista (case-insensitive)
 */
export const isInteresDuplicate = (interes: string, intereses: string[]): boolean => {
  const trimmed = interes.trim().toLowerCase();
  return intereses.some(
    existing => existing.trim().toLowerCase() === trimmed
  );
};

/**
 * Valida la lista completa de intereses: máximo 5
 */
export const validateInteresesList = (intereses: string[]): string | null => {
  if (intereses.length > 5) {
    return 'No puedes tener más de 5 intereses';
  }
  
  // Validar cada interés individualmente
  for (const interes of intereses) {
    const error = validateInteres(interes);
    if (error) {
      return error;
    }
  }
  
  // Verificar duplicados
  const lowercased = intereses.map(i => i.trim().toLowerCase());
  const unique = new Set(lowercased);
  if (unique.size !== intereses.length) {
    return 'No puedes tener intereses duplicados';
  }
  
  return null;
};

