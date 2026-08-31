import Link from 'next/link';
import Image from 'next/image';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { routes } from '@/lib/routes';
import { IconStar } from '@/shared/ui/icons';
import SectionHeader from './SectionHeader';

interface TopViewedListProps {
  movies: Movie[];
}

/**
 * "Las más vistas" como ranking editorial numerado:
 * números grandes extralight, póster pequeño, tipografía limpia.
 * El opuesto de un carrusel genérico: se lee como una cartelera.
 */
export default function TopViewedList({ movies }: TopViewedListProps) {
  if (movies.length === 0) return null;
  const top = movies.slice(0, 10);

  return (
    <section>
      <SectionHeader title="Las más vistas" href={routes.movies} />
      <ol className="grid md:grid-cols-2 gap-x-14">
        {top.map((movie, index) => (
          <li key={getMovieKey(movie)}>
            <Link
              href={routes.movie(movie.slug)}
              className="group flex items-center gap-5 py-3 border-b border-white/5"
            >
              <span className="w-10 shrink-0 text-right text-3xl md:text-4xl font-extralight text-white/25 tabular-nums group-hover:text-red-500/80 transition-colors">
                {index + 1}
              </span>
              {movie.poster_url ? (
                <div className="relative w-12 aspect-[2/3] shrink-0 rounded-sm overflow-hidden bg-white/5">
                  <Image
                    src={movie.poster_url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 aspect-[2/3] shrink-0 rounded-sm bg-white/5" />
              )}
              <div className="min-w-0">
                <h3 className="text-sm md:text-base font-medium text-gray-200 group-hover:text-white transition-colors truncate">
                  {movie.title}
                </h3>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1.5">
                  <span>{movie.year}</span>
                  {movie.rating > 0 && (
                    <>
                      <span className="text-gray-700">·</span>
                      <IconStar className="w-3 h-3 text-amber-400/80" />
                      <span>{movie.rating.toFixed(1)}</span>
                    </>
                  )}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </section>
  );
}
