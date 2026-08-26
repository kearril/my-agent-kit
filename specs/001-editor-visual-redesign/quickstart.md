# Quickstart & Verification Guide: Local Editor Visual Redesign & Writing Comfort Refactor

**Feature**: `001-editor-visual-redesign`
**Date**: 2026-08-26

## Prerequisites
- Node.js >= 22.12.0
- pnpm

## Setup & Launch

```bash
# 1. Install dependencies (if needed)
pnpm install

# 2. Start Astro development server
pnpm dev
```

Open your browser and navigate to:
```text
http://localhost:4321/__garden-editor/
```

---

## Runnable Verification Scenarios

### Scenario 1: Warm Paper Theme & Visual Comfort
1. Open `http://localhost:4321/__garden-editor/`.
2. Observe the workbench background and panes:
   - Verify that the background uses the warm craft paper texture (`--paper` / `--paper-dark`).
   - Verify that borders are solid black without blurry gradients.
   - Verify that all panels have clear, eye-friendly typography.

### Scenario 2: Compact Collapsible Header & Unobstructed Writing
1. Select any entry from the left navigation list (e.g. `agent-oh-my-pi`).
2. Verify that the center editing pane displays:
   - A single top header row with Title, Slug, Type, Draft badge, and `[展开属性 ▼]` button.
   - The body editing area immediately below the single-row toolbar, occupying the majority of the vertical space.
3. Click `[展开属性 ▼]`:
   - Verify that secondary metadata (Summary, Tags, Category, Dates, Links, Related entries) expands cleanly.
4. Click `[收起属性 ▲]`:
   - Verify that it collapses smoothly, restoring maximum writing space.

### Scenario 3: Single-Row Markdown Micro-Toolbar & Shortcuts
1. In the Markdown text area, select a word and click the **B** button on the micro-toolbar.
   - Verify that `**word**` is inserted around the selection.
2. Select text and press `Ctrl+B` (or `Cmd+B` on macOS).
   - Verify that bold formatting toggles.
3. Press `Tab` inside the textarea.
   - Verify that 2 spaces are inserted at the cursor without losing focus.
4. Press `Shift+Tab`.
   - Verify that 2 spaces are removed from the current line.
5. Press `Ctrl+S` (or `Cmd+S`).
   - Verify that the entry is saved to disk and the status changes to "所有改动已保存".

### Scenario 4: Live Debounced Preview & Authentic Binder Styling
1. Modify a heading or paragraph in the body text area.
2. Pause typing for ~300ms.
   - Verify that the right preview pane updates silently without any disruptive "stale" warnings.
   - Verify that the preview displays the complete article binder layout (Category badge, Status stamp, Summary Box, Metadata deck, and styled `.prose`).

### Scenario 5: Tag Autocompletion & Quick Today Fill
1. Expand the compact header.
2. Type `A` in the tag input field.
   - Verify that a dropdown appears suggesting existing tags (e.g. `AI`, `自动化`).
3. Click "今天" next to the Update Date field.
   - Verify that the current date (`YYYY-MM-DD`) is immediately populated.

### Scenario 6: Production Build Isolation Check
```bash
# Verify unit tests pass
pnpm test

# Verify production build contains ZERO dev editor code or routes
pnpm build
```
- Verify that `pnpm build` succeeds with zero errors and no `/src/dev/` or `/__garden-editor` routes in `dist/`.
