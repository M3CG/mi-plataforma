// scripts/lib/slug.js

const MAX_LENGTH = 80;

/**
 * Réplica JS de la lógica canónica de slugify.
 *
 * Mantiene consistencia con:
 * lib/utils/slugify.ts
 */
function slugify(value, maxLength = MAX_LENGTH) {
  if (!value || typeof value !== 'string') return '';

  const slug = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // quita tildes
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')     // caracteres no alfanuméricos → guiones
    .replace(/^-+|-+$/g, '');        // limpia guiones al inicio/final

  return slug.slice(0, maxLength).replace(/-+$/, '');
}

function isLatinizable(value) {
  const slug = slugify(value);
  return slug.length >= 2;
}

function chooseSlug(candidates) {
  for (const candidate of candidates) {
    if (!candidate) continue;

    if (isLatinizable(candidate)) {
      return slugify(candidate);
    }
  }

  return '';
}

module.exports = {
  slugify,
  isLatinizable,
  chooseSlug,
};