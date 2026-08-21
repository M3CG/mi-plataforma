// features/player/config/sandbox-policy.ts

/**
 * Permisos de sandbox aplicados a iframes de terceros.
 *
 * Estos permisos son una decisión de SEGURIDAD, no de configuración.
 * Cambiarlos afecta la superficie de ataque de toda la aplicación.
 *
 * - allow-scripts:        Necesario para que el reproductor funcione.
 * - allow-same-origin:    REMOVIDO. allow-scripts + allow-same-origin permite
 *                         al iframe eliminar su propio atributo sandbox (MDN).
 *                         Si un provider lo necesita, usar sandbox: false
 *                         en su configuración individual.
 * - allow-popups:         Algunos players abren controles en popups.
 * - allow-presentation:   Permite fullscreen/presentation API.
 * - allow-forms:          Algunos players usan forms internos.
 *
 * NO incluir:
 * - allow-top-navigation: Permitiría al iframe redirigir la página principal.
 * - allow-modals:         Permitiría alert()/confirm() que bloquean la UX.
 */
const SANDBOX_PERMISSIONS: readonly string[] = [
  'allow-scripts',
  'allow-popups',
  'allow-presentation',
  'allow-forms',
];

export const DEFAULT_SANDBOX = SANDBOX_PERMISSIONS.join(' ');

/**
 * Resuelve el valor efectivo del atributo `sandbox` para un iframe.
 *
 * Reglas:
 * - `false`      → sin sandbox (el provider lo requiere explícitamente)
 * - `string`     → usar el valor proporcionado
 * - `undefined`  → usar la política por defecto
 */
export function resolveSandboxAttribute(
  sandbox: string | false | undefined
): string | undefined {
  if (sandbox === false) return undefined;
  return sandbox ?? DEFAULT_SANDBOX;
}