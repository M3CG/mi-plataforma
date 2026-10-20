// lib/api/tmdb/discover.ts
import { DEFAULT_PAGE_SIZE } from '@/lib/api/pagination/config';
import {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  TMDB_FETCH_TIMEOUT_MS,
  isTmdbConfigured,
  tmdbImageUrl,
} from './config';

const TMDB_NATIVE_PAGE_SIZE = 20;
const TMDB_MAX_PAGE = 500;

export const ADMIN_IMPORT_DEFAULT_SORT = 'oldest';
export const CATALOG_DEFAULT_SORT = 'views';

const CATALOG_MIN_VOTE_COUNT = 200;
const CATALOG_MIN_RATING = 6.0;
const ADMIN_MIN_VOTE_COUNT = 10;

export type DiscoverMode = 'catalog' | 'admin';

const GENRE_SLUG_TO_TMDB_ID: Record<string, number> = {
  action: 28,
  adventure: 12,
  animation: 16,
  comedy: 35,
  crime: 80,
  documentary: 99,
  drama: 18,
  family: 10751,
  fantasy: 14,
  history: 36,
  horror: 27,
  music: 10402,
  mystery: 9648,
  romance: 10749,
  'science-fiction': 878,
  'tv-movie': 10770,
  thriller: 53,
  war: 10752,
  western: 37,
};

const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  'United States of America': 'US',
  'United States': 'US',
  Mexico: 'MX',
  Argentina: 'AR',
  Spain: 'ES',
  France: 'FR',
  'United Kingdom': 'GB',
  Germany: 'DE',
  Italy: 'IT',
  Japan: 'JP',
  'South Korea': 'KR',
  China: 'CN',
  India: 'IN',
  Canada: 'CA',
  Brazil: 'BR',
  Australia: 'AU',
  Russia: 'RU',
  Netherlands: 'NL',
  Sweden: 'SE',
  Norway: 'NO',
  Denmark: 'DK',
  Belgium: 'BE',
  Ireland: 'IE',
  'New Zealand': 'NZ',
  Poland: 'PL',
  'Czech Republic': 'CZ',
  Hungary: 'HU',
  Colombia: 'CO',
  Chile: 'CL',
  Peru: 'PE',
  Venezuela: 'VE',
  Uruguay: 'UY',
  Cuba: 'CU',
};

const SORT_TO_TMDB: Record<string, string> = {
  latest: 'primary_release_date.desc',
  oldest: 'primary_release_date.asc',
  title: 'original_title.asc',
  'title-desc': 'original_title.desc',
  rating: 'vote_average.desc',
  'rating-asc': 'vote_average.asc',
  views: 'popularity.desc',
};

export interface DiscoverResult {
  results: Array<Record<string, unknown>>;
  hasMore: boolean;
  page: number;
  totalPages: number;
}

interface TmdbDiscoverRawResponse {
  results?: Array<Record<string, unknown>>;
  total_pages?: number;
  total_results?: number;
}

async function fetchSingleTmdbDiscoverPage(
  baseUrl: URL,
  tmdbPage: number
): Promise<TmdbDiscoverRawResponse | null> {
  const pageUrl = new URL(baseUrl.toString());
  pageUrl.searchParams.set('page', String(tmdbPage));

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TMDB_FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(pageUrl.toString(), {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    return (await res.json()) as TmdbDiscoverRawResponse;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}

export async function discoverMovies(
  searchParams: URLSearchParams,
  requestedPage: number,
  mode: DiscoverMode = 'catalog',
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<DiscoverResult> {
  const safePage = Math.max(1, Math.floor(Number(requestedPage) || 1));
  const safePageSize = Math.max(
    1,
    Math.min(Math.floor(Number(pageSize) || DEFAULT_PAGE_SIZE), 100)
  );

  const empty: DiscoverResult = {
    results: [],
    hasMore: false,
    page: safePage,
    totalPages: 0,
  };

  if (!isTmdbConfigured()) return empty;

  const startIndex = (safePage - 1) * safePageSize;
  const endIndex = startIndex + safePageSize;

  const firstTmdbPage = Math.floor(startIndex / TMDB_NATIVE_PAGE_SIZE) + 1;
  const lastTmdbPage = Math.min(
    Math.floor((endIndex - 1) / TMDB_NATIVE_PAGE_SIZE) + 1,
    TMDB_MAX_PAGE
  );

  if (firstTmdbPage > TMDB_MAX_PAGE) {
    return empty;
  }

  const baseUrl = new URL(`${TMDB_BASE_URL}/discover/movie`);
  baseUrl.searchParams.set('api_key', TMDB_API_KEY);
  baseUrl.searchParams.set('language', 'en-US');
  baseUrl.searchParams.set('include_adult', 'false');

  if (mode === 'catalog') {
    baseUrl.searchParams.set('vote_count.gte', String(CATALOG_MIN_VOTE_COUNT));

    const userMinRating = searchParams.get('minRating');
    if (!userMinRating) {
      baseUrl.searchParams.set('vote_average.gte', String(CATALOG_MIN_RATING));
    }
  } else {
    baseUrl.searchParams.set('vote_count.gte', String(ADMIN_MIN_VOTE_COUNT));
  }

  const genres = searchParams.getAll('genres');
  const genreIds = genres
    .map((slug) => GENRE_SLUG_TO_TMDB_ID[slug])
    .filter((id): id is number => typeof id === 'number');

  if (genreIds.length > 0) {
    baseUrl.searchParams.set('with_genres', genreIds.join('|'));
  }

  const minRating = searchParams.get('minRating');
  if (minRating) {
    baseUrl.searchParams.set('vote_average.gte', minRating);
  }

  const fromYear = searchParams.get('fromYear');
  const toYear = searchParams.get('toYear');

  if (fromYear) {
    baseUrl.searchParams.set('primary_release_date.gte', `${fromYear}-01-01`);
  }
  if (toYear) {
    baseUrl.searchParams.set('primary_release_date.lte', `${toYear}-12-31`);
  }

  const fromRuntime = searchParams.get('fromRuntime');
  const toRuntime = searchParams.get('toRuntime');

  if (fromRuntime) {
    baseUrl.searchParams.set('with_runtime.gte', fromRuntime);
  }
  if (toRuntime) {
    baseUrl.searchParams.set('with_runtime.lte', toRuntime);
  }

  const country = searchParams.get('country');
  if (country) {
    const iso = COUNTRY_NAME_TO_ISO[country];
    if (iso) {
      baseUrl.searchParams.set('with_origin_country', iso);
    }
  }

  const defaultSort =
    mode === 'catalog' ? CATALOG_DEFAULT_SORT : ADMIN_IMPORT_DEFAULT_SORT;

  const sort = searchParams.get('sort') || defaultSort;
  baseUrl.searchParams.set(
    'sort_by',
    SORT_TO_TMDB[sort] ?? SORT_TO_TMDB[defaultSort]
  );

  const pagesToFetch: number[] = [];
  for (let p = firstTmdbPage; p <= lastTmdbPage; p += 1) {
    pagesToFetch.push(p);
  }

  const responses = await Promise.all(
    pagesToFetch.map((p) => fetchSingleTmdbDiscoverPage(baseUrl, p))
  );

  const firstResponse = responses[0];
  if (!firstResponse) return empty;

  const tmdbTotalPages = Math.min(
    Number(firstResponse.total_pages) || 0,
    TMDB_MAX_PAGE
  );
  const tmdbTotalResults = Math.min(
    Number(firstResponse.total_results) || 0,
    tmdbTotalPages * TMDB_NATIVE_PAGE_SIZE
  );

  const combinedRaw: Array<Record<string, unknown>> = [];
  responses.forEach((res, idx) => {
    const pageNumber = pagesToFetch[idx];
    if (res?.results && pageNumber <= tmdbTotalPages) {
      combinedRaw.push(...res.results);
    }
  });

  const offsetInFirstPage =
    startIndex - (firstTmdbPage - 1) * TMDB_NATIVE_PAGE_SIZE;
  const slicedRaw = combinedRaw.slice(
    offsetInFirstPage,
    offsetInFirstPage + safePageSize
  );

  const seenIds = new Set<number>();
  const results = slicedRaw
    .filter((movie) => {
      const id = Number(movie.id);
      if (!Number.isFinite(id) || seenIds.has(id)) return false;
      seenIds.add(id);
      return true;
    })
    .map((movie) => ({
      tmdbId: movie.id,
      title: movie.title,
      originalTitle: movie.original_title,
      year: movie.release_date
        ? new Date(String(movie.release_date)).getFullYear()
        : undefined,
      posterUrl: tmdbImageUrl(movie.poster_path as string | null, 'w500'),
      backdropUrl: tmdbImageUrl(movie.backdrop_path as string | null, 'w780'),
      rating: movie.vote_average,
      overview: movie.overview,
      originalLanguage: movie.original_language,
      genreIds: movie.genre_ids ?? [],
    }));

  const totalPages = Math.ceil(tmdbTotalResults / safePageSize);
  const hasMore = safePage < totalPages && results.length > 0;

  return {
    results,
    hasMore,
    page: safePage,
    totalPages,
  };
}
