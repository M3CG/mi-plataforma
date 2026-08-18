// entities/movie/lib/movieKey.ts

import type { Movie } from '@/types';

/**
 * Identidad única de una película.
 *
 * La identidad de la entidad Movie pertenece a la entidad,
 * no a features individuales como catalog o search.
 */
export function getMovieKey(
  movie: Pick<Movie, 'id' | 'documentId'>
): string {
  return movie.documentId || String(movie.id);
}

/**
 * Elimina películas repetidas usando la identidad canónica.
 */
export function dedupeMovies(
  existingMovies: Movie[],
  incomingMovies: Movie[]
): Movie[] {
  const seenKeys = new Set(existingMovies.map(getMovieKey));

  return incomingMovies.filter(
    (movie) => !seenKeys.has(getMovieKey(movie))
  );
}