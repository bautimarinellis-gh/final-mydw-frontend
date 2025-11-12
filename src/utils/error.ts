import axios from 'axios';

/**
 * Obtiene el mensaje de error apropiado según el tipo de error
 */
export const getErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    // Manejar error 409 (Conflict) - Email duplicado
    if (error.response?.status === 409) {
      return 'Este email ya está registrado';
    }

    const responseMessage = error.response?.data?.message;

    if (typeof responseMessage === 'string' && responseMessage.trim().length > 0) {
      return responseMessage;
    }

    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
};

/**
 * Obtiene errores de validación del servidor mapeados por campo
 * Retorna un objeto con los errores por campo, o null si no hay errores de validación
 */
export const getValidationErrors = (error: unknown): Record<string, string> | null => {
  if (axios.isAxiosError(error)) {
    // Error 400 (Bad Request) generalmente contiene errores de validación
    if (error.response?.status === 400) {
      const data = error.response.data;
      
      // Si el backend devuelve errores de validación por campo
      if (data?.errors && typeof data.errors === 'object') {
        const validationErrors: Record<string, string> = {};
        
        for (const [field, message] of Object.entries(data.errors)) {
          if (typeof message === 'string') {
            validationErrors[field] = message;
          } else if (Array.isArray(message) && message.length > 0) {
            // Si el backend devuelve un array de mensajes, tomar el primero
            validationErrors[field] = String(message[0]);
          }
        }
        
        if (Object.keys(validationErrors).length > 0) {
          return validationErrors;
        }
      }
    }
  }

  return null;
};


