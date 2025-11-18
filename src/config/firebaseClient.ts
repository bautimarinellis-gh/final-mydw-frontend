// https://firebase.google.com/docs/web/learn-more?hl=es-419#config-object

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// Las variables de entorno se cargan desde .env.local (desarrollo) o .env.production (producción)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Validar que todas las variables de entorno estén definidas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  throw new Error('Las variables de entorno de Firebase no están configuradas. Verifica tu archivo .env.local o .env.production');
}

// Initialize Firebase - evitar múltiples inicializaciones
let app;
try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
} catch (error) {
  console.error('Error inicializando Firebase:', error);
  // Si hay error, intentar obtener la app existente
  app = getApp();
}

export { app };
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
// Configurar para que siempre muestre el selector de cuenta
googleProvider.setCustomParameters({
  prompt: 'select_account',
});


