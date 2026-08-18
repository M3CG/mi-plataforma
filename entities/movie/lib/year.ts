// entities/movie/lib/year.ts

export const MOVIE_YEAR_MIN = 1900;

export function getMovieYearMax(): number {
  return new Date().getFullYear();
}

export function clampMovieYear(year: number): number {
  const maxYear = getMovieYearMax();

  return Math.min(
    Math.max(Math.floor(year), MOVIE_YEAR_MIN),
    maxYear
  );
}