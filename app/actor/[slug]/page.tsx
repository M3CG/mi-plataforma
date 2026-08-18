// app/actor/[slug]/page.tsx

import { notFound } from 'next/navigation';

import {
  ActorPage,
  getActorPageData,
  buildActorMetadata,
} from '@/features/actor-detail';

interface ActorRouteProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ActorRouteProps) {
  const { slug } = await params;

  const viewModel = await getActorPageData(slug);

  return buildActorMetadata(viewModel);
}

export default async function ActorRoute({
  params,
}: ActorRouteProps) {
  const { slug } = await params;

  const viewModel = await getActorPageData(slug);

  if (!viewModel) {
    notFound();
  }

  return <ActorPage viewModel={viewModel} />;
}