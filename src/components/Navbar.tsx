import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { sendTaskSummaryEmail } from '@/services/emailService';
import { Task } from '@/types';
import { CheckSquare, LogOut, Mail, Loader2, User } from 'lucide-react';

interface NavbarProps {
  tasks: Task[];
  onNotify: (msg: { text: string; type: 'success' | 'error' | 'info' }) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ tasks, onNotify }) => {
  const { currentUser, logout } = useAuth();
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSendEmail = async () => {
    if (!currentUser?.email) {
      onNotify({ text: 'No se encontró un email de usuario válido.', type: 'error' });
      return;
    }

    setSendingEmail(true);
    try {
      const result = await sendTaskSummaryEmail({
        tasks,
        userEmail: currentUser.email,
        userName: currentUser.displayName || undefined,
      });

      onNotify({
        text: result.message,
        type: 'success',
      });
    } catch (err: any) {
      onNotify({
        text: err.message || 'Error al enviar el email de resumen con AWS SES.',
        type: 'error',
      });
    } finally {
      setSendingEmail(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (err: any) {
      onNotify({ text: err.message || 'Error al cerrar sesión', type: 'error' });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo de MateCode */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <span className="font-bold text-lg text-slate-900 tracking-tight block">
              MateCode <span className="text-indigo-600">Tasks</span>
            </span>
            <span className="text-xs text-slate-500 font-medium hidden sm:block">
              Gestor Estratégico de Tareas
            </span>
          </div>
        </div>

        {/* Acciones de usuario y botones */}
        <div className="flex items-center space-x-3">
          {/* Botón de Enviar Resumen por Email (AWS SES) */}
          <button
            onClick={handleSendEmail}
            disabled={sendingEmail}
            title="Enviar resumen de tareas a mi correo con AWS SES"
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors disabled:opacity-50"
          >
            {sendingEmail ? (
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
            ) : (
              <Mail className="w-4 h-4 text-indigo-600" />
            )}
            <span className="hidden sm:inline">Enviar Resumen</span>
          </button>

          {/* Perfil del usuario */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Avatar'}
                className="w-8 h-8 rounded-full border border-slate-300 object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600">
                <User className="w-4 h-4" />
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-tight">
                {currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Usuario'}
              </p>
              <p className="text-[11px] text-slate-500 truncate max-w-[130px]">
                {currentUser?.email}
              </p>
            </div>
          </div>

          {/* Botón Cerrar Sesión */}
          <button
            onClick={handleLogout}
            className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Cerrar Sesión"
            aria-label="Cerrar sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
