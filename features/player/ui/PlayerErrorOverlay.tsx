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
            ? 'No server responded'
            : 'The server did not respond'}
        </h3>

        <p className="text-sm text-gray-400 max-w-sm">
          {allFailed
            ? 'All servers are down right now. Try again in a few minutes.'
            : 'The server took too long to respond. You can retry or pick another server manually.'}
        </p>
      </div>

      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors"
      >
        <IconRefresh className="w-4 h-4" />
        Retry
      </button>
    </div>
  );
}