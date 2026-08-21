// entities/movie/lib/format.ts
/**
* Formatea minutos de duración a un string legible.
*
* Esta lógica pertenece al dominio de películas,
* no a utilidades genéricas.
*/
export function formatRuntime(minutes?: number | null): string | null {
  if (!minutes || minutes <= 0) return null;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}
