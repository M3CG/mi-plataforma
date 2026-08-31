import { MovieGridSkeleton } from '@/features/catalog';

/**
 * Fallback de Suspense para el catálogo.
 *
 * Se muestra en dos situaciones:
 * 1. Primera carga de la página.
 * 2. Cuando cambian los filtros (React desmonta FilteredCatalog
 *    y muestra este skeleton hasta que el nuevo fetch resuelva).
 *
 * Incluye un indicador sutil arriba para que el usuario entienda
 * que la página está trabajando, no "congelada".
 */
export default function CatalogSkeleton() {
  return (
    <div>
      {/* Indicador de "aplicando filtros" */}
      <div className="flex items-center gap-2 mb-4 px-1 py-2">
        <div className="w-3.5 h-3.5 border-2 border-red-600/70 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-gray-400">
          Aplicando filtros...
        </span>
      </div>
      <MovieGridSkeleton count={24} />
    </div>
  );
}
