// app/not-found.tsx
import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="text-center max-w-md">
        <h1 className="text-8xl font-extrabold text-red-600 mb-4">404</h1>
        <h2 className="text-3xl font-bold mb-4">Page not found</h2>
        <p className="text-gray-400 mb-8">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href={routes.home}
            className="bg-red-600 hover:bg-red-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Back to home
          </Link>
          <Link
            href={routes.movies}
            className="bg-gray-800 hover:bg-gray-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Browse catalog
          </Link>
        </div>
      </div>
    </main>
  );
}
