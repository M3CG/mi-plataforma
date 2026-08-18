// lib/api/strapi/populate.ts

/**
 * Fuente canónica de relaciones a popular contra Strapi.
 *
 * Antes, los populate estaban repetidos en:
 * - movieParams.ts
 * - movies.ts
 * - actors.ts
 * - strapiMovieSearchRepository.ts
 *
 * Ahora, si agregamos una nueva relación, se modifica solo aquí.
 */
export const MOVIE_LIST_POPULATE = [
  'poster',
  'servers',
  'categories',
] as const;

export const MOVIE_DETAIL_POPULATE = [
  'poster',
  'servers',
  'categories',
  'actors',
  'directors',
] as const;

export function buildPopulateParams(
  relations: readonly string[]
): Record<string, string> {
  return Object.fromEntries(
    relations.map((relation, index) => [`populate[${index}]`, relation])
  );
}