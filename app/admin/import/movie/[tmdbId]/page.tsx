// app/admin/import/movie/[tmdbId]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { MovieImportDetail } from '@/features/admin-import';

export const metadata: Metadata = {
  title: 'Import Movie | Admin',
  robots: { index: false, follow: false },
};

interface MovieImportRouteProps {
  params: Promise<{ tmdbId: string }>;
}

export default async function MovieImportRoute({
  params,
}: MovieImportRouteProps) {
  if (!ADMIN_TOOLS_ENABLED) {
    notFound();
  }
  const { tmdbId } = await params;
  const numericId = Number(tmdbId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }
  return <MovieImportDetail tmdbId={numericId} />;
}
