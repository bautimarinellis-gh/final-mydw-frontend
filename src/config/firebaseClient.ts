// https://firebase.google.com/docs/web/learn-more?hl=es-419#config-object

// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyDVCHhkvm_XtLevL-Op2St_vTcHP86hKo8',
  authDomain: 'tinder-uai.firebaseapp.com',
  projectId: 'tinder-uai',
  storageBucket: 'tinder-uai.firebasestorage.app',
  messagingSenderId: '1030847800042',
  appId: '1:1030847800042:web:771ed265dfdaaad710ad93',
  measurementId: 'G-QX08S935JE',
};

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


