// lib/utils/imageLoader.ts
import type { ImageLoaderProps } from 'next/image';

/**
 * Custom image loader para Next.js.
 *
 * En lugar de usar la optimización de Vercel (que tiene límite de 1000
 * optimizaciones/mes en el plan Hobby), este loader devuelve la URL
 * original directamente, sin pasar por /_next/image.
 *
 * Next.js sigue aplicando lazy loading, responsive sizes y los demás
 * beneficios del componente <Image>, pero la descarga se hace
 * directamente desde el CDN origen (TMDB, Railway, etc).
 *
 * Esto resuelve el error OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED
 * que aparece cuando se supera el cupo gratuito de Vercel.
 */
export default function imageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // Para URLs de TMDB, podemos aprovechar sus tamaños predefinidos.
  // TMDB ofrece: w92, w154, w185, w342, w500, w780, original
  // Elegimos el más cercano al width solicitado.
  if (src.includes('image.tmdb.org')) {
    const tmdbSizes = [
      { max: 92, size: 'w92' },
      { max: 154, size: 'w154' },
      { max: 185, size: 'w185' },
      { max: 342, size: 'w342' },
      { max: 500, size: 'w500' },
      { max: 780, size: 'w780' },
    ];

    const matched = tmdbSizes.find((s) => width <= s.max);
    const tmdbSize = matched?.size ?? 'w780';

    // Reemplazar el tamaño en la URL si ya tiene uno
    return src.replace(/\/t\/p\/w\d+\//, `/t/p/${tmdbSize}/`);
  }

  // Para otras URLs (Railway uploads, etc), devolver tal cual
  return src;
}
