#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f package.json ]]; then
  echo "❌ Debes ejecutar este script desde la raíz del proyecto (donde está package.json)." >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Este script necesita Node.js instalado." >&2
  exit 1
fi

echo "🚀 Iniciando refactorización de separación de responsabilidades..."
echo "⚠️  Este script sobrescribe varios archivos. Se recomienda ejecutarlo con Git limpio."
echo ""

mkdir -p \
  widgets/movie-card/lib \
  lib/url \
  features/filters/config \
  features/filters/lib \
  lib/api/repositories \
  lib/queries \
  lib/validation

# ─────────────────────────────────────────────────────────────
# 1. MovieCardViewModel fuera de entities
# ─────────────────────────────────────────────────────────────

cat > widgets/movie-card/lib/createMovieCardViewModel.ts <<'EOF_CREATE_MOVIE_CARD_VIEW_MODEL'
import type { Category } from '@/entities/category';
import type { Movie } from '@/entities/movie';
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
EOF_CREATE_MOVIE_CARD_VIEW_MODEL

# ─────────────────────────────────────────────────────────────
# 2. Query params de URL fuera de entities
# ─────────────────────────────────────────────────────────────

cat > lib/url/movieFilterParams.ts <<'EOF_MOVIE_FILTER_PARAMS'
/**
* Fuente canónica de los query params de filtros de películas.
*
* Esto evita tener strings hardcodeados como:
* - 'genres'
* - 'minRating'
* - 'fromYear'
* - 'toYear'
* - 'country'
* - 'sort'
*
* en múltiples capas.
*/
export const MOVIE_FILTER_PARAM_KEYS = {
  genres: 'genres',
  minRating: 'minRating',
  fromYear: 'fromYear',
  toYear: 'toYear',
  country: 'country',
  sort: 'sort',
} as const;

export type MovieFilterParamKey =
  (typeof MOVIE_FILTER_PARAM_KEYS)[keyof typeof MOVIE_FILTER_PARAM_KEYS];

/**
* Query params de paginación usados por el BFF y clientes de catálogo.
*/
export const MOVIE_PAGINATION_PARAM_KEYS = {
  page: 'page',
  pageSize: 'pageSize',
} as const;
EOF_MOVIE_FILTER_PARAMS

# ─────────────────────────────────────────────────────────────
# 3. Sort: valores de dominio en entities, opciones UI en filters
# ─────────────────────────────────────────────────────────────

cat > entities/movie/config/sort.ts <<'EOF_ENTITY_SORT'
// entities/movie/config/sort.ts
import type { MovieSort } from '../types/filters';

/**
* Valores válidos de sorting.
* Fuente canónica para validación.
*/
export const MOVIE_SORT_VALUES: readonly MovieSort[] = [
  'latest',
  'oldest',
  'title',
  'title-desc',
  'rating',
  'rating-asc',
];

/**
* Sorting por defecto.
*/
export const DEFAULT_MOVIE_SORT: MovieSort = 'latest';

/**
* Type guard para saber si un valor es un sort válido.
*/
export function isMovieSort(value: unknown): value is MovieSort {
  return (
    typeof value === 'string' &&
    (MOVIE_SORT_VALUES as readonly string[]).includes(value)
  );
}
EOF_ENTITY_SORT

cat > features/filters/config/sortOptions.ts <<'EOF_FILTER_SORT_OPTIONS'
import type { MovieSort } from '@/entities/movie';

/**
* Opciones visibles de sorting.
*
* La UI debe consumir esto en lugar de definir sus propios valores.
*/
export interface MovieSortOption {
  value: MovieSort;
  label: string;
}

export const MOVIE_SORT_OPTIONS: readonly MovieSortOption[] = [
  { value: 'latest', label: 'Recientes' },
  { value: 'oldest', label: 'Antiguas' },
  { value: 'title', label: 'A - Z' },
  { value: 'title-desc', label: 'Z - A' },
  { value: 'rating', label: 'Mejor Puntuadas' },
  { value: 'rating-asc', label: 'Peor Puntuadas' },
];
EOF_FILTER_SORT_OPTIONS

cat > features/filters/config/options.ts <<'EOF_FILTER_OPTIONS'
// features/filters/config/options.ts
import {
  MOVIE_YEAR_MIN,
  getMovieYearMax,
  type MovieSort,
} from '@/entities/movie';
import { MOVIE_SORT_OPTIONS } from './sortOptions';

export const YEAR_MIN = MOVIE_YEAR_MIN;
export const YEAR_MAX = getMovieYearMax();

export const RATING_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: '5', label: '5.0+' },
  { value: '6', label: '6.0+' },
  { value: '7', label: '7.0+' },
  { value: '8', label: '8.0+' },
  { value: '9', label: '9.0+' },
] as const;

/**
* Las opciones de sorting pertenecen a la UI de filters.
*/
export const SORT_OPTIONS = MOVIE_SORT_OPTIONS;

export type RatingOptionValue =
  (typeof RATING_OPTIONS)[number]['value'];

export type SortOptionValue = MovieSort;
EOF_FILTER_OPTIONS

# ─────────────────────────────────────────────────────────────
# 4. Barrel limpio de entities/movie
# ─────────────────────────────────────────────────────────────

cat > entities/movie/index.ts <<'EOF_ENTITY_MOVIE_INDEX'
export type { Movie, Server } from './types/movie';

export { getMovieKey, dedupeMovies } from './lib/movieKey';

export type {
  MovieFilters,
  MovieFiltersQuery,
  MovieSort,
} from './types/filters';

export {
  MOVIE_SORT_VALUES,
  DEFAULT_MOVIE_SORT,
  isMovieSort,
} from './config/sort';

export {
  MOVIE_YEAR_MIN,
  getMovieYearMax,
  clampMovieYear,
} from './lib/year';
EOF_ENTITY_MOVIE_INDEX

# ─────────────────────────────────────────────────────────────
# 5. lib/url/movieFilters.ts sin estado de UI
# ─────────────────────────────────────────────────────────────

cat > lib/url/movieFilters.ts <<'EOF_LIB_URL_MOVIE_FILTERS'
// lib/url/movieFilters.ts
import {
  DEFAULT_MOVIE_SORT,
  isMovieSort,
  clampMovieYear,
  type MovieFilters,
  type MovieFiltersQuery,
} from '@/entities/movie';
import { MOVIE_FILTER_PARAM_KEYS } from './movieFilterParams';

function parseStringArray(
  value: string | string[] | undefined
): string[] {
  if (!value) return [];

  const values = Array.isArray(value) ? value : [value];
  const flattened = values.flatMap((item) => item.split(','));
  const cleaned = flattened
    .map((item) => item.trim())
    .filter(Boolean);

  return Array.from(new Set(cleaned));
}

function parseNumber(
  value: string | string[] | undefined
): number | undefined {
  const first = Array.isArray(value) ? value[0] : value;

  if (first === undefined || first === null || first === '') {
    return undefined;
  }

  const parsed = Number(first);
  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
* Parsea filtros de dominio desde URLSearchParams.
*
* Responsabilidad:
* - convertir query params crudos a MovieFilters tipado
* - sanear valores inválidos
*/
export function parseMovieFiltersFromSearchParams(
  searchParams: URLSearchParams
): MovieFilters {
  const genres = parseStringArray(
    searchParams.getAll(MOVIE_FILTER_PARAM_KEYS.genres)
  );

  const minRatingRaw = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.minRating) ?? undefined
  );

  const minRating =
    minRatingRaw === undefined
      ? undefined
      : Math.min(Math.max(minRatingRaw, 0), 10);

  let fromYear = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.fromYear) ?? undefined
  );

  let toYear = parseNumber(
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.toYear) ?? undefined
  );

  if (fromYear !== undefined) {
    fromYear = clampMovieYear(fromYear);
  }

  if (toYear !== undefined) {
    toYear = clampMovieYear(toYear);
  }

  if (
    fromYear !== undefined &&
    toYear !== undefined &&
    fromYear > toYear
  ) {
    [fromYear, toYear] = [toYear, fromYear];
  }

  const countryRaw =
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.country) ?? undefined;

  const country = countryRaw?.trim() || undefined;

  const sortParam =
    searchParams.get(MOVIE_FILTER_PARAM_KEYS.sort) ?? undefined;

  const sort = isMovieSort(sortParam) ? sortParam : undefined;

  return {
    genres: genres.length ? genres : undefined,
    minRating,
    fromYear,
    toYear,
    country,
    sort,
  };
}

/**
* Parsea filtros desde el objeto searchParams de Next.js.
*
* Este parser existe porque en server components recibimos
* un objeto plano, no una instancia de URLSearchParams.
*/
export function parseMovieFiltersFromRecord(
  record: MovieFiltersQuery
): MovieFilters {
  const params = new URLSearchParams();

  Object.entries(record).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((item) => {
        if (item) params.append(key, item);
      });
    } else {
      params.set(key, value);
    }
  });

  return parseMovieFiltersFromSearchParams(params);
}

/**
* Serializa filtros de dominio a query params.
*
* Responsabilidad:
* - convertir MovieFilters tipado a URLSearchParams
*/
export function serializeMovieFiltersToSearchParams(
  filters: MovieFilters
): URLSearchParams {
  const params = new URLSearchParams();

  (filters.genres ?? []).forEach((genre) => {
    params.append(MOVIE_FILTER_PARAM_KEYS.genres, genre);
  });

  if (
    typeof filters.minRating === 'number' &&
    Number.isFinite(filters.minRating)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.minRating,
      String(filters.minRating)
    );
  }

  if (
    typeof filters.fromYear === 'number' &&
    Number.isFinite(filters.fromYear)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.fromYear,
      String(filters.fromYear)
    );
  }

  if (
    typeof filters.toYear === 'number' &&
    Number.isFinite(filters.toYear)
  ) {
    params.set(
      MOVIE_FILTER_PARAM_KEYS.toYear,
      String(filters.toYear)
    );
  }

  if (filters.country) {
    params.set(MOVIE_FILTER_PARAM_KEYS.country, filters.country);
  }

  if (filters.sort && filters.sort !== DEFAULT_MOVIE_SORT) {
    params.set(MOVIE_FILTER_PARAM_KEYS.sort, filters.sort);
  }

  return params;
}
EOF_LIB_URL_MOVIE_FILTERS

# ─────────────────────────────────────────────────────────────
# 6. Estado de UI de filtros dentro de feature filters
# ─────────────────────────────────────────────────────────────

cat > features/filters/lib/parseFiltersForUI.ts <<'EOF_PARSE_FILTERS_FOR_UI'
import {
  DEFAULT_MOVIE_SORT,
  type MovieSort,
} from '@/entities/movie';
import { parseMovieFiltersFromSearchParams } from '@/lib/url/movieFilters';
import { MOVIE_FILTER_PARAM_KEYS } from '@/lib/url/movieFilterParams';

/**
* Estado de filtros listo para ser consumido por la UI.
*/
export interface MovieFiltersUIState {
  activeGenres: string[];
  minRating: string | null;
  country: string | null;
  sort: MovieSort;
  fromYear: number | null;
  toYear: number | null;
  hasYearFilter: boolean;
  filterCount: number;
}

/**
* Parsea la URL y devuelve un estado listo para la UI.
*
* Esto elimina la duplicación que existía en useMovieFilters,
* donde se volvían a leer manualmente los mismos query params.
*/
export function parseMovieFiltersForUI(
  searchParams: URLSearchParams
): MovieFiltersUIState {
  const domainFilters = parseMovieFiltersFromSearchParams(searchParams);

  const activeGenres = domainFilters.genres ?? [];

  const minRating =
    domainFilters.minRating !== undefined
      ? String(domainFilters.minRating)
      : null;

  const country = domainFilters.country ?? null;
  const sort = domainFilters.sort ?? DEFAULT_MOVIE_SORT;
  const fromYear = domainFilters.fromYear ?? null;
  const toYear = domainFilters.toYear ?? null;

  const hasYearFilter =
    searchParams.has(MOVIE_FILTER_PARAM_KEYS.fromYear) ||
    searchParams.has(MOVIE_FILTER_PARAM_KEYS.toYear);

  const filterCount =
    activeGenres.length +
    (minRating ? 1 : 0) +
    (hasYearFilter ? 1 : 0) +
    (country ? 1 : 0);

  return {
    activeGenres,
    minRating,
    country,
    sort,
    fromYear,
    toYear,
    hasYearFilter,
    filterCount,
  };
}
EOF_PARSE_FILTERS_FOR_UI

# ─────────────────────────────────────────────────────────────
# 7. Schemas Zod compartidos para payload del catálogo
# ─────────────────────────────────────────────────────────────

cat > lib/validation/moviePayloadSchemas.ts <<'EOF_MOVIE_PAYLOAD_SCHEMAS'
import { z } from 'zod';

export const ServerPayloadSchema = z.object({
  id: z.union([z.number(), z.string()]),
  name: z.string(),
  url: z.string(),
  language: z.string().optional(),
  quality: z.string().optional(),
  subtitles: z.boolean().optional(),
});

export const CategoryPayloadSchema = z.object({
  id: z.number(),
  name: z.string(),
  slug: z.string(),
});

export const PersonPayloadSchema = z.object({
  id: z.number(),
  documentId: z.string(),
  name: z.string(),
  slug: z.string(),
  profile_image_url: z.string().optional(),
});

export const MoviePayloadSchema = z.object({
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
  servers: z.array(ServerPayloadSchema).optional(),
  categories: z.array(CategoryPayloadSchema).optional(),
  actors: z.array(PersonPayloadSchema).optional(),
  directors: z.array(PersonPayloadSchema).optional(),
});

export const PaginatedMoviesSchema = z.object({
  data: z.array(MoviePayloadSchema),
  hasMore: z.boolean(),
  page: z.number(),
  pageSize: z.number(),
});
EOF_MOVIE_PAYLOAD_SCHEMAS

# ─────────────────────────────────────────────────────────────
# 8. Catálogo client sin schemas duplicados
# ─────────────────────────────────────────────────────────────

cat > features/catalog/infrastructure/moviesClient.ts <<'EOF_CATALOG_MOVIES_CLIENT'
import type { Movie, MovieFilters } from '@/entities/movie';
import type { PaginatedResult } from '@/lib/api/pagination/types';
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import { serializeMovieFiltersToSearchParams } from '@/lib/url/movieFilters';
import { MOVIE_PAGINATION_PARAM_KEYS } from '@/lib/url/movieFilterParams';
import { PaginatedMoviesSchema } from '@/lib/validation/moviePayloadSchemas';
import { logger } from '@/lib/utils/logger';

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
EOF_CATALOG_MOVIES_CLIENT

# ─────────────────────────────────────────────────────────────
# 9. Repositorio de búsqueda en lib/api/repositories
# ─────────────────────────────────────────────────────────────

cat > lib/api/repositories/movieSearch.ts <<'EOF_MOVIE_SEARCH_REPOSITORY'
import type { Movie } from '@/entities/movie';
import type { StrapiListResponse } from '@/lib/api/strapi/types';
import { fetchApi } from '@/lib/api/http/client';
import { normalizeMovieList } from '@/lib/api/strapi/normalizers';
import {
  buildPopulateParams,
  MOVIE_DETAIL_POPULATE,
} from '@/lib/api/strapi/populate';

const SEARCH_POPULATE = buildPopulateParams(MOVIE_DETAIL_POPULATE);

export interface MovieSearchRepository {
  byTitle(query: string, limit: number): Promise<Movie[]>;
  byActor(query: string, limit: number): Promise<Movie[]>;
  byDirector(query: string, limit: number): Promise<Movie[]>;
  byCategory(query: string, limit: number): Promise<Movie[]>;
}

async function runMovieSearch(
  params: Record<string, string>,
  limit: number
): Promise<Movie[]> {
  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/movies',
    {
      ...SEARCH_POPULATE,
      'pagination[page]': '1',
      'pagination[pageSize]': String(limit),
      ...params,
    },
    {
      cache: 'no-store',
    }
  );

  return normalizeMovieList(json);
}

export const movieSearchRepository: MovieSearchRepository = {
  async byTitle(query: string, limit: number): Promise<Movie[]> {
    let json = await fetchApi<StrapiListResponse<unknown>>(
      '/movies',
      {
        ...SEARCH_POPULATE,
        'pagination[page]': '1',
        'pagination[pageSize]': String(limit),
        'filters[$or][0][title][$containsi]': query,
        'filters[$or][1][english_title][$containsi]': query,
        'filters[$or][2][spanish_title][$containsi]': query,
      },
      {
        cache: 'no-store',
      }
    );

    if (json !== null) {
      return normalizeMovieList(json);
    }

    json = await fetchApi<StrapiListResponse<unknown>>(
      '/movies',
      {
        ...SEARCH_POPULATE,
        'pagination[page]': '1',
        'pagination[pageSize]': String(limit),
        'filters[title][$containsi]': query,
      },
      {
        cache: 'no-store',
      }
    );

    return normalizeMovieList(json);
  },

  async byActor(query: string, limit: number): Promise<Movie[]> {
    return runMovieSearch(
      {
        'filters[actors][name][$containsi]': query,
      },
      limit
    );
  },

  async byDirector(query: string, limit: number): Promise<Movie[]> {
    return runMovieSearch(
      {
        'filters[directors][name][$containsi]': query,
      },
      limit
    );
  },

  async byCategory(query: string, limit: number): Promise<Movie[]> {
    return runMovieSearch(
      {
        'filters[categories][name][$containsi]': query,
      },
      limit
    );
  },
};
EOF_MOVIE_SEARCH_REPOSITORY

# ─────────────────────────────────────────────────────────────
# 10. Queries de búsqueda en lib/queries
# ─────────────────────────────────────────────────────────────

cat > lib/queries/search.ts <<'EOF_SEARCH_QUERIES'
import { cache } from 'react';
import {
  movieSearchRepository,
  type MovieSearchRepository,
} from '@/lib/api/repositories/movieSearch';

const byTitle = cache(async (query: string, limit: number) =>
  movieSearchRepository.byTitle(query, limit)
);

const byActor = cache(async (query: string, limit: number) =>
  movieSearchRepository.byActor(query, limit)
);

const byDirector = cache(async (query: string, limit: number) =>
  movieSearchRepository.byDirector(query, limit)
);

const byCategory = cache(async (query: string, limit: number) =>
  movieSearchRepository.byCategory(query, limit)
);

export const movieSearchQueries: MovieSearchRepository = {
  byTitle,
  byActor,
  byDirector,
  byCategory,
};

export type { MovieSearchRepository };
EOF_SEARCH_QUERIES

# ─────────────────────────────────────────────────────────────
# 11. Reemplazos quirúrgicos con Node
# ─────────────────────────────────────────────────────────────

node <<'EOF_NODE'
const fs = require('fs');

function replaceInFile(file, from, to, options = {}) {
  const { all = false, required = true } = options;

  if (!fs.existsSync(file)) {
    if (required) {
      throw new Error(`Archivo no encontrado: ${file}`);
    }
    return;
  }

  let content = fs.readFileSync(file, 'utf8');

  if (content.includes(from)) {
    content = all
      ? content.split(from).join(to)
      : content.replace(from, to);

    fs.writeFileSync(file, content);
    return;
  }

  if (!content.includes(to)) {
    throw new Error(
      `No se encontró el patrón esperado en ${file}: ${from
        .split('\n')[0]
        .slice(0, 80)}...`
    );
  }
}

// MovieCard ahora usa view model local
replaceInFile(
  'widgets/movie-card/MovieCard.tsx',
  `import { createMovieCardViewModel } from '@/entities/movie';`,
  `import { createMovieCardViewModel } from './lib/createMovieCardViewModel';`
);

// BFF route usa params de URL desde lib/url
replaceInFile(
  'app/api/movies/route.ts',
  `@/entities/movie/config/filterParams`,
  `@/lib/url/movieFilterParams`,
  { all: true }
);

// Normalizers ya no usan types deprecated
replaceInFile(
  'lib/api/strapi/normalizers.ts',
  `import type {
  Actor,
  Category,
  Director,
  Movie,
  Server,
} from '@/types';`,
  `import type { Movie, Server } from '@/entities/movie';
import type { Category } from '@/entities/category';
import type { Actor, Director } from '@/entities/person';`
);

// Movie detail view model ya no usa types deprecated
replaceInFile(
  'features/movie-detail/lib/createMovieDetailViewModel.ts',
  `import type {
  Actor,
  Category,
  Director,
  Movie,
  Server,
} from '@/types';`,
  `import type { Movie, Server } from '@/entities/movie';
import type { Category } from '@/entities/category';
import type { Actor, Director } from '@/entities/person';`
);

// useMovieFilters separa dominio y params de URL
replaceInFile(
  'features/filters/model/useMovieFilters.ts',
  `import {
  DEFAULT_MOVIE_SORT,
  MOVIE_FILTER_PARAM_KEYS,
  type MovieFilterParamKey,
  type MovieSort,
} from '@/entities/movie';`,
  `import {
  DEFAULT_MOVIE_SORT,
  type MovieSort,
} from '@/entities/movie';
import {
  MOVIE_FILTER_PARAM_KEYS,
  type MovieFilterParamKey,
} from '@/lib/url/movieFilterParams';`
);

replaceInFile(
  'features/filters/model/useMovieFilters.ts',
  `import { parseMovieFiltersForUI } from '@/lib/url/movieFilters';`,
  `import { parseMovieFiltersForUI } from '../lib/parseFiltersForUI';`
);

// Search usa repositorio/queries en vez de infraestructura local
replaceInFile(
  'features/search/application/searchMovies.ts',
  `import {
  strapiMovieSearchRepository,
  type MovieSearchRepository,
} from '../infrastructure/strapiMovieSearchRepository';`,
  `import {
  movieSearchQueries,
  type MovieSearchRepository,
} from '@/lib/queries/search';`
);

replaceInFile(
  'features/search/application/searchMovies.ts',
  `repository: MovieSearchRepository = strapiMovieSearchRepository`,
  `repository: MovieSearchRepository = movieSearchQueries`
);

console.log('✅ Reemplazos de imports aplicados correctamente.');
EOF_NODE

# ─────────────────────────────────────────────────────────────
# 12. Eliminar archivos obsoletos
# ─────────────────────────────────────────────────────────────

rm -f entities/movie/lib/createMovieCardViewModel.ts
rm -f entities/movie/config/filterParams.ts
rm -f types/index.ts
rm -f features/search/infrastructure/strapiMovieSearchRepository.ts

rmdir types 2>/dev/null || true
rmdir features/search/infrastructure 2>/dev/null || true

# ─────────────────────────────────────────────────────────────
# 13. Validaciones rápidas
# ─────────────────────────────────────────────────────────────

if grep -R "from '@/types'" \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  .; then
  echo ""
  echo "❌ Todavía quedan imports de @/types." >&2
  exit 1
fi

if grep -R "@/entities/movie/config/filterParams" \
  --include='*.ts' \
  --include='*.tsx' \
  --exclude-dir=node_modules \
  --exclude-dir=.next \
  .; then
  echo ""
  echo "❌ Todavía quedan imports viejos de filterParams." >&2
  exit 1
fi

echo ""
echo "✅ Refactorización completada."
echo ""
echo "Siguientes pasos recomendados:"
echo "  1. npm install"
echo "  2. npm run lint"
echo "  3. npx tsc --noEmit"
echo ""
echo "Si todo pasa, haz commit de los cambios."