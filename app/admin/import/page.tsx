// app/admin/import/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { ADMIN_TOOLS_ENABLED } from '@/lib/config/adminTools';
import { AdminImportPage } from '@/features/admin-import';
import { getCategories } from '@/lib/queries/categories';
import { getCountries } from '@/lib/queries/countries';

export const metadata: Metadata = {
  title: 'Importar contenido | Admin',
  robots: { index: false, follow: false },
};

export default async function AdminImportRoute() {
  if (!ADMIN_TOOLS_ENABLED) {
    notFound();
  }
  const [categories, countries] = await Promise.all([
    getCategories(),
    getCountries(),
  ]);
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white">
          <div className="flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-red-600/60 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-400">Cargando...</p>
          </div>
        </div>
      }
    >
      <AdminImportPage categories={categories} countries={countries} />
    </Suspense>
  );
}
