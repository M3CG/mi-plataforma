// lib/config/adminTools.ts
/**
 * Interruptor de herramientas de administración.
 *
 * Por seguridad, estas herramientas SOLO están disponibles en
 * desarrollo local (`next dev`). En cualquier build de producción
 * (despliegue online) NODE_ENV es "production" y las rutas
 * administrativas devuelven 404.
 *
 * NO modificar esta lógica sin entender las implicancias de seguridad.
 */
export const ADMIN_TOOLS_ENABLED =
  process.env.NODE_ENV === 'development';
