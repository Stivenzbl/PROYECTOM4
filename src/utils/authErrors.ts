/**
 * Traduce códigos de error de Firebase Authentication a mensajes comprensibles en español.
 */
export function translateFirebaseAuthError(errorCode: string): string {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No existe ninguna cuenta registrada con este correo electrónico.';
    case 'auth/wrong-password':
      return 'La contraseña ingresada es incorrecta.';
    case 'auth/invalid-credential':
      return 'Credenciales inválidas. Verifica tu correo y contraseña.';
    case 'auth/email-already-in-use':
      return 'Este correo electrónico ya está registrado. Intenta iniciar sesión.';
    case 'auth/weak-password':
      return 'La contraseña es muy débil. Debe tener al menos 6 caracteres.';
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.';
    case 'auth/popup-closed-by-user':
      return 'La ventana de inicio de sesión con Google fue cerrada antes de completar el proceso.';
    case 'auth/popup-blocked':
      return 'El navegador bloqueó la ventana emergente de Google. Por favor, habilítala.';
    case 'auth/network-request-failed':
      return 'Error de conexión. Verifica tu conexión a internet e inténtalo de nuevo.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Por seguridad, inténtalo más tarde.';
    case 'auth/requires-recent-login':
      return 'Esta operación es sensible y requiere que inicies sesión nuevamente.';
    default:
      return 'Ocurrió un error inesperado. Por favor, inténtalo nuevamente.';
  }
}
