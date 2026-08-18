// features/movie-detail/ui/MovieHero.tsx

import Image from 'next/image';
import Link from 'next/link';

import BackButton from '@/shared/ui/BackButton';
import TrailerButton from './TrailerButton';
import WatchButton from './WatchButton';
import { routes } from '@/lib/routes';

import {
  IconImagePlaceholder,
  IconStar,
} from '@/shared/ui/icons';

import type { MovieDetailViewModel } from '../lib/createMovieDetailViewModel';

interface MovieHeroProps {
  viewModel: MovieDetailViewModel;
}

export default function MovieHero({ viewModel }: MovieHeroProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0">
        {viewModel.backdropImage && (
          <Image
            src={viewModel.backdropImage}
            alt=""
            fill
            className="object-cover object-top blur-[2px] scale-[1.02]"
            priority
            quality={80}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/60 to-gray-950/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-950/80 via-gray-950/30 to-transparent" />
      </div>

      {/* Contenido del hero */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pt-10 pb-12">
        <BackButton fallbackHref={routes.movies} />

        <div className="flex flex-col md:flex-row gap-8 mt-8">
          {/* Póster */}
          <div className="w-40 md:w-48 flex-shrink-0 mx-auto md:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
              {viewModel.posterUrl ? (
                <Image
                  src={viewModel.posterUrl}
                  alt={`Póster de ${viewModel.title}`}
                  fill
                  sizes="(max-width: 768px) 160px, 192px"
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full bg-white/5 flex items-center justify-center">
                  <IconImagePlaceholder className="w-12 h-12 text-gray-600" />
                </div>
              )}
            </div>
          </div>

          {/* Información */}
          <div className="flex-1 min-w-0 flex flex-col justify-end">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {viewModel.title}
              <span className="text-gray-400 font-light text-xl md:text-2xl lg:text-3xl ml-3">
                ({viewModel.year})
              </span>
            </h1>

            {/* Badges */}
            <div className="flex flex-wrap items-center gap-3 mt-4">
              {viewModel.rating > 0 && (
                <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full">
                  <IconStar className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-bold text-amber-400">
                    {viewModel.rating.toFixed(1)}
                  </span>
                </div>
              )}

              {viewModel.ageRating && (
                <span className="border border-white/20 text-gray-300 px-3 py-1.5 rounded-full text-sm font-medium">
                  {viewModel.ageRating}
                </span>
              )}

              {viewModel.runtimeLabel && (
                <span className="text-gray-300 text-sm">
                  {viewModel.runtimeLabel}
                </span>
              )}

              {viewModel.originalLanguage && (
                <span className="text-gray-400 text-sm uppercase">
                  {viewModel.originalLanguage}
                </span>
              )}
            </div>

            {/* Categorías */}
            {viewModel.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {viewModel.categories.map((category) => (
                  <Link
                    key={category.id}
                    href={routes.moviesByGenre(category.slug)}
                    className="
                      text-xs font-medium
                      bg-white/10 border border-white/10
                      text-gray-300
                      hover:text-white hover:bg-white/20
                      px-3 py-1.5 rounded-full
                      transition-all duration-150
                    "
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <WatchButton />
              <TrailerButton trailerUrl={viewModel.trailerUrl} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}