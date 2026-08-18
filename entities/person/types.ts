// entities/person/types.ts

/**
 * Persona base del dominio.
 *
 * Actor y Director son roles de una misma entidad de negocio: Person.
 * Esto evita duplicar tipos idénticos.
 */
export interface Person {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  profile_image_url?: string;
}

export type Actor = Person;
export type Director = Person;