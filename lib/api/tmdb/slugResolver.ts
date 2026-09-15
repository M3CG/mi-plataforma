// lib/api/tmdb/slugResolver.ts
import { slugify } from '@/lib/utils/slugify';

/**
 * Genera el slug de URL para una película de TMDB.
 * Formato: {tmdbId}-{titulo-slugificado}
 * Ejemplo: 603-the-matrix
 */
export function generateTmdbSlug(
  tmdbId: number,
  title: string
): string {
  const slug = slugify(title);
  return slug ? `${tmdbId}-${slug}` : `${tmdbId}`;
}

/**
 * Extrae el tmdbId de un slug de URL.
 * "603-the-matrix" → 603
 * "the-matrix" → null (slug de Strapi, no de TMDB)
 */
export function extractTmdbIdFromSlug(slug: string): number | null {
  const match = slug.match(/^(\d+)(?:-|$)/);
  if (!match) return null;
  const id = parseInt(match[1], 10);
  return Number.isFinite(id) && id > 0 ? id : null;
}

/**
 * Determina si un slug es de TMDB (empieza con número).
 */
export function isTmdbSlug(slug: string): boolean {
  return /^\d+(-|$)/.test(slug);
}