#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd -P)"
UPSTREAM_DIR="$ROOT_DIR/.upstream"

mkdir -p "$UPSTREAM_DIR"

sync_repo() {
  local name="$1"
  local url="$2"
  local target="$UPSTREAM_DIR/$name"

  echo "==> Syncing $name ($url)..."
  if [ -d "$target/.git" ]; then
    git -C "$target" pull --ff-only
  else
    if [ -d "$target" ]; then
      rm -rf "$target"
    fi
    git clone --depth 1 "$url" "$target"
  fi
}

sync_repo "caveman" "https://github.com/JuliusBrussee/caveman.git"
sync_repo "ponytail" "https://github.com/DietrichGebert/ponytail.git"

echo ""
echo "All upstream mirrors synced locally in $UPSTREAM_DIR."
