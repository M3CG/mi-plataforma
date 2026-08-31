// lib/api/tmdb/slugCandidates.ts
import { slugify, isLatinizable } from '@/lib/utils/slugify';

export interface SlugCandidateInput {
  originalTitle?: string | null;
  englishTitle?: string | null;
  spanishTitle?: string | null;
  year?: number | null;
}

export interface BaseSlugCandidate {
  slug: string;
  source: string;
}

/**
 * Genera candidatos de slug con la prioridad pedida:
 * título original → inglés → español, y variantes con año e índice.
 */
export function generateSlugCandidates(
  input: SlugCandidateInput
): BaseSlugCandidate[] {
  const ordered: Array<{ title?: string | null; source: string }> = [
    { title: input.originalTitle, source: 'original' },
    { title: input.englishTitle, source: 'english' },
    { title: input.spanishTitle, source: 'spanish' },
  ];

  const seen = new Set<string>();
  const candidates: BaseSlugCandidate[] = [];
  const push = (slug: string, source: string) => {
    if (!slug || seen.has(slug)) return;
    seen.add(slug);
    candidates.push({ slug, source });
  };

  let firstBase: string | null = null;
  for (const { title, source } of ordered) {
    if (!title || !isLatinizable(title)) continue;
    const base = slugify(title);
    if (!base) continue;
    if (!firstBase) firstBase = base;
    push(base, source);
    if (input.year) push(`${base}-${input.year}`, source);
  }

  if (firstBase && input.year) {
    for (let index = 2; index <= 3; index += 1) {
      push(`${firstBase}-${input.year}-${index}`, 'index');
    }
  }

  return candidates;
}

/**
 * Candidatos de slug para personas (actores/directores).
 */
export function generatePersonSlugCandidates(
  name: string
): BaseSlugCandidate[] {
  const base = slugify(name);
  if (!base) return [];
  const candidates: BaseSlugCandidate[] = [
    { slug: base, source: 'name' },
  ];
  for (let index = 2; index <= 3; index += 1) {
    candidates.push({ slug: `${base}-${index}`, source: 'index' });
  }
  return candidates;
}
