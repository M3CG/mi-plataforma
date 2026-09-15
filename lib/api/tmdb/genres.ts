// lib/api/tmdb/genres.ts
import type { Category } from '@/entities/category';

/**
 * Géneros de TMDB. Son fijos y universales.
 * Inverso de GENRE_SLUG_TO_TMDB_ID en discover.ts.
 */
const TMDB_GENRES: Array<{ id: number; name: string; slug: string }> = [
  { id: 28,    name: 'Action',          slug: 'action' },
  { id: 12,    name: 'Adventure',       slug: 'adventure' },
  { id: 16,    name: 'Animation',       slug: 'animation' },
  { id: 35,    name: 'Comedy',          slug: 'comedy' },
  { id: 80,    name: 'Crime',           slug: 'crime' },
  { id: 99,    name: 'Documentary',     slug: 'documentary' },
  { id: 18,    name: 'Drama',           slug: 'drama' },
  { id: 10751, name: 'Family',          slug: 'family' },
  { id: 14,    name: 'Fantasy',         slug: 'fantasy' },
  { id: 36,    name: 'History',         slug: 'history' },
  { id: 27,    name: 'Horror',          slug: 'horror' },
  { id: 10402, name: 'Music',           slug: 'music' },
  { id: 9648,  name: 'Mystery',         slug: 'mystery' },
  { id: 10749, name: 'Romance',         slug: 'romance' },
  { id: 878,   name: 'Science Fiction', slug: 'science-fiction' },
  { id: 10770, name: 'TV Movie',        slug: 'tv-movie' },
  { id: 53,    name: 'Thriller',        slug: 'thriller' },
  { id: 10752, name: 'War',             slug: 'war' },
  { id: 37,    name: 'Western',         slug: 'western' },
];

/**
 * Países disponibles para filtrar.
 * Mismo mapeo que COUNTRY_NAME_TO_ISO en discover.ts.
 */
const TMDB_COUNTRIES: string[] = [
  'United States of America',
  'Mexico',
  'Argentina',
  'Spain',
  'France',
  'United Kingdom',
  'Germany',
  'Italy',
  'Japan',
  'South Korea',
  'China',
  'India',
  'Canada',
  'Brazil',
  'Australia',
  'Russia',
  'Colombia',
  'Chile',
  'Peru',
];

export function getTmdbCategories(): Category[] {
  return TMDB_GENRES.map((g) => ({
    id: g.id,
    name: g.name,
    slug: g.slug,
  }));
}

export function getTmdbCountries(): string[] {
  return TMDB_COUNTRIES;
}