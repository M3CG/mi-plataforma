// lib/utils/slugify.ts

// Única fuente de verdad para generación y validación de slugs.

const MAX_LENGTH = 80;

/**
 * Convierte un string en un slug URL-safe.
 *
 * @example
 * slugify("The Odyssey")           // "the-odyssey"
 * slugify("Misión: Imposible")     // "mision-imposible"
 * slugify("올드보이")              // "" (coreano no es latinizable)
 * slugify("Spider-Man", 10)        // "spider-man"
 */
export function slugify(value: string, maxLength: number = MAX_LENGTH): string {
  if (!value || typeof value !== 'string') return '';

  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')  // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')      // caracteres no-alfanuméricos → guiones
    .replace(/^-+|-+$/g, '');         // limpia guiones al inicio/final

  return slug.slice(0, maxLength).replace(/-+$/, '');
}

/**
 * Determina si un string produce un slug válido (es "latinizable").
 *
 * Útil para decidir si usar el título original o un fallback.
 */
export function isLatinizable(value: string): boolean {
  const slug = slugify(value);
  return slug.length >= 2;
}

/**
 * Genera un slug a partir de múltiples candidatos, eligiendo el primero válido.
 *
 * @example
 * chooseSlug(["올드보이", "Oldboy", "Oldeuboi"])  // "oldboy"
 */
export function chooseSlug(candidates: (string | null | undefined)[]): string {
  for (const candidate of candidates) {
    if (!candidate) continue;

    if (isLatinizable(candidate)) {
      return slugify(candidate);
    }
  }

  return '';
}

/**
 * Validación canónica de slugs dinámicos.
 *
 * Se usa en rutas como:
 * - /movie/[slug]
 * - /actor/[slug]
 *
 * Evita slugs basura como:
 * - "undefined"
 * - "null"
 * - ""
 */
export function isValidSlug(slug: string | null | undefined): slug is string {
  return Boolean(
    slug &&
    slug !== 'undefined' &&
    slug !== 'null' &&
    slug.trim() !== ''
  );
}