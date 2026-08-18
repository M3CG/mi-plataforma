import { z } from 'zod';
import type { Movie, MovieFilters } from '@/entities/movie';
import type { PaginatedResult } from '@/lib/api/pagination/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import { serializeMovieFiltersToSearchParams } from '@/lib/url/movieFilters';
import { MOVIE_PAGINATION_PARAM_KEYS } from '@/entities/movie/config/filterParams';
import { logger } from '@/lib/utils/logger';

const ServerSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  url: z.string(),
  language: z.string().optional(),
  quality: z.string().optional(),
  subtitles: z.boolean().optional(),
});

const CategorySchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

const PersonSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  profile_image_url: z.string().optional(),
});

const MovieSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  title: z.string(),
  english_title: z.string().optional(),
  spanish_title: z.string().optional(),
  slug: z.string(),
  synopsis: z.string(),
  year: z.number(),
  rating: z.number(),
  country: z.string(),
  tmdb_id: z.number(),
  views: z.number().optional(),
  featured_this_week: z.boolean().optional(),
  poster_url: z.string().optional(),
  backdrop_url: z.string().optional(),
  trailer_url: z.string().optional(),
  runtime: z.number().optional(),
  age_rating: z.string().optional(),
  original_language: z.string().optional(),
  servers: z.array(ServerSchema).optional(),
  categories: z.array(CategorySchema).optional(),
  actors: z.array(PersonSchema).optional(),
  directors: z.array(PersonSchema).optional(),
});

const PaginatedMoviesSchema = z.object({
  data: z.array(MovieSchema),
  hasMore: z.boolean(),
  page: z.number(),
  pageSize: z.number(),
});

export async function fetchMoviesFromApi(
  filters: MovieFilters,
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Movie>> {
  try {
    const params = serializeMovieFiltersToSearchParams(filters);
    params.set(MOVIE_PAGINATION_PARAM_KEYS.page, String(page));
    params.set(MOVIE_PAGINATION_PARAM_KEYS.pageSize, String(pageSize));

    const response = await fetch(`/api/movies?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const parsed = PaginatedMoviesSchema.safeParse(json);

    if (!parsed.success) {
      logger.error('Invalid BFF payload for catalog movies', {
        component: 'CatalogClient',
        action: 'fetchMoviesFromApi',
        error: parsed.error,
        page,
        pageSize,
      });

      return {
        data: [],
        hasMore: false,
        page,
        pageSize,
      };
    }

    return parsed.data as PaginatedResult<Movie>;
  } catch (error) {
    logger.error('Error fetching movies from BFF', {
      component: 'CatalogClient',
      action: 'fetchMoviesFromApi',
      error,
      page,
      pageSize,
    });

    return {
      data: [],
      hasMore: false,
      page,
      pageSize,
    };
  }
}
