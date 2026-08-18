// features/navigation/ui/HeaderNavigation.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHome, IconFilm } from '@/shared/ui/icons';
import { NAV_LINKS, type NavLink } from '../config/nav-links';
import { routes } from '@/lib/routes';

const ICON_MAP: Record<string, React.ReactNode> = {
  [routes.home]: <IconHome />,
  [routes.movies]: <IconFilm />,
};

function isActive(pathname: string, href: string): boolean {
  if (href === routes.home) return pathname === routes.home;

  return pathname.startsWith(href);
}

function NavLinkItem({
  link,
  active,
  compact = false,
}: {
  link: NavLink;
  active: boolean;
  compact?: boolean;
}) {
  const baseClasses = compact
    ? 'flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200'
    : 'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200';

  const stateClasses = active
    ? 'bg-white/10 text-white'
    : 'text-gray-400 hover:text-white hover:bg-white/5';

  return (
    <Link
      href={link.href}
      title={link.title}
      aria-label={link.title}
      aria-current={active ? 'page' : undefined}
      className={`${baseClasses} ${stateClasses}`}
    >
      {ICON_MAP[link.href]}
      {!compact && <span>{link.label}</span>}
    </Link>
  );
}

export default function HeaderNavigation() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop */}
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Navegación principal"
      >
        {NAV_LINKS.map((link) => (
          <NavLinkItem
            key={link.href}
            link={link}
            active={isActive(pathname, link.href)}
          />
        ))}
      </nav>

      {/* Mobile (solo iconos) */}
      <nav
        className="flex md:hidden items-center gap-1"
        aria-label="Navegación principal"
      >
        {NAV_LINKS.map((link) => (
          <NavLinkItem
            key={link.href}
            link={link}
            active={isActive(pathname, link.href)}
            compact
          />
        ))}
      </nav>
    </>
  );
}