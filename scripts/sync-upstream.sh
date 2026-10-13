#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd -P)"
UPSTREAM_DIR="$ROOT_DIR/.upstream"

mkdir -p "$UPSTREAM_DIR"

# Git mirror: shallow clone of the whole repository.
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

# Release mirror: verified release asset ZIP for repositories too large to clone.
# Asset must ship "<asset>.zip" + "<asset>.sha256" with a single "<zip_root>/" folder.
sync_release() {
  local name="$1"
  local repo="$2"
  local asset="$3"
  local zip_root="$4"
  local target="$UPSTREAM_DIR/$name"

  echo "==> Syncing $name (latest release of $repo)..."
  local info tag
  info="$(curl -fsSL -H "User-Agent: my-agent-kit-sync" "https://api.github.com/repos/$repo/releases/latest")"
  tag="$(printf '%s' "$info" | node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).tag_name))')"
  if [ -f "$target/.release-tag" ] && [ "$(cat "$target/.release-tag")" = "$tag" ]; then
    echo "Already at $tag"
    return
  fi

  local base="https://github.com/$repo/releases/download/$tag/$asset"
  local tmp
  tmp="$(mktemp -d)"
  trap 'rm -rf "$tmp"' RETURN
  curl -fsSL -o "$tmp/asset.zip" "$base.zip"
  local expected actual
  expected="$(curl -fsSL "$base.sha256" | awk '{print tolower($1)}')"
  actual="$(sha256sum "$tmp/asset.zip" | awk '{print tolower($1)}')"
  if [ "$actual" != "$expected" ]; then
    echo "SHA-256 mismatch for $name $tag: expected $expected, got $actual" >&2
    return 1
  fi
  unzip -q "$tmp/asset.zip" -d "$tmp/x"
  rm -rf "$target"
  mv "$tmp/x/$zip_root" "$target"
  printf '%s' "$tag" > "$target/.release-tag"
  echo "Mirrored $tag"
}

sync_repo "matt" "https://github.com/mattpocock/skills.git"
sync_release "hyperframes" "heygen-com/hyperframes" "hyperframes-agent-plugin" "hyperframes"
echo ""
echo "All upstream mirrors synced locally in $UPSTREAM_DIR."
