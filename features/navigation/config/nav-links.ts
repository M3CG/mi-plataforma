// features/navigation/config/nav-links.ts

import { routes } from '@/lib/routes';

export interface NavLink {
  label: string;
  href: string;
  title: string;
}

export const NAV_LINKS: NavLink[] = [
  {
    label: 'Home',
    href: routes.home,
    title: 'Go to the home page',
  },
  {
    label: 'Movies',
    href: routes.movies,
    title: 'Browse the movie catalog',
  },
];