// features/catalog/ui/MovieGrid.tsx
'use client';

import { Fragment, type ReactNode } from 'react';
import type { Movie } from '@/types';
import type { MovieFilters } from '@/entities/movie/types/filters';
import { getMovieKey } from '@/entities/movie/lib/movieKey';

import CatalogMovieCard from './CatalogMovieCard';
import { useInfiniteMovies } from '../model/useInfiniteMovies';
import { useInfiniteScroll } from '../model/useInfiniteScroll';

export interface MovieGridProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  filters: MovieFilters;
  renderAfterMovie?: (index: number, movie: Movie) => ReactNode;
}

export default function MovieGrid({
  initialMovies,
  initialHasMore,
  filters,
  renderAfterMovie,
}: MovieGridProps) {
  const {
    movies,
    hasMore,
    isLoading,
    loadMore,
  } = useInfiniteMovies({
    initialMovies,
    initialHasMore,
    filters,
  });

  const sentinelRef = useInfiniteScroll({
    hasMore,
    isLoading,
    onLoadMore: loadMore,
  });

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {movies.map((movie, index) => (
          <Fragment key={getMovieKey(movie)}>
            <div className="contents">
              <CatalogMovieCard movie={movie} />
            </div>

            {renderAfterMovie?.(index, movie)}
          </Fragment>
        ))}
      </div>

      {/* Zona de observación / Loading */}
      <div
        ref={sentinelRef}
        className="w-full py-12 flex justify-center min-h-[80px]"
      >
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-red-600/60 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Cargando más películas...</span>
          </div>
        )}

        {!hasMore && movies.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-px bg-white/10"></div>
            <p className="text-gray-500 text-xs">Fin del catálogo</p>
          </div>
        )}
      </div>
    </>
  );
}