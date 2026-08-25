// features/ads/config/ads.ts

/**
 * Interruptor global de publicidad.
 *
 * Mientras no haya anuncios contratados, se deja en false para no
 * mostrar los placeholders de "Espacio Publicitario", que solo ocupan
 * lugar y arruinan la apariencia del sitio.
 *
 * Para volver a mostrar los espacios publicitarios, cambiar a true.
 */
export const ADS_ENABLED = false;

/**
 * Cantidad de películas entre inserciones publicitarias.
 *
 * Esta configuración pertenece a advertising,
 * no a catalog.
 */
export const MOVIES_PER_AD = 24;
