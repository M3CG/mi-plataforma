// lib/queries/countries.ts
import { cache } from 'react';

import { fetchCountries } from '@/lib/api/repositories/countries';

export const getCountries = cache(fetchCountries);