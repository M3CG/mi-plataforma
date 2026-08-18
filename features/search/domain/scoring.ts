// features/search/domain/scoring.ts

import type { Movie } from '@/types';
import { normalizeSearchTerm } from './normalize';

export type SearchSource =
  | 'title'
  | 'actor'
  | 'director'
  | 'category';

const SOURCE_BASE: Record<SearchSource, number> = {
  title: 70,
  actor: 45,
  director: 40,
  category: 35,
};

export function computeSearchScore(
  movie: Movie,
  normalizedQuery: string,
  source: SearchSource
): number {
  let score = SOURCE_BASE[source];

  if (source === 'title') {
    const candidates = [
      movie.title,
      movie.english_title,
      movie.spanish_title,
    ].filter((value): value is string => Boolean(value && typeof value === 'string'));

    let best = 0;

    for (const rawCandidate of candidates) {
      const candidate = normalizeSearchTerm(rawCandidate);

      if (candidate === normalizedQuery) {
        best = Math.max(best, 30);
      } else if (candidate.startsWith(normalizedQuery)) {
        best = Math.max(best, 20);
      } else if (candidate.includes(normalizedQuery)) {
        best = Math.max(best, 10);
      } else {
        const queryWords = normalizedQuery
          .split(' ')
          .filter((word) => word.length > 1);

        const candidateWords = candidate.split(' ');

        const matchedWords = queryWords.filter((queryWord) =>
          candidateWords.some((candidateWord) =>
            candidateWord.includes(queryWord)
          )
        );

        if (matchedWords.length > 0) {
          best = Math.max(best, 5 + matchedWords.length * 2);
        }
      }
    }

    score += best;
  } else if (source === 'actor') {
    const exactActorMatch = (movie.actors || []).some(
      (actor) => normalizeSearchTerm(actor.name) === normalizedQuery
    );

    if (exactActorMatch) {
      score += 10;
    }
  } else if (source === 'director') {
    const exactDirectorMatch = (movie.directors || []).some(
      (director) => normalizeSearchTerm(director.name) === normalizedQuery
    );

    if (exactDirectorMatch) {
      score += 10;
    }
  } else if (source === 'category') {
    const exactCategoryMatch = (movie.categories || []).some(
      (category) => normalizeSearchTerm(category.name) === normalizedQuery
    );

    if (exactCategoryMatch) {
      score += 10;
    }
  }

  return score;
}