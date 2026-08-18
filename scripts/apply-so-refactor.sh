#!/usr/bin/env bash
set -euo pipefail

# ─── 1. Crear carpetas ───
mkdir -p app/providers
mkdir -p shared/ui
mkdir -p widgets/Header
mkdir -p widgets/MovieCard
mkdir -p entities/movie/config
mkdir -p entities/movie/types
mkdir -p entities/category
mkdir -p entities/person
mkdir -p lib/api/repositories

# ─── 2. Mover components hacia capas correctas ───
mv components/icons.tsx shared/ui/icons.tsx
mv components/BackButton.tsx shared/ui/BackButton.tsx
mv components/Header.tsx widgets/Header/Header.tsx
mv components/AppMovieCard.tsx widgets/MovieCard/AppMovieCard.tsx
mv components/ScrollToTop.tsx app/providers/ScrollToTop.tsx

rm -rf components

# ─── 3. Renombrar resources → repositories ───
mv lib/api/resources/*.ts lib/api/repositories/
rm -rf lib/api/resources

# ─── 4. Actualizar imports ───
find . \( -name '*.ts' -o -name '*.tsx' \) \
  -not -path './node_modules/*' \
  -not -path './.next/*' \
  -exec perl -pi -e '
    s{\@/components/icons}{\@/shared/ui/icons}g;
    s{\@/components/BackButton}{\@/shared/ui/BackButton}g;
    s{\@/components/AppMovieCard}{\@/widgets/MovieCard/AppMovieCard}g;
    s{\@/components/Header}{\@/widgets/Header/Header}g;
    s{\@/components/ScrollToTop}{\@/app/providers/ScrollToTop}g;
    s{\@/lib/api/resources/}{\@/lib/api/repositories/}g;
  ' {} +

# ─── 5. Eliminar types antiguos ───
# IMPORTANTE: antes de ejecutar esto ya debes haber reemplazado types/index.ts
rm -f types/movie.ts
rm -f types/category.ts
rm -f types/person.ts