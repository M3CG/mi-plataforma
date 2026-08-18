

// features/player/ui/VideoPlayer.tsx
'use client';

import type { PlayableSource } from '../types';
import { LOAD_TIMEOUT_MS } from '../config/player';

import { useServerFailover } from '../model/useServerFailover';

import ServerSelector from './ServerSelector';
import PlayerLoadingOverlay from './PlayerLoadingOverlay';
import PlayerErrorOverlay from './PlayerErrorOverlay';
import PlayerFrame from './PlayerFrame';

export interface VideoPlayerProps {
  sources: PlayableSource[];
}

export default function VideoPlayer({ sources }: VideoPlayerProps) {
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

  if (!sources || sources.length === 0) {
    return (
      <div className="aspect-video bg-white/[0.02] border border-white/5 rounded-2xl flex items-center justify-center text-gray-500">
        No hay servidores disponibles para esta película.
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
          El servidor anterior no respondió. Cambiando automáticamente a{' '}
          <strong>{activeSource?.name}</strong>...
        </div>
      )}

      <div className="relative aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/5">
        {loadStatus === 'loading' && (
          <PlayerLoadingOverlay
            serverName={activeSource?.name}
            timeoutMs={LOAD_TIMEOUT_MS}
          />
        )}

        {(loadStatus === 'timeout' || allFailed) && (
          <PlayerErrorOverlay
            allFailed={allFailed}
            onRetry={handleRetry}
          />
        )}

        {activeSource && loadStatus !== 'timeout' && !allFailed && (
          <PlayerFrame
            key={`${activeSource.url}-${retryCounter}`}
            source={activeSource}
            onLoad={handleIframeLoad}
          />
        )}
      </div>

      <p className="mt-2 text-[10px] text-gray-600 text-center">
        El contenido se reproduce en un entorno aislado por seguridad. Si un
        servidor muestra publicidad emergente, ciérrala directamente en el
        reproductor.
      </p>
    </div>
  );
}