cat << 'SCRIPT_EOF' > fix-failover-timer-on-warning.sh
#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Corrigiendo inicio prematuro del temporizador de servidores durante la advertencia de AdBlock..."

# ─── 1. Actualizar useServerFailover.ts para soportar `enabled` ───
cat << 'EOF' > features/player/model/useServerFailover.ts
'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { LoadStatus, PlayableSource } from '../types';
import { LOAD_TIMEOUT_MS } from '../config/player';
import { findNextAvailableSource } from '../lib/findNextAvailableSource';

interface UseServerFailoverProps {
  sources: PlayableSource[];
  timeoutMs?: number;
  /**
   * Si es false, el hook no inicia el temporizador de failover ni pasa a 'loading'.
   * Útil mientras se muestra la advertencia de AdBlock antes de montar el iframe.
   */
  enabled?: boolean;
}

export function useServerFailover({
  sources,
  timeoutMs = LOAD_TIMEOUT_MS,
  enabled = true,
}: UseServerFailoverProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [internalLoadStatus, setInternalLoadStatus] =
    useState<LoadStatus>('idle');
  const [autoSwitched, setAutoSwitched] = useState(false);
  const [retryCounter, setRetryCounter] = useState(0);
  const [failedSourceIds, setFailedSourceIds] = useState<Set<string>>(
    () => new Set<string>()
  );

  const failedSourceIdsRef = useRef<Set<string>>(failedSourceIds);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    failedSourceIdsRef.current = failedSourceIds;
  }, [failedSourceIds]);

  const safeActiveIndex =
    sources.length > 0 && activeIndex >= sources.length ? 0 : activeIndex;

  const activeSource = sources[safeActiveIndex] ?? null;

  // Mientras `enabled` sea false (cartel de advertencia activo), el estado se mantiene en 'idle'
  const effectiveLoadStatus: LoadStatus = useMemo(() => {
    if (!activeSource || !enabled) return 'idle';
    if (internalLoadStatus === 'idle') return 'loading';
    return internalLoadStatus;
  }, [activeSource, enabled, internalLoadStatus]);

  const clearLoadTimeout = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const markSourceFailed = useCallback((sourceId: string) => {
    const next = new Set(failedSourceIdsRef.current);
    next.add(sourceId);
    failedSourceIdsRef.current = next;
    setFailedSourceIds(next);
  }, []);

  const clearSourceFailed = useCallback((sourceId: string) => {
    const next = new Set(failedSourceIdsRef.current);
    next.delete(sourceId);
    failedSourceIdsRef.current = next;
    setFailedSourceIds(next);
  }, []);

  const resetFailedSources = useCallback(() => {
    const next = new Set<string>();
    failedSourceIdsRef.current = next;
    setFailedSourceIds(next);
  }, []);

  // Timer de carga del servidor activo: SOLO corre cuando `enabled` es true
  useEffect(() => {
    clearLoadTimeout();

    if (!enabled || !activeSource) {
      return;
    }

    timeoutRef.current = setTimeout(() => {
      markSourceFailed(activeSource.id);

      const nextIndex = findNextAvailableSource(
        sources,
        safeActiveIndex,
        failedSourceIdsRef.current
      );

      if (nextIndex !== -1) {
        setAutoSwitched(true);
        setActiveIndex(nextIndex);
      } else {
        setInternalLoadStatus('timeout');
      }
    }, timeoutMs);

    return clearLoadTimeout;
  }, [
    enabled,
    activeSource,
    sources,
    safeActiveIndex,
    clearLoadTimeout,
    markSourceFailed,
    retryCounter,
    timeoutMs,
  ]);

  const handleIframeLoad = useCallback(() => {
    clearLoadTimeout();
    setInternalLoadStatus('loaded');
  }, [clearLoadTimeout]);

  const handleRetry = useCallback(() => {
    if (!activeSource) return;

    clearSourceFailed(activeSource.id);
    setAutoSwitched(false);
    setInternalLoadStatus('loading');
    setRetryCounter((previous) => previous + 1);
  }, [activeSource, clearSourceFailed]);

  const handleSelectSource = useCallback(
    (index: number) => {
      const source = sources[index];
      if (!source) return;

      clearSourceFailed(source.id);
      setAutoSwitched(false);

      if (index === safeActiveIndex) {
        setInternalLoadStatus(enabled ? 'loading' : 'idle');
        setRetryCounter((previous) => previous + 1);
      } else {
        setActiveIndex(index);
        setInternalLoadStatus('idle');
      }
    },
    [sources, safeActiveIndex, clearSourceFailed, enabled]
  );

  const allFailed = useMemo(() => {
    if (sources.length === 0) return false;
    return sources.every((source) => failedSourceIds.has(source.id));
  }, [sources, failedSourceIds]);

  return {
    sources,
    activeSource,
    activeIndex: safeActiveIndex,
    failedSourceIds,
    loadStatus: effectiveLoadStatus,
    autoSwitched,
    retryCounter,
    allFailed,
    handleIframeLoad,
    handleRetry,
    handleSelectSource,
    resetFailedSources,
  };
}
EOF

# ─── 2. Pasar `enabled: iframeAllowed` en VideoPlayer.tsx ───
cat << 'EOF' > features/player/ui/VideoPlayer.tsx
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

type AdBlockWarningPhase = 'checking' | 'show' | 'dismissed';

export default function VideoPlayer({ sources }: VideoPlayerProps) {
  const [warningPhase, setWarningPhase] = useState<AdBlockWarningPhase>(() =>
    shouldShowWarning() ? 'checking' : 'dismissed'
  );

  useEffect(() => {
    if (warningPhase !== 'checking') return;
    let cancelled = false;

    detectAdBlock()
      .then((hasBlocker) => {
        if (cancelled) return;
        if (hasBlocker) {
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
  } = useServerFailover({
    sources,
    enabled: iframeAllowed,
  });

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
      <div className="aspect-video bg-[#00040A] border border-white/5 rounded-2xl flex items-center justify-center text-gray-500">
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

      {iframeAllowed && autoSwitched && loadStatus === 'loading' && (
        <div className="mb-3 flex items-center gap-2 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/10 rounded-lg px-3 py-2">
          <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse flex-shrink-0" />
          The previous server did not respond. Automatically switching to{' '}
          <strong>{activeSource?.name}</strong>...
        </div>
      )}

      <div className="relative aspect-video bg-[#00040A] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/5">
        {warningPhase === 'checking' && (
          <div className="absolute inset-0 z-10 bg-[#00040A] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-red-600/60 border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {showWarning && (
          <div className="absolute inset-0 z-10 bg-[#00040A] flex flex-col items-center justify-center gap-3 sm:gap-5 px-4 py-3 sm:p-8 text-center">
            <div className="hidden min-[380px]:flex w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-red-600/10 border border-red-600/25 items-center justify-center flex-shrink-0">
              <IconShield className="w-5 h-5 sm:w-6 sm:h-6 text-red-500" />
            </div>

            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed max-w-sm flex-shrink-0">
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
EOF

echo "✅ Fix aplicado. Ejecutando npm run check y npm test..."
npm run check
npm test
SCRIPT_EOF

chmod +x fix-failover-timer-on-warning.sh
./fix-failover-timer-on-warning.sh
rm -f fix-failover-timer-on-warning.sh
