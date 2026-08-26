# Research & Technical Decisions: Local Editor Visual Redesign & Writing Comfort Refactor

**Feature**: `001-editor-visual-redesign`
**Date**: 2026-08-26
**Status**: Completed

## 1. Visual Theme & Eye-Comfort Palette

### Decision
Integrate the digital garden's official paper craft tokens (`--paper`: `#fbf9f4`, `--paper-dark`: `#efece4`, `--paper-cotton`: `#faf8f5`, `--board-kraft`: `#e6e0d4`, `--red`: `#e63946`, `--teal`: `#2a9d8f`, `--yellow`: `#e9c46a`, `--dark`: `#27272a`, `--muted`: `#52525b`) directly into `editor.css`.

### Rationale
- The existing editor used harsh neon backgrounds and pure white blocks that caused eye strain during extended editing sessions.
- Adopting the warm paper textures and retro drafting grid (`24px x 24px` subtle grid) aligns the editor 100% with `docs/DESIGN.md` while providing a soft, comfortable contrast for writing.
- Straightforward CSS variable alignment guarantees zero visual drift between the editor shell and the main website.

### Alternatives Considered
- **Dark Mode for Editor**: Rejected because the published digital garden is designed around a warm retro physical stationery/paper theme. A dark mode would break visual parity between editing and reading.
- **Third-party UI component libraries (Chakra, AntD, Tailwind UI)**: Rejected by Constitution (Principle IV) and `docs/DESIGN.md` (no rounded corners, no blur shadows, no generic themes).

---

## 2. Lightweight Markdown Micro-Toolbar & Textarea Ergonomics

### Decision
Implement a lightweight, zero-dependency textarea enhancement utility (`src/dev/lib/markdown-actions.ts`) paired with a single-row micro-toolbar (`MarkdownToolbar.tsx`) and standard keyboard shortcut handlers (`useEditorShortcuts.ts`).

### Capabilities
- **Single-row Micro-Toolbar**: Buttons for Bold (`**text**`), Italic (`*text*`), Inline Code (`` `code` ``), Link (`[text](url)`), Bullet List (`- `), Numbered List (`1. `), Quote (`> `), and Code Block (````code````).
- **Keyboard Shortcuts**: `Ctrl/Cmd + S` (Save), `Ctrl/Cmd + B` (Bold), `Ctrl/Cmd + I` (Italic), `Ctrl/Cmd + K` (Link), `Ctrl/Cmd + E` (Inline Code).
- **Indentation Handling**: Intercept `Tab` and `Shift + Tab` in the textarea to insert or unindent 2 spaces instead of moving browser focus.
- **Selection Preservation**: Wrapping selected text or inserting placeholder with cursor repositioned inside the syntax delimiters.

### Rationale
- The user explicitly positioned the browser editor as a **lightweight, fast, and comfortable tool for short entries** (complex long-form drafting will be done in external editors).
- Zero external dependencies: no heavy editor runtimes (Monaco, CodeMirror, Slate, Lexical) needed. This keeps load times instantaneous and eliminates maintenance complexity.

### Alternatives Considered
- **Monaco / CodeMirror 6**: Overkill for short-entry editing; adds massive bundle size and styling overrides.
- **WYSIWYG Markdown editors (Milkdown / TipTap)**: High complexity, unpredictable Markdown round-trip serialization, and risk of breaking frontmatter.

---

## 3. Metadata Layout: Compact Collapsible Header (Accordion Header)

### Decision
Structure the editor column into a clear vertical layout:
1. **Header Bar**: Title, Slug, Type badge, Draft switch, and a smooth `[展开/收起属性 ▼]` toggle.
2. **Collapsible Metadata Drawer**: Summary, Tags (with autocomplete chips), Category (for notes), Dates (with "今天" quick button), External Links repeater, and Related entries selector.
3. **Single-row Micro-Toolbar**: Markdown formatting buttons.
4. **Full-height Body Textarea**: Responsive height that expands to take all remaining vertical viewport space.

### Rationale
- Maximizes visible writing canvas upon opening any entry (80%+ of the viewport is dedicated to writing).
- Eliminates the need to scroll through 15+ vertical form fields to reach the body.
- Single-page layout requires zero tab switching, keeping drafting fast and intuitive.

### Alternatives Considered
- **Tabbed Interface (Tabs: Body vs. Metadata)**: Rejected because switching tabs breaks editing flow and hides basic properties like title while typing body text.
- **Sidebar Drawer**: Rejected because it overlaps or squishes the three-column layout.

---

## 4. Live Debounced Preview & True-to-Site Article Binder Styling

### Decision
Create a custom `useDebouncedPreview` hook that triggers preview rendering 300ms after the author stops typing.
Upgrade `buildPreviewDocument(html, formData)` in `src/dev/lib/preview-renderer.ts` to inject the full article shell structure (Header, Category Badge, Status Stamp, Title, Summary Box, Metadata Deck, Links, Connections, and `.prose` body) with exact CSS styles from `article.css` and `tokens.css`.

### Rationale
- Authors can instantly verify how tags, summary, links, and body text will look together on the published site.
- Silent 300ms debouncing eliminates the intrusive "预览已过期" (stale preview) warning banner while preventing unnecessary server requests.

### Alternatives Considered
- **Manual "Preview" Button Only**: Causes friction; author must keep clicking after every edit.
- **Instant Un-debounced Preview on Every Keystroke**: Causes excessive API calls and potential cursor/iframe jitter.

---

## 5. Garden Vocabulary Aggregator for Tags & Categories

### Decision
Extract all unique tags and categories in-memory from the loaded `entries` list in `editor.tsx` (`useGardenVocabulary(entries)`). Provide an interactive autocomplete dropdown in `TagPicker.tsx` and suggestions for Note `category`.

### Rationale
- Fulfills the `docs/CONTENT.md` rule: "优先复用已有词汇，不为每个新想法创建标签" (reuse existing vocabulary).
- Pure client-side computation requires zero new API endpoints or database changes.

### Alternatives Considered
- **Backend Vocabulary API endpoint**: Unnecessary overhead since all entry summaries are already fetched upon loading the editor.
