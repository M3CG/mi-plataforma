// features/movie-detail/services/getMovieDetailPage.ts

import { getMovieBySlug } from '@/lib/queries/movies';
import { isValidSlug } from '@/lib/utils/slugify';
import {
  createMovieDetailViewModel,
  type MovieDetailViewModel,
} from '../lib/createMovieDetailViewModel';

export async function getMovieDetailPage(
  slug: string
): Promise<MovieDetailViewModel | null> {
  if (!isValidSlug(slug)) {
    return null;
  }

  const movie = await getMovieBySlug(slug);

  if (!movie) {
    return null;
  }

  return createMovieDetailViewModel(movie);
}