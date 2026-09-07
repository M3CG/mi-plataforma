// shared/lib/adblock-detector.ts

/**
 * Detecta el navegador del usuario para recomendar el adblocker correcto.
 */
export function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'other' {
  if (typeof window === 'undefined') return 'other';
  const ua = window.navigator.userAgent;
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Edg')) return 'edge';
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Safari')) return 'safari';
  return 'other';
}

/**
 * Obtiene la recomendación de adblocker según el navegador.
 */
export function getAdblockRecommendation(browser: string): {
  name: string;
  url: string;
  description: string;
} {
  const recommendations: Record<string, { name: string; url: string; description: string }> = {
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
  return recommendations[browser] || recommendations.other;
}
