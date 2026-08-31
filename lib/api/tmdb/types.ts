// lib/api/tmdb/types.ts
export interface TmdbGenre {
  id: number;
  name: string;
}

export interface TmdbSearchMovieItem {
  id: number;
  title: string;
  original_title: string;
  overview?: string;
  release_date?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  original_language?: string;
}

export interface TmdbSearchPersonItem {
  id: number;
  name: string;
  known_for_department?: string;
  profile_path?: string | null;
  popularity?: number;
}

export interface TmdbTranslationData {
  title?: string;
  overview?: string;
}

export interface TmdbTranslation {
  iso_639_1: string;
  iso_3166_1: string;
  name?: string;
  data?: TmdbTranslationData;
}

export interface TmdbCast {
  id: number;
  name: string;
  character?: string;
  profile_path?: string | null;
}

export interface TmdbCrew {
  id: number;
  name: string;
  job?: string;
  profile_path?: string | null;
}

export interface TmdbVideo {
  key: string;
  site?: string;
  type?: string;
  iso_639_1?: string;
}

export interface TmdbReleaseDate {
  certification?: string;
}

export interface TmdbReleaseCountry {
  iso_3166_1: string;
  release_dates?: TmdbReleaseDate[];
}

export interface TmdbImage {
  file_path: string;
  width?: number;
  height?: number;
  iso_639_1?: string | null;
  vote_average?: number;
}

export interface TmdbMovieDetail {
  id: number;
  title: string;
  original_title: string;
  original_language?: string;
  overview?: string;
  release_date?: string;
  runtime?: number;
  vote_average?: number;
  poster_path?: string | null;
  backdrop_path?: string | null;
  imdb_id?: string | null;
  adult?: boolean;
  genres?: TmdbGenre[];
  production_countries?: Array<{ iso_3166_1: string; name: string }>;
  translations?: { translations?: TmdbTranslation[] };
  credits?: { cast?: TmdbCast[]; crew?: TmdbCrew[] };
  videos?: { results?: TmdbVideo[] };
  release_dates?: { results?: TmdbReleaseCountry[] };
  images?: { posters?: TmdbImage[]; backdrops?: TmdbImage[] };
}

export interface TmdbPersonDetail {
  id: number;
  name: string;
  known_for_department?: string;
  biography?: string;
  profile_path?: string | null;
  images?: { profiles?: TmdbImage[] };
}

// ─── Filmografía ───
export interface TmdbFilmographyMovie {
  id: number;
  title: string;
  original_title: string;
  release_date?: string;
  poster_path?: string | null;
  vote_average?: number;
  overview?: string;
  character?: string;
  job?: string;
}

export interface TmdbPersonMovieCredits {
  cast?: TmdbFilmographyMovie[];
  crew?: TmdbFilmographyMovie[];
}

// ─── Previews ───
export interface PosterOption {
  url: string;
  textless: boolean;
  width?: number;
  height?: number;
}

export interface TmdbMoviePreview {
  tmdbId: number;
  imdbId?: string;
  originalTitle: string;
  englishTitle?: string;
  spanishTitle?: string;
  mainSynopsis: string;
  englishSynopsis?: string;
  spanishSynopsis?: string;
  year: number;
  rating: number;
  runtime?: number;
  country?: string;
  originalLanguage?: string;
  ageRating?: string;
  trailerUrl?: string;
  genres: Array<{ tmdbId: number; name: string }>;
  cast: Array<{
    tmdbId: number;
    name: string;
    character?: string;
    profileImageUrl?: string;
  }>;
  directors: Array<{
    tmdbId: number;
    name: string;
    profileImageUrl?: string;
  }>;
  defaultPosterUrl?: string;
  defaultBackdropUrl?: string;
  posters: PosterOption[];
}

export interface TmdbPersonPreview {
  tmdbId: number;
  name: string;
  knownForDepartment?: string;
  biography?: string;
  defaultProfileUrl?: string;
  profiles: Array<{ url: string }>;
}
