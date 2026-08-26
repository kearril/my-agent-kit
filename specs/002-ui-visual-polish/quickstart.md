# Quickstart & Visual Validation Guide: UI Visual Polish

**Feature**: `002-ui-visual-polish`  
**Date**: 2026-08-26  
**Status**: Ready

---

## 1. Prerequisites & Setup

Ensure all dependencies and dev environment are initialized:

```bash
pnpm install
```

Start the Astro dev server:

```bash
pnpm dev
```

The site will be available at `http://localhost:4321/`.

---

## 2. Validation Scenarios

### Scenario 1: Long-Form Reading Experience & Typography
1. Open `http://localhost:4321/entries/agent-oh-my-pi/` (or any public entry).
2. **Verify Layout**:
   - Container is bounded to 960px max width and centered.
   - Background is warm paper (`#fbf9f4`) with subtle `24px × 24px` drafting grid.
   - Line-height is comfortable (`1.8`), line length is constrained to ~65-75 characters.
3. **Verify Code Blocks**:
   - Background is engineering paper (`#f0eae1`), text is dark ink (`var(--dark)`).
   - Code wraps softly without horizontal scrollbars.
   - Click the copy button: verify SVG checkmark transition and `COPIED!` feedback.
4. **Verify Callouts & Summary Box**:
   - Summary box at the top is rendered with kraft paper background and left border ruler.
   - Backlinks and related entries deck at the bottom are neatly aligned with Lucide icons.

### Scenario 2: Tactile Feedback & Micro-Interactions
1. Open `http://localhost:4321/`.
2. **Verify Button States**:
   - Hover over primary action buttons: verify `-2px, -2px` lift and shadow expansion to `6px ~ 8px`.
   - Click down (Active): verify `3px, 3px` depression and shadow reduction to 0.
   - Press `Tab` to navigate: verify sharp `focus-visible` dual-layer indicator (`outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal);`).
3. **Verify Paper Card Hover**:
   - Hover over featured cards: verify smooth transition from tilted angle (e.g. `-1.5deg`) to `0deg` without layout shift.
4. **Verify Ledger Rows**:
   - Hover over rows in Updates / Notes: verify warm yellow highlight (`--paper-butter`) and `4px` horizontal slide.

### Scenario 3: Washi Tape Dividers & Homepage Rhythm
1. Scroll down the homepage from Hero through Featured, Updates, Notes, and Explore.
2. Verify washi tape striped divider strips separating major sections cleanly with tactile workshop feel.

### Scenario 4: Explore Island Interactions
1. Scroll to the Explore section on the homepage.
2. Type in search keywords: verify smooth debounced results and live specimen count badge.
3. Click asset type filter chips: verify instant filtering and active badge highlight.
4. Click card to open modal dialog (if enabled): verify backdrop scroll lock and `Esc` key closing.

### Scenario 5: Accessibility & Reduced Motion
1. In browser DevTools, emulate `prefers-reduced-motion: reduce`.
2. Hover and click interactive elements: verify all translations and rotations are disabled and transitions remain smooth and instant.

---

## 3. Automated Test & Build Suite

Run Vitest unit tests and Astro static build verification:

```bash
pnpm test && pnpm build
```

Expected result: 100% tests passing, zero build errors, zero production leaks.
