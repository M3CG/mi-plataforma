// features/movies-page/ui/MoviesHeader.tsx

interface MoviesHeaderProps {
  hasResults: boolean;
}

export default function MoviesHeader({ hasResults }: MoviesHeaderProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
        Catálogo de Películas
      </h1>

      <p className="text-sm text-gray-400 mt-1">
        Explora{' '}
        {hasResults
          ? 'nuestra colección'
          : 'el catálogo'}{' '}
        — filtra por género, año, puntuación y más.
      </p>
    </div>
  );
}