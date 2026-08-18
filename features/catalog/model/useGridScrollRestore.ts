'use client';

import { useEffect } from 'react';
import {
  peekPendingScrollFor,
  consumePendingScrollFor,
  readSavedGridState,
  type SavedGridState,
} from '../lib/gridStateStorage';
import { SCROLL_RESTORE_DELAY_MS } from '../config/grid';
import { routes } from '@/lib/routes';

/**
 * Responsabilidad única:
 * restaurar scroll y estado guardado del grid
 * cuando el usuario regresa al catálogo.
 */
export function useGridScrollRestore(
  filterKey: string,
  restoreState: (state: SavedGridState) => void
) {
  useEffect(() => {
    const returnPath = routes.movies;
    const savedScroll = peekPendingScrollFor(returnPath);

    if (savedScroll === null) return;

    const savedState = readSavedGridState(filterKey);

    if (!savedState) {
      consumePendingScrollFor(returnPath);
      return;
    }

    restoreState(savedState);

    const timeout = setTimeout(() => {
      window.scrollTo(0, savedScroll);
      consumePendingScrollFor(returnPath);
    }, SCROLL_RESTORE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [filterKey, restoreState]);
}
