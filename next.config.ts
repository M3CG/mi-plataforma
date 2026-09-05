import type { NextConfig } from 'next';

// ─── Headers de seguridad ───
// Se aplican a TODAS las rutas del sitio
const securityHeaders = [
  {
    // Evita que el navegador adivine el tipo MIME de archivos.
    // Ejemplo: un atacante no puede subir un .jpg que en realidad es un .js malicioso.
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    // Evita que tu página sea embebida en un iframe de otro sitio (protege contra clickjacking).
    // Nota: nuestros iframes de video no se ven afectados porque están EN nuestra página,
    // esto protege que OTROS sitios embebidos carguen CineStream dentro de ellos.
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    // Activa el filtro XSS básico del navegador (legacy, pero no hace daño tenerlo).
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  {
    // Controla cuánto información del "referrer" se envía cuando un usuario sale de tu sitio.
    // "strict-origin-when-cross-origin" es el balance correcto:
    // - Navegación interna: URL completa
    // - Navegación a otro sitio: solo el dominio (protege URLs con slugs de películas)
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    // Desactiva APIs del navegador que no necesitamos.
    // Reduce la superficie de ataque y mejora la privacidad del usuario.
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    // Fuerza HTTPS por un año. Solo útil si tu sitio ya está en HTTPS.
    // En desarrollo local (http), este header se ignora por el navegador, así que no molesta.
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload',
  },
];

const nextConfig: NextConfig = {
  // Activa el modo estricto de React: ayuda a detectar bugs en desarrollo
  // haciendo doble-render de componentes. No afecta producción.
  reactStrictMode: true,

  // Oculta el header "X-Powered-By: Next.js" de las respuestas HTTP.
  // No revelar la tecnología que usas es una buena práctica de seguridad.
  poweredByHeader: false,

  images: {
    loader: 'custom',
    loaderFile: './lib/utils/imageLoader',
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      // Strapi local (desarrollo)
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '1337',
        pathname: '/uploads/**',
      },
      // TMDB (imágenes de pósters/backdrops)
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
            // Strapi en Railway (producción)
      {
        protocol: 'https',
        hostname: 'db-production-d11b.up.railway.app',
        pathname: '/uploads/**',
      },
      // ⚠️ AGREGA AQUÍ tu Strapi de producción cuando lo tengas desplegado
      // Ejemplo:
      // {
      //   protocol: 'https',
      //   hostname: 'api.tudominio.com',
      //   pathname: '/uploads/**',
      // },
    ],
  },

  // Aplicar los headers de seguridad a todas las rutas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;