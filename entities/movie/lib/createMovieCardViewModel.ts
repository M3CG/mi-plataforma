import type { Category } from '@/entities/category';
import type { Movie } from '../types/movie';
import { formatRuntime } from '@/lib/utils/format';

export interface MovieCardViewModel {
  title: string;
  year: number;
  rating: number;
  ageRating?: string;
  posterUrl?: string;
  runtimeLabel?: string;
  languages: string[];
  primaryQuality?: string;
  hasSubtitles: boolean;
  categories: Category[];
}

export function createMovieCardViewModel(
  movie: Movie
): MovieCardViewModel {
  const servers = movie.servers ?? [];

  const languages = Array.from(
    new Set(
      servers
        .map((server) => server.language)
        .filter((language): language is string => Boolean(language))
    )
  );

  const qualities = Array.from(
    new Set(
      servers
        .map((server) => server.quality)
        .filter((quality): quality is string => Boolean(quality))
    )
  );

  const hasSubtitles = servers.some((server) => server.subtitles === true);

  return {
    title: movie.title,
    year: movie.year,
    rating: movie.rating,
    ageRating: movie.age_rating ?? undefined,
    posterUrl: movie.poster_url,
    runtimeLabel: formatRuntime(movie.runtime) ?? undefined,
    languages,
    primaryQuality: qualities[0],
    hasSubtitles,
    categories: movie.categories ?? [],
  };
}
