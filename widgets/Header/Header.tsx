// components/Header.tsx
'use client';

import Link from 'next/link';
import { IconPlay } from '@/shared/ui/icons';
import { HeaderNavigation } from '@/features/navigation';
import { SearchBar } from '@/features/search';
import { routes } from '@/lib/routes';

export default function Header() {
  return (
    <header className="bg-gray-950/80 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 h-16 border-b border-white/5">
      <div className="container mx-auto px-4 md:px-8 h-full flex items-center justify-between gap-4">
        {/* ─── LOGO ─── */}
        <Link
          href={routes.home}
          className="flex items-center gap-2.5 group flex-shrink-0"
          title="CineStream - Home page"
          aria-label="CineStream, go to the home page"
        >
          <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center group-hover:bg-red-500 transition-colors shadow-lg shadow-red-600/25">
            <IconPlay className="w-4 h-4 text-white ml-0.5" />
          </div>

          <span className="text-lg font-bold tracking-wide text-white hidden sm:block">
            CINE<span className="text-red-500">STREAM</span>
          </span>
        </Link>

        {/* ─── NAVEGACIÓN ─── */}
        <HeaderNavigation />

        {/* ─── BÚSQUEDA ─── */}
        <SearchBar />
      </div>
    </header>
  );
}