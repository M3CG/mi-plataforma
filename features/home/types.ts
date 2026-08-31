import type { Movie } from '@/entities/movie';

export interface HomeHeroData {
  /** 6 últimos estrenos para el hero rotativo + cinta */
  heroMovies: Movie[];
  /** 10 recién llegadas (tira minimalista) */
  latestMovies: Movie[];
}

export interface HomeRankingsData {
  /** 10 más vistas */
  mostViewedMovies: Movie[];
  /** 10 mejores puntuadas de todos los tiempos */
  bestOfAllTimeMovies: Movie[];
}

/** Compat hacia atrás (páginas o tools que pidan todo junto). */
export interface HomePageData extends HomeHeroData, HomeRankingsData {}
