import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '@/services/firebase';
import { translateFirebaseAuthError } from '@/utils/authErrors';

interface AuthContextType {
  currentUser: User | null;
  loading: boolean;
  error: string | null;
  isConfigured: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const isConfigured = useMemo(() => isFirebaseConfigured(), []);

  const clearError = useCallback(() => setError(null), []);

  useEffect(() => {
    // Si las credenciales son de prueba o mock, desactivamos el loading para no bloquear la app
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Gestionar retorno de signInWithRedirect si la ventana emergente fue bloqueada
    getRedirectResult(auth)
      .then((userCred) => {
        if (userCred?.user) {
          setCurrentUser(userCred.user);
        }
      })
      .catch((err) => {
        if (err?.code) {
          const msg = translateFirebaseAuthError(err.code);
          setError(msg);
        }
      });

    // Observer onAuthStateChanged para gestionar sesión persistente
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setCurrentUser(user);
        setLoading(false);
      },
      (err) => {
        console.error('Error observador Auth:', err);
        setError('Error al verificar el estado de autenticación');
        setLoading(false);
      }
    );

    // Limpieza de suscripción para evitar memory leaks
    return () => unsubscribe();
  }, [isConfigured]);

  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = translateFirebaseAuthError(code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const registerWithEmail = async (email: string, pass: string, name?: string) => {
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
      if (name && userCredential.user) {
        await updateProfile(userCredential.user, { displayName: name });
        // Forzar actualización del estado local con el displayName
        setCurrentUser({ ...userCredential.user, displayName: name });
      }
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = translateFirebaseAuthError(code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const loginWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      if (code === 'auth/popup-blocked') {
        console.warn('Popup bloqueado por el navegador. Redirigiendo automáticamente...');
        try {
          await signInWithRedirect(auth, googleProvider);
          return;
        } catch (redirectErr) {
          console.error('Error en redirección:', redirectErr);
        }
      }
      const msg = translateFirebaseAuthError(code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    setError(null);
    try {
      await signOut(auth);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code || '';
      const msg = translateFirebaseAuthError(code);
      setError(msg);
      throw new Error(msg);
    }
  };

  const value = {
    currentUser,
    loading,
    error,
    isConfigured,
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
};
