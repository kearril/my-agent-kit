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
    const version = JSON.parse(fs.readFileSync(pkg)).version;
    if (p.version && p.version !== version) throw new Error(`Catalog version ${p.version} != package.json version ${version} for ${p.name}`);
    // Skills hidden from the model are only reachable through a Chinese command wrapper.
    const skillsDir = path.join(src, "skills");
    if (fs.existsSync(skillsDir)) {
      for (const skill of fs.readdirSync(skillsDir)) {
        const md = path.join(skillsDir, skill, "SKILL.md");
        if (!fs.existsSync(md)) continue;
        const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(fs.readFileSync(md, "utf8"));
        if (fm && /^disable-model-invocation:\s*true\s*$/m.test(fm[1]) && !fs.existsSync(path.join(src, "commands", `${skill}.md`)))
          throw new Error(`${p.name}: user-only skill "${skill}" has no commands/${skill}.md`);
      }
    }
  }
' "$ROOT_DIR"
echo "  [OK] marketplace.json & plugin package.json files valid"

echo ""
echo "All validation checks passed successfully."
