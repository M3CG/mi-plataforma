import { describe, it, expect } from 'vitest';
import { parseMovieFiltersFromSearchParams } from '../movieFilters';

describe('parseMovieFiltersFromSearchParams', () => {
  it('parses genres', () => {
    const params = new URLSearchParams('genres=action&genres=drama');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.genres).toEqual(['action', 'drama']);
  });

  it('parses comma-separated genres', () => {
    const params = new URLSearchParams('genres=action,drama');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.genres).toEqual(['action', 'drama']);
  });

  it('parses minRating', () => {
    const params = new URLSearchParams('minRating=7');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.minRating).toBe(7);
  });

  it('clamps minRating to valid range', () => {
    const params = new URLSearchParams('minRating=15');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.minRating).toBe(10);
  });

  it('parses sort', () => {
    const params = new URLSearchParams('sort=rating');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.sort).toBe('rating');
  });

  it('ignores invalid sort', () => {
    const params = new URLSearchParams('sort=invalid');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.sort).toBeUndefined();
  });

  it('parses year range', () => {
    const params = new URLSearchParams('fromYear=2010&toYear=2020');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.fromYear).toBe(2010);
    expect(filters.toYear).toBe(2020);
  });

  it('swaps inverted year range', () => {
    const params = new URLSearchParams('fromYear=2020&toYear=2010');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.fromYear).toBe(2010);
    expect(filters.toYear).toBe(2020);
  });

  it('parses runtime range', () => {
    const params = new URLSearchParams('fromRuntime=90&toRuntime=150');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.fromRuntime).toBe(90);
    expect(filters.toRuntime).toBe(150);
  });

  it('parses country', () => {
    const params = new URLSearchParams('country=Mexico');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.country).toBe('Mexico');
  });

  it('returns empty filters for empty params', () => {
    const params = new URLSearchParams('');
    const filters = parseMovieFiltersFromSearchParams(params);
    expect(filters.genres).toBeUndefined();
    expect(filters.minRating).toBeUndefined();
    expect(filters.sort).toBeUndefined();
  });
});
