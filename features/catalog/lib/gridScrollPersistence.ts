import { GRID_SCROLL_STORAGE_KEY } from '../config/grid';
import { deferScrollRestore } from '@/lib/scroll/defer';

/**
 * Guarda la posición de scroll actual y marca la señal
 * para que ScrollToTop no intervenga al regresar a la ruta indicada.
 */
export function saveGridScrollPosition(returnPath: string): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(
      GRID_SCROLL_STORAGE_KEY,
      String(window.scrollY)
    );
  } catch {
    // Si sessionStorage falla, igualmente marcamos la señal.
  }

  deferScrollRestore(returnPath);
}
