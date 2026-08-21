import { describe, it, expect } from 'vitest';
import { buildMovieListParams } from '../movieParams';

describe('buildMovieListParams', () => {
  it('builds basic params with defaults', () => {
    const params = buildMovieListParams({}, 1, 24);
    expect(params['pagination[page]']).toBe('1');
    expect(params['pagination[pageSize]']).toBe('24');
    expect(params['sort[0]']).toBe('year:desc');
    expect(params['sort[1]']).toBe('rating:desc');
    expect(params['sort[2]']).toBe('id:desc');
  });

  it('applies genre filters', () => {
    const params = buildMovieListParams(
      { genres: ['action', 'drama'] },
      1,
      24
    );
    expect(params['filters[categories][slug][$in][0]']).toBe('action');
    expect(params['filters[categories][slug][$in][1]']).toBe('drama');
  });

  it('applies rating filter', () => {
    const params = buildMovieListParams({ minRating: 7 }, 1, 24);
    expect(params['filters[rating][$gte]']).toBe('7');
  });

  it('clamps rating to valid range', () => {
    const params = buildMovieListParams({ minRating: 15 }, 1, 24);
    expect(params['filters[rating][$gte]']).toBe('10');
  });

  it('swaps year range if inverted', () => {
    const params = buildMovieListParams(
      { fromYear: 2020, toYear: 2010 },
      1,
      24
    );
    expect(params['filters[year][$gte]']).toBe('2010');
    expect(params['filters[year][$lte]']).toBe('2020');
  });

  it('applies country filter', () => {
    const params = buildMovieListParams({ country: 'Mexico' }, 1, 24);
    expect(params['filters[country][$eq]']).toBe('Mexico');
  });

  it('applies sort preset', () => {
    const params = buildMovieListParams({ sort: 'rating' }, 1, 24);
    expect(params['sort[0]']).toBe('rating:desc');
  });

  it('includes populate params', () => {
    const params = buildMovieListParams({}, 1, 24);
    expect(params['populate[0]']).toBe('poster');
    expect(params['populate[1]']).toBe('servers');
    expect(params['populate[2]']).toBe('categories');
  });
});
