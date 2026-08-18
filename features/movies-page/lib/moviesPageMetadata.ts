// features/movies-page/lib/moviesPageMetadata.ts

import type { Metadata } from 'next';

export function buildMoviesPageMetadata(): Metadata {
  return {
    title: 'Catálogo de Películas | CineStream',
    description:
      'Explora el catálogo completo de CineStream. Filtra películas por género, año, puntuación y país.',
    openGraph: {
      title: 'Catálogo de Películas | CineStream',
      description:
        'Explora el catálogo completo de CineStream. Filtra películas por género, año, puntuación y país.',
    },
    twitter: {
      card: 'summary',
      title: 'Catálogo de Películas | CineStream',
      description:
        'Explora el catálogo completo de CineStream. Filtra películas por género, año, puntuación y país.',
    },
  };
}