// features/actor-detail/services/getActorPageData.ts
import { cache } from 'react';
import type { Actor } from '@/entities/person';
import { isValidSlug } from '@/lib/utils/slugify';
import {
  extractTmdbIdFromSlug,
  generateTmdbSlug,
} from '@/lib/api/tmdb/slugResolver';
import {
  tmdbGetPerson,
  tmdbGetPersonMovieCredits,
  tmdbSearchPersons,
} from '@/lib/api/tmdb/client';
import { normalizePersonDetail } from '@/lib/api/tmdb/normalizers';
import { normalizeTmdbSearchToMovies } from '@/lib/api/tmdb/catalogNormalizer';
import type { ActorDetailViewModel } from '../types';
import { createActorDetailViewModel } from '../lib/createActorDetailViewModel';

export const getActorPageData = cache(
  async (slug: string): Promise<ActorDetailViewModel | null> => {
    if (!isValidSlug(slug)) {
      return null;
    }

    let tmdbId = extractTmdbIdFromSlug(slug);

    if (tmdbId === null) {
      const searchQuery = slug.replace(/-/g, ' ').trim();
      const searchResult = await tmdbSearchPersons(searchQuery);
      const firstMatch = searchResult?.results?.[0];
      if (!firstMatch?.id) {
        return null;
      }
      tmdbId = firstMatch.id;
    }

    const [personDetail, credits] = await Promise.all([
      tmdbGetPerson(tmdbId),
      tmdbGetPersonMovieCredits(tmdbId),
    ]);

    if (!personDetail) {
      return null;
    }

    const preview = normalizePersonDetail(personDetail);
    const actor: Actor = {
      id: preview.tmdbId,
      documentId: `tmdb-person-${preview.tmdbId}`,
      name: preview.name,
      slug: generateTmdbSlug(preview.tmdbId, preview.name),
      profile_image_url: preview.defaultProfileUrl,
    };

    const seenMovieIds = new Set<number>();
    const rawCast = (credits?.cast ?? [])
      .filter((item) => {
        if (!item.id || !item.title || seenMovieIds.has(item.id)) {
          return false;
        }
        seenMovieIds.add(item.id);
        return true;
      })
      .sort((a, b) => {
        const yearA = a.release_date
          ? new Date(a.release_date).getFullYear()
          : 0;
        const yearB = b.release_date
          ? new Date(b.release_date).getFullYear()
          : 0;
        if (yearB !== yearA) return yearB - yearA;
        return (b.vote_average ?? 0) - (a.vote_average ?? 0);
      });

    const movies = normalizeTmdbSearchToMovies(rawCast);

    return createActorDetailViewModel(actor, movies);
  }
);
