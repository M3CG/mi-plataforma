// lib/api/tmdb/index.ts
export * from './config';
export * from './types';
export * from './client';
export * from './normalizers';
export * from './slugCandidates';

import { tmdbGetMovie, tmdbGetPerson, tmdbGetPersonMovieCredits } from './client';
import {
  normalizeMovieDetail,
  normalizePersonDetail,
} from './normalizers';
import type {
  TmdbMoviePreview,
  TmdbPersonPreview,
  TmdbPersonMovieCredits,
} from './types';

export async function getMoviePreview(
  tmdbId: number
): Promise<TmdbMoviePreview | null> {
  const detail = await tmdbGetMovie(tmdbId);
  if (!detail) return null;
  return normalizeMovieDetail(detail);
}

export async function getPersonPreview(
  personId: number
): Promise<TmdbPersonPreview | null> {
  const detail = await tmdbGetPerson(personId);
  if (!detail) return null;
  return normalizePersonDetail(detail);
}

export async function getPersonFilmography(
  personId: number
): Promise<TmdbPersonMovieCredits | null> {
  return tmdbGetPersonMovieCredits(personId);
}
