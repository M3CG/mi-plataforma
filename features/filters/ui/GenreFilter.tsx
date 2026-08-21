// features/filters/ui/GenreFilter.tsx
'use client';

import type { Category } from '@/entities/category';
import DropdownMenu from './DropdownMenu';
import { IconFilm } from '@/shared/ui/icons';

interface GenreFilterProps {
  categories: Category[];
  activeGenres: string[];
  onToggleGenre: (slug: string) => void;
  forceClose?: boolean;
}

export default function GenreFilter({
  categories,
  activeGenres,
  onToggleGenre,
  forceClose = false,
}: GenreFilterProps) {
  const genresLabel =
    activeGenres.length === 0
      ? 'Género'
      : activeGenres.length === 1
      ? categories.find((category) => category.slug === activeGenres[0])
          ?.name || '1 Género'
      : `${activeGenres.length} Géneros`;

  return (
    <DropdownMenu
      id="genres"
      icon={<IconFilm />}
      label="Género"
      currentLabel={genresLabel}
      isActive={activeGenres.length > 0}
      closeOnSelect={false}
      forceClose={forceClose}
    >
      <div className="w-80 bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-2xl shadow-black/40">
        <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onToggleGenre(category.slug)}
              aria-pressed={activeGenres.includes(category.slug)}
              className={`px-3 py-1.5 text-xs rounded-full font-medium transition-all duration-150 border ${
                activeGenres.includes(category.slug)
                  ? 'bg-red-600/80 border-red-500/30 text-white shadow-md shadow-red-900/20'
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </DropdownMenu>
  );
}
