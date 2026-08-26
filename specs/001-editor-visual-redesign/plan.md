# Implementation Plan: Local Editor Visual Redesign & Writing Comfort Refactor

**Branch**: `001-editor-visual-redesign` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-editor-visual-redesign/spec.md`

## Summary

Refactor the local development entry editor (`/__garden-editor/`) into an eye-friendly, lightweight, and ergonomic authoring studio ("Paracosm Studio"). The refactoring replaces harsh high-contrast blocks with warm paper craft styling, introduces a compact collapsible header that restores vertical writing height, adds a single-row Markdown micro-toolbar with standard shortcuts, connects a 300ms debounced live preview with true-to-site reading binder styling, and modularizes the 1800+ line monolith into maintainable components.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19.x / Node.js >= 22.12.0
**Primary Dependencies**: React 19, React DOM 19, Astro 7.x, Marked 18.x (dev-only for markdown preview parsing), Lucide SVGs (for icons)
**Storage**: Local Markdown/MDX files in `src/content/entries/<type>/` via `entry-store.ts` (disk-based, SHA-256 revision concurrency)
**Testing**: Vitest 4.x (`pnpm test`), Astro Build (`pnpm build`)
**Target Platform**: Desktop Evergreen Browsers (Chrome, Edge, Firefox, Safari) during `pnpm dev`
**Project Type**: Dev-only workbench module served via Astro integration middleware (`local-editor.ts`)
**Performance Goals**: <400ms debounced live preview update, instantaneous shortcut response, 0ms input lag during typing
**Constraints**: 100% loopback access isolation (`127.0.0.1`), zero dev code leaked into static production builds (`dist/`), strictly neo-brutalist / paper craft tokens from `docs/DESIGN.md` (no round corners, no blur, no gradients)
**Scale/Scope**: ~10–100 garden entries, 6 core entry types (`prompt`, `skill`, `mcp`, `website`, `project`, `note`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Rule | Status | Evaluation & Evidence |
| :--- | :--- | :--- |
| **I. Static-First Astro & Island Boundaries** | **PASS** | Editor runs strictly under `src/dev/` and `local-editor.ts` middleware during `pnpm dev`. It is never imported by public pages or layouts. |
| **II. Content Collections as Source of Truth** | **PASS** | Directly reads and writes `src/content/entries/` following the `src/content.config.ts` schema. No duplicate database. |
| **III. Stable Public Content Identity** | **PASS** | `slug` remains immutable in edit mode and enforces kebab-case. PublishedAt/draft invariants strictly upheld. |
| **IV. Intentional Simplicity & Clear Boundaries** | **PASS** | Zero heavy editor frameworks (Monaco/CodeMirror/WYSIWYG) introduced. Uses enhanced native textarea + micro-toolbar for lightweight editing of short entries. |
| **V. Verifiable Quality & Traceable Delivery** | **PASS** | Feature spec, research, data model, contracts, and quickstart generated. Unit tests in `tests/dev/` defend state and API. |
| **Design & Accessibility Guidelines** | **PASS** | Follows `docs/DESIGN.md` paper tokens (`--paper`, `--paper-dark`, `--paper-cotton`, `--board-kraft`), 4px/3px black borders, no border radius, 44px touch targets. |

## Project Structure

### Documentation (this feature)

```text
specs/001-editor-visual-redesign/
├── spec.md              # Feature specification
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical research & decisions
├── data-model.md        # State structures & data contracts
├── quickstart.md        # Verification and walkthrough guide
├── contracts/           # API and component contracts
│   ├── editor-api.contract.md
│   └── workbench-ui.contract.md
├── checklists/
│   └── requirements.md  # Specification quality checklist
└── tasks.md             # Task breakdown (generated via /speckit.tasks)
```

### Source Code Architecture

```text
src/dev/
├── editor.tsx                     # Top-level workbench coordinator & root mounting
├── editor.css                     # Warm paper craft & neo-brutalist styling system
├── editor-state.ts                # Pure reducer state machine for panes and modes
├── components/                    # Modular UI components
│   ├── StudioToolbar.tsx          # Top toolbar with branding, status, and view toggles
│   ├── NavSidebar.tsx             # Foldable navigation list with search and filters
│   ├── CompactHeader.tsx          # Compact collapsible header for entry metadata
│   ├── MarkdownToolbar.tsx        # Single-row formatting micro-toolbar & stats
│   ├── ArticleBinderPreview.tsx   # Live sandboxed preview with true-to-site styling
│   └── controls/                  # Reusable form controls
│       ├── TagPicker.tsx          # Autocomplete tag chip selector
│       ├── RelatedPicker.tsx      # Multi-select related entry selector
│       └── LinkRepeater.tsx       # External links repeater
├── hooks/                         # Ergonomic React hooks
│   ├── useEditorShortcuts.ts      # Keyboard shortcuts (Ctrl+S, Ctrl+B, Ctrl+K, Tab)
│   ├── useDebouncedPreview.ts     # 300ms debounced live preview trigger
│   └── useGardenVocabulary.ts     # In-memory tag and category vocabulary aggregator
├── lib/                           # Pure helper utilities
│   ├── markdown-actions.ts        # Textarea formatting insertion & selection wrapping
│   └── preview-renderer.ts        # Complete article binder HTML synthesis
└── server/                        # Backend storage & API (existing, unchanged)
    ├── entry-store.ts             # File system CRUD with SHA-256 revision check
    └── editor-api.ts              # API request router & Marked markdown parsing
```

## Complexity Tracking

> No violations of Constitution principles detected. No exceptions required.
