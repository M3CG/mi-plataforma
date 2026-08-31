// lib/api/tmdb/normalizers.ts
import { tmdbImageUrl } from './config';
import type {
  PosterOption,
  TmdbMovieDetail,
  TmdbMoviePreview,
  TmdbPersonDetail,
  TmdbPersonPreview,
  TmdbSearchMovieItem,
  TmdbSearchPersonItem,
  TmdbTranslation,
} from './types';

// Español latinoamericano preferido; nunca España salvo original español de España.
const LATIN_SPANISH_COUNTRIES = [
  'MX', 'AR', 'CO', 'CL', 'PE', 'VE', 'UY', 'EC', 'BO', 'PY',
  'CR', 'GT', 'HN', 'PA', 'DO', 'SV', 'NI', 'CU', 'PR', 'US',
];

const VALID_AGE_RATINGS = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

function emptyToNull(value?: string | null): string | undefined {
  return value && value.trim() !== '' ? value : undefined;
}

function translationHasContent(translation: TmdbTranslation): boolean {
  const data = translation.data;
  if (!data) return false;
  return Boolean(
    (data.title ?? '') !== '' || (data.overview ?? '') !== ''
  );
}

function resolveSpanish(detail: TmdbMovieDetail): {
  title?: string;
  overview?: string;
} {
  const translations = detail.translations?.translations ?? [];
  const esTranslations = translations.filter(
    (t) => t.iso_639_1 === 'es'
  );
  const countryCodes = (detail.production_countries ?? []).map(
    (c) => c.iso_3166_1
  );
  const isSpanishOriginal = detail.original_language === 'es';
  const isSpainOriginal =
    isSpanishOriginal && countryCodes.includes('ES');

  if (isSpainOriginal) {
    const esEs = esTranslations.find(
      (t) => t.iso_3166_1 === 'ES' && translationHasContent(t)
    );
    if (esEs) {
      return {
        title: emptyToNull(esEs.data?.title) ?? detail.original_title,
        overview: emptyToNull(esEs.data?.overview),
      };
    }
    return {
      title: detail.original_title,
      overview: emptyToNull(detail.overview),
    };
  }

  for (const countryCode of LATIN_SPANISH_COUNTRIES) {
    const match = esTranslations.find(
      (t) => t.iso_3166_1 === countryCode && translationHasContent(t)
    );
    if (match) {
      return {
        title: emptyToNull(match.data?.title),
        overview: emptyToNull(match.data?.overview),
      };
    }
  }

  if (isSpanishOriginal) {
    return {
      title: detail.original_title,
      overview: emptyToNull(detail.overview),
    };
  }

  return {};
}

function resolveOriginal(detail: TmdbMovieDetail): {
  overview?: string;
} {
  const originalLanguage = detail.original_language;
  const translations = detail.translations?.translations ?? [];

  // Buscar la traducción en el idioma original
  if (originalLanguage) {
    const originalTranslation = translations.find(
      (t) => t.iso_639_1 === originalLanguage && translationHasContent(t)
    );
    if (originalTranslation?.data?.overview) {
      return { overview: emptyToNull(originalTranslation.data.overview) };
    }
  }

  // Si el idioma original es inglés, el overview del response ya es el original
  if (originalLanguage === 'en') {
    return { overview: emptyToNull(detail.overview) };
  }

  // Fallback: usar el overview del response (será inglés)
  return { overview: emptyToNull(detail.overview) };
}

function mapCertification(certification?: string): string | undefined {
  if (!certification) return undefined;
  const normalized = certification.toUpperCase().trim();
  if (VALID_AGE_RATINGS.includes(normalized)) return normalized;
  const equivalences: Record<string, string> = {
    PG13: 'PG-13',
    'PG 13': 'PG-13',
    X: 'NC-17',
    NC17: 'NC-17',
  };
  return equivalences[normalized];
}

function resolveAgeRating(detail: TmdbMovieDetail): string {
  const results = detail.release_dates?.results ?? [];
  const usRelease = results.find((r) => r.iso_3166_1 === 'US');
  if (usRelease) {
    const certification = (usRelease.release_dates ?? [])
      .map((rd) => rd.certification)
      .find(Boolean);
    const mapped = mapCertification(certification);
    if (mapped) return mapped;
  }
  return detail.adult ? 'R' : 'PG-13';
}

function resolveTrailerUrl(detail: TmdbMovieDetail): string | undefined {
  const videos = detail.videos?.results ?? [];
  const trailers = videos.filter(
    (v) => v.type === 'Trailer' && v.site === 'YouTube'
  );

  if (trailers.length === 0) return undefined;

  // 1. Preferir tráiler sin idioma (internacional/original)
  const international = trailers.find((v) => !v.iso_639_1);
  if (international) {
    return `https://www.youtube.com/embed/${international.key}`;
  }

  // 2. Preferir tráiler en español (cualquier variante)
  // Nota: TMDB no distingue es-MX de es-ES en videos,
  // pero los tráilers latinos suelen ser más comunes
  const spanish = trailers.find((v) => v.iso_639_1 === 'es');
  if (spanish) {
    return `https://www.youtube.com/embed/${spanish.key}`;
  }

  // 3. Fallback: primer tráiler disponible
  return `https://www.youtube.com/embed/${trailers[0].key}`;
}

function normalizePosters(detail: TmdbMovieDetail): {
  posters: PosterOption[];
  defaultPosterUrl?: string;
} {
  const rawPosters = detail.images?.posters ?? [];
  const sortable = rawPosters
    .map((img) => ({
      filePath: img.file_path,
      iso: img.iso_639_1,
      vote: img.vote_average ?? 0,
      width: img.width,
      height: img.height,
    }))
    .filter((p) => Boolean(p.filePath));

  // Pósters sin texto (iso null) primero, luego por puntuación.
  sortable.sort((a, b) => {
    const aTextless = !a.iso;
    const bTextless = !b.iso;
    if (aTextless !== bTextless) return aTextless ? -1 : 1;
    return b.vote - a.vote;
  });

  const posters: PosterOption[] = sortable
    .map((p) => ({
      url: tmdbImageUrl(p.filePath, 'w500') as string,
      textless: !p.iso,
      width: p.width,
      height: p.height,
    }))
    .filter((p) => Boolean(p.url));

  const defaultPosterUrl =
    posters[0]?.url ?? tmdbImageUrl(detail.poster_path, 'w500');

  return { posters, defaultPosterUrl };
}

export function normalizeSearchMovie(
  item: TmdbSearchMovieItem
): Record<string, unknown> {
  return {
    tmdbId: item.id,
    title: item.title,
    originalTitle: item.original_title,
    year: item.release_date
      ? new Date(item.release_date).getFullYear()
      : undefined,
    posterUrl: tmdbImageUrl(item.poster_path, 'w342'),
    rating: item.vote_average,
    overview: item.overview,
    originalLanguage: item.original_language,
  };
}

export function normalizeSearchPerson(
  item: TmdbSearchPersonItem
): Record<string, unknown> {
  return {
    tmdbId: item.id,
    name: item.name,
    knownForDepartment: item.known_for_department,
    profileUrl: tmdbImageUrl(item.profile_path, 'w185'),
    popularity: item.popularity,
  };
}

export function normalizeMovieDetail(
  detail: TmdbMovieDetail
): TmdbMoviePreview {
  const originalTitle = detail.original_title || detail.title || '';
  const englishTitle =
    originalTitle &&
      detail.title &&
      detail.title !== originalTitle
      ? detail.title
      : undefined;
  const englishSynopsis = emptyToNull(detail.overview);
  const spanish = resolveSpanish(detail);
  const original = resolveOriginal(detail);
  const mainSynopsis = original.overview ?? englishSynopsis ?? '';
  const year = detail.release_date
    ? new Date(detail.release_date).getFullYear()
    : 0;
  const { posters, defaultPosterUrl } = normalizePosters(detail);

  const genres = (detail.genres ?? []).map((g) => ({
    tmdbId: g.id,
    name: g.name,
  }));

  const cast = (detail.credits?.cast ?? []).slice(0, 10).map((c) => ({
    tmdbId: c.id,
    name: c.name,
    character: c.character,
    profileImageUrl: tmdbImageUrl(c.profile_path, 'w185'),
  }));

  const directors = (detail.credits?.crew ?? [])
    .filter((member) => member.job === 'Director')
    .map((member) => ({
      tmdbId: member.id,
      name: member.name,
      profileImageUrl: tmdbImageUrl(member.profile_path, 'w185'),
    }));

  const country = (detail.production_countries ?? [])[0]?.name;

  return {
    tmdbId: detail.id,
    imdbId: detail.imdb_id ?? undefined,
    originalTitle,
    englishTitle,
    spanishTitle: spanish.title,
    mainSynopsis,
    englishSynopsis,
    spanishSynopsis: spanish.overview,
    year,
    rating: detail.vote_average ?? 0,
    runtime: detail.runtime ?? undefined,
    country,
    originalLanguage: detail.original_language,
    ageRating: resolveAgeRating(detail),
    trailerUrl: resolveTrailerUrl(detail),
    genres,
    cast,
    directors,
    defaultPosterUrl,
    defaultBackdropUrl: tmdbImageUrl(detail.backdrop_path, 'original'),
    posters,
  };
}

export function normalizePersonDetail(
  detail: TmdbPersonDetail
): TmdbPersonPreview {
  const profiles = (detail.images?.profiles ?? [])
    .map((img) => ({
      url: tmdbImageUrl(img.file_path, 'w500') as string,
    }))
    .filter((p) => Boolean(p.url));
  const defaultProfileUrl =
    profiles[0]?.url ?? tmdbImageUrl(detail.profile_path, 'w500');
  return {
    tmdbId: detail.id,
    name: detail.name,
    knownForDepartment: detail.known_for_department,
    biography: detail.biography,
    defaultProfileUrl,
    profiles,
  };
}
