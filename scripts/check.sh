#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd -P)"
PLUGINS=("caveman" "ponytail")

echo "==> Validating TypeScript extensions..."

for plugin in "${PLUGINS[@]}"; do
  entry="$ROOT_DIR/plugins/$plugin/extensions/index.ts"
  if [ ! -f "$entry" ]; then
    echo "::error::Extension entry not found: $entry"
    exit 1
  fi
  bun build "$entry" --target=bun --no-bundle > /dev/null
  echo "  [OK] $plugin/extensions/index.ts"
done

echo ""
echo "All extensions validated successfully."
