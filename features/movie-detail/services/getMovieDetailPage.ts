// features/movie-detail/services/getMovieDetailPage.ts
import { isValidSlug } from '@/lib/utils/slugify';
import {
  extractTmdbIdFromSlug,
  isTmdbSlug,
} from '@/lib/api/tmdb/slugResolver';
import { tmdbGetMovie } from '@/lib/api/tmdb/client';
import { normalizeMovieDetail } from '@/lib/api/tmdb/normalizers';
import {
  createMovieDetailViewModel,
  type MovieDetailViewModel,
} from '../lib/createMovieDetailViewModel';
import type { Movie } from '@/entities/movie';
import { generateTmdbSlug } from '@/lib/api/tmdb/slugResolver';
import { slugify } from '@/lib/utils/slugify';
import { logger } from '@/lib/utils/logger';

/**
 * Convierte un TmdbMoviePreview a la entidad Movie
 * para poder usar createMovieDetailViewModel.
 */
function tmdbPreviewToMovie(preview: ReturnType<typeof normalizeMovieDetail>): Movie {
  const slug = generateTmdbSlug(preview.tmdbId, preview.originalTitle);

  return {
    id: preview.tmdbId,
    documentId: `tmdb-${preview.tmdbId}`,
    title: preview.englishTitle || preview.originalTitle,
    english_title: preview.englishTitle,
    spanish_title: preview.spanishTitle,
    slug,
    synopsis: preview.mainSynopsis,
    english_synopsis: preview.englishSynopsis,
    spanish_synopsis: preview.spanishSynopsis,
    year: preview.year,
    rating: preview.rating,
    country: preview.country || '',
    tmdb_id: preview.tmdbId,
    poster_url: preview.defaultPosterUrl,
    backdrop_url: preview.defaultBackdropUrl,
    trailer_url: preview.trailerUrl,
    runtime: preview.runtime,
    age_rating: preview.ageRating,
    original_language: preview.originalLanguage,
    servers: [],
    categories: preview.genres.map((g) => ({
      id: g.tmdbId,
      name: g.name,
      slug: slugify(g.name),
    })),
    actors: preview.cast.map((c) => ({
      id: c.tmdbId,
      documentId: `tmdb-person-${c.tmdbId}`,
      name: c.name,
      slug: slugify(c.name) || `person-${c.tmdbId}`,
      profile_image_url: c.profileImageUrl,
    })),
    directors: preview.directors.map((d) => ({
      id: d.tmdbId,
      documentId: `tmdb-person-${d.tmdbId}`,
      name: d.name,
      slug: slugify(d.name) || `person-${d.tmdbId}`,
      profile_image_url: d.profileImageUrl,
    })),
  };
}

export async function getMovieDetailPage(
  slug: string
): Promise<MovieDetailViewModel | null> {
  if (!isValidSlug(slug)) {
    return null;
  }

  // Extraer el tmdbId del slug.
  // Si el slug tiene formato TMDB ({id}-{titulo}), buscar en TMDB.
  const tmdbId = extractTmdbIdFromSlug(slug);

  if (tmdbId === null) {
    // Slug sin formato TMDB: no se puede resolver.
    logger.debug('Slug sin formato TMDB, no se puede resolver', {
      component: 'MovieDetail',
      action: 'getMovieDetailPage',
      slug,
    });
    return null;
  }

  try {
    const detail = await tmdbGetMovie(tmdbId);
    if (!detail) {
      logger.debug('Película no encontrada en TMDB', {
        component: 'MovieDetail',
        action: 'getMovieDetailPage',
        slug,
        tmdbId,
      });
      return null;
    }

    const preview = normalizeMovieDetail(detail);
    const movie = tmdbPreviewToMovie(preview);
    return createMovieDetailViewModel(movie);
  } catch (error) {
    logger.error('Error obteniendo película de TMDB', {
      component: 'MovieDetail',
      action: 'getMovieDetailPage',
      slug,
      tmdbId,
      error,
    });
    return null;
  }
}