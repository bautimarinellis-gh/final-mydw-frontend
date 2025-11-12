import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Crear instancia de axios con configuración base
// Sin autenticación - todas las peticiones se hacen sin token
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.error('Error en petición:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;

