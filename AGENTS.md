# AGENTS.md — Repository Instructions & Constitution

This repository (`my-agent-kit`) is a private Agent plugin marketplace and skills collection deeply tailored for **Oh My Pi (omp)**.

---

## 1. Triad Synergy & Domain Boundaries

Three core plugins coexist in `plugins/` without functional overlap:

1. **`mattpocock-skills` (Top-level Engineering Authority)**:
   - Owns full engineering lifecycle: `/matt-grill-with-docs` → `/matt-to-spec` → `/matt-to-tickets` → `/matt-implement`.
   - Owns testing methodology (`tdd` red-green loop), two-axis review (`code-review`), and six-step bug diagnosis (`diagnosing-bugs`).
2. **`ponytail` (Anti-Bloat Guardrail)**:
   - Owns code-level simplicity: enforces "The Ladder" (YAGNI → reuse → stdlib first → native first → one line).
   - Prevents speculative abstractions and unnecessary third-party dependencies. Tracks tech debt via `/ponytail-debt`.
3. **`caveman` (Communication & Delivery Efficiency)**:
   - Owns output compression: cuts ~65% verbose output tokens via runtime hook while preserving 100% technical accuracy.
   - Owns delivery finalization (`/caveman-commit` 50-char intent commits), rollback protection (`migration`), and stopping discipline (`verify-and-stop`).

---

## 2. Inviolable Repository Rules

When working in or modifying this repository, Agents MUST strictly obey these rules:

1. **Upstream Isolation (`.upstream/` is strictly READ-ONLY)**:
   - `.upstream/` contains local read-only mirrors managed via `scripts/sync-upstream.*` and ignored by git.
   - **NEVER** edit files inside `.upstream/`. All adaptations, refinements, and commands MUST live in `plugins/<name>/`.
2. **Language Separation Architecture**:
   - **`skills/` (for AI)**: Must remain **100% original upstream English**, byte-for-byte identical where possible. NEVER translate `SKILL.md` frontmatter or body. This ensures zero merge conflict during upstream pulls.
   - **`commands/` (for Humans)**: Frontmatter `description` MUST be concise, accurate Chinese for OMP slash command autocomplete.
3. **OMP Command Naming Convention**:
   - Commands in `plugins/<plugin>/commands/<cmd>.md` map directly to OMP slash commands (`/<cmd>`).
   - Matt Pocock commands MUST use the `/matt-*` prefix (e.g. `/matt-grill-with-docs`, `/matt-implement`).
   - Caveman commands use `/caveman-*`; Ponytail commands use `/ponytail-*`.
   - **NEVER use colons `:` in command filenames** due to Windows NTFS filesystem constraints.
4. **Flat Skill Directory Requirement**:
   - OMP plugin loaders scan a single directory level: `plugins/<name>/skills/<skill-name>/SKILL.md`.
   - Nested subcategories (e.g. `skills/engineering/tdd/`) MUST be flattened to `skills/tdd/`.
5. **YAGNI on Runtime Extensions**:
   - Do NOT add `extensions/index.ts` unless stateful runtime hooks, status bar indicators, or command toggles are strictly required.
   - Pure prompt/workflow suites (like `mattpocock-skills`) MUST remain zero-runtime.
6. **Mandatory Quality Gate**:
   - Every modification MUST pass both `bash scripts/check.sh` and `powershell scripts/check.ps1` before committing.
