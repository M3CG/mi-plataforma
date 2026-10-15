// shared/lib/adblock-detector.ts

export type BrowserKind =
  | 'chrome'
  | 'firefox'
  | 'safari'
  | 'edge'
  | 'other';

/**
 * Detecta el navegador del usuario para abrir el enlace de
 * instalación correcto. La UI solo usa la URL, nunca muestra
 * el nombre de la extensión.
 */
export function detectBrowser(): BrowserKind {
  if (typeof window === 'undefined') return 'other';

  const ua = window.navigator.userAgent;

  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Edg')) return 'edge';
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Safari')) return 'safari';

  return 'other';
}

/**
 * Enlace de instalación del bloqueador recomendado por navegador.
 */
export function getAdblockRecommendation(browser: BrowserKind): {
  name: string;
  url: string;
  description: string;
} {
  const recommendations: Record<
    BrowserKind,
    { name: string; url: string; description: string }
  > = {
    chrome: {
      name: 'uBlock Origin',
      url: 'https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm',
      description: 'El bloqueador más eficiente y ligero para Chrome',
    },
    firefox: {
      name: 'uBlock Origin',
      url: 'https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/',
      description: 'El bloqueador más eficiente y ligero para Firefox',
    },
    safari: {
      name: 'AdGuard',
      url: 'https://apps.apple.com/app/adguard-adblock-privacy/id1047223162',
      description: 'El mejor bloqueador de anuncios para Safari',
    },
    edge: {
      name: 'uBlock Origin',
      url: 'https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak',
      description: 'El bloqueador más eficiente y ligero para Edge',
    },
    other: {
      name: 'uBlock Origin',
      url: 'https://ublockorigin.com/',
      description: 'Busca uBlock Origin en la tienda de extensiones de tu navegador',
    },
  };

  return recommendations[browser] ?? recommendations.other;
}

/** Clases que los bloqueadores suelen ocultar o eliminar. */
const BAIT_CLASS_NAMES =
  'adsbox ad-banner ads adsbanner ad-placement pub_300x250 text-ad';

/**
 * Detecta si el usuario tiene un bloqueador de anuncios activo.
 *
 * Cubre dos casos:
 * 1. Navegadores con bloqueo nativo (Brave Shields expone API oficial).
 * 2. Extensiones (uBlock Origin, AdGuard, etc.) mediante un elemento
 *    "bait" con clases típicas de anuncios: si el bloqueador lo
 *    oculta o lo elimina del DOM, la detección es positiva.
 *
 * Nunca lanza: ante cualquier duda devuelve false (muestra el aviso).
 */
export async function detectAdBlock(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  // ─── 1) Brave: API oficial de detección ───
  try {
    const brave = (
      window.navigator as Navigator & {
        brave?: { isBrave?: () => Promise<boolean> };
      }
    ).brave;

    if (brave?.isBrave && (await brave.isBrave())) {
      return true;
    }
  } catch {
    // Si la consulta falla, continuar con el bait element.
  }

  // ─── 2) Bait element ───
  try {
    const bait = document.createElement('div');
    bait.className = BAIT_CLASS_NAMES;
    bait.setAttribute('data-ad-unit', 'banner');
    bait.setAttribute('aria-hidden', 'true');
    bait.style.position = 'absolute';
    bait.style.left = '-9999px';
    bait.style.top = '-9999px';
    bait.style.width = '1px';
    bait.style.height = '1px';
    document.body.appendChild(bait);

    // Dos frames + buffer: tiempo suficiente para que los
    // bloqueadores apliquen sus reglas cosméticas.
    await new Promise<void>((resolve) => {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.setTimeout(resolve, 60);
        });
      });
    });

    let wasBlocked = false;
    if (bait.parentNode === null) {
      // El bloqueador eliminó el elemento del DOM.
      wasBlocked = true;
    } else {
      const styles = window.getComputedStyle(bait);
      wasBlocked =
        bait.offsetHeight === 0 ||
        styles.display === 'none' ||
        styles.visibility === 'hidden';
      bait.remove();
    }

    return wasBlocked;
  } catch {
    return false;
  }
}