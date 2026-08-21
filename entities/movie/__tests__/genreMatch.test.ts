import { describe, it, expect } from 'vitest';
import {
  shouldUseGenreMatchRanking,
  getMovieGenreMatchCount,
} from '../lib/genreMatch';

describe('shouldUseGenreMatchRanking', () => {
  it('returns false for 0 genres', () => {
    expect(shouldUseGenreMatchRanking([])).toBe(false);
  });

  it('returns false for 1 genre', () => {
    expect(shouldUseGenreMatchRanking(['action'])).toBe(false);
  });

  it('returns true for 2 genres', () => {
    expect(shouldUseGenreMatchRanking(['action', 'drama'])).toBe(true);
  });

  it('returns true for 3+ genres', () => {
    expect(shouldUseGenreMatchRanking(['a', 'b', 'c'])).toBe(true);
  });

  it('returns false for undefined', () => {
    expect(shouldUseGenreMatchRanking(undefined)).toBe(false);
  });

  it('filters empty strings', () => {
    expect(shouldUseGenreMatchRanking(['action', '', '  '])).toBe(false);
  });
});

describe('getMovieGenreMatchCount', () => {
  const movie = {
    categories: [
      { id: 1, name: 'Action', slug: 'action' },
      { id: 2, name: 'Drama', slug: 'drama' },
    ],
  };

  it('counts all matching genres', () => {
    expect(getMovieGenreMatchCount(movie, ['action', 'drama'])).toBe(2);
  });

  it('counts partial matches', () => {
    expect(getMovieGenreMatchCount(movie, ['action', 'comedy'])).toBe(1);
  });

  it('returns 0 for no matches', () => {
    expect(getMovieGenreMatchCount(movie, ['comedy', 'horror'])).toBe(0);
  });

  it('returns 0 for empty selected genres', () => {
    expect(getMovieGenreMatchCount(movie, [])).toBe(0);
  });

  it('handles movie with no categories', () => {
    expect(getMovieGenreMatchCount({ categories: [] }, ['action'])).toBe(0);
    expect(getMovieGenreMatchCount({}, ['action'])).toBe(0);
  });
});
