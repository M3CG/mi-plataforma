// lib/api/resources/categories.ts
import type { Category } from '@/types';
import type { StrapiListResponse } from '../strapi/types';

import { fetchApi } from '../http/client';
import { normalizeCategory } from '../strapi/normalizers';

export async function fetchCategories(): Promise<Category[]> {
  const params = {
    'pagination[pageSize]': '100',
    'sort[0]': 'name:asc',
  };

  const json = await fetchApi<StrapiListResponse<unknown>>(
    '/categories',
    params,
    {
      next: {
        revalidate: 3600,
        tags: ['categories'],
      },
    }
  );

  if (!json?.data || !Array.isArray(json.data)) return [];

  return json.data
    .map(normalizeCategory)
    .filter((category): category is Category => category !== null);
}