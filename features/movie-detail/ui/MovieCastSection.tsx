// features/movie-detail/ui/MovieCastSection.tsx

import Image from 'next/image';
import Link from 'next/link';

import type { Actor } from '@/entities/person';
import { IconUserPlaceholder } from '@/shared/ui/icons';
import { routes } from '@/lib/routes';

interface MovieCastSectionProps {
  actors: Actor[];
}

export default function MovieCastSection({
  actors,
}: MovieCastSectionProps) {
  if (!actors || actors.length === 0) {
    return null;
  }

  return (
    <div className="mb-12">
      <h2 className="text-lg font-semibold text-white mb-4">
        Reparto Principal
      </h2>

      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
        {actors.map((actor) => (
          <Link
            key={actor.documentId}
            href={routes.actor(actor.slug)}
            className="flex-shrink-0 w-24 text-center group"
            title={`Ver películas de ${actor.name}`}
          >
            <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-white/10 group-hover:border-red-500/50 transition-all duration-300 mb-2 mx-auto">
              {actor.profile_image_url ? (
                <Image
                  src={actor.profile_image_url}
                  alt={actor.name}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              ) : (
                <IconUserPlaceholder className="w-8 h-8 text-gray-500" />
              )}
            </div>

            <p className="text-xs text-gray-300 font-medium leading-tight group-hover:text-white transition-colors">
              {actor.name}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}