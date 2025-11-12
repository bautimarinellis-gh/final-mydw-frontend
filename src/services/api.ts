import axios from 'axios';
import { ACCESS_TOKEN_KEY, USER_KEY } from '../constants/storage';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Crear instancia de axios con configuración base
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // IMPORTANTE: Necesario para cookies (refresh token)
});

const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  } catch (error) {
    console.error('No se pudo acceder a localStorage para obtener el token:', error);
    return null;
  }
};

// Interceptor para adjuntar token a las peticiones
api.interceptors.request.use(
  (config) => {
    const token = getStoredToken();

    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Variables para manejar la cola de peticiones durante el refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: string | null) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Interceptor para manejar errores 401 y refrescar el token automáticamente
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Si el error es 401 y no es una petición de refresh ni ya se intentó refrescar
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes('/api/auth/refresh')
    ) {
      if (isRefreshing) {
        // Si ya se está refrescando, esperar en la cola
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Intentar renovar el token
        const response = await axios.post(
          `${API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true, // IMPORTANTE: Para enviar la cookie del refresh token
          }
        );

        const { accessToken } = response.data;

        // Guardar el nuevo token
        if (typeof window !== 'undefined') {
          try {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
          } catch (storageError) {
            console.error('No se pudo guardar el nuevo token:', storageError);
          }
        }

        // Actualizar el header de la petición original
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;

        // Procesar la cola de peticiones pendientes
        processQueue(null, accessToken);
        isRefreshing = false;

        // Reintentar la petición original
        return api(originalRequest);
      } catch (refreshError) {
        // Si el refresh falla, limpiar todo y redirigir al login
        processQueue(refreshError, null);
        isRefreshing = false;

        // Limpiar localStorage
        if (typeof window !== 'undefined') {
          try {
            localStorage.removeItem(ACCESS_TOKEN_KEY);
            localStorage.removeItem(USER_KEY);
          } catch (storageError) {
            console.error('No se pudo limpiar localStorage:', storageError);
          }

          // Redirigir al login (ajusta según tu router)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
        }

        return Promise.reject(refreshError);
      }
    }

    // Para otros errores, solo loguear y rechazar
    console.error('Error en petición:', error.response?.data?.message || error.message);
    return Promise.reject(error);
  }
);

export default api;

