#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
CYAN='\033[0;36m'
NC='\033[0m'

echo "━━━ Limpiar archivos de detección de adblocker ━━━"

# ═══════════════════════════════════════════════════════════════
# 1. Eliminar hook de detección (ya no necesario)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}→ Eliminando useAdblockDetection.ts${NC}"

if [[ -f "shared/lib/hooks/useAdblockDetection.ts" ]]; then
  rm shared/lib/hooks/useAdblockDetection.ts
  echo "  ✓ shared/lib/hooks/useAdblockDetection.ts eliminado"
fi

# ═══════════════════════════════════════════════════════════════
# 2. Eliminar provider de detección (ya no necesario)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}→ Eliminando AdblockDetector.tsx${NC}"

if [[ -f "app/providers/AdblockDetector.tsx" ]]; then
  rm app/providers/AdblockDetector.tsx
  echo "  ✓ app/providers/AdblockDetector.tsx eliminado"
fi

# ═══════════════════════════════════════════════════════════════
# 3. Remover import de AdblockDetector del layout
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}→ Limpiando app/layout.tsx${NC}"

python3 << 'PYTHON_LAYOUT'
file_path = "app/layout.tsx"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

original = content

# Remover import de AdblockDetector
content = content.replace(
    "import { AdblockDetector } from '@/app/providers/AdblockDetector';\n",
    ""
)
content = content.replace(
    "import { AdblockDetector } from '@/app/providers/AdblockDetector';",
    ""
)

# Remover uso del componente
content = content.replace("<AdblockDetector />\n", "")
content = content.replace("<AdblockDetector />", "")

if content != original:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("  ✓ app/layout.tsx limpiado")
else:
    print("  → No se requirieron cambios")

PYTHON_LAYOUT

# ═══════════════════════════════════════════════════════════════
# 4. Limpiar detector de adblocker (ya no necesario)
# ═══════════════════════════════════════════════════════════════
echo -e "${CYAN}→ Simplificando adblock-detector.ts${NC}"

cat > shared/lib/adblock-detector.ts << 'EOF_DETECTOR'
// shared/lib/adblock-detector.ts

/**
 * Detecta el navegador del usuario para recomendar el adblocker correcto.
 */
export function detectBrowser(): 'chrome' | 'firefox' | 'safari' | 'edge' | 'other' {
  if (typeof window === 'undefined') return 'other';
  const ua = window.navigator.userAgent;
  if (ua.includes('Firefox')) return 'firefox';
  if (ua.includes('Edg')) return 'edge';
  if (ua.includes('Chrome')) return 'chrome';
  if (ua.includes('Safari')) return 'safari';
  return 'other';
}

/**
 * Obtiene la recomendación de adblocker según el navegador.
 */
export function getAdblockRecommendation(browser: string): {
  name: string;
  url: string;
  description: string;
} {
  const recommendations: Record<string, { name: string; url: string; description: string }> = {
    chrome: {
      name: 'uBlock Origin',
      url: 'https://chrome.google.com/webstore/detail/ublock-origin/cjpalhdlnbpafiamejdnhcphjbkeiagm',
      description: 'El bloqueador más eficiente y ligero para Chrome',
    },
    firefox: {
      name: 'uBlock Origin',
      url: 'https://addons.mozilla.org/en-US/firefox/addon/ublock-origin/',
      description: 'El bloqueador más eficiente y ligero para Firefox',
    },
    safari: {
      name: 'AdGuard',
      url: 'https://apps.apple.com/app/adguard-adblock-privacy/id1047223162',
      description: 'El mejor bloqueador de anuncios para Safari',
    },
    edge: {
      name: 'uBlock Origin',
      url: 'https://microsoftedge.microsoft.com/addons/detail/ublock-origin/odfafepnkmbhccpbejgmiehpchacaeak',
      description: 'El bloqueador más eficiente y ligero para Edge',
    },
    other: {
      name: 'uBlock Origin',
      url: 'https://ublockorigin.com/',
      description: 'Busca uBlock Origin en la tienda de extensiones de tu navegador',
    },
  };
  return recommendations[browser] || recommendations.other;
}
EOF_DETECTOR

echo "  ✓ shared/lib/adblock-detector.ts simplificado"

# ═══════════════════════════════════════════════════════════════
# 5. Verificaciones
# ═══════════════════════════════════════════════════════════════
echo ""
echo -e "${CYAN}Verificando TypeScript...${NC}"
npx tsc --noEmit 2>&1 | tail -5 && echo -e "${GREEN}✓ TypeScript OK${NC}"

echo ""
echo -e "${GREEN}━━━ Limpieza completada ━━━${NC}"
echo ""
echo "Archivos eliminados:"
echo "  ✓ shared/lib/hooks/useAdblockDetection.ts (ya no necesario)"
echo "  ✓ app/providers/AdblockDetector.tsx (ya no necesario)"
echo ""
echo "Archivos simplificados:"
echo "  ✓ shared/lib/adblock-detector.ts (solo detección de navegador)"
echo "  ✓ app/layout.tsx (sin imports innecesarios)"
echo ""
echo "El modal de advertencia ahora funciona de forma independiente,"
echo "sin depender de detección de adblocker."
echo ""
echo "Para probar:"
echo "  npm run dev"
