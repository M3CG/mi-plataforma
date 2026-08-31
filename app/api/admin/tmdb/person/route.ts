// app/api/admin/tmdb/person/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { isTmdbConfigured } from '@/lib/api/tmdb/config';
import {
  getPersonPreview,
  generatePersonSlugCandidates,
} from '@/lib/api/tmdb';
import { checkSlugsTaken } from '@/lib/api/repositories/adminImport';

export async function GET(request: NextRequest) {
  if (!ADMIN_TOOLS_ENABLED) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }
  if (!isTmdbConfigured()) {
    return NextResponse.json(
      { error: 'TMDB_API_KEY not configured' },
      { status: 500 }
    );
  }
  const id = Number(request.nextUrl.searchParams.get('id'));
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: 'Invalid id' }, { status: 400 });
  }
  const preview = await getPersonPreview(id);
  if (!preview) {
    return NextResponse.json(
      { error: 'Person not found on TMDB' },
      { status: 404 }
    );
  }

  const baseCandidates = generatePersonSlugCandidates(preview.name);
  const slugs = baseCandidates.map((candidate) => candidate.slug);
  const takenSet = await checkSlugsTaken('actors', slugs);
  const slugCandidates = baseCandidates.map((candidate) => ({
    slug: candidate.slug,
    source: candidate.source,
    taken: takenSet.has(candidate.slug),
    recommended: false,
  }));
  const firstAvailable = slugCandidates.find(
    (candidate) => !candidate.taken
  );
  if (firstAvailable) firstAvailable.recommended = true;

  return NextResponse.json({ preview, slugCandidates });
}
