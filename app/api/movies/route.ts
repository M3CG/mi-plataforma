// app/api/movies/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { fetchMoviesWithFilters } from '@/lib/api/repositories/movies';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import { parseMovieFiltersFromSearchParams } from '@/lib/url/movieFilters';
import { MOVIE_PAGINATION_PARAM_KEYS } from '@/lib/url/movieFilterParams';
import { logger } from '@/lib/utils/logger';
import { checkRateLimit, getClientIp } from '@/lib/utils/rate-limit';

export async function GET(request: NextRequest) {
  // ─── Rate limiting ───
  const clientIp = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(clientIp);

  if (!allowed) {
    logger.warn('Rate limit exceeded on /api/movies', {
      component: 'BFF',
      action: 'GET /api/movies',
      ip: clientIp,
    });

    return NextResponse.json(
      {
        data: [],
        hasMore: false,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
        error: 'Too many requests',
      },
      {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Remaining': '0',
        },
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = parseMovieFiltersFromSearchParams(searchParams);

    const page = Math.max(
      1,
      Math.min(
        Number(searchParams.get(MOVIE_PAGINATION_PARAM_KEYS.page)) || 1,
        1000
      )
    );

    const pageSize = Math.max(
      1,
      Math.min(
        Number(searchParams.get(MOVIE_PAGINATION_PARAM_KEYS.pageSize)) ||
          DEFAULT_PAGE_SIZE,
        100
      )
    );

    const result = await fetchMoviesWithFilters(filters, page, pageSize);

    return NextResponse.json(result, {
      headers: {
        'X-RateLimit-Remaining': String(remaining),
      },
    });
  } catch (error) {
    logger.error('Error in /api/movies', {
      component: 'BFF',
      action: 'GET /api/movies',
      error,
    });

    return NextResponse.json(
      {
        data: [],
        hasMore: false,
        page: 1,
        pageSize: DEFAULT_PAGE_SIZE,
      },
      { status: 500 }
    );
  }
}
