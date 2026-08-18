// app/not-found.tsx

import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-extrabold text-red-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Página no encontrada</h2>

        <p className="text-gray-400 mb-8">
          La página que buscas no existe o fue movida a otra ubicación.
        </p>

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href={routes.home}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>

          <Link
            href={routes.movies}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}