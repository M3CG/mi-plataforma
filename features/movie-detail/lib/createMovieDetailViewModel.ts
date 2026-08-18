// features/movie-detail/lib/createMovieDetailViewModel.ts

import type {
  Actor,
  Category,
  Director,
  Movie,
  Server,
} from '@/types';
import { formatRuntime } from '@/lib/utils/format';

export interface MovieDetailViewModel {
  slug: string;
  title: string;
  year: number;
  rating: number;

  ageRating?: string;
  runtimeLabel?: string;
  runtimeMinutes?: number;
  originalLanguage?: string;

  synopsis: string;
  country?: string;

  posterUrl?: string;
  backdropImage?: string;
  trailerUrl?: string;

  tmdbId: number;

  categories: Category[];
  actors: Actor[];
  directors: Director[];
  servers: Server[];

  directorNames: string;
}

export function createMovieDetailViewModel(
  movie: Movie
): MovieDetailViewModel {
  const directors = movie.directors ?? [];

  return {
    slug: movie.slug,
    title: movie.title,
    year: movie.year,
    rating: movie.rating,

    ageRating: movie.age_rating ?? undefined,
    runtimeLabel: formatRuntime(movie.runtime) ?? undefined,
    runtimeMinutes: movie.runtime ?? undefined,
    originalLanguage: movie.original_language ?? undefined,

    synopsis: movie.synopsis ?? '',
    country: movie.country || undefined,

    posterUrl: movie.poster_url,
    backdropImage: movie.backdrop_url || movie.poster_url,
    trailerUrl: movie.trailer_url || undefined,

    tmdbId: movie.tmdb_id,

    categories: movie.categories ?? [],
    actors: movie.actors ?? [],
    directors,
    servers: movie.servers ?? [],

    directorNames: directors
      .map((director) => director.name)
      .join(', '),
  };
}