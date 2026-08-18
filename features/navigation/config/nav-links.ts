// features/navigation/config/nav-links.ts

import { routes } from '@/lib/routes';

export interface NavLink {
  label: string;
  href: string;
  title: string;
}

export const NAV_LINKS: NavLink[] = [
  {
    label: 'Inicio',
    href: routes.home,
    title: 'Ir a la página principal',
  },
  {
    label: 'Películas',
    href: routes.movies,
    title: 'Explorar catálogo de películas',
  },
];