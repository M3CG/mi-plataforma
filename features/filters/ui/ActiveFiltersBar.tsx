// features/filters/ui/ActiveFiltersBar.tsx
'use client';
import type { Category } from '@/entities/category';
import {
  IconCalendar,
  IconClock,
  IconClose,
  IconFilm,
  IconGlobe,
  IconStar,
  IconTrash,
} from '@/shared/ui/icons';
import {
  RATING_OPTIONS,
  YEAR_MIN,
  YEAR_MAX,
  RUNTIME_MIN,
  RUNTIME_MAX,
} from '../config/options';

interface ActiveFiltersBarProps {
  categories: Category[];
  activeGenres: string[];
  minRating: string | null;
  country: string | null;
  fromYear: number | null;
  toYear: number | null;
  hasYearFilter: boolean;
  fromRuntime: number | null;
  toRuntime: number | null;
  hasRuntimeFilter: boolean;
  filterCount: number;
  onRemoveGenre: (slug: string) => void;
  onRemoveRating: () => void;
  onRemoveCountry: () => void;
  onRemoveYear: () => void;
  onRemoveRuntime: () => void;
  onClearAll: () => void;
}

export default function ActiveFiltersBar({
  categories,
  activeGenres,
  minRating,
  country,
  fromYear,
  toYear,
  hasYearFilter,
  fromRuntime,
  toRuntime,
  hasRuntimeFilter,
  filterCount,
  onRemoveGenre,
  onRemoveRating,
  onRemoveCountry,
  onRemoveYear,
  onRemoveRuntime,
  onClearAll,
}: ActiveFiltersBarProps) {
  if (filterCount === 0) return null;

  const ratingLabel =
    RATING_OPTIONS.find((option) => option.value === minRating)?.label ||
    minRating;

  const displayFromYear = fromYear ?? YEAR_MIN;
  const displayToYear = toYear ?? YEAR_MAX;

  const displayFromRuntime = fromRuntime ?? RUNTIME_MIN;
  const displayToRuntime = toRuntime ?? RUNTIME_MAX;

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-t border-white/5">
      {activeGenres.map((slug) => {
        const category = categories.find((item) => item.slug === slug);
        if (!category) return null;
        return (
          <button
            key={slug}
            onClick={() => onRemoveGenre(slug)}
            aria-label={`Quitar filtro ${category.name}`}
            title={`Quitar ${category.name}`}
            className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/30 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all duration-150"
          >
            <IconFilm className="w-3 h-3 opacity-60" />
            {category.name}
            <IconClose className="w-2.5 h-2.5 opacity-60" />
          </button>
        );
      })}

      {minRating && (
        <button
          onClick={onRemoveRating}
          aria-label={`Quitar filtro de puntuación ${ratingLabel}`}
          title={`Quitar puntuación ${ratingLabel}`}
          className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/30 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all duration-150"
        >
          <IconStar className="w-3 h-3 opacity-60" />
          {ratingLabel}
          <IconClose className="w-2.5 h-2.5 opacity-60" />
        </button>
      )}

      {country && (
        <button
          onClick={onRemoveCountry}
          aria-label={`Quitar filtro de país ${country}`}
          title={`Quitar ${country}`}
          className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/30 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all duration-150"
        >
          <IconGlobe className="w-3 h-3 opacity-60" />
          {country}
          <IconClose className="w-2.5 h-2.5 opacity-60" />
        </button>
      )}

      {hasYearFilter && (
        <button
          onClick={onRemoveYear}
          aria-label="Quitar filtro de año"
          title={`Quitar ${displayFromYear} - ${displayToYear}`}
          className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/30 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all duration-150"
        >
          <IconCalendar className="w-3 h-3 opacity-60" />
          {displayFromYear} - {displayToYear}
          <IconClose className="w-2.5 h-2.5 opacity-60" />
        </button>
      )}

      {hasRuntimeFilter && (
        <button
          onClick={onRemoveRuntime}
          aria-label="Quitar filtro de duración"
          title={`Quitar ${displayFromRuntime} - ${displayToRuntime} min`}
          className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-red-600/20 hover:border-red-500/30 text-gray-300 hover:text-white text-xs px-3 py-1.5 rounded-full transition-all duration-150"
        >
          <IconClock className="w-3 h-3 opacity-60" />
          {displayFromRuntime} - {displayToRuntime} min
          <IconClose className="w-2.5 h-2.5 opacity-60" />
        </button>
      )}

      <button
        onClick={onClearAll}
        aria-label="Limpiar filtros activos"
        title="Limpiar filtros activos"
        className="flex items-center gap-1.5 ml-auto bg-red-950/40 border border-red-800/30 text-red-400 hover:bg-red-600/80 hover:text-white hover:border-red-500/30 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150"
      >
        <IconTrash />
        <span className="hidden sm:inline">Limpiar {filterCount}</span>
      </button>
    </div>
  );
}
