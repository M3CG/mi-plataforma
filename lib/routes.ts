// lib/routes.ts
import { SITE_URL } from './config/site';

// ─── Rutas relativas (para <Link> y router.push) ───

export const routes = {
  home: '/',
  movies: '/movies',                          // ← Ahora es string constante
  movie: (slug: string) => `/movie/${slug}`,
  actor: (slug: string) => `/actor/${slug}`,
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  moviesByGenre: (genreSlug: string) => `/movies?genres=${genreSlug}`,
  moviesWithParams: (params: string) => `/movies?${params}`,  // ← Para casos excepcionales
} as const;

// ─── URLs absolutas (para SEO, sitemap, JSON-LD) ───

export const absoluteRoutes = {
  home: `${SITE_URL}`,
  movies: `${SITE_URL}/movies`,
  movie: (slug: string) => `${SITE_URL}/movie/${slug}`,
  actor: (slug: string) => `${SITE_URL}/actor/${slug}`,
} as const;