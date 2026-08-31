// features/admin-import/types.ts
export type ImportStatus = 'idle' | 'saving' | 'success' | 'error';

export interface AdminSearchMovieResult {
  tmdbId: number;
  title: string;
  originalTitle?: string;
  year?: number;
  posterUrl?: string;
  rating?: number;
  overview?: string;
  originalLanguage?: string;
  inDatabase?: boolean;
}

export interface AdminSearchPersonResult {
  tmdbId: number;
  name: string;
  knownForDepartment?: string;
  profileUrl?: string;
  popularity?: number;
}

export interface PosterOption {
  url: string;
  textless: boolean;
  width?: number;
  height?: number;
}

export interface SlugCandidate {
  slug: string;
  source: string;
  recommended: boolean;
  taken: boolean;
}

export interface MoviePreview {
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

export interface PersonPreview {
  tmdbId: number;
  name: string;
  knownForDepartment?: string;
  biography?: string;
  defaultProfileUrl?: string;
  profiles: Array<{ url: string }>;
}

// ─── Filmografía ───
export interface FilmographyMovie {
  tmdbId: number;
  title: string;
  originalTitle: string;
  year?: number;
  posterUrl?: string;
  rating: number;
  overview: string;
  role: string;
  inDatabase: boolean;
}
