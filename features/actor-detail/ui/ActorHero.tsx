// features/actor-detail/ui/ActorHero.tsx

import Image from 'next/image';

import BackButton from '@/shared/ui/BackButton';
import { IconUserPlaceholder } from '@/shared/ui/icons';

import type { ActorDetailViewModel } from '../types';

interface ActorHeroProps {
  viewModel: ActorDetailViewModel;
}

export default function ActorHero({ viewModel }: ActorHeroProps) {
  const { actor, movieCount } = viewModel;

  return (
    <div className="relative overflow-hidden">
      {/* Fondo sutil */}
      <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-gray-950" />

      {/* Contenido del hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-12">
        <BackButton />

        <div className="flex flex-col md:flex-row items-center md:items-end gap-8 mt-8">
          {/* Foto del actor */}
          <div className="w-40 h-40 md:w-48 md:h-48 flex-shrink-0">
            <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white/10 shadow-2xl shadow-black/50">
              {actor.profile_image_url ? (
                <Image
                  src={actor.profile_image_url}
                  alt={actor.name}
                  fill
                  sizes="(max-width: 768px) 160px, 192px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <IconUserPlaceholder />
                </div>
              )}
            </div>
          </div>

          {/* Información del actor */}
          <div className="text-center md:text-left flex-1 min-w-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
              Actor
            </p>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {actor.name}
            </h1>

            <p className="text-gray-400 mt-3 text-sm md:text-base">
              {movieCount}{' '}
              {movieCount === 1 ? 'película disponible' : 'películas disponibles'}{' '}
              en el catálogo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}