// entities/movie/types/movie.ts
import type { Category } from '@/entities/category/types';
import type { Actor, Director } from '@/entities/person/types';

export interface Server {
  id: number | string;
  name: string;
  url: string;
  language?: string;
  quality?: string;
  subtitles?: boolean;
}

export interface Movie {
  id: number;
  documentId: string;
  title: string;
  english_title?: string;
  spanish_title?: string;
  slug: string;
  synopsis: string;
  english_synopsis?: string;
  spanish_synopsis?: string;
  year: number;
  rating: number;
  country: string;
  tmdb_id: number;
  views?: number;
  featured_this_week?: boolean;
  poster_url?: string;
  backdrop_url?: string;
  trailer_url?: string;
  runtime?: number;
  age_rating?: string;
  original_language?: string;
  servers?: Server[];
  categories?: Category[];
  actors?: Actor[];
  directors?: Director[];
}