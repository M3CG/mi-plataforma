#!/usr/bin/env bash
set -euo pipefail

echo "━━━ Fix: Next.js dev server en todas las interfaces de red ━━━"

python3 << 'PYTHON_FIX'
import json

with open("package.json", "r", encoding="utf-8") as f:
    pkg = json.load(f)

# Cambiar el script dev para usar --hostname 0.0.0.0
if "scripts" in pkg and "dev" in pkg["scripts"]:
    old_dev = pkg["scripts"]["dev"]
    if "--hostname" not in old_dev:
        pkg["scripts"]["dev"] = "next dev --hostname 0.0.0.0"
        print(f"  ✓ Cambiado: '{old_dev}' → '{pkg['scripts']['dev']}'")
    else:
        print("  → Ya tiene --hostname configurado")
else:
    print("  ⚠ No se encontró el script 'dev' en package.json")

with open("package.json", "w", encoding="utf-8") as f:
    json.dump(pkg, f, indent=2)
    f.write("\n")

PYTHON_FIX

echo ""
echo "Ahora reiniciá el servidor de desarrollo:"
echo "  1. Ctrl+C para detener el servidor actual"
echo "  2. npm run dev"
echo ""
echo "Después abrí http://192.168.1.200:3000/ en el navegador."
echo "El WebSocket de HMR ahora debería conectar correctamente."