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
