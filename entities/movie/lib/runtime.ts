// entities/movie/lib/runtime.ts
/**
* Límites canónicos de duración de película (en minutos).
*
* - Mínimo 0: permite incluir cualquier duración.
* - Máximo 240 (4 horas): cubre incluso películas muy largas.
*/
export const MOVIE_RUNTIME_MIN = 0;
export const MOVIE_RUNTIME_MAX = 240;

export function clampMovieRuntime(runtime: number): number {
  return Math.min(
    Math.max(Math.floor(runtime), MOVIE_RUNTIME_MIN),
    MOVIE_RUNTIME_MAX
  );
}
