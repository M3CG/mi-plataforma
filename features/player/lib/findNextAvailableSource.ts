// features/player/lib/findNextAvailableSource.ts

import type { PlayableSource } from '../types';

export function findNextAvailableSource(
  sources: PlayableSource[],
  currentIndex: number,
  failedSourceIds: Set<string>
): number {
  const total = sources.length;

  for (let offset = 1; offset < total; offset += 1) {
    const candidateIndex = (currentIndex + offset) % total;
    const candidateSource = sources[candidateIndex];

    if (candidateSource && !failedSourceIds.has(candidateSource.id)) {
      return candidateIndex;
    }
  }

  return -1;
}