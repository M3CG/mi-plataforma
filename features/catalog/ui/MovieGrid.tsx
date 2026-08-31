'use client';

import { Fragment, type ReactNode } from 'react';
import type { Movie, MovieFilters } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import PosterGrid from '@/shared/ui/PosterGrid';
import { useInfiniteMovies } from '../model/useInfiniteMovies';
import { useInfiniteScroll } from '../model/useInfiniteScroll';

export interface MovieGridProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  filters: MovieFilters;
  renderMovie: (movie: Movie, index: number) => ReactNode;
  renderAfterMovie?: (index: number, movie: Movie) => ReactNode;
}

export default function MovieGrid({
  initialMovies,
  initialHasMore,
  filters,
  renderMovie,
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
      <PosterGrid variant="compact">
        {movies.map((movie, index) => (
          <Fragment key={getMovieKey(movie)}>
            {renderMovie(movie, index)}
            {renderAfterMovie?.(index, movie)}
          </Fragment>
        ))}
      </PosterGrid>

      <div
        ref={sentinelRef}
        className="w-full py-12 flex justify-center min-h-[80px]"
      >
        {isLoading && (
          <div className="flex items-center gap-3 text-gray-400">
            <div className="w-5 h-5 border-2 border-red-600/60 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Loading more movies...</span>
          </div>
        )}

        {!hasMore && movies.length > 0 && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-px bg-white/10"></div>
            <p className="text-gray-500 text-xs">End of catalog</p>
          </div>
        )}
      </div>
    </>
  );
}
