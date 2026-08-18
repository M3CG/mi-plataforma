// lib/queries/categories.ts
import { cache } from 'react';

import { fetchCategories } from '@/lib/api/repositories/categories';

export const getCategories = cache(fetchCategories);