import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Evita parpadeos o redirección prematura mientras Firebase verifica la sesión activa
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center space-y-3">
          <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          <p className="text-sm font-medium text-slate-600">Verificando sesión segura...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    // Redirige al login preservando la ruta solicitada en state
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

// Redirige usuarios ya autenticados lejos de login/registro hacia /tasks
export const PublicOnlyRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (currentUser) {
    return <Navigate to="/tasks" replace />;
  }

  return children;
};
