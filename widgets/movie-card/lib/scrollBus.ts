/**
 * Bus de scroll compartido para MovieCard.
 *
 * Antes cada tarjeta registraba su propio listener de window.scroll
 * (N tarjetas = N listeners por evento). Ahora hay UN listener nativo
 * y los suscriptores reciben onScroll / onScrollEnd.
 */
const SCROLL_END_DELAY_MS = 150;

interface ScrollHandlers {
  onScroll: () => void;
  onScrollEnd: () => void;
}

const subscribers = new Set<ScrollHandlers>();
let endTimer: ReturnType<typeof setTimeout> | null = null;

function handleScroll(): void {
  if (endTimer) clearTimeout(endTimer);
  subscribers.forEach((handlers) => handlers.onScroll());
  endTimer = setTimeout(() => {
    endTimer = null;
    subscribers.forEach((handlers) => handlers.onScrollEnd());
  }, SCROLL_END_DELAY_MS);
}

export function subscribeScroll(handlers: ScrollHandlers): () => void {
  subscribers.add(handlers);
  if (subscribers.size === 1 && typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll, { passive: true });
  }
  return () => {
    subscribers.delete(handlers);
    if (subscribers.size === 0 && typeof window !== 'undefined') {
      window.removeEventListener('scroll', handleScroll);
      if (endTimer) {
        clearTimeout(endTimer);
        endTimer = null;
      }
    }
  };
}
