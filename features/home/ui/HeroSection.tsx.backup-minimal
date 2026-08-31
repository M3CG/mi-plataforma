import Image from 'next/image';
import Link from 'next/link';
import type { Movie } from '@/entities/movie';
import { routes } from '@/lib/routes';
import { IconPlay, IconStar } from '@/shared/ui/icons';

interface HeroSectionProps {
  movie: Movie;
}

export default function HeroSection({ movie }: HeroSectionProps) {
  const backdrop = movie.backdrop_url || movie.poster_url;

  return (
    <section className="relative h-[72vh] min-h-[480px] w-full overflow-hidden">
      {backdrop && (
        <Image
          src={backdrop}
          alt=""
          fill
          priority
          quality={85}
          sizes="100vw"
          className="object-cover object-top"
        />
      )}

      {/*
        Degradados cinematográficos.
        Usamos #0a0a0a porque es el fondo real de la página
        (globals.css -> --background). Así el hero se funde
        de forma seamless con el resto del inicio.
      */}

      {/* Vertical: sólido abajo, se desvanece hacia arriba */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />

      {/* Horizontal: oscurece el lado izquierdo para legibilidad del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/85 via-[#0a0a0a]/30 to-transparent" />

      {/* Sutil refuerzo superior para integrar con el header fijo */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-[#0a0a0a]/70 to-transparent" />

      <div className="relative z-10 flex h-full items-end">
        <div className="container mx-auto px-4 md:px-8 pb-20">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight drop-shadow-lg">
              {movie.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 mt-4 text-sm">
              {movie.rating > 0 && (
                <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                  <IconStar className="w-4 h-4" />
                  {movie.rating.toFixed(1)}
                </span>
              )}
              {movie.year > 0 && (
                <span className="text-gray-300">{movie.year}</span>
              )}
              {movie.age_rating && (
                <span className="border border-white/30 text-gray-200 text-xs px-2 py-0.5 rounded">
                  {movie.age_rating}
                </span>
              )}
            </div>

            {movie.synopsis && (
              <p className="mt-4 text-gray-200 text-sm md:text-base leading-relaxed line-clamp-3 max-w-xl">
                {movie.synopsis}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href={routes.movie(movie.slug)}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-all duration-200 shadow-lg shadow-red-600/30 hover:-translate-y-0.5"
              >
                <IconPlay className="w-5 h-5" />
                Ver ahora
              </Link>
              <Link
                href={routes.movie(movie.slug)}
                className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 text-white font-medium px-6 py-3 rounded-full transition-all duration-200"
              >
                Más información
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
