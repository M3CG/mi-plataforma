// features/actor-detail/ui/ActorEmptyState.tsx

import { IconUserPlaceholder } from '@/shared/ui/icons';

interface ActorEmptyStateProps {
  actorName: string;
}

export default function ActorEmptyState({
  actorName,
}: ActorEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-16 h-16 mb-4 rounded-full bg-white/5 flex items-center justify-center">
        <IconUserPlaceholder />
      </div>

      <h3 className="text-lg font-semibold text-gray-200 mb-1">
        No movies available
      </h3>

      <p className="text-sm text-gray-400 max-w-sm">
        We don&apos;t have any {actorName} movies in the catalog yet.
      </p>
    </div>
  );
}