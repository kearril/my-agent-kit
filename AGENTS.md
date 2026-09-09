# AGENTS.md — Repository Operating Handbook & Conventions

This repository is a private plugin marketplace and capabilities integration kit tailored for **Oh My Pi (omp)** and Agent Skills ecosystems.

This handbook establishes durable architectural invariants and operational rules for any AI Agent working in this repository.

---

## 1. Repository Structural Contracts

The repository is partitioned into strictly bounded zones:

- **`plugins/<name>/`**: Packaged plugin suites designed for OMP extension mechanisms.
  - `skills/<skill-name>/`: Skill definitions containing `SKILL.md` and optional supporting references.
  - `commands/<cmd-name>.md`: Slash command definitions exposed to humans in the OMP interface.
  - `extensions/index.ts` *(optional)*: TypeScript runtime extensions (hooks, status bars, mode switches).
  - `package.json`: Package metadata and plugin extension declarations.
  - `README.md`: Component catalog and domain boundaries.
- **`skills/<name>/`**: Standalone atomic skills for modular usage via `npx skills`. Single-purpose only.
- **`.upstream/<name>/`**: Local shallow-cloned upstream reference mirrors.
- **`.omp-plugin/marketplace.json`**: Official marketplace registry listing all installable plugins.
- **`scripts/`**: Automated mirror sync (`sync-upstream.*`) and validation checks (`check.*`).

---

## 2. Inviolable Operating Invariants

When inspecting, modifying, or extending this repository, Agents MUST strictly obey these rules:

### Rule 1: Upstream Isolation (Strictly Read-Only)
- `.upstream/` contains local mirror clones managed by `scripts/sync-upstream.*` and is ignored by git.
- **NEVER modify, format, or commit files in `.upstream/`.**
- All extractions, adaptations, and secondary developments MUST reside under `plugins/<name>/` or `skills/<name>/`.

### Rule 2: Dual-Layer Language Separation
- **`skills/` (for Models) $\to$ 100% Upstream Original English**:
  - `SKILL.md` files (both YAML frontmatter and body content) MUST remain in their original upstream English.
  - NEVER translate skill descriptions or prompt rules.
  - **Reason**: Preserves model semantic activation accuracy on native trigger words and guarantees zero merge conflicts during upstream synchronization.
- **`commands/` (for Humans) $\to$ Localized Chinese Descriptions**:
  - Command markdown files (`commands/*.md`) are user-facing entry points.
  - Frontmatter `description` MUST be concise, accurate Chinese to provide clear guidance in the terminal autocomplete menu.

### Rule 3: Single-Layer Skill Directory Requirement
- OMP and standard Agent Skills loaders scan direct subdirectories only: `<root>/skills/<skill-name>/SKILL.md`.
- Upstream repositories with nested categorization (e.g. `skills/category/name/`) MUST be flattened to `skills/<name>/` during extraction.

### Rule 4: Command Naming & Cross-Platform Safety
- Command files in `commands/<name>.md` define slash commands `/<name>`.
- To avoid global namespace pollution, commands within a plugin SHOULD carry a plugin-level prefix (e.g., `<plugin>-<action>.md`).
- **NEVER use colons `:` in command filenames** (e.g., `plugin:action.md` is invalid). Windows NTFS/FAT filesystems forbid colons in filenames. Always use hyphens `-`.

### Rule 5: Minimal Runtime Overhead (YAGNI)
- Do NOT create `extensions/index.ts` unless stateful runtime hooks, status bar indicators, or command toggles are strictly necessary.
- Pure prompt, workflow, or documentation suites MUST remain zero-runtime (Markdown + JSON only).

### Rule 6: Dual-Platform Quality Gate
- Before committing any changes, run the validation scripts:
  - Bash: `bash scripts/check.sh`
  - PowerShell: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check.ps1`
- Both scripts validate JSON schema integrity, file existence, and TypeScript build compatibility. Never commit on failing checks.

### Rule 7: Commit Discipline
- Follow Conventional Commits format: `<type>(<scope>): <imperative summary>`.
- Subject line MUST be $\le 50$ characters, imperative mood, lowercase after type, no trailing period.
- Emphasize *why* over *what*.
