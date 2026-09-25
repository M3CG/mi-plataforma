// lib/api/http/config.ts
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:1337';

export const FETCH_TIMEOUT_MS = 10_000;

// ─── Token unificado de Strapi ───
// Antes existían dos variables (STRAPI_API_TOKEN y STRAPI_ADMIN_TOKEN)
// para el mismo token. Este es el nombre canónico; el fallback mantiene
// compatibilidad con entornos que aún usan el nombre viejo.
// Cuando ningún entorno use STRAPI_ADMIN_TOKEN, borrar el fallback.
export const STRAPI_API_TOKEN =
  process.env.STRAPI_API_TOKEN
  ?? process.env.STRAPI_ADMIN_TOKEN
  ?? '';

if (
  process.env.NODE_ENV === 'production' &&
  !process.env.STRAPI_API_TOKEN &&
  process.env.STRAPI_ADMIN_TOKEN
) {
  // Solo avisa que el entorno sigue usando el nombre legacy.
  console.warn(
    '[config] Usando STRAPI_ADMIN_TOKEN (legacy). ' +
    'Renombrar a STRAPI_API_TOKEN.'
  );
}