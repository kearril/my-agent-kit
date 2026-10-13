#!/usr/bin/env node
// Absorb .upstream/<name> mirrors into plugins/<name> verbatim, then bump versions.
// Usage: node scripts/absorb.mjs [--summary <file>] [plugin...]   (default: all plugins)
// Run scripts/sync-upstream.* first. Local OMP adaptations (commands/, package.json,
// README.md) are never touched; everything listed by a plugin's rule is replaced wholesale.
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const git = (...args) => execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

// Per-plugin rules: which upstream skill dirs and root files are vendored, and how the
// upstream baseline is described in the version tables.
const RULES = {
  matt: {
    // Upstream's own Claude plugin manifest is the authoritative list of released skills.
    skills: (up) => readJson(path.join(up, ".claude-plugin/plugin.json")).skills.map((p) => path.join(up, p)),
    files: [],
    baseline: (up) => {
      const [sha, date] = execFileSync("git", ["-C", up, "log", "-1", "--format=%h %cs"], { encoding: "utf8" }).trim().split(" ");
      return `\`${sha}\` *(${date})*`;
    },
  },
  hyperframes: {
    skills: (up) =>
      fs.readdirSync(path.join(up, "skills"), { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => path.join(up, "skills", d.name)),
    // plugin.json pins the launcher's CLI version; see plugins/hyperframes/README.md.
    files: ["plugin.json", "LICENSE"],
    baseline: (up) => `Release \`${fs.readFileSync(path.join(up, ".release-tag"), "utf8").trim()}\``,
  },
};

const args = process.argv.slice(2);
let summaryFile;
const si = args.indexOf("--summary");
if (si !== -1) [, summaryFile] = args.splice(si, 2);
const names = args.length ? args : Object.keys(RULES);

// Replace one cell of the table row for `name` (rows start with "| **`name`** |").
function setCell(file, name, column, value) {
  const text = fs.readFileSync(file, "utf8");
  const prefix = `| **\`${name}\`** |`;
  const lines = text.split("\n");
  const i = lines.findIndex((l) => l.startsWith(prefix));
  if (i === -1) throw new Error(`No table row for ${name} in ${path.relative(root, file)}`);
  const cells = lines[i].split("|");
  cells[column + 1] = ` ${value} `;
  lines[i] = cells.join("|");
  fs.writeFileSync(file, lines.join("\n"));
}

function bumpPatch(version) {
  const [major, minor, patch] = version.split(".").map(Number);
  return `${major}.${minor}.${patch + 1}`;
}

const changed = [];
for (const name of names) {
  const rule = RULES[name];
  if (!rule) throw new Error(`No absorb rule for plugin "${name}"`);
  const up = path.join(root, ".upstream", name);
  const dst = path.join(root, "plugins", name);
  if (!fs.existsSync(up)) throw new Error(`Missing mirror ${path.relative(root, up)}; run scripts/sync-upstream.* first`);

  const sources = rule.skills(up);
  const seen = new Set();
  for (const src of sources) {
    const skill = path.basename(src);
    if (!fs.existsSync(path.join(src, "SKILL.md"))) throw new Error(`${name}: ${src} has no SKILL.md`);
    if (seen.has(skill)) throw new Error(`${name}: duplicate skill name "${skill}" after flattening`);
    seen.add(skill);
  }

  fs.rmSync(path.join(dst, "skills"), { recursive: true, force: true });
  for (const src of sources) fs.cpSync(src, path.join(dst, "skills", path.basename(src)), { recursive: true });
  for (const f of rule.files) fs.copyFileSync(path.join(up, f), path.join(dst, f));

  // Only upstream-owned paths count; local adaptation (commands/, README.md) never bumps.
  // -f: upstream skills ship .gitignore files that would hide their own committed fixtures.
  const owned = ["skills", ...rule.files].map((p) => `plugins/${name}/${p}`);
  git("add", "-A", "-f", "--", ...owned);
  if (execFileSync("git", ["diff", "--cached", "--name-only", "--", ...owned], { cwd: root, encoding: "utf8" }).trim() === "") {
    console.log(`${name}: up to date`);
    continue;
  }

  // Bump from the committed version so re-running before commit does not bump twice.
  // A plugin not yet committed keeps its initial version.
  const pkgFile = path.join(dst, "package.json");
  const pkg = readJson(pkgFile);
  const committed = execFileSync("git", ["ls-tree", "--name-only", "HEAD", `plugins/${name}/package.json`], { cwd: root, encoding: "utf8" }).trim();
  const from = committed ? JSON.parse(git("show", `HEAD:plugins/${name}/package.json`)).version : pkg.version;
  if (committed) pkg.version = bumpPatch(from);
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, 2) + "\n");

  const mktFile = path.join(root, ".omp-plugin/marketplace.json");
  const mkt = readJson(mktFile);
  const entry = mkt.plugins.find((p) => p.name === name);
  if (!entry) throw new Error(`${name} missing from marketplace.json`);
  entry.version = pkg.version;
  fs.writeFileSync(mktFile, JSON.stringify(mkt, null, 2) + "\n");

  const baseline = rule.baseline(up);
  setCell(path.join(root, "plugins/README.md"), name, 1, `\`v${pkg.version}\``);
  setCell(path.join(root, "plugins/README.md"), name, 3, baseline);
  setCell(path.join(root, "README.md"), name, 1, `\`v${pkg.version}\``);
  git("add", "--", `plugins/${name}/package.json`, ".omp-plugin/marketplace.json", "plugins/README.md", "README.md");

  changed.push({ name, from, to: pkg.version, baseline });
  console.log(`${name}: ${from} -> ${pkg.version} (upstream ${baseline})`);
}

if (summaryFile) {
  const body = changed.map((c) => `- \`${c.name}\`: ${c.from} → ${c.to}, upstream ${c.baseline}`).join("\n");
  fs.writeFileSync(summaryFile, body ? body + "\n" : "");
}
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(process.env.GITHUB_OUTPUT, `changed=${changed.map((c) => c.name).join(", ")}\n`);
}
