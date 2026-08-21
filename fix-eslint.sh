#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
NC='\033[0m'
log() { echo -e "${GREEN}✓${NC} $1"; }

write_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  log "  $path"
}

# ─────────────────────────────────────────────────────
# 1. Crear genreRankedParams.ts en lib/api/strapi/
# ─────────────────────────────────────────────────────
write_file "lib/api/strapi/genreRankedParams.ts" << 'EOF'
// lib/api/strapi/genreRankedParams.ts

/**
 * Nombres de query params que espera el endpoint custom
 * GET /movies/genre-ranked de Strapi.
 *
 * Estos NO son los query params de la URL del frontend.
 * Son la interfaz del endpoint custom del backend.
 *
 * El BFF (/api/movies) recibe params del frontend
 * (definidos en lib/url/movieFilterParams.ts) y los
 * traduce a estos nombres para llamar al endpoint custom.
 */
export const GENRE_RANKED_PARAM_KEYS = {
  genres: 'genres',
  minRating: 'minRating',
  fromYear: 'fromYear',
  toYear: 'toYear',
  country: 'country',
  sort: 'sort',
} as const;

export const GENRE_RANKED_PAGINATION_KEYS = {
  page: 'page',
  pageSize: 'pageSize',
} as const;
EOF

# ─────────────────────────────────────────────────────
# 2. Actualizar lib/api/repositories/movies.ts
# ─────────────────────────────────────────────────────
write_file "lib/api/repositories/movies.ts" << 'EOF'
// lib/api/repositories/movies.ts

import {
  type Movie,
  type MovieFilters,
  shouldUseGenreMatchRanking,
} from '@/entities/movie';
import {
  GENRE_RANKED_PARAM_KEYS,
  GENRE_RANKED_PAGINATION_KEYS,
} from '../strapi/genreRankedParams';
import type { PaginatedResult } from '../pagination/types';
import type { StrapiListResponse } from '../strapi/types';
import {
  DEFAULT_PAGE_SIZE,
  HOME_PAGE_SIZE,
} from '../pagination/config';
import { fetchApi } from '../http/client';
import { getHasMore } from '../strapi/pagination';
import {
  normalizeMovie,
  normalizeMovieList,
} from '../strapi/normalizers';
import { buildMovieListParams } from '../strapi/movieParams';
import {
  buildPopulateParams,
  MOVIE_DETAIL_POPULATE,
} from '../strapi/populate';
import { isValidSlug } from '@/lib/utils/slugify';
import { logger } from '@/lib/utils/logger';

async function fetchGenreRankedMovies(
  queryParams: MovieFilters,
  page: number,
  pageSize: number
): Promise<PaginatedResult<Movie> | null> {
  const genres = (queryParams.genres ?? []).filter(Boolean);

  const params: Record<string, string | string[] | undefined> = {
    [GENRE_RANKED_PARAM_KEYS.genres]: genres,
    [GENRE_RANKED_PAGINATION_KEYS.page]: String(page),
    [GENRE_RANKED_PAGINATION_KEYS.pageSize]: String(pageSize),
  };

  if (queryParams.sort) {
    params[GENRE_RANKED_PARAM_KEYS.sort] = queryParams.sort;
  }

  if (
    typeof queryParams.minRating === 'number' &&
    Number.isFinite(queryParams.minRating)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.minRating] = String(
      queryParams.minRating
    );
  }

  if (
    typeof queryParams.fromYear === 'number' &&
    Number.isFinite(queryParams.fromYear)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.fromYear] = String(
      queryParams.fromYear
    );
  }

  if (
    typeof queryParams.toYear === 'number' &&
    Number.isFinite(queryParams.toYear)
  ) {
    params[GENRE_RANKED_PARAM_KEYS.toYear] = String(queryParams.toYear);
  }

  if (queryParams.country) {
    params[GENRE_RANKED_PARAM_KEYS.country] = queryParams.country;
  }

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies/genre-ranked',
    params,
    {
      next: {
        revalidate: 60,
        tags: ['movies', 'movies:list', 'movies:genre-ranked'],
      },
    }
  );

  if (!json) {
    return null;
  }

  return {
    data: normalizeMovieList(json),
    hasMore: getHasMore(json, page, pageSize),
    page,
    pageSize,
  };
}

export async function fetchMoviesWithFilters(
  queryParams: MovieFilters = {},
  page = 1,
  pageSize = DEFAULT_PAGE_SIZE
): Promise<PaginatedResult<Movie>> {
  const safePage = Math.max(1, Math.floor(Number(page) || 1));
  const safePageSize = Math.max(
    1,
    Math.floor(Number(pageSize) || DEFAULT_PAGE_SIZE)
  );

  if (shouldUseGenreMatchRanking(queryParams.genres)) {
    const rankedResult = await fetchGenreRankedMovies(
      queryParams,
      safePage,
      safePageSize
    );

    if (rankedResult) {
      return rankedResult;
    }

    logger.warn(
      'Genre ranked endpoint failed. Falling back to standard movie list query.',
      {
        component: 'MoviesRepository',
        action: 'fetchMoviesWithFilters',
        genres: queryParams.genres,
      }
    );
  }

  const params = buildMovieListParams(
    queryParams,
    safePage,
    safePageSize
  );

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    params,
    {
      next: {
        revalidate: 60,
        tags: ['movies', 'movies:list'],
      },
    }
  );

  return {
    data: normalizeMovieList(json),
    hasMore: getHasMore(json, safePage, safePageSize),
    page: safePage,
    pageSize: safePageSize,
  };
}

export async function fetchHomeMovies(): Promise<Movie[]> {
  const params = buildMovieListParams(
    { sort: 'latest' },
    1,
    HOME_PAGE_SIZE
  );

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['movies', 'movies:home'],
      },
    }
  );

  return normalizeMovieList(json);
}

export async function fetchMovieBySlug(
  slug: string
): Promise<Movie | null> {
  if (!isValidSlug(slug)) {
    logger.warn('Slug de película inválido', {
      component: 'MoviesRepository',
      action: 'fetchMovieBySlug',
      slug,
    });
    return null;
  }

  const params = {
    'filters[slug][$eq]': slug,
    ...buildPopulateParams(MOVIE_DETAIL_POPULATE),
    'pagination[pageSize]': '1',
  };

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['movies', `movie:${slug}`],
      },
    }
  );

  const firstItem = Array.isArray(json?.data)
    ? json.data[0]
    : undefined;

  if (!firstItem) return null;
  return normalizeMovie(firstItem);
}
EOF

# ─────────────────────────────────────────────────────
# 3. Actualizar BFF route para usar el import correcto
# ─────────────────────────────────────────────────────
write_file "app/api/movies/route.ts" << 'EOF'
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
EOF

echo ""
echo "═══════════════════════════════════════════════════"
echo -e "  ${GREEN}✓ FIX APLICADO${NC}"
echo "═══════════════════════════════════════════════════"
echo ""
echo "  Cambios:"
echo "    1. Creado lib/api/strapi/genreRankedParams.ts"
echo "    2. Actualizado lib/api/repositories/movies.ts"
echo "       (importa desde ../strapi/genreRankedParams)"
echo "    3. Actualizado app/api/movies/route.ts"
echo ""
echo "  Verificar con: npm run check"
