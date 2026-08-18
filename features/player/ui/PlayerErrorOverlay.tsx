// features/player/ui/PlayerErrorOverlay.tsx
'use client';

import { IconRefresh, IconWarning } from '@/shared/ui/icons';

interface PlayerErrorOverlayProps {
  allFailed: boolean;
  onRetry: () => void;
}

export default function PlayerErrorOverlay({
  allFailed,
  onRetry,
}: PlayerErrorOverlayProps) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/90 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-red-600/10 border border-red-600/20 flex items-center justify-center">
        <IconWarning className="w-7 h-7 text-red-500" />
      </div>

      <div>
        <h3 className="text-white font-semibold mb-1">
          {allFailed
            ? 'Ningún servidor respondió'
            : 'El servidor no respondió'}
        </h3>

        <p className="text-sm text-gray-400 max-w-sm">
          {allFailed
            ? 'Todos los servidores están caídos en este momento. Intenta nuevamente en unos minutos.'
            : 'El servidor tardó demasiado en responder. Puedes reintentar o seleccionar otro servidor manualmente.'}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
      >
        <IconRefresh className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}