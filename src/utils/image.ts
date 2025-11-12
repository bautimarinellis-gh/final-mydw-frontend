/**
 * Construye la URL completa de una imagen de perfil
 * Si la URL ya es completa (empieza con http), la devuelve tal cual
 * Si es relativa, la combina con la URL base del API
 */
export const getProfileImageUrl = (imageUrl: string | undefined | null): string | null => {
  if (!imageUrl) {
    return null;
  }

  // Si ya es una URL completa, devolverla tal cual
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // Si es una URL relativa, construir la URL completa
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};

