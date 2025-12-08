/**
 * firebaseClient.ts - Configuración e inicialización de Firebase para autenticación con Google.
 * Carga credenciales desde variables de entorno y previene múltiples inicializaciones.
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Las variables de entorno de Firebase no están configuradas. Verifica tu archivo .env.local o .env.production');
}

let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error('Error inicializando Firebase:', error);
  app = getApp();
}

export { app };
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});


