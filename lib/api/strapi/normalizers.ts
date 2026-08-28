// lib/api/strapi/normalizers.ts
import type { Movie, Server } from '@/entities/movie';
import type { Category } from '@/entities/category';
import type { Actor, Director } from '@/entities/person';

import {
  StrapiCategorySchema,
  StrapiMovieSchema,
  StrapiPersonSchema,
  StrapiServerSchema,
} from './schemas';

import type { StrapiListResponse } from './types';
import { API_URL } from '../http/config';
import { cleanApiUrl } from '../http/url';

import { slugify, chooseSlug } from '@/lib/utils/slugify';
import { logger } from '@/lib/utils/logger';

function toAbsoluteUrl(path?: string | null): string | undefined {
  if (!path) return undefined;

  if (/^https?:\/\//i.test(path)) return path;

  const base = cleanApiUrl(API_URL);

  return `${base}${path.startsWith('/') ? '' : '/'}${path}`;
}

function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

function unwrapStrapiItem(raw: unknown): unknown {
  if (!raw || typeof raw !== 'object') return raw;

  const obj = raw as Record<string, unknown>;

  if ('attributes' in obj && obj.attributes !== undefined) {
    return unwrapStrapiItem(obj.attributes);
  }

  if ('data' in obj && obj.data !== undefined && !Array.isArray(obj.data)) {
    return unwrapStrapiItem(obj.data);
  }

  return raw;
}

function extractRelationArray(value: unknown): unknown[] {
  if (!value) return [];

  if (Array.isArray(value)) return value;

  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>;

    if (Array.isArray(obj.data)) return obj.data;
  }

  return [];
}

function getMediaUrl(
  media: unknown,
  preferredFormat: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'
): string | undefined {
  const source = unwrapStrapiItem(media);

  if (!source) return undefined;

  if (typeof source === 'string') return toAbsoluteUrl(source);

  if (typeof source === 'object') {
    const obj = source as {
      url?: string | null;
      formats?: Record<string, { url?: string | null } | undefined>;
    };

    const formats = obj.formats || {};

    const candidates = [preferredFormat, 'large', 'medium', 'small', 'thumbnail']
      .map((formatKey) => formats[formatKey]?.url)
      .filter(Boolean);

    const selected = candidates[0] ?? obj.url;

    return toAbsoluteUrl(selected ?? undefined);
  }

  return undefined;
}

/**
 * Responsabilidad única: resolver el slug de una película
 * aplicando la prioridad de títulos.
 */
function resolveMovieSlug(movie: {
  slug?: string | null;
  title: string;
  english_title?: string | null;
  spanish_title?: string | null;
  id: number;
  tmdb_id?: number | null;
}): string {
  if (movie.slug) return movie.slug;

  const candidateSlug = chooseSlug([
    movie.title,
    movie.english_title,
    movie.spanish_title,
  ]);

  if (candidateSlug) {
    return `${candidateSlug}-${movie.id}`;
  }

  return `tmdb-${movie.tmdb_id ?? movie.id}`;
}

export function normalizeServer(raw: unknown): Server | null {
  const source = unwrapStrapiItem(raw);
  const parsed = StrapiServerSchema.safeParse(source);

  if (!parsed.success) return null;

  const server = parsed.data;

  if (!isValidHttpUrl(server.url)) return null;

  return {
    id: server.id,
    name: server.name,
    url: server.url,
    language: server.language ?? undefined,
    quality: server.quality ?? undefined,
    subtitles: Boolean(server.subtitles),
  };
}

export function normalizeCategory(raw: unknown): Category | null {
  const source = unwrapStrapiItem(raw);
  const parsed = StrapiCategorySchema.safeParse(source);

  if (!parsed.success) return null;

  const category = parsed.data;

  return {
    id: category.id,
    name: category.name,
    slug: category.slug || slugify(category.name),
  };
}

export function normalizeMovie(raw: unknown): Movie | null {
  const source = unwrapStrapiItem(raw);
  const parsed = StrapiMovieSchema.safeParse(source);

  if (!parsed.success) {
    logger.warn('Invalid movie payload skipped', {
      component: 'Normalizers',
      action: 'normalizeMovie',
      error: parsed.error,
    });

    return null;
  }

  const movie = parsed.data;

  const servers = extractRelationArray(movie.servers)
    .map(normalizeServer)
    .filter((item): item is Server => item !== null);

  const categories = extractRelationArray(movie.categories)
    .map(normalizeCategory)
    .filter((item): item is Category => item !== null);

  const actors = extractRelationArray(movie.actors)
    .map(normalizePerson)
    .filter((item): item is Actor => item !== null);

  const directors = extractRelationArray(movie.directors)
    .map(normalizePerson)
    .filter((item): item is Director => item !== null);

  const posterUrl =
    getMediaUrl(movie.poster, 'medium') ?? movie.poster_url ?? undefined;

  const backdropUrl =
    getMediaUrl(movie.backdrop ?? movie.poster, 'large') ??
    movie.backdrop_url ??
    undefined;

  const slug = resolveMovieSlug(movie);

  return {
    id: movie.id,
    documentId: movie.documentId ?? String(movie.id),
    title: movie.title,
    english_title: movie.english_title ?? undefined,
    spanish_title: movie.spanish_title ?? undefined,
    slug,
    synopsis: movie.synopsis ?? '',
    english_synopsis: movie.english_synopsis ?? undefined,
    spanish_synopsis: movie.spanish_synopsis ?? undefined,
    year: movie.year ?? 0,
    rating: movie.rating ?? 0,
    country: movie.country ?? '',
    tmdb_id: movie.tmdb_id ?? 0,
    views: movie.views ?? undefined,
    featured_this_week: movie.is_featured ?? undefined,
    poster_url: posterUrl,
    backdrop_url: backdropUrl,
    trailer_url: movie.trailer_url ?? undefined,
    runtime: movie.runtime ?? undefined,
    age_rating: movie.age_rating ?? undefined,
    original_language: movie.original_language ?? undefined,
    servers,
    categories,
    actors,
    directors,
  };
}

export function normalizeMovieList(
  json: StrapiListResponse<unknown> | null
): Movie[] {
  if (!json?.data || !Array.isArray(json.data)) return [];

  return json.data
    .map(normalizeMovie)
    .filter((movie): movie is Movie => movie !== null);
}

/**
 * Normaliza una persona.
 *
 * Reemplaza a normalizeActor.
 * Actor y Director son el mismo tipo de negocio.
 */
export function normalizePerson(raw: unknown): Actor | Director | null {
  const source = unwrapStrapiItem(raw);
  const parsed = StrapiPersonSchema.safeParse(source);

  if (!parsed.success) return null;

  const person = parsed.data;

  return {
    id: person.id,
    documentId: person.documentId ?? String(person.id),
    name: person.name,
    slug: person.slug || slugify(person.name),
    profile_image_url: getMediaUrl(
      person.profile_image ?? person.profile_image_url,
      'thumbnail'
    ),
  };
}