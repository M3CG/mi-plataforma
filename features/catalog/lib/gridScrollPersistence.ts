// features/catalog/lib/gridScrollPersistence.ts

import { GRID_SCROLL_STORAGE_KEY } from '../config/grid';
import { deferScrollRestore } from '@/lib/scroll/defer';

/**
 * Guarda la posición de scroll actual y marca la señal global
 * para que ScrollToTop no intervenga.
 */
export function saveGridScrollPosition(): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(
      GRID_SCROLL_STORAGE_KEY,
      String(window.scrollY)
    );
  } catch {
    // Si sessionStorage falla, igualmente marcamos la señal.
  }

  deferScrollRestore();
}