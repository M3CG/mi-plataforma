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
