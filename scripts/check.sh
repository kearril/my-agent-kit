#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd -P)"
echo "==> Validating marketplace and package JSON files..."
node -e '
  const fs = require("fs");
  const path = require("path");
  const root = process.argv[1];
  const mkt = JSON.parse(fs.readFileSync(path.join(root, ".omp-plugin/marketplace.json")));
  for (const p of mkt.plugins) {
    const src = path.join(root, p.source);
    if (!fs.existsSync(src)) throw new Error(`Plugin source not found: ${p.source}`);
    const pkg = path.join(src, "package.json");
    if (!fs.existsSync(pkg)) throw new Error(`package.json missing in ${p.source}`);
    JSON.parse(fs.readFileSync(pkg));
  }
' "$ROOT_DIR"
echo "  [OK] marketplace.json & plugin package.json files valid"

echo "==> Validating TypeScript extensions..."
PLUGINS_WITH_EXT=("caveman" "ponytail")
for plugin in "${PLUGINS_WITH_EXT[@]}"; do
  entry="$ROOT_DIR/plugins/$plugin/extensions/index.ts"
  if [ ! -f "$entry" ]; then
    echo "::error::Extension entry not found: $entry"
    exit 1
  fi
  bun build "$entry" --target=bun --no-bundle > /dev/null
  echo "  [OK] $plugin/extensions/index.ts"
done

echo ""
echo "All validation checks passed successfully."
