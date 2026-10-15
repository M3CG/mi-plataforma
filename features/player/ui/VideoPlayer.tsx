// features/player/ui/VideoPlayer.tsx
'use client';

import { useEffect, useState } from 'react';
import type { PlayableSource } from '../types';
import { LOAD_TIMEOUT_MS } from '../config/player';
import { useServerFailover } from '../model/useServerFailover';
import {
  shouldShowWarning,
  markAsWarnedInSession,
} from '@/shared/lib/adblock-storage';
import {
  detectAdBlock,
  detectBrowser,
  getAdblockRecommendation,
} from '@/shared/lib/adblock-detector';
import { IconShield } from '@/shared/ui/icons';
import ServerSelector from './ServerSelector';
import PlayerLoadingOverlay from './PlayerLoadingOverlay';
import PlayerErrorOverlay from './PlayerErrorOverlay';
import PlayerFrame from './PlayerFrame';

export interface VideoPlayerProps {
  sources: PlayableSource[];
}

/**
 * Fases de la advertencia de adblock:
 *
 * - 'checking':  detección breve del bloqueador del usuario (~100 ms).
 * - 'show':      sin bloqueador → aviso minimalista.
 * - 'dismissed': tiene bloqueador o eligió continuar → renderizar iframe.
 */
type AdBlockWarningPhase = 'checking' | 'show' | 'dismissed';

export default function VideoPlayer({ sources }: VideoPlayerProps) {
  // ─── Estado de advertencia ───
  const [warningPhase, setWarningPhase] = useState<AdBlockWarningPhase>(() =>
    shouldShowWarning() ? 'checking' : 'dismissed'
  );

  // Si el usuario ya tiene un bloqueador (extensión o navegador con
  // bloqueo nativo), se ahorra la advertencia por completo.
  useEffect(() => {
    if (warningPhase !== 'checking') return;
    let cancelled = false;

    detectAdBlock()
      .then((hasBlocker) => {
        if (cancelled) return;
        if (hasBlocker) {
          // Marcar como descartada: próximas navegaciones SPA
          // ni siquiera repiten la detección.
          markAsWarnedInSession();
          setWarningPhase('dismissed');
        } else {
          setWarningPhase('show');
        }
      })
      .catch(() => {
        if (!cancelled) setWarningPhase('show');
      });

    return () => {
      cancelled = true;
    };
  }, [warningPhase]);

  const showWarning = warningPhase === 'show';
  const iframeAllowed = warningPhase === 'dismissed';

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

  const handleInstall = () => {
    const recommendation = getAdblockRecommendation(detectBrowser());
    window.open(recommendation.url, '_blank', 'noopener,noreferrer');
  };

  const handleContinue = () => {
    markAsWarnedInSession();
    setWarningPhase('dismissed');
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
        {/* ─── Detección de bloqueador (breve, ~100 ms) ─── */}
        {warningPhase === 'checking' && (
          <div className="absolute inset-0 z-10 bg-gray-950 flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-600/60 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* ─── Advertencia minimalista (sin bloqueador detectado) ─── */}
        {showWarning && (
          <div className="absolute inset-0 z-10 bg-gray-950 flex flex-col items-center justify-center gap-3 sm:gap-5 px-4 py-3 sm:p-8 text-center">
            <div className="hidden min-[380px]:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600/10 border border-red-600/25 items-center justify-center flex-shrink-0">
              <IconShield className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>

            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed max-w-sm flex-shrink-0">
              To avoid invasive ads, we recommend installing an ad
              blocker.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 flex-shrink-0">
              <button
                onClick={handleInstall}
                className="bg-red-600 hover:bg-red-500 text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-colors"
              >
                Install Ad Blocker
              </button>
              <button
                onClick={handleContinue}
                className="bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white text-xs sm:text-sm font-medium px-4 sm:px-6 py-2 sm:py-2.5 rounded-full transition-colors"
              >
                Continue without it
              </button>
            </div>
          </div>
        )}

        {/* ─── Contenido del player (solo con advertencia descartada) ─── */}
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

        {iframeAllowed &&
          activeSource &&
          loadStatus !== 'timeout' &&
          !allFailed && (
            <PlayerFrame
              key={`${activeSource.url}-${retryCounter}`}
              source={activeSource}
              onLoad={handleIframeLoad}
            />
          )}
      </div>

      <p className="mt-2 text-[10px] text-gray-600 text-center">
        Content plays in a sandboxed environment for security. If a
        server shows pop-up ads, close them directly in the player.
      </p>
    </div>
  );
}