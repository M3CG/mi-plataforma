import Link from 'next/link';
import { routes } from '@/lib/routes';

/**
 * Cierre del home: en vez de seguir apilando filas,
 * un CTA limpio que manda al catálogo completo.
 */
export default function CatalogCta() {
  return (
    <section className="border-t border-white/5 pt-12 flex flex-col items-center text-center gap-4">
      <p className="text-sm text-gray-500">
        Looking for something specific? Browse the full catalog with filters by genre, year and rating.
      </p>
      <Link
        href={routes.movies}
        className="border border-white/15 rounded-full px-7 py-2.5 text-sm text-gray-200 hover:bg-white hover:text-black transition-colors duration-200"
      >
        Browse the full catalog
      </Link>
    </section>
  );
}
