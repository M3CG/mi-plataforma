import type { Movie } from '../types/movie';

/**
* La relevancia por coincidencia de géneros solo se usa
* cuando hay 2 o más géneros seleccionados.
*/
export function shouldUseGenreMatchRanking(
  genres?: string[]
): boolean {
  const normalizedGenres = Array.from(
    new Set((genres ?? []).map((genre) => genre.trim()).filter(Boolean))
  );

  return normalizedGenres.length >= 2;
}

/**
* Devuelve cuántos géneros seleccionados tiene una película.
*/
export function getMovieGenreMatchCount(
  movie: Pick<Movie, 'categories'>,
  selectedGenres: string[]
): number {
  const selected = new Set(
    selectedGenres.map((genre) => genre.trim()).filter(Boolean)
  );

  if (selected.size === 0) {
    return 0;
  }

  const movieGenres = new Set(
    (movie.categories ?? []).map((category) => category.slug)
  );

  let count = 0;

  selected.forEach((genreSlug) => {
    if (movieGenres.has(genreSlug)) {
      count += 1;
    }
  });

  return count;
}

/**
* Ordena películas por coincidencia de géneros seleccionados.
*
* Esto se deja como helper de dominio, aunque el orden principal
* ahora debe venir desde Strapi.
*/
export function rankMoviesByGenreMatch(
  movies: Movie[],
  selectedGenres: string[]
): Movie[] {
  const selected = selectedGenres
    .map((genre) => genre.trim())
    .filter(Boolean);

  if (selected.length < 2) {
    return movies;
  }

  return movies
    .map((movie, index) => ({
      movie,
      index,
      score: getMovieGenreMatchCount(movie, selected),
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.index - b.index;
    })
    .map((entry) => entry.movie);
}
