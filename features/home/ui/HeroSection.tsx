import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '@/entities/movie';
import { formatRuntime } from '@/entities/movie';
import { routes } from '@/lib/routes';
import { IconPlay, IconStar } from '@/shared/ui/icons';

interface HeroSectionProps {
  movie: Movie;
}

/**
 * Hero editorial minimalista:
 * backdrop muy atenuado como atmósfera, tipografía extralight
 * gigante y póster enmarcado a la derecha.
 * Nada de gradientes pesados ni hero "Netflix clone".
 */
export default function HeroSection({ movie }: HeroSectionProps) {
  const backdrop = movie.backdrop_url || movie.poster_url;
  const runtimeLabel = formatRuntime(movie.runtime);

  return (
    <section className="relative overflow-hidden">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          quality={80}
          sizes="100vw"
          className="object-cover object-top opacity-20 saturate-50"
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/70 to-[#0a0a0a]/30" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-32 md:pt-40 pb-14 md:pb-20">
        <div className="flex items-end gap-10 lg:gap-14">
          {/* ─── Columna editorial ─── */}
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-500 mb-5">
              En cartelera
            </p>
            <h1 className="text-4xl md:text-6xl font-extralight text-white leading-[1.05] tracking-tight">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-5 text-sm text-gray-400">
              <span>{movie.year}</span>
              {movie.rating > 0 && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="flex items-center gap-1 text-amber-400/90">
                    <IconStar className="w-3.5 h-3.5" />
                    {movie.rating.toFixed(1)}
                  </span>
                </>
              )}
              {runtimeLabel && (
                <>
                  <span className="text-gray-700">·</span>
                  <span>{runtimeLabel}</span>
                </>
              )}
              {movie.age_rating && (
                <>
                  <span className="text-gray-700">·</span>
                  <span className="border border-white/15 rounded px-1.5 py-0.5 text-[11px] text-gray-400">
                    {movie.age_rating}
                  </span>
                </>
              )}
            </div>

            {movie.synopsis && (
              <p className="mt-5 text-sm md:text-[15px] text-gray-400 leading-relaxed line-clamp-3 max-w-xl">
                {movie.synopsis}
              </p>
            )}

            <div className="mt-8 flex items-center gap-5">
              <Link
                href={routes.movie(movie.slug)}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                <IconPlay className="w-4 h-4" />
                Ver ahora
              </Link>
              <Link
                href={routes.movie(movie.slug)}
                className="text-sm text-gray-400 hover:text-white underline underline-offset-4 decoration-white/20 hover:decoration-white/60 transition-colors"
              >
                Ficha técnica
              </Link>
            </div>
          </div>

          {/* ─── Póster enmarcado ─── */}
          {movie.poster_url && (
            <div className="hidden md:block w-44 lg:w-52 shrink-0">
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden border border-white/10 shadow-2xl shadow-black/60">
                <Image
                  src={movie.poster_url}
                  alt={`Póster de ${movie.title}`}
                  fill
                  sizes="208px"
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
