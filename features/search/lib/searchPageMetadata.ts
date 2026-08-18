// features/search/lib/searchPageMetadata.ts

import type { Metadata } from 'next';

import { normalizeSearchQuery } from './normalizeSearchQuery';

export function buildSearchMetadata(
  rawQuery?: string | string[]
): Metadata {
  const query = normalizeSearchQuery(rawQuery);

  if (!query) {
    return {
      title: 'Buscar | CineStream',
      description:
        'Busca películas por título, actor, director o género en CineStream.',
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  return {
    title: `Búsqueda: "${query}" | CineStream`,
    description: `Resultados de búsqueda para "${query}" en CineStream.`,
    openGraph: {
      title: `Búsqueda: "${query}" | CineStream`,
      description: `Resultados de búsqueda para "${query}" en CineStream.`,
    },
    twitter: {
      card: 'summary',
      title: `Búsqueda: "${query}" | CineStream`,
      description: `Resultados de búsqueda para "${query}" en CineStream.`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}