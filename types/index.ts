// types/index.ts

/**
 * Cap de compatibilidad hacia afuera.
 *
 * Los tipos de dominio ahora pertenecen a sus entidades:
 * - Movie / Server → entities/movie
 * - Category → entities/category
 * - Actor / Director / Person → entities/person
 *
 * Este archivo solo re-exporta para no romper imports existentes.
 */
export type { Movie, Server } from '@/entities/movie/types/movie';
export type { Category } from '@/entities/category/types';
export type { Actor, Director, Person } from '@/entities/person/types';