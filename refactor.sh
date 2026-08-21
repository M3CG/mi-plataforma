#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

log()  { echo -e "${GREEN}✓${NC} $1"; }
info() { echo -e "${CYAN}→${NC} $1"; }

write_file() {
  local path="$1"
  mkdir -p "$(dirname "$path")"
  cat > "$path"
  log "  $path"
}

echo ""
echo "═══════════════════════════════════════════════════════"
echo "  UX: Dropdowns inteligentes + Tooltip Sinopsis"
echo "═══════════════════════════════════════════════════════"
echo ""

# ═══════════════════════════════════════════════════════
# 1. globals.css — Agregar clase para tooltip de sinopsis
# ═══════════════════════════════════════════════════════
info "1/7: globals.css — clase para tooltip con delay asimétrico"

# Agregar bloque de tooltip al final de globals.css
cat >> app/globals.css << 'EOF'

/* ═══ Tooltip de sinopsis (delay asimétrico) ═══ */
/* Aparece con 500ms de delay, desaparece instantáneamente */
.synopsis-tooltip {
  opacity: 0;
  transition: opacity 300ms ease 0ms;
  pointer-events: none;
}
.group:hover .synopsis-tooltip {
  opacity: 1;
  transition: opacity 300ms ease 500ms;
}
EOF

log "  app/globals.css actualizado"

# ═══════════════════════════════════════════════════════
# 2. DropdownMenu.tsx — hover close + forceClose
# ═══════════════════════════════════════════════════════
info "2/7: DropdownMenu — cierre por hover + forceClose"

write_file "features/filters/ui/DropdownMenu.tsx" << 'EOF'
// features/filters/ui/DropdownMenu.tsx
'use client';

import { ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { IconChevron } from '@/shared/ui/icons';

interface DropdownMenuProps {
  id: string;
  icon: ReactNode;
  label: string;
  currentLabel: string;
  isActive: boolean;
  align?: 'left' | 'right';
  closeOnSelect?: boolean;
  /** Fuerza el cierre del dropdown (ej: cuando la barra se colapsa) */
  forceClose?: boolean;
  children: ReactNode;
}

export default function DropdownMenu({
  id,
  icon,
  label,
  currentLabel,
  isActive,
  align = 'left',
  closeOnSelect = true,
  forceClose = false,
  children,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Force close desde el padre ───
  // Cuando la barra de filtros se colapsa (scroll down),
  // todos los dropdowns se cierran automáticamente.
  useEffect(() => {
    if (forceClose) {
      setIsOpen(false);
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
        closeTimeoutRef.current = null;
      }
    }
  }, [forceClose]);

  // ─── Programar cierre con delay ───
  // 300ms de gracia para que el mouse pueda viajar
  // del botón al panel sin cerrar el dropdown.
  const scheduleClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 300);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  }, []);

  // ─── Click outside + Escape ───
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // ─── Cleanup del timeout al desmontar ───
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative"
      ref={ref}
      onMouseLeave={scheduleClose}
      onMouseEnter={cancelClose}
    >
      <button
        onClick={() => {
          cancelClose();
          setIsOpen(!isOpen);
        }}
        aria-expanded={isOpen}
        aria-controls={`${id}-dropdown`}
        aria-label={`${label}: ${currentLabel}`}
        title={`${label}: ${currentLabel}`}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
          isActive
            ? 'bg-red-600/80 border-red-500/30 text-white shadow-lg shadow-red-900/20'
            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20 hover:text-white'
        }`}
      >
        <span className={isActive ? 'text-red-100' : 'text-gray-500'}>
          {icon}
        </span>
        <span className="hidden sm:inline">{currentLabel}</span>
        <IconChevron open={isOpen} className="w-3 h-3 opacity-60" />
      </button>
      {isOpen && (
        <div
          id={`${id}-dropdown`}
          className={`absolute z-[200] top-full mt-2 ${
            align === 'right' ? 'right-0' : 'left-0'
          }`}
          onClick={(event) => {
            if (closeOnSelect) {
              setIsOpen(false);
            } else {
              event.stopPropagation();
            }
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
}
EOF

# ═══════════════════════════════════════════════════════
# 3-6. Filter components — agregar forceClose prop
# ═══════════════════════════════════════════════════════

info "3/7: GenreFilter — agregar forceClose"
write_file "features/filters/ui/GenreFilter.tsx" << 'EOF'
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
EOF

info "4/7: RatingFilter — agregar forceClose"
write_file "features/filters/ui/RatingFilter.tsx" << 'EOF'
// features/filters/ui/RatingFilter.tsx
'use client';
import DropdownMenu from './DropdownMenu';
import { IconStar } from '@/shared/ui/icons';
import { RATING_OPTIONS } from '../config/options';

interface RatingFilterProps {
  value: string | null;
  onChange: (value: string | null) => void;
  forceClose?: boolean;
}

export default function RatingFilter({ value, onChange, forceClose = false }: RatingFilterProps) {
  const currentLabel =
    RATING_OPTIONS.find((option) => option.value === (value ?? 'all'))
      ?.label || 'Puntuación';

  return (
    <DropdownMenu
      id="rating"
      icon={<IconStar />}
      label="Puntuación"
      currentLabel={currentLabel}
      isActive={Boolean(value)}
      forceClose={forceClose}
    >
      <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40 min-w-[160px]">
        {RATING_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() =>
              onChange(option.value === 'all' ? null : option.value)
            }
            className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
              (value || 'all') === option.value
                ? 'bg-red-600/80 text-white font-medium'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </DropdownMenu>
  );
}
EOF

info "5/7: CountryFilter — agregar forceClose"
write_file "features/filters/ui/CountryFilter.tsx" << 'EOF'
// features/filters/ui/CountryFilter.tsx
'use client';
import DropdownMenu from './DropdownMenu';
import { IconGlobe } from '@/shared/ui/icons';

interface CountryFilterProps {
  countries: string[];
  value: string | null;
  onChange: (value: string | null) => void;
  forceClose?: boolean;
}

export default function CountryFilter({
  countries,
  value,
  onChange,
  forceClose = false,
}: CountryFilterProps) {
  return (
    <DropdownMenu
      id="country"
      icon={<IconGlobe />}
      label="País"
      currentLabel={value || 'País'}
      isActive={Boolean(value)}
      forceClose={forceClose}
    >
      <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40 w-52 max-h-64 overflow-y-auto scrollbar-hide">
        <button
          onClick={() => onChange(null)}
          className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
            !value
              ? 'bg-red-600/80 text-white font-medium'
              : 'text-gray-300 hover:bg-white/5'
          }`}
        >
          Todos
        </button>
        {countries.map((countryName) => (
          <button
            key={countryName}
            onClick={() => onChange(countryName)}
            className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
              value === countryName
                ? 'bg-red-600/80 text-white font-medium'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            {countryName}
          </button>
        ))}
      </div>
    </DropdownMenu>
  );
}
EOF

info "6/7: SortFilter — agregar forceClose"
write_file "features/filters/ui/SortFilter.tsx" << 'EOF'
// features/filters/ui/SortFilter.tsx
'use client';
import DropdownMenu from './DropdownMenu';
import { IconSort } from '@/shared/ui/icons';
import { SORT_OPTIONS } from '../config/options';
import type { MovieSort } from '@/entities/movie';

interface SortFilterProps {
  value: MovieSort;
  onChange: (value: MovieSort) => void;
  forceClose?: boolean;
}

export default function SortFilter({ value, onChange, forceClose = false }: SortFilterProps) {
  const currentLabel =
    SORT_OPTIONS.find((option) => option.value === value)?.label ||
    'Ordenar';

  return (
    <DropdownMenu
      id="sort"
      icon={<IconSort />}
      label="Ordenar"
      currentLabel={currentLabel}
      isActive={false}
      align="right"
      forceClose={forceClose}
    >
      <div className="bg-gray-950/95 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl shadow-black/40 min-w-[180px]">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`block w-full text-left px-3 py-2 text-sm rounded-xl transition-colors ${
              value === option.value
                ? 'bg-red-600/80 text-white font-medium'
                : 'text-gray-300 hover:bg-white/5'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </DropdownMenu>
  );
}
EOF

# ═══════════════════════════════════════════════════════
# 7. FilterMenu.tsx — z-index fix + forceClose propagation
# ═══════════════════════════════════════════════════════
info "7/7: FilterMenu — z-index fix + forceClose a cada filtro"

write_file "features/filters/ui/FilterMenu.tsx" << 'EOF'
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
          {/* z-10 + relative: crea stacking context por encima de ActiveFiltersBar.
              Esto evita que los dropdowns se "mezclen" visualmente con los
              filtros activos que están debajo. */}
          <div
            className="relative z-10 transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isCollapsed ? '0px' : '400px',
              opacity: isCollapsed ? 0 : 1,
              transform: isCollapsed ? 'translateY(-8px)' : 'translateY(0)',
              pointerEvents: isCollapsed ? 'none' : 'auto',
            }}
          >
            <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-3">
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
              />
              <RuntimeRangeFilter
                fromRuntime={fromRuntime}
                toRuntime={toRuntime}
                onApply={applyRuntimeRange}
              />
              {/* Spacer flexible que empuja SortFilter a la derecha */}
              <div className="flex-1 min-w-4" />
              <SortFilter
                value={sort}
                onChange={setSort}
                forceClose={isCollapsed}
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
EOF

# ═══════════════════════════════════════════════════════
# 8. MovieCard.tsx — Tooltip de sinopsis en hover
# ═══════════════════════════════════════════════════════
info "8/8: MovieCard — tooltip de sinopsis en hover (desktop)"

write_file "widgets/movie-card/MovieCard.tsx" << 'EOF'
'use client';

import Image from 'next/image';
import Link from 'next/link';
import type { MouseEvent } from 'react';

import type { Movie } from '@/entities/movie';
import { createMovieCardViewModel } from './lib/createMovieCardViewModel';
import { IconImagePlaceholder, IconStar } from '@/shared/ui/icons';
import MovieCardCategoryLink from './MovieCardCategoryLink';

export interface MovieCardProps {
  movie: Movie;
  href: string;
  getCategoryHref?: (categorySlug: string) => string;
  onPrimaryLinkClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
  highlightedCategorySlugs?: string[];
}

export default function MovieCard({
  movie,
  href,
  getCategoryHref,
  onPrimaryLinkClick,
  highlightedCategorySlugs,
}: MovieCardProps) {
  const viewModel = createMovieCardViewModel(movie);
  const hasSynopsis =
    Boolean(viewModel.synopsis) && viewModel.synopsis.trim().length > 0;

  return (
    <article
      className="
        group relative
        bg-white/[0.03] border border-white/5
        rounded-2xl overflow-hidden
        transition-all duration-300
        hover:bg-white/[0.06] hover:border-white/10
        hover:shadow-xl hover:shadow-black/20
        hover:-translate-y-1
      "
    >
      <Link
        href={href}
        onClick={onPrimaryLinkClick}
        aria-label={`Ver detalle de ${viewModel.title}`}
        title={`Ver detalle de ${viewModel.title}`}
        className="absolute inset-0 z-10"
      />

      {/* ─── Tooltip de sinopsis (solo desktop) ─── */}
      {/* Aparece con 500ms de delay al hacer hover,
          desaparece instantáneamente al quitar el mouse.
          pointer-events-none para no interferir con el Link. */}
      {hasSynopsis && (
        <div
          className="
            synopsis-tooltip
            absolute bottom-full left-1/2 -translate-x-1/2 mb-3
            w-72 z-50
            hidden lg:block
          "
          aria-hidden="true"
        >
          <div className="bg-gray-950/95 backdrop-blur-sm border border-white/10 rounded-xl shadow-2xl shadow-black/50 p-3">
            <p className="text-xs text-gray-300 leading-relaxed line-clamp-4">
              {viewModel.synopsis}
            </p>
          </div>
          {/* Flecha */}
          <div
            className="
              absolute left-1/2 -translate-x-1/2 -bottom-1.5
              w-3 h-3
              bg-gray-950/95 border-r border-b border-white/10
              rotate-45
            "
          />
        </div>
      )}

      {/* Imagen */}
      <div className="relative aspect-[2/3] overflow-hidden">
        {viewModel.posterUrl ? (
          <Image
            src={viewModel.posterUrl}
            alt={`Póster de ${viewModel.title}`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1400px) 25vw, 20vw"
            className="
              object-cover
              transition-transform duration-500
              group-hover:scale-105
            "
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <IconImagePlaceholder className="w-10 h-10 text-gray-600" />
          </div>
        )}

        <div
          className="
            absolute inset-0
            bg-gradient-to-t from-black/60 via-transparent to-transparent
            opacity-0 group-hover:opacity-100
            transition-opacity duration-300
          "
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {viewModel.primaryQuality && (
            <span
              className="
                bg-red-600/90 backdrop-blur-sm
                text-white text-[10px] font-bold
                px-2 py-0.5 rounded-md
                uppercase tracking-wide
              "
            >
              {viewModel.primaryQuality}
            </span>
          )}
          {viewModel.hasSubtitles && (
            <span
              className="
                bg-black/60 backdrop-blur-sm
                text-gray-200 text-[10px] font-semibold
                px-2 py-0.5 rounded-md
              "
            >
              CC
            </span>
          )}
        </div>

        {viewModel.rating > 0 && (
          <div
            className="
              absolute top-2.5 right-2.5
              flex items-center gap-1
              bg-black/70 backdrop-blur-sm
              px-2 py-1 rounded-lg
            "
          >
            <IconStar className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-bold text-white">
              {viewModel.rating.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Información */}
      <div className="relative p-3.5">
        <h2
          className="
            text-sm font-semibold text-gray-100
            leading-snug line-clamp-2 min-h-[2.5rem]
            group-hover:text-white transition-colors
          "
        >
          {viewModel.title}
        </h2>

        <div className="flex items-center gap-2 mt-1.5 text-xs">
          <span className="text-gray-400">{viewModel.year}</span>
          {viewModel.runtimeLabel && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">
                {viewModel.runtimeLabel}
              </span>
            </>
          )}
          {viewModel.ageRating && (
            <>
              <span className="text-gray-600">·</span>
              <span className="text-gray-400">{viewModel.ageRating}</span>
            </>
          )}
        </div>

        {viewModel.languages.length > 0 && (
          <p className="text-[11px] text-gray-400 mt-1.5 truncate">
            {viewModel.languages.join(' · ')}
          </p>
        )}

        {viewModel.categories.length > 0 && (
          <div className="relative z-20 flex flex-wrap gap-1 mt-2.5">
            {viewModel.categories.map((category) => (
              <MovieCardCategoryLink
                key={category.id}
                category={category}
                href={getCategoryHref?.(category.slug)}
                highlighted={
                  highlightedCategorySlugs?.includes(category.slug) ??
                  false
                }
              />
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
EOF

# ═══════════════════════════════════════════════════════
# Resumen
# ═══════════════════════════════════════════════════════
echo ""
echo "═══════════════════════════════════════════════════════"
echo -e "  ${GREEN}✓ CAMBIOS APLICADOS${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""
echo "  Archivos modificados: 8"
echo ""
echo "  Problema 1 — Dropdown se mezcla con filtros activos:"
echo "    ✓ Collapsible div ahora tiene relative z-10"
echo "    ✓ Dropdown panel tiene z-[200]"
echo "    ✓ Stacking context correcto: dropdown siempre arriba"
echo ""
echo "  Problema 2 — Dropdowns no se cierran:"
echo "    ✓ onMouseLeave programa cierre en 300ms"
echo "    ✓ onMouseEnter cancela el cierre (permite"
echo "      mover el mouse del botón al panel)"
echo "    ✓ forceClose cierra al colapsar la barra"
echo ""
echo "  Mejora — Tooltip de sinopsis:"
echo "    ✓ Aparece tras 500ms de hover (evita flicker)"
echo "    ✓ Desaparece instantáneamente al quitar el mouse"
echo "    ✓ Solo en desktop (hidden lg:block)"
echo "    ✓ pointer-events-none: no interfiere con clicks"
echo "    ✓ Posicionado arriba de la tarjeta con flecha"
echo ""
echo "  Verificar: npm run check && npm run dev"
echo ""