// lib/api/tmdb/discover.ts
import {
  TMDB_API_KEY,
  TMDB_BASE_URL,
  TMDB_FETCH_TIMEOUT_MS,
  isTmdbConfigured,
  tmdbImageUrl,
} from './config';

/**
* Orden por defecto para la página de importación:
* de más antiguas a más nuevas.
*/
export const ADMIN_IMPORT_DEFAULT_SORT = 'oldest';

/**
* Mapeo de slug de género (generado por slugify del nombre en inglés)
* al ID de género de TMDB. Los IDs de TMDB son fijos y universales.
*/
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

/**
* Mapeo de nombre de país (como viene de TMDB production_countries)
* a código ISO 3166-1 alpha-2 (lo que espera with_origin_country).
*/
const COUNTRY_NAME_TO_ISO: Record<string, string> = {
  'United States of America': 'US',
  'United States': 'US',
  'Mexico': 'MX',
  'Argentina': 'AR',
  'Spain': 'ES',
  'France': 'FR',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'Italy': 'IT',
  'Japan': 'JP',
  'South Korea': 'KR',
  'China': 'CN',
  'India': 'IN',
  'Canada': 'CA',
  'Brazil': 'BR',
  'Australia': 'AU',
  'Russia': 'RU',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Denmark': 'DK',
  'Belgium': 'BE',
  'Ireland': 'IE',
  'New Zealand': 'NZ',
  'Poland': 'PL',
  'Czech Republic': 'CZ',
  'Hungary': 'HU',
  'Colombia': 'CO',
  'Chile': 'CL',
  'Peru': 'PE',
  'Venezuela': 'VE',
  'Uruguay': 'UY',
  'Cuba': 'CU',
};

/**
* Traducción de los presets de sorting del dominio
* a los valores de sort_by de TMDB Discover.
*/
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

/**
* Traduce los query params de filtros del catálogo a una llamada
* a TMDB Discover y devuelve resultados normalizados.
*/
export async function discoverMovies(
  searchParams: URLSearchParams,
  requestedPage: number
): Promise<DiscoverResult> {
  const empty: DiscoverResult = {
    results: [],
    hasMore: false,
    page: requestedPage,
    totalPages: 0,
  };
  if (!isTmdbConfigured()) return empty;

  const url = new URL(`${TMDB_BASE_URL}/discover/movie`);
  url.searchParams.set('api_key', TMDB_API_KEY);
  url.searchParams.set('language', 'en-US');
  url.searchParams.set('page', String(Math.max(1, requestedPage)));
  url.searchParams.set('include_adult', 'false');
  // Evitar películas sin votos suficientes (ratings poco confiables)
  url.searchParams.set('vote_count.gte', '10');

  // ─── Géneros ───
  const genres = searchParams.getAll('genres');
  const genreIds = genres
    .map((slug) => GENRE_SLUG_TO_TMDB_ID[slug])
    .filter((id): id is number => typeof id === 'number');
  if (genreIds.length > 0) {
    url.searchParams.set('with_genres', genreIds.join('|'));
  }

  // ─── Puntuación mínima ───
  const minRating = searchParams.get('minRating');
  if (minRating) {
    url.searchParams.set('vote_average.gte', minRating);
  }

  // ─── Rango de años ───
  const fromYear = searchParams.get('fromYear');
  const toYear = searchParams.get('toYear');
  if (fromYear) {
    url.searchParams.set('primary_release_date.gte', `${fromYear}-01-01`);
  }
  if (toYear) {
    url.searchParams.set('primary_release_date.lte', `${toYear}-12-31`);
  }

  // ─── Rango de duración ───
  const fromRuntime = searchParams.get('fromRuntime');
  const toRuntime = searchParams.get('toRuntime');
  if (fromRuntime) {
    url.searchParams.set('with_runtime.gte', fromRuntime);
  }
  if (toRuntime) {
    url.searchParams.set('with_runtime.lte', toRuntime);
  }

  // ─── País ───
  const country = searchParams.get('country');
  if (country) {
    const iso = COUNTRY_NAME_TO_ISO[country];
    if (iso) {
      url.searchParams.set('with_origin_country', iso);
    }
  }

  // ─── Ordenamiento (default: oldest) ───
  const sort = searchParams.get('sort') || ADMIN_IMPORT_DEFAULT_SORT;
  url.searchParams.set(
    'sort_by',
    SORT_TO_TMDB[sort] ?? SORT_TO_TMDB.oldest
  );

  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    TMDB_FETCH_TIMEOUT_MS
  );
  try {
    const res = await fetch(url.toString(), {
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return empty;
    const data = await res.json();
    const results = (data.results ?? []).map(
      (movie: Record<string, unknown>) => ({
        tmdbId: movie.id,
        title: movie.title,
        originalTitle: movie.original_title,
        year: movie.release_date
          ? new Date(String(movie.release_date)).getFullYear()
          : undefined,
        posterUrl: tmdbImageUrl(movie.poster_path as string | null, 'w342'),
        rating: movie.vote_average,
        overview: movie.overview,
        originalLanguage: movie.original_language,
      })
    );
    return {
      results,
      hasMore: requestedPage < (data.total_pages ?? 0),
      page: requestedPage,
      totalPages: data.total_pages ?? 0,
    };
  } catch {
    clearTimeout(timeout);
    return empty;
  }
}
