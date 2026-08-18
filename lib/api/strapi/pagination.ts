// lib/api/strapi/pagination.ts
import type { StrapiListResponse } from './types';

/**
* Determina si hay más páginas disponibles basándose
* en la respuesta de paginación de Strapi.
*
* Estrategia:
* 1. Si Strapi devuelve `pageCount`, lo usamos directamente.
* 2. Si no, inferimos: si la cantidad de items recibidos es igual
*    al pageSize, asumimos que probablemente hay más.
*/
export function getHasMore(
  json: StrapiListResponse<unknown> | null,
  page: number,
  pageSize: number
): boolean {
  if (!json) return false;

  const pageCount = json.meta?.pagination?.pageCount;

  if (typeof pageCount === 'number') {
    return page < pageCount;
  }

  return Array.isArray(json.data) && json.data.length === pageSize;
}