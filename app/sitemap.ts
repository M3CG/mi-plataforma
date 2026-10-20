// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { discoverMovies } from '@/lib/api/tmdb/discover';
import { normalizeTmdbResultsToMovies } from '@/lib/api/tmdb/catalogNormalizer';
import { absoluteRoutes } from '@/lib/routes';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteRoutes.home,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: absoluteRoutes.movies,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  const movieRoutes: MetadataRoute.Sitemap = [];
  const searchParams = new URLSearchParams();

  for (let page = 1; page <= 10; page += 1) {
    try {
      const result = await discoverMovies(searchParams, page, 'catalog', 24);
      const movies = normalizeTmdbResultsToMovies(result.results);

      movies.forEach((movie) => {
        movieRoutes.push({
          url: absoluteRoutes.movie(movie.slug),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });

      if (!result.hasMore) break;
    } catch {
      break;
    }
  }

  return [...staticRoutes, ...movieRoutes];
}
