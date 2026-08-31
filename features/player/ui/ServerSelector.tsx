// features/player/ui/ServerSelector.tsx
'use client';

import { IconPlay } from '@/shared/ui/icons';
import type { PlayableSource } from '../types';

interface ServerSelectorProps {
  sources: PlayableSource[];
  activeIndex: number;
  failedSourceIds: Set<string>;
  onSelectSource: (index: number) => void;
}

export default function ServerSelector({
  sources,
  activeIndex,
  failedSourceIds,
  onSelectSource,
}: ServerSelectorProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      {sources.map((source, index) => {
        const isActive = index === activeIndex;
        const isFailed = failedSourceIds.has(source.id);

        return (
          <button
            key={source.id}
            onClick={() => onSelectSource(index)}
            aria-pressed={isActive}
            title={
              isFailed
                ? 'This server did not respond. Click to retry.'
                : source.name
            }
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              isActive
                ? 'bg-red-600/80 border-red-500/30 text-white shadow-lg shadow-red-900/20'
                : isFailed
                  ? 'bg-white/[0.03] border-white/5 text-gray-600 hover:bg-white/5 hover:text-gray-400'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
            }`}
          >
            {isActive && <IconPlay className="w-3 h-3" />}
            {source.name}

            {isFailed && !isActive && (
              <span className="text-[9px] uppercase tracking-wide opacity-60">
                caído
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}