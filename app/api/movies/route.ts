// app/api/movies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import { parseMovieFiltersFromSearchParams } from '@/lib/url/movieFilters';
import { MOVIE_PAGINATION_PARAM_KEYS } from '@/lib/url/movieFilterParams';
import { PaginatedMoviesSchema } from '@/lib/validation/moviePayloadSchemas';
import { logger } from '@/lib/utils/logger';
import { checkRateLimit, getClientIp } from '@/lib/utils/rate-limit';
import { discoverMovies } from '@/lib/api/tmdb/discover';
import { normalizeTmdbResultsToMovies } from '@/lib/api/tmdb/catalogNormalizer';

export async function GET(request: NextRequest) {
  const clientIp = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(clientIp);
  if (!allowed) {
    logger.warn('Rate limit exceeded on /api/movies', {
      component: 'BFF',
      action: 'GET /api/movies',
      ip: clientIp,
    });
    return NextResponse.json(
      { data: [], hasMore: false, page: 1, pageSize: DEFAULT_PAGE_SIZE, error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60', 'X-RateLimit-Remaining': '0' } }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = Math.max(
      1,
      Math.min(Number(searchParams.get(MOVIE_PAGINATION_PARAM_KEYS.page)) || 1, 500)
    );
    const pageSize = Math.max(
      1,
      Math.min(Number(searchParams.get(MOVIE_PAGINATION_PARAM_KEYS.pageSize)) || DEFAULT_PAGE_SIZE, 100)
    );

    // TMDB Discover usa los mismos query params que el BFF anterior.
    // discoverMovies ya traduce genres, minRating, fromYear, etc.
    const discoverResult = await discoverMovies(searchParams, page, 'catalog');

    const movies = normalizeTmdbResultsToMovies(discoverResult.results);

    const result = {
      data: movies,
      hasMore: discoverResult.hasMore,
      page,
      pageSize,
    };

    const parsed = PaginatedMoviesSchema.safeParse(result);
    if (!parsed.success) {
      logger.error('Invalid BFF response payload', {
        component: 'BFF',
        action: 'GET /api/movies',
        error: parsed.error,
        page,
        pageSize,
      });
      return NextResponse.json(
        { data: [], hasMore: false, page, pageSize },
        { status: 502 }
      );
    }

    return NextResponse.json(parsed.data, {
      headers: { 'X-RateLimit-Remaining': String(remaining) },
    });
  } catch (error) {
    logger.error('Error in /api/movies', {
      component: 'BFF',
      action: 'GET /api/movies',
      error,
    });
    return NextResponse.json(
      { data: [], hasMore: false, page: 1, pageSize: DEFAULT_PAGE_SIZE },
      { status: 500 }
    );
  }
}