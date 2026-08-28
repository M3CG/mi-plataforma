// lib/api/strapi/schemas.ts
import { z } from 'zod';

export const StrapiServerSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  name: z.string(),
  url: z.string(),
  language: z.string().nullish(),
  quality: z.string().nullish(),
  subtitles: z.boolean().nullish(),
}).passthrough();

export const StrapiCategorySchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  name: z.string(),
  slug: z.string().nullish(),
  tmdb_id: z.number().nullish(),
}).passthrough();

/**
 * Un solo schema para personas.
 *
 * Actor y Director son roles del mismo concepto de negocio.
 */
export const StrapiPersonSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  name: z.string(),
  slug: z.string().nullish(),
  profile_image_url: z.string().nullish(),
  profile_image: z.unknown().nullish(),
}).passthrough();

export const StrapiMovieSchema = z.object({
  id: z.number(),
  documentId: z.string().nullish(),
  title: z.string(),
  english_title: z.string().nullish(),
  spanish_title: z.string().nullish(),
  slug: z.string().nullish(),
  synopsis: z.string().nullish(),
  english_synopsis: z.string().nullish(),
  spanish_synopsis: z.string().nullish(),
  year: z.number().nullish(),
  rating: z.number().nullish(),
  country: z.string().nullish(),
  tmdb_id: z.number().nullish(),
  imdb_id: z.string().nullish(),
  views: z.number().nullish(),
  is_featured: z.boolean().nullish(),
  poster_url: z.string().nullish(),
  backdrop_url: z.string().nullish(),
  trailer_url: z.string().nullish(),
  runtime: z.number().nullish(),
  age_rating: z.string().nullish(),
  original_language: z.string().nullish(),
  release_date: z.string().nullish(),

  poster: z.unknown().nullish(),
  backdrop: z.unknown().nullish(),
  servers: z.unknown().nullish(),
  categories: z.unknown().nullish(),
  actors: z.unknown().nullish(),
  directors: z.unknown().nullish(),
}).passthrough();