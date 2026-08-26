# Contract: Component Visual & Interaction Specs

**Contract ID**: `CONTRACT-COMPONENT-VISUALS-001`  
**Status**: Stable

---

## 1. Article Reading Binder (`/entries/[slug]/`)

- **Outer Shell**:
  - `max-width: 960px; margin: 0 auto; padding: 24px 16px 64px;`
  - `background: var(--paper);`
  - `border: 3.5px solid var(--black); box-shadow: 8px 8px 0 var(--black);`
  - `background-image: linear-gradient(rgba(24, 24, 27, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(24, 24, 27, 0.04) 1px, transparent 1px); background-size: 24px 24px;`
- **Prose Content Rhythm**:
  - `line-height: 1.8; font-size: 1.05rem; color: var(--dark);`
  - `max-width: 720px; margin: 0 auto;` (65~75 char golden reading length).
  - Headings: `h2` with top margin `2.5rem`, left black stripe border, and `font-black uppercase`.
- **Code & Prompt Block**:
  - `background: #f0eae1; border: 2.5px solid var(--black); box-shadow: 4px 4px 0 var(--black);`
  - `white-space: pre-wrap; word-break: break-word;` (zero horizontal scrollbars).
  - Copy button: 44px touch target, Lucide `Copy` -> `Check` transition with `COPIED!` feedback badge.

---

## 2. Interactive Tactile Buttons

```css
.button-tactile {
  min-height: 44px;
  border: 3.5px solid var(--black);
  border-radius: 0;
  background: var(--red);
  color: var(--white);
  box-shadow: 4px 4px 0 var(--black);
  font-weight: 900;
  transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
}
.button-tactile:hover {
  transform: translate(-2px, -2px);
  box-shadow: 6px 6px 0 var(--black);
}
.button-tactile:active {
  transform: translate(3px, 3px);
  box-shadow: 0 0 0 var(--black);
}
.button-tactile:focus-visible {
  outline: 4px solid var(--black);
  box-shadow: 6px 6px 0 var(--teal);
}
```

---

## 3. Washi Tape Section Dividers

```css
.washi-section-divider {
  width: 100%;
  height: 14px;
  background: repeating-linear-gradient(
    -45deg,
    var(--red),
    var(--red) 4px,
    var(--yellow) 4px,
    var(--yellow) 8px
  );
  border-top: 2.5px solid var(--black);
  border-bottom: 2.5px solid var(--black);
  transform: rotate(-0.5deg);
  margin: 0;
  box-shadow: 2px 2px 0 var(--black);
}
```

---

## 4. Specimen Ledger Rows

```css
.ledger-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border-bottom: 2px solid var(--black);
  background: var(--paper-cotton);
  transition: background 0.15s ease-out, transform 0.15s ease-out;
}
.ledger-row:hover {
  background: var(--paper-butter);
  transform: translateX(4px);
}
.ledger-dot-leader {
  flex: 1;
  border-bottom: 2px dotted var(--black);
  height: 1px;
  margin: 0 8px;
}
```
