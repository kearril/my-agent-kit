#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd -P)"
UPSTREAM_DIR="$ROOT_DIR/.upstream"

mkdir -p "$UPSTREAM_DIR"

latest_tag() {
  curl -fsSL -H "User-Agent: my-agent-kit-sync" "https://api.github.com/repos/$1/releases/latest" |
    node -e 'let s="";process.stdin.on("data",d=>s+=d).on("end",()=>console.log(JSON.parse(s).tag_name))'
}

# Git mirror: shallow clone of the latest release tag (unreleased main commits are skipped).
sync_repo() {
  local name="$1"
  local repo="$2"
  local target="$UPSTREAM_DIR/$name"

  echo "==> Syncing $name (latest release of $repo)..."
  local tag
  tag="$(latest_tag "$repo")"
  if [ -f "$target/.release-tag" ] && [ "$(cat "$target/.release-tag")" = "$tag" ]; then
    echo "Already at $tag"
    return
  fi
  rm -rf "$target"
  git -c advice.detachedHead=false clone -q --depth 1 --branch "$tag" "https://github.com/$repo.git" "$target"
  printf '%s' "$tag" > "$target/.release-tag"
  echo "Mirrored $tag"
}

sync_repo "matt" "mattpocock/skills"
echo ""
echo "All upstream mirrors synced locally in $UPSTREAM_DIR."
