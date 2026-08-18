// app/error.tsx
'use client';

import { useEffect } from 'react';
import { IconWarning } from '@/shared/ui/icons';
import { logger } from '@/lib/utils/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Application error', {
      component: 'ErrorBoundary',
      error,
    });
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-red-600/10 rounded-full flex items-center justify-center">
          <IconWarning />
        </div>

        <h2 className="text-3xl font-bold mb-3">Algo salió mal</h2>

        <p className="text-gray-400 mb-8">
          Ocurrió un error inesperado. Por favor, intenta nuevamente.
        </p>

        <button
          onClick={reset}
          className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </main>
  );
}