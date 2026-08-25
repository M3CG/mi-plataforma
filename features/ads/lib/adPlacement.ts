// features/ads/lib/adPlacement.ts
import { MOVIES_PER_AD, ADS_ENABLED } from '../config/ads';

/**
 * Fuente canónica para decidir cuándo se muestra un anuncio
 * dentro del grid de películas.
 *
 * Responsabilidad:
 * - regla de negocio de advertising
 *
 * La UI solo debe preguntar:
 * shouldShowAdAtIndex(index)
 */
export function shouldShowAdAtIndex(index: number): boolean {
  if (!ADS_ENABLED) {
    return false;
  }
  if (!MOVIES_PER_AD || MOVIES_PER_AD <= 0) {
    return false;
  }
  const position = index + 1;
  return position % MOVIES_PER_AD === 0;
}
