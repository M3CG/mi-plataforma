// lib/scroll/defer.ts

const SCROLL_DEFER_KEY = '__scroll_restore_pending';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Marca que una feature quiere controlar el scroll.
 *
 * Esta señal es leída por ScrollToTop para no intervenir.
 */
export function deferScrollRestore(): void {
  if (!isBrowser()) return;

  try {
    sessionStorage.setItem(SCROLL_DEFER_KEY, 'true');
  } catch {
    // Si sessionStorage falla, igualmente dejamos que el flujo continúe.
  }
}

/**
 * Consulta si hay una señal pendiente de restauración de scroll.
 * No la consume.
 */
export function isScrollRestoreDeferred(): boolean {
  if (!isBrowser()) return false;

  try {
    return sessionStorage.getItem(SCROLL_DEFER_KEY) === 'true';
  } catch {
    return false;
  }
}

/**
 * Consume la señal pendiente.
 * Devuelve true si existía y fue limpiada.
 */
export function consumeScrollRestoreSignal(): boolean {
  if (!isScrollRestoreDeferred()) return false;

  try {
    sessionStorage.removeItem(SCROLL_DEFER_KEY);
  } catch {
    // Si no se puede limpiar, igualmente la damos por consumida.
  }

  return true;
}