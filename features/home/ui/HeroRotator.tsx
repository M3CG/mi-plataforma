'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '@/entities/movie';
import { getMovieKey } from '@/entities/movie';
import { routes } from '@/lib/routes';
import { IconPlay, IconStar } from '@/shared/ui/icons';

interface HeroRotatorProps {
  movies: Movie[];
  currentIndex: number;
}

export default function HeroRotator({
  movies,
  currentIndex,
}: HeroRotatorProps) {
  if (movies.length === 0) return null;

  return (
    <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden">
      {movies.map((movie, idx) => {
        const backdrop = movie.backdrop_url || movie.poster_url;
        const isActive = idx === currentIndex;

        return (
          <div
            key={getMovieKey(movie)}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
            aria-hidden={!isActive}
          >
            {backdrop && (
              <Image
                src={backdrop}
                alt=""
                fill
                priority={idx === 0}
                quality={80}
                sizes="100vw"
                className="object-cover object-top"
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/50 to-[#0a0a0a]/20" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />

            <div className="relative z-10 flex h-full items-end">
              <div className="container mx-auto px-4 md:px-8 pb-12 md:pb-16">
                <div className="max-w-2xl">
                  <h1 className="text-3xl md:text-5xl font-extralight text-white leading-[1.05] tracking-tight">
                    {movie.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-4 text-sm text-gray-400">
                    <span>{movie.year}</span>
                    {movie.rating > 0 && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="flex items-center gap-1 text-amber-400/90">
                          <IconStar className="w-3.5 h-3.5" />
                          {movie.rating.toFixed(1)}
                        </span>
                      </>
                    )}
                    {movie.age_rating && (
                      <>
                        <span className="text-gray-700">·</span>
                        <span className="border border-white/15 rounded px-1.5 py-0.5 text-[11px] text-gray-400">
                          {movie.age_rating}
                        </span>
                      </>
                    )}
                  </div>

                  {movie.synopsis && (
                    <p className="mt-4 text-sm md:text-[15px] text-gray-400 leading-relaxed line-clamp-2 max-w-xl">
                      {movie.synopsis}
                    </p>
                  )}

                  <div className="mt-5 flex items-center gap-5">
                    <Link
                      href={routes.movie(movie.slug)}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
                    >
                      <IconPlay className="w-4 h-4" />
                      Watch now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </section>
  );
}