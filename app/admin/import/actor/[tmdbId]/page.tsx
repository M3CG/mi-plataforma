// app/admin/import/actor/[tmdbId]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { ActorImportDetail } from '@/features/admin-import';

export const metadata: Metadata = {
  title: 'Importar actor | Admin',
  robots: { index: false, follow: false },
};

interface ActorImportRouteProps {
  params: Promise<{ tmdbId: string }>;
}

export default async function ActorImportRoute({
  params,
}: ActorImportRouteProps) {
  if (!ADMIN_TOOLS_ENABLED) {
    notFound();
  }
  const { tmdbId } = await params;
  const numericId = Number(tmdbId);
  if (!Number.isFinite(numericId) || numericId <= 0) {
    notFound();
  }
  return <ActorImportDetail tmdbId={numericId} />;
}
