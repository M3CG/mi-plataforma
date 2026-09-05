#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

LOADER_FILE="lib/utils/imageLoader.ts"

echo "━━━ Crear imageLoader.ts faltante ━━━"

# Crear directorio si no existe
mkdir -p "$(dirname "$LOADER_FILE")"

# Crear el archivo del loader
cat > "$LOADER_FILE" << 'EOF_LOADER'
import type { ImageLoaderProps } from 'next/image';

/**
 * Custom image loader para Next.js.
 *
 * Evita usar la optimización de Vercel (límite de 1000
 * optimizaciones/mes en el plan Hobby) descargando directamente
 * desde el CDN origen (TMDB, Railway, etc).
 *
 * Next.js sigue aplicando lazy loading, responsive sizes y los
 * demás beneficios del componente <Image>.
 */
export default function imageLoader({
  src,
  width,
}: ImageLoaderProps): string {
  // Para URLs de TMDB, aprovechar sus tamaños predefinidos
  // TMDB ofrece: w92, w154, w185, w342, w500, w780, original
  if (src.includes('image.tmdb.org')) {
    const tmdbSizes = [
      { max: 92, size: 'w92' },
      { max: 154, size: 'w154' },
      { max: 185, size: 'w185' },
      { max: 342, size: 'w342' },
      { max: 500, size: 'w500' },
      { max: 780, size: 'w780' },
    ];

    const matched = tmdbSizes.find((s) => width <= s.max);
    const tmdbSize = matched?.size ?? 'w780';

    // Reemplazar el tamaño en la URL si ya tiene uno
    return src.replace(/\/t\/p\/w\d+\//, `/t/p/${tmdbSize}/`);
  }

  // Para otras URLs (Railway uploads, etc), devolver tal cual
  return src;
}
EOF_LOADER

echo -e "${GREEN}✓ $LOADER_FILE creado${NC}"
echo ""
echo "Verificando TypeScript..."
npx tsc --noEmit 2>&1 | tail -3 && echo -e "${GREEN}✓ TypeScript OK${NC}"

echo ""
echo "Ahora ejecutá: npm run dev"
