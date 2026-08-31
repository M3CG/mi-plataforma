import Link from 'next/link';
import Image from 'next/image';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { routes } from '@/lib/routes';
import SectionHeader from './SectionHeader';

interface LatestArrivalsProps {
  movies: Movie[];
}

/**
 * "Recién llegadas" como tira minimalista:
 * póster limpio + título + año. Sin badges, sin bordes,
 * sin overlays. El catálogo ya tiene las tarjetas completas.
 */
export default function LatestArrivals({ movies }: LatestArrivalsProps) {
  if (movies.length === 0) return null;

  return (
    <section>
      <SectionHeader title="Recién llegadas" href={routes.movies} />
      <div className="flex gap-4 md:gap-5 overflow-x-auto scrollbar-hide -mx-4 px-4 md:-mx-8 md:px-8 pb-2">
        {movies.slice(0, 10).map((movie) => (
          <Link
            key={getMovieKey(movie)}
            href={routes.movie(movie.slug)}
            className="group w-32 sm:w-36 md:w-40 shrink-0"
          >
            <div className="relative aspect-[2/3] rounded-md overflow-hidden bg-white/5">
              {movie.poster_url ? (
                <Image
                  src={movie.poster_url}
                  alt={`Póster de ${movie.title}`}
                  fill
                  sizes="(max-width: 640px) 128px, 160px"
                  className="object-cover transition-opacity duration-300 group-hover:opacity-80"
                />
              ) : (
                <div className="w-full h-full bg-white/5" />
              )}
            </div>
            <h3 className="mt-2.5 text-xs md:text-sm text-gray-300 group-hover:text-white transition-colors truncate">
              {movie.title}
            </h3>
            <p className="text-[11px] text-gray-600 mt-0.5">{movie.year}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
