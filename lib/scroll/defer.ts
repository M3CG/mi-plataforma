const SCROLL_DEFER_KEY = '__scroll_restore_pending_path';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Marca que una feature quiere controlar el scroll
 * cuando el usuario regrese a una ruta concreta.
 */
export function deferScrollRestore(returnPath: string): void {
  if (!isBrowser()) return;

  try {
    sessionStorage.setItem(SCROLL_DEFER_KEY, returnPath);
  } catch {
    // Si sessionStorage falla, igualmente dejamos que el flujo continúe.
  }
}

/**
 * Consulta si hay una señal pendiente de restauración de scroll
 * para una ruta específica.
 */
export function isScrollRestoreDeferredFor(pathname: string): boolean {
  if (!isBrowser()) return false;

  try {
    return sessionStorage.getItem(SCROLL_DEFER_KEY) === pathname;
  } catch {
    return false;
  }
}

/**
 * Consume la señal pendiente si corresponde a la ruta indicada.
 */
export function consumeScrollRestoreSignal(pathname: string): boolean {
  if (!isScrollRestoreDeferredFor(pathname)) return false;

  try {
    sessionStorage.removeItem(SCROLL_DEFER_KEY);
  } catch {
    // Si no se puede limpiar, igualmente la damos por consumida.
  }

  return true;
}
