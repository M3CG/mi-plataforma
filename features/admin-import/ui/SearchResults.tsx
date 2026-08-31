// features/admin-import/ui/SearchResults.tsx
'use client';
import Image from 'next/image';
import Link from 'next/link';
import type {
  AdminSearchMovieResult,
  AdminSearchPersonResult,
} from '../types';

interface SearchResultsProps {
  tab: 'movie' | 'person';
  movieResults: AdminSearchMovieResult[];
  personResults: AdminSearchPersonResult[];
  isLoading: boolean;
  error: string | null;
}

export default function SearchResults({
  tab,
  movieResults,
  personResults,
  isLoading,
  error,
}: SearchResultsProps) {
  if (isLoading) {
    return (
      <p className="text-gray-400 py-8 text-center">
        Buscando en TMDB...
      </p>
    );
  }
  if (error) {
    return <p className="text-red-400 py-8 text-center">{error}</p>;
  }

  if (tab === 'movie') {
    if (movieResults.length === 0) return null;
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {movieResults.map((movie) => (
          <Link
            key={movie.tmdbId}
            href={`/admin/import/movie/${movie.tmdbId}`}
            className="group relative text-left bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden hover:border-red-500/30 transition-all"
          >
            <div className="relative aspect-[2/3] bg-white/5">
              {movie.posterUrl ? (
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600 text-3xl">
                  🎬
                </div>
              )}
              {movie.inDatabase && (
                <span className="absolute top-2 right-2 text-[9px] px-1.5 py-0.5 rounded bg-green-600/90 text-white font-bold shadow-md z-10">
                  EN DB
                </span>
              )}
            </div>
            <div className="p-3">
              <h3 className="text-sm font-semibold line-clamp-2 group-hover:text-red-400 text-gray-200 transition-colors">
                {movie.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                {movie.year && <span>{movie.year}</span>}
                {typeof movie.rating === 'number' &&
                  movie.rating > 0 && (
                    <span className="text-amber-400">
                      ★ {movie.rating.toFixed(1)}
                    </span>
                  )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  }

  if (personResults.length === 0) return null;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {personResults.map((person) => (
        <Link
          key={person.tmdbId}
          href={`/admin/import/actor/${person.tmdbId}`}
          className="group text-center bg-white/[0.03] border border-white/5 rounded-2xl p-4 hover:border-red-500/30 transition-all"
        >
          <div className="relative w-20 h-20 mx-auto rounded-full overflow-hidden bg-white/5 mb-3">
            {person.profileUrl ? (
              <Image
                src={person.profileUrl}
                alt={person.name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-600">
                👤
              </div>
            )}
          </div>
          <h3 className="text-sm font-semibold text-gray-200 group-hover:text-red-400 line-clamp-2 transition-colors">
            {person.name}
          </h3>
          {person.knownForDepartment && (
            <p className="text-xs text-gray-500 mt-1">
              {person.knownForDepartment}
            </p>
          )}
        </Link>
      ))}
    </div>
  );
}
