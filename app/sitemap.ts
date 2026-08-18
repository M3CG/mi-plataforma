// app/sitemap.ts
import type { MetadataRoute } from 'next';

import { getMoviesWithFilters } from '@/lib/queries/movies';
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

  let page = 1;
  let hasMore = true;

  while (hasMore && page <= 50) {
    try {
      const result = await getMoviesWithFilters({}, page, 100);
      const movies = result.data;

      movies.forEach((movie) => {
        movieRoutes.push({
          url: absoluteRoutes.movie(movie.slug),
          lastModified: new Date(),
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      });

      hasMore = result.hasMore;
      page++;
    } catch {
      break;
    }
  }

  return [...staticRoutes, ...movieRoutes];
}