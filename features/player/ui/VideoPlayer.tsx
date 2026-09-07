// features/player/ui/VideoPlayer.tsx
'use client';

import { useState } from 'react';
import type { PlayableSource } from '../types';
import { LOAD_TIMEOUT_MS } from '../config/player';

import { useServerFailover } from '../model/useServerFailover';
import { shouldShowWarning, markAsWarnedInSession } from '@/shared/lib/adblock-storage';
import { detectBrowser, getAdblockRecommendation } from '@/shared/lib/adblock-detector';

import ServerSelector from './ServerSelector';
import PlayerLoadingOverlay from './PlayerLoadingOverlay';
import PlayerErrorOverlay from './PlayerErrorOverlay';
import PlayerFrame from './PlayerFrame';

export interface VideoPlayerProps {
  sources: PlayableSource[];
}

export default function VideoPlayer({ sources }: VideoPlayerProps) {
  // ─── Estado de advertencia ───
  const [showWarning, setShowWarning] = useState(() => shouldShowWarning());
  const browser = detectBrowser();
  const recommendation = getAdblockRecommendation(browser);

  const {
    activeSource,
    activeIndex,
    failedSourceIds,
    loadStatus,
    autoSwitched,
    retryCounter,
    allFailed,

    handleIframeLoad,
    handleRetry,
    handleSelectSource,
  } = useServerFailover({ sources });

  // El iframe solo se permite si el usuario cerró la advertencia
  const iframeAllowed = !showWarning;

  const handleInstall = () => {
    window.open(recommendation.url, '_blank', 'noopener,noreferrer');
  };

  const handleContinue = () => {
    markAsWarnedInSession();
    setShowWarning(false);
  };

  if (!sources || sources.length === 0) {
    return (
      <div className="aspect-video bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-gray-500">
        No servers available for this movie.
      </div>
    );
  }

  return (
    <div className="w-full">
      <ServerSelector
        sources={sources}
        activeIndex={activeIndex}
        failedSourceIds={failedSourceIds}
        onSelectSource={handleSelectSource}
      />

      {autoSwitched && loadStatus === 'loading' && (
        <div className="mb-3 flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
          The previous server did not respond. Automatically switching to{' '}
          <strong>{activeSource?.name}</strong>...
        </div>
      )}

      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/5">
        {/* ─── Advertencia inline (en el espacio del player) ─── */}
        {showWarning && (
          <div className="absolute inset-0 z-10 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex flex-col items-center justify-center p-4 sm:p-8 text-center overflow-y-auto">
            {/* Icono */}
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/20 rounded-full flex items-center justify-center mb-3 flex-shrink-0">
              <svg
                className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>

            {/* Título */}
            <h3 className="text-white font-bold text-base sm:text-lg mb-2 flex-shrink-0">
              Recomendación antes de reproducir
            </h3>

            {/* Descripción */}
            <p className="text-gray-300 text-xs sm:text-sm mb-3 leading-relaxed max-w-md flex-shrink-0">
              Los servidores muestran publicidad invasiva. Te recomendamos
              instalar un bloqueador de anuncios para una mejor experiencia.
            </p>

            {/* Recomendación */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 mb-3 w-full max-w-sm flex-shrink-0">
              <p className="text-xs font-semibold text-white mb-2">
                Extensión recomendada:
              </p>
              <div className="flex items-center gap-2">
                <div className="flex-1 text-left">
                  <p className="text-white font-medium text-sm">{recommendation.name}</p>
                  <p className="text-gray-400 text-xs">{recommendation.description}</p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm flex-shrink-0">
              <button
                onClick={handleInstall}
                className="
                  flex-1 bg-blue-600 hover:bg-blue-700
                  text-white font-semibold
                  px-4 py-2.5 rounded-lg
                  transition-colors
                  text-sm
                "
              >
                Instalar bloqueador
              </button>
              <button
                onClick={handleContinue}
                className="
                  flex-1 bg-gray-800 hover:bg-gray-700
                  text-gray-300 font-medium
                  px-4 py-2.5 rounded-lg
                  transition-colors
                  border border-white/10
                  text-sm
                "
              >
                Continuar sin bloqueador
              </button>
            </div>

            {/* Nota */}
            <p className="text-gray-500 text-[10px] mt-3 flex-shrink-0">
              Esta advertencia aparecerá nuevamente al recargar la página.
            </p>
          </div>
        )}

        {/* ─── Contenido del player (solo si la advertencia fue cerrada) ─── */}
        {iframeAllowed && loadStatus === 'loading' && (
          <PlayerLoadingOverlay
            serverName={activeSource?.name}
            timeoutMs={LOAD_TIMEOUT_MS}
          />
        )}

        {iframeAllowed && (loadStatus === 'timeout' || allFailed) && (
          <PlayerErrorOverlay
            allFailed={allFailed}
            onRetry={handleRetry}
          />
        )}

        {iframeAllowed && activeSource && loadStatus !== 'timeout' && !allFailed && (
          <PlayerFrame
            key={`${activeSource.url}-${retryCounter}`}
            source={activeSource}
            onLoad={handleIframeLoad}
          />
        )}
      </div>

      <p className="mt-2 text-[10px] text-gray-600 text-center">
        Content plays in a sandboxed environment for security. If a
        server shows pop-up ads, close them directly in the
        player.
      </p>
    </div>
  );
}
