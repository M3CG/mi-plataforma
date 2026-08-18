// features/filters/ui/FilterMenu.tsx
'use client';

import { Category } from '@/types';

import { useMovieFilters } from '../model/useMovieFilters';
import { useScrollCollapse } from '../model/useScrollCollapse';
import { useStickySentinel } from '../model/useStickySentinel';

import GenreFilter from './GenreFilter';
import RatingFilter from './RatingFilter';
import CountryFilter from './CountryFilter';
import YearRangeFilter from './YearRangeFilter';
import SortFilter from './SortFilter';
import ActiveFiltersBar from './ActiveFiltersBar';

export interface FilterMenuProps {
  categories: Category[];
  countries: string[];
}

export default function FilterMenu({
  categories,
  countries,
}: FilterMenuProps) {
  const {
    activeGenres,
    minRating,
    country,
    sort,
    fromYear,
    toYear,
    hasYearFilter,
    filterCount,

    toggleGenre,
    removeGenre,

    setRating,
    removeRating,

    setCountry,
    removeCountry,

    setSort,

    applyYearRange,
    removeYear,

    clearFilters,
  } = useMovieFilters();

  const { ref: sentinelRef, isStuck } = useStickySentinel<HTMLDivElement>();
  const isCollapsed = useScrollCollapse();

  return (
    <>
      {/* Sentinel para detectar cuándo el menú está "pegado" al header */}
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      <div className="sticky top-16 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pb-4">
        <div
          className={`bg-gray-950/80 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/20 transition-all duration-300 ${
            isStuck
              ? 'rounded-b-2xl rounded-t-none border-t-0'
              : 'rounded-2xl'
          }`}
        >
          {/* ═══ SECCIÓN COLAPSABLE: CONTROLES DE FILTRO ═══ */}
          <div
            className="transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isCollapsed ? '0px' : '400px',
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateY(-8px)' : 'translateY(0)',
              pointerEvents: isCollapsed ? 'none' : 'auto',
            }}
          >
            <div className="flex flex-wrap items-center gap-3 px-5 pt-5 pb-4">
              <GenreFilter
                categories={categories}
                activeGenres={activeGenres}
                onToggleGenre={toggleGenre}
              />

              <RatingFilter value={minRating} onChange={setRating} />

              <CountryFilter
                countries={countries}
                value={country}
                onChange={setCountry}
              />

              <YearRangeFilter
                fromYear={fromYear}
                toYear={toYear}
                onApply={applyYearRange}
              />

              {/* Spacer */}
              <div className="flex-1" />

              <SortFilter value={sort} onChange={setSort} />
            </div>
          </div>

          {/* ═══ SECCIÓN SIEMPRE VISIBLE: FILTROS ACTIVOS ═══ */}
          <ActiveFiltersBar
            categories={categories}
            activeGenres={activeGenres}
            minRating={minRating}
            country={country}
            fromYear={fromYear}
            toYear={toYear}
            hasYearFilter={hasYearFilter}
            filterCount={filterCount}
            onRemoveGenre={removeGenre}
            onRemoveRating={removeRating}
            onRemoveCountry={removeCountry}
            onRemoveYear={removeYear}
            onClearAll={clearFilters}
          />
        </div>
      </div>
    </>
  );
}