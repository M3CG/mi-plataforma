#!/usr/bin/env bash
set -euo pipefail

echo "Iniciando refactor arquitectónico - Fase 1"

# ─────────────────────────────────────────────
# Crear carpetas nuevas
# ─────────────────────────────────────────────
mkdir -p widgets/movie-card
mkdir -p widgets/composition/catalog-grid-with-ads
mkdir -p features/home/services
mkdir -p features/home/ui

# ─────────────────────────────────────────────
# widgets/movie-card/MovieCard.tsx
# ─────────────────────────────────────────────
cat > widgets/movie-card/MovieCard.tsx <<'EOF'
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';
import type { Movie } from '@/entities/movie';
import { createMovieCardViewModel } from '@/entities/movie';
import { IconImagePlaceholder, IconStar } from '@/shared/ui/icons';
import MovieCardCategoryLink from './MovieCardCategoryLink';

export interface MovieCardProps {
  movie: Movie;
  href: string;
  getCategoryHref?: (categorySlug: string) => string;
  onPrimaryLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function MovieCard({
  movie,
  href,
  getCategoryHref,
  onPrimaryLinkClick,
}: MovieCardProps) {
  const viewModel = createMovieCardViewModel(movie);

  return (
    <article
      className="
        group relative
        bg-white/[0.03] border border-white/5
        rounded-2xl overflow-hidden
        transition-all duration-300
        hover:bg-white/[0.06] hover:border-white/10
        hover:shadow-xl hover:shadow-black/20
        hover:-translate-y-1
      "
    >
      <Link
        href={href}
        onClick={onPrimaryLinkClick}
        aria-label={`Ver detalle de ${viewModel.title}`}
        title={`Ver detalle de ${viewModel.title}`}
        className="absolute inset-0 z-10"
      />

      {/* Imagen */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {viewModel.posterUrl ? (
          <Image
            src={viewModel.posterUrl}
            alt={`Póster de ${viewModel.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1400px) 25vw, 20vw"
            className="
              object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <IconImagePlaceholder className="w-10 h-10 text-gray-600" />
          </div>
        )}

        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-black/60 via-transparent to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          "
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {viewModel.primaryQuality && (
            <span
              className="
                bg-red-600/90 backdrop-blur-sm
                text-white text-[10px] font-bold
                px-2 py-0.5 rounded-md
                uppercase tracking-wide
              "
            >
              {viewModel.primaryQuality}
            </span>
          )}

          {viewModel.hasSubtitles && (
            <span
              className="
                bg-black/60 backdrop-blur-sm
                text-gray-200 text-[10px] font-semibold
                px-2 py-0.5 rounded-md
              "
            >
              CC
            </span>
          )}
        </div>

        {viewModel.rating > 0 && (
          <div
            className="
              absolute top-2.5 right-2.5
              flex items-center gap-1
              bg-black/70 backdrop-blur-sm
              px-2 py-1 rounded-lg
            "
          >
            <IconStar className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-white">
              {viewModel.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="relative p-3.5">
        <h2
          className="
            text-sm font-semibold text-gray-100
            leading-snug line-clamp-2 min-h-[2.5rem]
            group-hover:text-white transition-colors
          "
        >
          {viewModel.title}
        </h2>

        <div className="flex items-center gap-2 mt-1.5 text-xs">
          <span className="text-gray-400">{viewModel.year}</span>

          {viewModel.runtimeLabel && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">{viewModel.runtimeLabel}</span>
            </>
          )}

          {viewModel.ageRating && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">{viewModel.ageRating}</span>
            </>
          )}
        </div>

        {viewModel.languages.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1.5 truncate">
            {viewModel.languages.join(' · ')}
          </p>
        )}

        {viewModel.categories.length > 0 && (
          <div className="relative z-20 flex flex-wrap gap-1 mt-2.5">
            {viewModel.categories.map((category) => (
              <MovieCardCategoryLink
                key={category.id}
                category={category}
                href={getCategoryHref?.(category.slug)}
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
EOF

# ─────────────────────────────────────────────
# widgets/movie-card/MovieCardCategoryLink.tsx
# ─────────────────────────────────────────────
cat > widgets/movie-card/MovieCardCategoryLink.tsx <<'EOF'
import Link from 'next/link';
import type { Category } from '@/entities/category';

interface MovieCardCategoryLinkProps {
  category: Category;
  href?: string;
}

export default function MovieCardCategoryLink({
  category,
  href,
}: MovieCardCategoryLinkProps) {
  const baseClasses = `
    relative z-20
    text-[10px] font-medium
    bg-white/5 border border-white/5
    text-gray-400
    px-2 py-0.5 rounded-full
    transition-all duration-150
  `;

  if (!href) {
    return <span className={baseClasses}>{category.name}</span>;
  }

  return (
    <Link
      href={href}
      title={`Filtrar películas por ${category.name}`}
      aria-label={`Filtrar películas por ${category.name}`}
      className={`
        ${baseClasses}
        hover:text-white hover:bg-white/10 hover:border-white/10
      `}
    >
      {category.name}
    </Link>
  );
}
EOF

# ─────────────────────────────────────────────
# widgets/movie-card/MovieCardSkeleton.tsx
# ─────────────────────────────────────────────
cat > widgets/movie-card/MovieCardSkeleton.tsx <<'EOF'
export default function MovieCardSkeleton() {
  return (
    <div className="bg-white/[0.03] border border-white/5 rounded-2xl overflow-hidden animate-pulse">
      <div className="aspect-[2/3] bg-white/5" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-white/10 rounded w-4/5" />
        <div className="h-3 bg-white/10 rounded w-2/5" />
        <div className="h-3 bg-white/10 rounded w-3/5" />
      </div>
    </div>
  );
}
EOF

# ─────────────────────────────────────────────
# widgets/movie-card/AppMovieCard.tsx
# ─────────────────────────────────────────────
cat > widgets/movie-card/AppMovieCard.tsx <<'EOF'
'use client';

import type { MouseEvent } from 'react';
import type { Movie } from '@/entities/movie';
import MovieCard from './MovieCard';
import { routes } from '@/lib/routes';

interface AppMovieCardProps {
  movie: Movie;
  onPrimaryLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
}

export default function AppMovieCard({
  movie,
  onPrimaryLinkClick,
}: AppMovieCardProps) {
  return (
    <MovieCard
      movie={movie}
      href={routes.movie(movie.slug)}
      getCategoryHref={(categorySlug) => routes.moviesByGenre(categorySlug)}
      onPrimaryLinkClick={onPrimaryLinkClick}
    />
  );
}
EOF

# ─────────────────────────────────────────────
# widgets/movie-card/index.ts
# ─────────────────────────────────────────────
cat > widgets/movie-card/index.ts <<'EOF'
export { default as MovieCard } from './MovieCard';
export type { MovieCardProps } from './MovieCard';
export { default as MovieCardCategoryLink } from './MovieCardCategoryLink';
export { default as MovieCardSkeleton } from './MovieCardSkeleton';
export { default as AppMovieCard } from './AppMovieCard';
EOF

# ─────────────────────────────────────────────
# widgets/composition/catalog-grid-with-ads
# ─────────────────────────────────────────────
cat > widgets/composition/catalog-grid-with-ads/CatalogGridWithAds.tsx <<'EOF'
'use client';

import type { Movie, MovieFilters } from '@/entities/movie';
import { MovieGrid } from '@/features/catalog';
import { MovieGridAdSlot } from '@/features/ads';

interface CatalogGridWithAdsProps {
  initialMovies: Movie[];
  initialHasMore: boolean;
  filters: MovieFilters;
}

export default function CatalogGridWithAds({
  initialMovies,
  initialHasMore,
  filters,
}: CatalogGridWithAdsProps) {
  return (
    <MovieGrid
      initialMovies={initialMovies}
      initialHasMore={initialHasMore}
      filters={filters}
      renderAfterMovie={(index) => <MovieGridAdSlot index={index} />}
    />
  );
}
EOF

cat > widgets/composition/catalog-grid-with-ads/index.ts <<'EOF'
export { default as CatalogGridWithAds } from './CatalogGridWithAds';
EOF

# ─────────────────────────────────────────────
# entities/movie/index.ts
# Sin UI. Solo dominio.
# ─────────────────────────────────────────────
cat > entities/movie/index.ts <<'EOF'
export type { Movie, Server } from './types/movie';

export { createMovieCardViewModel } from './lib/createMovieCardViewModel';
export type { MovieCardViewModel } from './lib/createMovieCardViewModel';

export { getMovieKey, dedupeMovies } from './lib/movieKey';

export type {
  MovieFilters,
  MovieFiltersQuery,
  MovieSort,
} from './types/filters';

export {
  MOVIE_SORT_VALUES,
  DEFAULT_MOVIE_SORT,
  MOVIE_SORT_OPTIONS,
  isMovieSort,
} from './config/sort';

export type { MovieSortOption } from './config/sort';

export {
  MOVIE_YEAR_MIN,
  getMovieYearMax,
  clampMovieYear,
} from './lib/year';

export {
  MOVIE_FILTER_PARAM_KEYS,
  MOVIE_PAGINATION_PARAM_KEYS,
} from './config/filterParams';

export type { MovieFilterParamKey } from './config/filterParams';
EOF

# ─────────────────────────────────────────────
# entities/movie/lib/createMovieCardViewModel.ts
# ─────────────────────────────────────────────
cat > entities/movie/lib/createMovieCardViewModel.ts <<'EOF'
import type { Category } from '@/entities/category';
import type { Movie } from '../types/movie';
import { formatRuntime } from '@/lib/utils/format';

export interface MovieCardViewModel {
  title: string;
  year: number;
  rating: number;
  ageRating?: string;
  posterUrl?: string;
  runtimeLabel?: string;
  languages: string[];
  primaryQuality?: string;
  hasSubtitles: boolean;
  categories: Category[];
}

export function createMovieCardViewModel(
  movie: Movie
): MovieCardViewModel {
  const servers = movie.servers ?? [];

  const languages = Array.from(
    new Set(
      servers
        .map((server) => server.language)
        .filter((language): language is string => Boolean(language))
    )
  );

  const qualities = Array.from(
    new Set(
      servers
        .map((server) => server.quality)
        .filter((quality): quality is string => Boolean(quality))
    )
  );

  const hasSubtitles = servers.some((server) => server.subtitles === true);

  return {
    title: movie.title,
    year: movie.year,
    rating: movie.rating,
    ageRating: movie.age_rating ?? undefined,
    posterUrl: movie.poster_url,
    runtimeLabel: formatRuntime(movie.runtime) ?? undefined,
    languages,
    primaryQuality: qualities[0],
    hasSubtitles,
    categories: movie.categories ?? [],
  };
}
EOF

# ─────────────────────────────────────────────
# entities/movie/lib/movieKey.ts
# ─────────────────────────────────────────────
cat > entities/movie/lib/movieKey.ts <<'EOF'
import type { Movie } from '../types/movie';

/**
 * Identidad única de una película.
 *
 * La identidad de la entidad Movie pertenece a la entidad,
 * no a features individuales como catalog o search.
 */
export function getMovieKey(
  movie: Pick<Movie, 'id' | 'documentId'>
): string {
  return movie.documentId || String(movie.id);
}

/**
 * Elimina películas repetidas usando la identidad canónica.
 */
export function dedupeMovies(
  existingMovies: Movie[],
  incomingMovies: Movie[]
): Movie[] {
  const seenKeys = new Set(existingMovies.map(getMovieKey));
  return incomingMovies.filter(
    (movie) => !seenKeys.has(getMovieKey(movie))
  );
}
EOF

# ─────────────────────────────────────────────
# features/ads/index.ts
# Ya no exporta MovieGridWithAds.
# ─────────────────────────────────────────────
cat > features/ads/index.ts <<'EOF'
export { default as AdBanner } from './ui/AdBanner';
export { default as MovieGridAdSlot } from './ui/MovieGridAdSlot';
export { shouldShowAdAtIndex } from './lib/adPlacement';
export { MOVIES_PER_AD } from './config/ads';
EOF

# ─────────────────────────────────────────────
# features/home
# ─────────────────────────────────────────────
cat > features/home/services/getHomePageData.ts <<'EOF'
import { getHomeMovies } from '@/lib/queries/movies';
import type { Movie } from '@/entities/movie';

export interface HomePageData {
  movies: Movie[];
}

export async function getHomePageData(): Promise<HomePageData> {
  const movies = await getHomeMovies();

  return {
    movies,
  };
}
EOF

cat > features/home/ui/HomePage.tsx <<'EOF'
import type { ReactNode } from 'react';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';

interface HomePageProps {
  movies: Movie[];
  afterTrendingSlot?: ReactNode;
}

export default function HomePage({
  movies,
  afterTrendingSlot,
}: HomePageProps) {
  return (
    <main className="min-h-screen p-8">
      <h2 className="text-2xl font-bold mb-6 text-white">
        Trending Now
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
        {movies.map((movie) => (
          <AppMovieCard
            key={getMovieKey(movie)}
            movie={movie}
          />
        ))}
      </div>

      {afterTrendingSlot}
    </main>
  );
}
EOF

cat > features/home/index.ts <<'EOF'
export { default as HomePage } from './ui/HomePage';
export { getHomePageData } from './services/getHomePageData';
EOF

# ─────────────────────────────────────────────
# app/page.tsx
# Ahora usa features/home.
# ─────────────────────────────────────────────
cat > app/page.tsx <<'EOF'
import { HomePage, getHomePageData } from '@/features/home';
import { AdBanner } from '@/features/ads';

export default async function Home() {
  const data = await getHomePageData();

  return (
    <HomePage
      movies={data.movies}
      afterTrendingSlot={<AdBanner format="horizontal" />}
    />
  );
}
EOF

# ─────────────────────────────────────────────
# app/movies/page.tsx
# Ya no usa MovieGridWithAds de features/ads.
# Usa widget de composición.
# ─────────────────────────────────────────────
cat > app/movies/page.tsx <<'EOF'
import type { MovieFiltersQuery } from '@/entities/movie';
import {
  MoviesPage,
  getMoviesPageData,
  buildMoviesPageMetadata,
} from '@/features/movies-page';
import { parseMovieFiltersFromRecord } from '@/lib/url/movieFilters';
import { AdBanner } from '@/features/ads';
import { CatalogGridWithAds } from '@/widgets/composition/catalog-grid-with-ads';

export const metadata = buildMoviesPageMetadata();

interface MoviesRouteProps {
  searchParams: Promise<MovieFiltersQuery>;
}

export default async function MoviesRoute({
  searchParams,
}: MoviesRouteProps) {
  const rawFilters = await searchParams;
  const filters = parseMovieFiltersFromRecord(rawFilters);
  const pageData = await getMoviesPageData(filters);

  return (
    <MoviesPage
      data={pageData}
      catalogSlot={
        <CatalogGridWithAds
          initialMovies={pageData.initialMovies}
          initialHasMore={pageData.initialHasMore}
          filters={pageData.filters}
        />
      }
      sidebarSlot={
        <aside className="hidden xl:block w-64 flex-shrink-0">
          <div className="sticky top-24 h-[calc(100vh-8rem)]">
            <AdBanner format="skyscraper" />
          </div>
        </aside>
      }
    />
  );
}
EOF

# ─────────────────────────────────────────────
# features/catalog/ui/CatalogMovieCard.tsx
# Ahora guarda scroll solo en navegación principal.
# ─────────────────────────────────────────────
cat > features/catalog/ui/CatalogMovieCard.tsx <<'EOF'
'use client';

import type { MouseEvent } from 'react';
import type { Movie } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';
import { saveGridScrollPosition } from '../lib/gridScrollPersistence';
import { routes } from '@/lib/routes';

interface CatalogMovieCardProps {
  movie: Movie;
}

export default function CatalogMovieCard({
  movie,
}: CatalogMovieCardProps) {
  const handlePrimaryLinkClick = (
    event: MouseEvent<HTMLAnchorElement>
  ) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }

    saveGridScrollPosition(routes.movies);
  };

  return (
    <AppMovieCard
      movie={movie}
      onPrimaryLinkClick={handlePrimaryLinkClick}
    />
  );
}
EOF

# ─────────────────────────────────────────────
# features/catalog/ui/MovieGridSkeleton.tsx
# ─────────────────────────────────────────────
cat > features/catalog/ui/MovieGridSkeleton.tsx <<'EOF'
import { MovieCardSkeleton } from '@/widgets/movie-card';

interface MovieGridSkeletonProps {
  count?: number;
}

export default function MovieGridSkeleton({
  count = 24,
}: MovieGridSkeletonProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <MovieCardSkeleton key={index} />
      ))}
    </div>
  );
}
EOF

# ─────────────────────────────────────────────
# features/search/ui/SearchResults.tsx
# ─────────────────────────────────────────────
cat > features/search/ui/SearchResults.tsx <<'EOF'
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';

interface SearchResultsProps {
  results: Movie[];
}

export default function SearchResults({ results }: SearchResultsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
      {results.map((movie) => (
        <AppMovieCard
          key={getMovieKey(movie)}
          movie={movie}
        />
      ))}
    </div>
  );
}
EOF

# ─────────────────────────────────────────────
# features/actor-detail/ui/ActorFilmography.tsx
# ─────────────────────────────────────────────
cat > features/actor-detail/ui/ActorFilmography.tsx <<'EOF'
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { AppMovieCard } from '@/widgets/movie-card';
import ActorEmptyState from './ActorEmptyState';

interface ActorFilmographyProps {
  movies: Movie[];
  actorName: string;
}

export default function ActorFilmography({
  movies,
  actorName,
}: ActorFilmographyProps) {
  if (!movies || movies.length === 0) {
    return <ActorEmptyState actorName={actorName} />;
  }

  return (
    <>
      <h2 className="text-lg font-semibold text-white mb-6">
        Filmografía
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
        {movies.map((movie) => (
          <AppMovieCard
            key={getMovieKey(movie)}
            movie={movie}
          />
        ))}
      </div>
    </>
  );
}
EOF

# ─────────────────────────────────────────────
# shared/ui/BackButton.tsx
# Shared ya no conoce rutas.
# ─────────────────────────────────────────────
cat > shared/ui/BackButton.tsx <<'EOF'
'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { IconBack } from '@/shared/ui/icons';

interface BackButtonProps {
  fallbackHref: string;
}

export default function BackButton({ fallbackHref }: BackButtonProps) {
  const router = useRouter();
  const [hasHistory, setHasHistory] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      setHasHistory(true);
    }
  }, []);

  const handleBack = () => {
    if (hasHistory) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      onClick={handleBack}
      className="inline-flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
    >
      <IconBack />
      Volver
    </button>
  );
}
EOF

# ─────────────────────────────────────────────
# features/actor-detail/ui/ActorHero.tsx
# Actualizado para usar BackButton con fallback.
# ─────────────────────────────────────────────
cat > features/actor-detail/ui/ActorHero.tsx <<'EOF'
import Image from 'next/image';
import BackButton from '@/shared/ui/BackButton';
import { IconUserPlaceholder } from '@/shared/ui/icons';
import { routes } from '@/lib/routes';
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
        <BackButton fallbackHref={routes.movies} />

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
              {movieCount === 1
                ? 'película disponible'
                : 'películas disponibles'}{' '}
              en el catálogo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
EOF

# ─────────────────────────────────────────────
# lib/scroll/defer.ts
# Scroll restore scopado por ruta.
# ─────────────────────────────────────────────
cat > lib/scroll/defer.ts <<'EOF'
const SCROLL_DEFER_KEY = '__scroll_restore_pending_path';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Marca que una feature quiere controlar el scroll
 * cuando el usuario regrese a una ruta concreta.
 */
export function deferScrollRestore(returnPath: string): void {
  if (!isBrowser()) return;

  try {
    sessionStorage.setItem(SCROLL_DEFER_KEY, returnPath);
  } catch {
    // Si sessionStorage falla, igualmente dejamos que el flujo continúe.
  }
}

/**
 * Consulta si hay una señal pendiente de restauración de scroll
 * para una ruta específica.
 */
export function isScrollRestoreDeferredFor(pathname: string): boolean {
  if (!isBrowser()) return false;

  try {
    return sessionStorage.getItem(SCROLL_DEFER_KEY) === pathname;
  } catch {
    return false;
  }
}

/**
 * Consume la señal pendiente si corresponde a la ruta indicada.
 */
export function consumeScrollRestoreSignal(pathname: string): boolean {
  if (!isScrollRestoreDeferredFor(pathname)) return false;

  try {
    sessionStorage.removeItem(SCROLL_DEFER_KEY);
  } catch {
    // Si no se puede limpiar, igualmente la damos por consumida.
  }

  return true;
}
EOF

# ─────────────────────────────────────────────
# app/providers/ScrollToTop.tsx
# Solo delega scroll si la ruta actual coincide.
# ─────────────────────────────────────────────
cat > app/providers/ScrollToTop.tsx <<'EOF'
'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isScrollRestoreDeferredFor } from '@/lib/scroll/defer';

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (isScrollRestoreDeferredFor(pathname)) {
      return;
    }

    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
EOF

# ─────────────────────────────────────────────
# features/catalog/lib/gridScrollPersistence.ts
# ─────────────────────────────────────────────
cat > features/catalog/lib/gridScrollPersistence.ts <<'EOF'
import { GRID_SCROLL_STORAGE_KEY } from '../config/grid';
import { deferScrollRestore } from '@/lib/scroll/defer';

/**
 * Guarda la posición de scroll actual y marca la señal
 * para que ScrollToTop no intervenga al regresar a la ruta indicada.
 */
export function saveGridScrollPosition(returnPath: string): void {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(
      GRID_SCROLL_STORAGE_KEY,
      String(window.scrollY)
    );
  } catch {
    // Si sessionStorage falla, igualmente marcamos la señal.
  }

  deferScrollRestore(returnPath);
}
EOF

# ─────────────────────────────────────────────
# features/catalog/lib/gridStateStorage.ts
# ─────────────────────────────────────────────
cat > features/catalog/lib/gridStateStorage.ts <<'EOF'
import type { Movie } from '@/entities/movie';
import {
  GRID_SCROLL_STORAGE_KEY,
  GRID_STATE_STORAGE_PREFIX,
} from '../config/grid';
import {
  consumeScrollRestoreSignal,
  isScrollRestoreDeferredFor,
} from '@/lib/scroll/defer';

export interface SavedGridState {
  movies: Movie[];
  hasMore: boolean;
  page: number;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getFilterKey(filters: unknown): string {
  try {
    return JSON.stringify(filters ?? {});
  } catch {
    return '{}';
  }
}

function readRawScrollValue(): string | null {
  try {
    return sessionStorage.getItem(GRID_SCROLL_STORAGE_KEY);
  } catch {
    return null;
  }
}

function removeRawScrollValue(): void {
  try {
    sessionStorage.removeItem(GRID_SCROLL_STORAGE_KEY);
  } catch {
    // Ignorar errores de almacenamiento.
  }
}

/**
 * Consulta si hay scroll pendiente para una ruta,
 * sin consumir la señal global.
 *
 * Esto permite que ScrollToTop todavía pueda verla
 * durante el mismo ciclo de navegación.
 */
export function peekPendingScrollFor(returnPath: string): number | null {
  if (!isBrowser()) return null;

  if (!isScrollRestoreDeferredFor(returnPath)) {
    removeRawScrollValue();
    return null;
  }

  const rawValue = readRawScrollValue();
  if (rawValue === null) return null;

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    removeRawScrollValue();
    return null;
  }

  return parsedValue;
}

/**
 * Consume la señal de scroll pendiente para una ruta
 * y devuelve la posición guardada.
 */
export function consumePendingScrollFor(returnPath: string): number | null {
  if (!isBrowser()) return null;

  const hasPendingSignal = consumeScrollRestoreSignal(returnPath);
  const rawValue = readRawScrollValue();

  if (!hasPendingSignal) {
    removeRawScrollValue();
    return null;
  }

  if (rawValue === null) return null;

  removeRawScrollValue();

  const parsedValue = Number(rawValue);
  if (!Number.isFinite(parsedValue)) {
    return null;
  }

  return parsedValue;
}

export function readSavedGridState(
  filterKey: string
): SavedGridState | null {
  if (!isBrowser()) return null;

  const storageKey = `${GRID_STATE_STORAGE_PREFIX}${filterKey}`;

  try {
    const rawState = sessionStorage.getItem(storageKey);
    if (!rawState) return null;

    const parsedState = JSON.parse(rawState);

    if (
      !parsedState ||
      !Array.isArray(parsedState.movies) ||
      parsedState.movies.length === 0
    ) {
      return null;
    }

    return {
      movies: parsedState.movies as Movie[],
      hasMore: Boolean(parsedState.hasMore),
      page: Number(parsedState.page) || 1,
    };
  } catch {
    sessionStorage.removeItem(storageKey);
    return null;
  }
}

export function writeGridState(
  filterKey: string,
  state: SavedGridState
): void {
  if (!isBrowser()) return;

  const storageKey = `${GRID_STATE_STORAGE_PREFIX}${filterKey}`;

  try {
    sessionStorage.setItem(storageKey, JSON.stringify(state));
  } catch {
    // Silenciar errores de quota de sessionStorage.
  }
}
EOF

# ─────────────────────────────────────────────
# features/catalog/model/useGridScrollRestore.ts
# ─────────────────────────────────────────────
cat > features/catalog/model/useGridScrollRestore.ts <<'EOF'
'use client';

import { useEffect } from 'react';
import {
  peekPendingScrollFor,
  consumePendingScrollFor,
  readSavedGridState,
  type SavedGridState,
} from '../lib/gridStateStorage';
import { SCROLL_RESTORE_DELAY_MS } from '../config/grid';
import { routes } from '@/lib/routes';

/**
 * Responsabilidad única:
 * restaurar scroll y estado guardado del grid
 * cuando el usuario regresa al catálogo.
 */
export function useGridScrollRestore(
  filterKey: string,
  restoreState: (state: SavedGridState) => void
) {
  useEffect(() => {
    const returnPath = routes.movies;
    const savedScroll = peekPendingScrollFor(returnPath);

    if (savedScroll === null) return;

    const savedState = readSavedGridState(filterKey);

    if (!savedState) {
      consumePendingScrollFor(returnPath);
      return;
    }

    restoreState(savedState);

    const timeout = setTimeout(() => {
      window.scrollTo(0, savedScroll);
      consumePendingScrollFor(returnPath);
    }, SCROLL_RESTORE_DELAY_MS);

    return () => clearTimeout(timeout);
  }, [filterKey, restoreState]);
}
EOF

# ─────────────────────────────────────────────
# types/index.ts
# Compatibilidad deprecada.
# ─────────────────────────────────────────────
cat > types/index.ts <<'EOF'
/**
 * @deprecated
 *
 * Este archivo existe solo como capa de compatibilidad temporal.
 *
 * Los tipos de dominio deben importarse desde sus entidades:
 * - @/entities/movie
 * - @/entities/category
 * - @/entities/person
 */
export type { Movie, Server } from '@/entities/movie/types/movie';
export type { Category } from '@/entities/category/types';
export type { Actor, Director, Person } from '@/entities/person/types';
EOF

# ─────────────────────────────────────────────
# Actualizar MovieHero para BackButton con fallback
# ─────────────────────────────────────────────
if [ -f features/movie-detail/ui/MovieHero.tsx ]; then
  perl -pi -e 's#<BackButton />#<BackButton fallbackHref={routes.movies} />#g' features/movie-detail/ui/MovieHero.tsx
fi

# ─────────────────────────────────────────────
# Eliminar archivos antiguos
# ─────────────────────────────────────────────
rm -f entities/movie/ui/MovieCard.tsx
rm -f entities/movie/ui/MovieCardCategoryLink.tsx
rm -f entities/movie/ui/MovieCardSkeleton.tsx
rmdir entities/movie/ui 2>/dev/null || true

rm -f widgets/MovieCard/AppMovieCard.tsx
rmdir widgets/MovieCard 2>/dev/null || true

rm -f features/ads/ui/MovieGridWithAds.tsx

echo ""
echo "Refactor Fase 1 aplicado."
echo "Ahora ejecuta: npm run build"