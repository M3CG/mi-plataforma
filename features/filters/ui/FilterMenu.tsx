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
            className="relative z-10 transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isCollapsed ? '0px' : '400px',
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateY(-8px)' : 'translateY(0)',
              pointerEvents: isCollapsed ? 'none' : 'auto',
            }}
          >
            {/*
              Layout responsive:
              - Mobile (< lg): Grid de 3 columnas
                · Fila 1: Género | Puntuación | País
                · Fila 2: Año (col-span-3)
                · Fila 3: Duración (col-span-3)
                · Fila 4: Ordenar (col-span-3)
              - Desktop (lg+): Flex wrap clásico
            */}
            <div className="grid grid-cols-3 gap-2 px-4 pt-4 pb-3 lg:flex lg:flex-wrap lg:items-center">
              {/* ─── Fila 1: Género, Puntuación, País ─── */}
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

              {/* ─── Fila 2: Año (full width en mobile) ─── */}
              <YearRangeFilter
                fromYear={fromYear}
                toYear={toYear}
                onApply={applyYearRange}
                className="col-span-3"
              />

              {/* ─── Fila 3: Duración (full width en mobile) ─── */}
              <RuntimeRangeFilter
                fromRuntime={fromRuntime}
                toRuntime={toRuntime}
                onApply={applyRuntimeRange}
                className="col-span-3"
              />

              {/* Spacer: solo visible en desktop para empujar Sort a la derecha */}
              <div className="hidden lg:block flex-1 min-w-4" />

              {/* ─── Fila 4: Ordenar (full width en mobile) ─── */}
              <SortFilter
                value={sort}
                onChange={setSort}
                forceClose={isCollapsed}
                className="col-span-3 lg:col-span-auto"
              />
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