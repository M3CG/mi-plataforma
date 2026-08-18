// features/movie-detail/ui/MovieInfoSection.tsx

import type { MovieDetailViewModel } from '../lib/createMovieDetailViewModel';

interface MovieInfoSectionProps {
  viewModel: MovieDetailViewModel;
}

export default function MovieInfoSection({
  viewModel,
}: MovieInfoSectionProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 mb-12">
      {/* Sinopsis */}
      <div className="lg:col-span-2">
        <h2 className="text-lg font-semibold text-white mb-3">
          Sinopsis
        </h2>

        <p className="text-gray-300 leading-relaxed text-sm md:text-base">
          {viewModel.synopsis ||
            'No hay sinopsis disponible para este título.'}
        </p>
      </div>

      {/* Información lateral */}
      <div className="space-y-5">
        {viewModel.directors.length > 0 && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              Director
            </h3>

            <p className="text-sm text-gray-300">
              {viewModel.directorNames}
            </p>
          </div>
        )}

        {viewModel.country && (
          <div>
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
              País
            </h3>

            <p className="text-sm text-gray-300">
              {viewModel.country}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}