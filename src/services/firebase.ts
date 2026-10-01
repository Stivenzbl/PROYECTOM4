import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Verifica si las variables de entorno aún tienen valores de ejemplo
export const isFirebaseConfigured = (): boolean => {
  const apiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(apiKey && !apiKey.includes('mock-api-key') && apiKey !== 'tu_firebase_api_key_aqui');
};

// Inicialización de la aplicación de Firebase (singleton)
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Servicios exportados por separado según los requisitos de arquitectura
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// Configuración opcional para forzar selección de cuenta en Google
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

export default app;
