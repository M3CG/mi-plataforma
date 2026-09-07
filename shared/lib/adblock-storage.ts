// shared/lib/adblock-storage.ts

/**
 * Estado en memoria: se resetea cuando el usuario recarga la página.
 * Esto permite que la advertencia aparezca 1 vez por carga de página,
 * pero no moleste en cada película de la misma sesión de navegación.
 */
let warnedInCurrentSession = false;

/**
 * Verifica si se debe mostrar la advertencia.
 *
 * true si la advertencia NO fue mostrada en esta carga de página.
 * No verifica si tiene adblocker o no, siempre muestra.
 */
export function shouldShowWarning(): boolean {
  return !warnedInCurrentSession;
}

/**
 * Marca que la advertencia se mostró en la sesión actual.
 * Se resetea automáticamente cuando el usuario recarga la página.
 */
export function markAsWarnedInSession(): void {
  warnedInCurrentSession = true;
}
