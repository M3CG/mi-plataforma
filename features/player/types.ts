// features/player/types.ts

export type LoadStatus =
  | 'idle'
  | 'loading'
  | 'loaded'
  | 'timeout';

export interface PlayableSource {
  id: string;
  name: string;
  url: string;

  /**
   * - string: se usa como valor del atributo sandbox.
   * - false: se renderiza el iframe sin sandbox.
   * - undefined: se usa el sandbox por defecto.
   */
  sandbox?: string | false;
}