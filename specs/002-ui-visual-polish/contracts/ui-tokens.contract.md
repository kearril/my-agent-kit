# Contract: UI Design Tokens & Foundations

**Contract ID**: `CONTRACT-UI-TOKENS-001`  
**Status**: Stable

---

## 1. Color Tokens (CSS Custom Properties)

The following tokens MUST be defined in `src/styles/tokens.css` under `:root` and remain the single source of truth:

```css
:root {
  /* Ink & Contrast */
  --black: #18181b;
  --white: #ffffff;
  --dark: #27272a;
  --muted: #52525b;

  /* Paper Craft Foundations */
  --paper: #fbf9f4;
  --paper-dark: #efece4;
  --paper-cinnamon: #f09a8f;
  --paper-butter: #fce4a6;
  --paper-cotton: #faf8f5;
  --paper-sage: #b7d5c4;
  --board-kraft: #e6e0d4;

  /* Accent & Pop Stamp Colors */
  --red: #e63946;
  --teal: #2a9d8f;
  --yellow: #e9c46a;
  --mint: #95e1d3;
  --coral: #e76f51;
  --blue: #457b9d;

  /* Engineering Paper Code Background */
  --code-bg: #f0eae1;
}
```

---

## 2. Geometry & Shadow Rules

- `border-radius`: STRICTLY `0` across all elements (no rounded corners).
- `border`: `2.5px solid var(--black)` ~ `4px solid var(--black)`.
- `box-shadow`: STRICTLY solid hard-offset shadows (e.g. `4px 4px 0 var(--black)`, `6px 6px 0 var(--black)`, `8px 8px 0 var(--black)`). Zero blur allowed (`blur: 0`).
- `rotation`: Max `3deg` for stamp/tape accents; must transition smoothly to `0deg` on hover without layout reflow.

---

## 3. Accessibility & Motion Rules

- `focus-visible`: `outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal);`
- `min-touch-target`: `44px × 44px` on all mobile clickable targets.
- `@media (prefers-reduced-motion: reduce)`: All `transform` translations/rotations MUST be disabled (`transform: none !important; transition-duration: 0.01ms !important;`).
