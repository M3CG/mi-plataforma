// features/catalog/model/useGridScrollRestore.ts
'use client';

import { useEffect } from 'react';
import {
  consumePendingScroll,
  readSavedGridState,
  type SavedGridState,
} from '../lib/gridStateStorage';
import { SCROLL_RESTORE_DELAY_MS } from '../config/grid';

/**
 * Responsabilidad única:
 * restaurar scroll y estado guardado del grid.
 */
export function useGridScrollRestore(
  filterKey: string,
  restoreState: (state: SavedGridState) => void
) {
  useEffect(() => {
    const savedScroll = consumePendingScroll();

    if (savedScroll === null) return;

    const savedState = readSavedGridState(filterKey);

    if (!savedState) return;

    restoreState(savedState);

    const timeout = setTimeout(() => {
      window.scrollTo(0, savedScroll);
    }, SCROLL_RESTORE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [filterKey, restoreState]);
}