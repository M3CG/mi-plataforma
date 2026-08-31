// features/admin-import/ui/AdminImportPage.tsx
'use client';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { Category } from '@/entities/category';
import { FilterMenu } from '@/features/filters';
import { useTmdbSearch } from '../model/useTmdbSearch';
import { useTmdbDiscover } from '../model/useTmdbDiscover';
import SearchResults from './SearchResults';

interface AdminImportPageProps {
  categories: Category[];
  countries: string[];
}

function tabClasses(active: boolean): string {
  return `px-5 py-2 rounded-full text-sm font-medium transition-all ${
    active
      ? 'bg-red-600 text-white'
      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
  }`;
}

export default function AdminImportPage({
  categories,
  countries,
}: AdminImportPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tab = searchParams.get('tab') ?? 'movie';
  const urlQuery = searchParams.get('q') ?? '';
  const isSearchMode = urlQuery.length > 0;

  const [searchInput, setSearchInput] = useState(urlQuery);

  const {
    search,
    movieResults,
    personResults,
    isLoading: searchLoading,
    error: searchError,
  } = useTmdbSearch();
  const discover = useTmdbDiscover();

  // Sincronizar el input con la query de la URL (ej: al volver con back)
  useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
    setSearchInput(urlQuery);
  }, [urlQuery]);

  // Disparar búsqueda cuando hay query en la URL
  useEffect(() => {
    if (urlQuery.length >= 2) {
      search(urlQuery, tab === 'person' ? 'person' : 'movie');
    }
  }, [urlQuery, tab, search]);

  // Asegurar sort=oldest por defecto en el tab de películas
  useEffect(() => {
    if (tab === 'movie' && !searchParams.has('sort')) {
      const params = new URLSearchParams(searchParams.toString());
      params.set('sort', 'oldest');
      router.replace(`/admin/import?${params.toString()}`);
    }
  }, [tab, searchParams, router]);

  const updateUrl = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      router.replace(`/admin/import?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handleTabChange = (newTab: 'movie' | 'person') => {
    if (newTab === tab) return;
    updateUrl((params) => {
      params.set('tab', newTab);
      params.delete('q');
      params.delete('page');
    });
    setSearchInput('');
  };

  const handleSearchSubmit = (event: FormEvent) => {
    event.preventDefault();
    const q = searchInput.trim();
    updateUrl((params) => {
      if (q.length >= 2) params.set('q', q);
      else params.delete('q');
    });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    updateUrl((params) => {
      params.delete('q');
    });
  };

  return (
    <div className="min-h-screen text-white">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Importar contenido</h1>
          <p className="text-sm text-gray-400 mt-2">
            Explora TMDB con los filtros del catálogo, previsualiza y agrega
            películas o actores a la base de datos.
          </p>
          <span className="inline-flex items-center gap-2 mt-3 text-xs px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300">
            Herramienta de administración — solo disponible en desarrollo
            local
          </span>
        </header>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => handleTabChange('movie')}
            className={tabClasses(tab === 'movie')}
          >
            Películas
          </button>
          <button
            onClick={() => handleTabChange('person')}
            className={tabClasses(tab === 'person')}
          >
            Actores
          </button>
        </div>

        {/* Filtros del catálogo (solo tab películas) */}
        {tab === 'movie' && (
          <div className="mb-6">
            <FilterMenu categories={categories} countries={countries} />
          </div>
        )}

        {/* Barra de búsqueda */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 mb-8">
          <div className="relative flex-1">
            <input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder={
                tab === 'movie'
                  ? 'Buscar película específica en TMDB...'
                  : 'Buscar actor en TMDB...'
              }
              className="w-full bg-white/5 border border-white/10 rounded-full px-5 py-3 pr-12 text-sm outline-none focus:border-red-500/50"
            />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white text-sm"
                aria-label="Limpiar búsqueda"
              >
                ✕
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={searchLoading}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 px-6 py-3 rounded-full text-sm font-semibold"
          >
            {searchLoading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {/* ─── Resultados: Discover (sin búsqueda) ─── */}
        {tab === 'movie' && !isSearchMode && (
          <>
            <SearchResults
              tab="movie"
              movieResults={discover.movies}
              personResults={[]}
              isLoading={discover.isLoading && discover.movies.length === 0}
              error={discover.error}
            />
            {discover.movies.length > 0 && discover.hasMore && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={discover.loadMore}
                  disabled={discover.isLoading}
                  className="bg-white/5 hover:bg-white/10 border border-white/10 disabled:opacity-50 px-8 py-3 rounded-full text-sm font-semibold"
                >
                  {discover.isLoading ? 'Cargando...' : 'Cargar más'}
                </button>
              </div>
            )}
            {!discover.isLoading &&
              discover.movies.length === 0 &&
              !discover.error && (
                <p className="text-gray-500 text-center py-12">
                  No se encontraron películas con los filtros seleccionados.
                </p>
              )}
          </>
        )}

        {/* ─── Resultados: Búsqueda por texto ─── */}
        {tab === 'movie' && isSearchMode && (
          <SearchResults
            tab="movie"
            movieResults={movieResults}
            personResults={[]}
            isLoading={searchLoading}
            error={searchError}
          />
        )}

        {/* ─── Resultados: Actores ─── */}
        {tab === 'person' && (
          <SearchResults
            tab="person"
            movieResults={[]}
            personResults={personResults}
            isLoading={searchLoading}
            error={searchError}
          />
        )}
      </div>
    </div>
  );
}
