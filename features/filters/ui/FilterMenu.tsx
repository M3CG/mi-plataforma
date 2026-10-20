// features/filters/ui/FilterMenu.tsx
'use client';

import type { Category } from '@/entities/category';
import { useMovieFilters } from '../model/useMovieFilters';
import { useScrollCollapse } from '../model/useScrollCollapse';
import { useStickySentinel } from '../model/useStickySentinel';
import GenreFilter from './GenreFilter';
import RatingFilter from './RatingFilter';
import CountryFilter from './CountryFilter';
import YearRangeFilter from './YearRangeFilter';
import RuntimeRangeFilter from './RuntimeRangeFilter';
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
    fromRuntime,
    toRuntime,
    hasRuntimeFilter,
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
    applyRuntimeRange,
    removeRuntime,
    clearFilters,
  } = useMovieFilters();

  const { ref: sentinelRef, isStuck } = useStickySentinel<HTMLDivElement>();
  const isCollapsed = useScrollCollapse();

  return (
    <>
      <div ref={sentinelRef} className="h-px" aria-hidden="true" />

      <div className="sticky top-16 z-30 -mx-4 md:-mx-8 px-4 md:px-8 pb-4">
        <div
          className={`bg-[#000F20]/80 backdrop-blur-xl border border-white/5 shadow-2xl shadow-black/20 transition-all duration-300 ${
            isStuck
              ? 'rounded-b-2xl rounded-t-none border-t-0'
              : 'rounded-2xl'
          }`}
        >
          <div
            className="relative z-10 duration-300 ease-in-out"
            style={{
              maxHeight: isCollapsed ? '0px' : '260px',
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed
                ? 'translateY(-8px)'
                : 'translateY(0)',
              pointerEvents: isCollapsed ? 'none' : 'auto',
              transitionProperty: 'max-height, opacity, transform',
            }}
          >
            <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-3 lg:flex lg:flex-wrap lg:items-center">
              <GenreFilter
                categories={categories}
                activeGenres={activeGenres}
                onToggleGenre={toggleGenre}
                forceClose={isCollapsed}
              />
              <RatingFilter
                value={minRating}
                onChange={setRating}
                forceClose={isCollapsed}
              />
              <CountryFilter
                countries={countries}
                value={country}
                onChange={setCountry}
                forceClose={isCollapsed}
              />

              <YearRangeFilter
                fromYear={fromYear}
                toYear={toYear}
                onApply={applyYearRange}
                className="col-span-3"
              />

              <RuntimeRangeFilter
                fromRuntime={fromRuntime}
                toRuntime={toRuntime}
                onApply={applyRuntimeRange}
                className="col-span-3"
              />

              <div className="hidden lg:block flex-1 min-w-4" />

              <SortFilter
                value={sort}
                onChange={setSort}
                forceClose={isCollapsed}
                className="col-span-3 lg:col-span-auto"
              />
            </div>
          </div>

          <ActiveFiltersBar
            categories={categories}
            activeGenres={activeGenres}
            minRating={minRating}
            country={country}
            fromYear={fromYear}
            toYear={toYear}
            hasYearFilter={hasYearFilter}
            fromRuntime={fromRuntime}
            toRuntime={toRuntime}
            hasRuntimeFilter={hasRuntimeFilter}
            filterCount={filterCount}
            onRemoveGenre={removeGenre}
            onRemoveRating={removeRating}
            onRemoveCountry={removeCountry}
            onRemoveYear={removeYear}
            onRemoveRuntime={removeRuntime}
            onClearAll={clearFilters}
          />
        </div>
      </div>
    </>
  );
}
