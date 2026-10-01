import React, { useState } from 'react';
import { isFirebaseConfigured } from '@/services/firebase';
import { AlertTriangle, X, ExternalLink } from 'lucide-react';

export const FirebaseBanner: React.FC = () => {
  const [closed, setClosed] = useState(false);
  const configured = isFirebaseConfigured();

  if (configured || closed) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 text-amber-900 text-sm">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Modo de Desarrollo Local:</strong> La app está usando persistencia local simulada.
            Para conectar tu proyecto real de Firebase, reemplaza los valores en tu archivo <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">.env</code>.
          </span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="https://console.firebase.google.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 font-medium text-amber-800 underline hover:text-amber-950"
          >
            Consola Firebase <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setClosed(true)}
            className="text-amber-700 hover:text-amber-900 p-1 rounded hover:bg-amber-100"
            aria-label="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
