import { describe, it, expect } from 'vitest';
import { translateFirebaseAuthError } from '@/utils/authErrors';

describe('translateFirebaseAuthError', () => {
  it('traduce correctamente error de usuario no encontrado', () => {
    const msg = translateFirebaseAuthError('auth/user-not-found');
    expect(msg).toBe('No existe ninguna cuenta registrada con este correo electrónico.');
  });

  it('traduce correctamente error de contraseña incorrecta', () => {
    const msg = translateFirebaseAuthError('auth/wrong-password');
    expect(msg).toBe('La contraseña ingresada es incorrecta.');
  });

  it('traduce correctamente error de credenciales inválidas', () => {
    const msg = translateFirebaseAuthError('auth/invalid-credential');
    expect(msg).toBe('Credenciales inválidas. Verifica tu correo y contraseña.');
  });

  it('traduce correctamente error de email duplicado', () => {
    const msg = translateFirebaseAuthError('auth/email-already-in-use');
    expect(msg).toBe('Este correo electrónico ya está registrado. Intenta iniciar sesión.');
  });

  it('devuelve mensaje amigable por defecto ante un código de error desconocido', () => {
    const msg = translateFirebaseAuthError('auth/codigo-desconocido-xyz');
    expect(msg).toBe('Ocurrió un error inesperado. Por favor, inténtalo nuevamente.');
  });
});
