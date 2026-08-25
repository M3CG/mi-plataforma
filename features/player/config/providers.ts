// features/player/config/providers.ts

export interface EmbedProvider {
  name: string;
  baseUrl: string;
  /**
   * - string:    se usa como valor del atributo sandbox.
   * - false:     se renderiza el iframe sin sandbox.
   * - undefined: se usa el sandbox por defecto (definido en sandbox-policy.ts).
   *
   * Nota: todos los providers dinámicos actuales requieren sandbox: false
   * porque dependen de APIs del navegador que el sandbox restringe.
   * La política DEFAULT_SANDBOX sigue disponible en sandbox-policy.ts
   * para cualquier provider futuro que sí pueda correr aislado.
   */
  sandbox?: string | false;
}

export const EMBED_PROVIDERS: EmbedProvider[] = [
  {
    name: 'VidSrc',
    baseUrl:
      process.env.NEXT_PUBLIC_VIDSRC_URL || 'https://vidsrc.to/embed/movie/',
    sandbox: false,
  },
  {
    name: 'VidLink',
    baseUrl:
      process.env.NEXT_PUBLIC_VIDLINK_URL || 'https://vidlink.pro/movie/',
    sandbox: false,
  },
  {
    name: 'VidEasy',
    baseUrl:
      process.env.NEXT_PUBLIC_VIDEASY_URL || 'https://player.videasy.to/movie/',
    sandbox: false,
  },
  {
    name: 'MoviesApi',
    baseUrl:
      process.env.NEXT_PUBLIC_MOVIESAPI_URL || 'https://moviesapi.to/movie/',
    sandbox: false,
  },
  {
    name: 'Mapple',
    baseUrl:
      process.env.NEXT_PUBLIC_MAPPLE_URL || 'https://mapple.uk/watch/movie/',
    sandbox: false,
  },
  {
    name: 'VidZee',
    baseUrl:
      process.env.NEXT_PUBLIC_VIDZEE_URL ||
      'https://player.vidzee.wtf/embed/movie/',
    sandbox: false,
  },
];
