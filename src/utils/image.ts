/**
 * Construye la URL completa de una imagen de perfil
 * - Soporta URLs locales
 * - Optimiza imágenes de Cloudinary para evitar pixelado
 */
export const getProfileImageUrl = (
  imageUrl: string | undefined | null,
  size: number = 400
): string | null => {
  if (!imageUrl) {
    return null;
  }

  // Cloudinary: inyectar transformaciones de calidad
  if (imageUrl.includes('res.cloudinary.com')) {
    return imageUrl.replace(
      '/upload/',
      `/upload/c_fill,w_${size},h_${size},q_auto,f_auto/`
    );
  }

  // URL absoluta (no Cloudinary)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // URL relativa (backend propio)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
  return `${API_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`;
};