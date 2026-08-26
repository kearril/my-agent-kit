# Implementation Plan: UI Visual Polish & Reading Comfort Enhancement

**Branch**: `002-ui-visual-polish` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/002-ui-visual-polish/spec.md`

## Summary

This feature comprehensively elevates the public user interface of Paracosm Garden according to `docs/DESIGN.md` (Playful Neo-Brutalist & Paper Craft Scrapbook Workshop). It delivers:
1. **Long-Form Reading Comfort**: Reading Binder container (`max-width: 960px`), 65~75 char golden reading length, line-height 1.8, warm `#fbf9f4` paper background, subtle `24px × 24px` drafting grid, and `#f0eae1` engineering paper code blocks with soft-wrapping and one-click SVG copy feedback.
2. **Tactile Micro-Interactions**: Unified 3-state physical button/card feedback (Hover lift & shadow expansion, Active depression to zero shadow, Focus-visible high-contrast dual ring) and playful paper sheet straighten-up (`rotate(-1.5deg)` -> `rotate(0deg)`).
3. **Clearer Interface Hierarchy**: Diagonal striped washi tape section dividers, specimen ledger table rows with dot-leaders and full-row sliding highlights, and enhanced Explore Island search/filtering.
4. **Lucide SVG Icon System**: Clean, zero-emoji, 2.25px stroke-width tactile SVG icons for asset types (Prompt, Skill, MCP, Website, Project, Note) and operational metadata (Calendar, Clock, Tag, ExternalLink, Copy).

## Technical Context

**Language/Version**: TypeScript 5.8+ / Astro 7.2+ / React 19  
**Primary Dependencies**: Astro, `@astrojs/react`, `@astrojs/mdx`, `@lucide/astro` (existing zero-runtime icon library)  
**Storage**: Astro Content Collections (`src/content/entries/`)  
**Testing**: Vitest (`pnpm test`), Astro Build (`pnpm build`)  
**Target Platform**: Modern desktop, tablet, and mobile web browsers (Chromium, Firefox, Safari)  
**Project Type**: Static site generation (SSG) with localized interactive React Islands  
**Performance Goals**: Zero client-side JS overhead on static reading pages; <100ms copy and filter feedback; 60fps CSS transitions without layout thrashing  
**Constraints**: Zero rounded corners (`border-radius: 0`), solid black borders (`2.5px ~ 4px`), hard offset shadows (no blur), rotation $\le 3^\circ$, strict adherence to `prefers-reduced-motion: reduce`, min touch target 44px  
**Scale/Scope**: All public pages (Homepage, `/entries/[slug]`, Explore Island, SiteHeader, SiteFooter) and stylesheets (`article.css`, `home.css`, `tokens.css`, `base.css`, `responsive.css`)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Static-First Astro & Island Boundaries**: Public pages remain static Astro components; React is strictly confined to `src/components/islands/ExploreIsland.tsx`.
- [x] **II. Content Collections as Source of Truth**: No duplicated entry data in components; all entry metadata and markdown rendering come from `src/content/entries/`.
- [x] **III. Stable Public Content Identity**: Canonical URLs `/entries/<slug>/` and immutable slugs remain unchanged.
- [x] **IV. Intentional Simplicity & Clear Boundaries**: Zero new heavy runtime dependencies; styles placed in `src/styles/`, components in `src/components/`, logic in `src/lib/`.
- [x] **V. Verifiable Quality & Traceable Delivery**: Fully documented in `spec.md`, `plan.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, and tracked via tasks.
- [x] **Design & Accessibility**: No rounded corners, no blur shadows, no gradients, no emojis; strict 44px touch targets, `focus-visible`, and `prefers-reduced-motion` compliance.

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-visual-polish/
├── plan.md              # This file
├── research.md          # Architecture decisions & research
├── data-model.md        # Visual entity models & token mappings
├── quickstart.md        # Verification scenarios
├── checklists/
│   └── requirements.md  # Quality checklist
├── contracts/
│   ├── ui-tokens.contract.md
│   └── component-visuals.contract.md
└── tasks.md             # Implementation tasks (/speckit.tasks)
```

### Source Code Touch-Points

```text
src/
├── styles/
│   ├── tokens.css       # Design tokens, colors, transitions
│   ├── base.css         # Global button, card, focus-visible resets
│   ├── article.css      # Reading Binder, typography, code blocks, callouts
│   ├── home.css         # Washi tape dividers, ledger tables, hero & section rhythms
│   └── responsive.css   # Mobile & tablet 44px touch targets & layout guards
├── components/
│   ├── layout/
│   │   ├── SiteHeader.astro  # Header tactile buttons & breadcrumbs
│   │   └── SiteFooter.astro  # Footer tactile links & stamps
│   ├── home/
│   │   ├── Hero.astro             # Tactile buttons, badges & Lucide icons
│   │   ├── FeaturedSection.astro  # Straighten-up paper sheets & type badges
│   │   ├── UpdatesSection.astro   # Ledger table with dot-leaders & hover slide
│   │   ├── NotesSection.astro     # Ledger table & note stamps
│   │   └── ExploreSection.astro   # Section header & washi tape divider
│   └── islands/
│       └── ExploreIsland.tsx      # Tactile filter chips, clear button, modal polish
└── pages/
    ├── index.astro                # Homepage assembly & washi tape section dividers
    └── entries/
        └── [slug].astro           # Reading binder shell, summary box, copy feedback, backlinks
```

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|:---|:---|:---|
| None | All changes leverage existing `@lucide/astro`, native CSS, and existing Astro/React setup | N/A |
