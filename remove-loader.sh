#!/usr/bin/env bash
set -euo pipefail

FILE="next.config.ts"

echo "━━━ Fix: Remover configuración de loader custom ━━━"

python3 << 'PYTHON_FIX'
file_path = "next.config.ts"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Remover líneas del loader custom
lines_to_remove = [
    "    loader: 'custom',",
    "    loaderFile: './lib/utils/imageLoader',",
]

original_content = content

for line in lines_to_remove:
    content = content.replace(line + "\n", "")

if content != original_content:
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content)
    print("  ✓ Configuración de loader custom removida")
else:
    print("  → No se encontró configuración de loader custom")

PYTHON_FIX

echo ""
echo "Verificando TypeScript..."
npx tsc --noEmit 2>&1 | tail -3 && echo "✓ TypeScript OK"

echo ""
echo "Ahora ejecutá: npm run dev"

