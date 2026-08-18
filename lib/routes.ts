import { SITE_URL } from './config/site';

export const routes = {
  home: '/',
  movies: '/movies',
  movie: (slug: string) => `/movie/${slug}`,
  actor: (slug: string) => `/actor/${slug}`,
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
  moviesByGenre: (genreSlug: string) => `/movies?genres=${genreSlug}`,
} as const;

export const absoluteRoutes = {
  home: `${SITE_URL}`,
  movies: `${SITE_URL}/movies`,
  movie: (slug: string) => `${SITE_URL}/movie/${slug}`,
  actor: (slug: string) => `${SITE_URL}/actor/${slug}`,
} as const;
