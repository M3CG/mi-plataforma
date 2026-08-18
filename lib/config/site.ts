// lib/config/site.ts

/**
 * URL base del sitio.
 *
 * Se usa para:
 * - JSON-LD (SEO)
 * - Sitemap
 * - Robots.txt
 * - Open Graph / meta tags absolutos
 *
 * En desarrollo cae a localhost:3000.
 * En producción DEBE configurarse vía NEXT_PUBLIC_SITE_URL.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';