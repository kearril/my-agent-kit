# Feature Specification: Local Editor Visual Redesign & Writing Comfort Refactor

**Feature Branch**: `001-editor-visual-redesign`

**Created**: 2026-08-26

**Status**: Draft

**Input**: User description: "我希望有更加舒适的编辑体验和更加舒适的编辑界面。主要是视觉重构，当前界面不适合长时间编辑"

## Clarifications

### Session 2026-08-26
- Q: Markdown 正文编辑区应采用哪种轻量化设计以保证最清爽、快速的输入体验？ → A: Option B（单行微型工具栏：保留一行极简微型按钮如加粗、行内代码、链接、列表，兼顾快速点选与轻量快捷键，不做复杂的多级富文本工具栏，定位为简短条目快速舒适编辑）。
- Q: 条目的元数据字段应该以何种形式在界面中排布以保证快速顺手？ → A: Option A（紧凑头部折叠栏：默认在正文顶部显示核心标题、Slug、草稿开关，高级属性如标签、分类、链接、关联等一键平滑折叠，单页直观且零切换开销）。

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Comfortable Short-Entry Writing & Visual Fatigue Reduction (Priority: P1)

As a digital garden author, I want the local entry editor to provide a warm, comfortable, eye-friendly writing environment with clean typography and generous vertical canvas, so that I can draft, inspect, and tweak short notes, prompts, skills, and links quickly without eye strain or interface clutter.

**Why this priority**: The browser editor is positioned as a lightweight, fast, and comfortable tool for short entries (while heavy long-form editing is handled in dedicated local editors). The visual redesign must eliminate eye fatigue from harsh contrast and remove redundant vertical clutter.

**Independent Test**: Can be independently tested by opening any existing entry or creating a new short entry, verifying that the writing canvas is prominent, eye-friendly, and unobstructed by long lists of metadata inputs.

**Acceptance Scenarios**:

1. **Given** an author opens an entry in the local editor, **When** they view the editor workspace, **Then** the primary focus is on the writing canvas with eye-friendly paper tones, comfortable line heights, and distinct yet non-fatiguing typography.
2. **Given** an entry with metadata and body text, **When** the author starts writing, **Then** the compact header displays primary fields (title, slug, draft status) while secondary fields stay neatly collapsed, providing unobstructed vertical editing height.
3. **Given** an author wants to focus solely on writing and reviewing, **When** they activate the dual-column view, **Then** the entry navigation sidebar folds smoothly, expanding the writing and live preview area.

---

### User Story 2 - Lightweight Markdown Ergonomics & True-to-Site Live Preview (Priority: P1)

As an author writing short Markdown entries, I want essential formatting actions (single-row micro-toolbar for bold, italic, code, link, list), lightweight keyboard shortcuts, and real-time live preview matching the published website's layout, so that I can format content effortlessly and verify the final rendered appearance instantly.

**Why this priority**: Fast short-entry editing requires quick formatting without heavyweight plugin overhead. Immediate live preview confirms exact published appearance.

**Independent Test**: Can be independently tested by typing Markdown with micro-toolbar actions and shortcuts (e.g. bold, link, code), seeing instant debounced rendering in the preview pane, and confirming that the preview exactly matches the reading binder layout and typography of the published entry page.

**Acceptance Scenarios**:

1. **Given** an author is writing body text, **When** they select text and press formatting shortcuts (such as bold, italic, code, link) or click the single-row micro-toolbar, **Then** the corresponding Markdown syntax is inserted or wrapped around the selection, and the cursor or selection is positioned appropriately.
2. **Given** an author is typing in the editor, **When** they press the Tab key or Shift+Tab, **Then** the editor inserts or removes standard 2-space indentation instead of moving browser focus away from the editor.
3. **Given** an author modifies content, **When** they pause typing, **Then** the preview pane updates silently within a brief debounced window (around 300ms) without flashing disruptive stale warnings or requiring manual button clicks.
4. **Given** an author views the live preview pane, **When** examining the rendered output, **Then** it presents the complete entry card and reading binder view—including title, badges, stamps, summary box, metadata deck, links, and formatted prose—identical to the published site layout.
5. **Given** an author is working on changes, **When** they press the save keyboard shortcut (`Ctrl/Cmd + S`), **Then** the draft is saved to disk, a confirmation status appears, and the unsaved indicator clears.

---

### User Story 3 - Ergonomic Metadata Management with Autocomplete (Priority: P2)

As an author categorizing and connecting garden entries, I want to view and edit entry metadata (tags, categories, related entries, links, and dates) through a compact collapsible header with intelligent autocompletion, so that I can reuse established vocabulary easily without cluttering the main writing space.

**Why this priority**: Adhering to the garden's content discipline ("reuse existing vocabulary") requires visibility into established tags and categories. A compact collapsible header keeps secondary metadata easily reachable without vertical sprawling.

**Independent Test**: Can be tested by expanding the compact header's advanced properties, typing a tag prefix to see suggestions from existing entries across the garden, selecting related entries via an interactive selector, and using quick "today" actions for date updates.

**Acceptance Scenarios**:

1. **Given** an author editing an entry, **When** adding tags, **Then** the system provides suggestions matching existing tags across the garden, allowing one-click or Enter selection.
2. **Given** an author updating an entry's revision date, **When** they click the quick date action (e.g. "Today"), **Then** the current date is filled into the update date field instantly.
3. **Given** an author managing related entries, **When** searching for connections, **Then** matches are displayed in a clean searchable selector with type indicators and clear badge selections.
4. **Given** an author managing external links, **When** adding links, **Then** they can quickly input label/URL pairs or choose from common preset labels (such as official repository, live demo, reference article).

---

### User Story 4 - Specimen Ledger Navigation & Organization (Priority: P3)

As an author managing dozens of digital garden entries, I want to quickly search, filter by type/status, sort by recency or title, and toggle the navigation pane, so that I can switch between entries effortlessly and maintain an organized workspace.

**Why this priority**: While writing comfort is the primary goal, seamless entry switching and clear visual feedback for unsaved drafts complete the workbench workflow.

**Independent Test**: Can be tested by filtering the entry ledger by status (draft/local/all) and type (note/prompt/skill/etc.), sorting by modification date, selecting entries, and confirming that unsaved draft warnings prevent accidental loss.

**Acceptance Scenarios**:

1. **Given** a list of entries in the navigation ledger, **When** an author filters by type or draft status, **Then** the list updates immediately showing matching entries with clear type badges and modification stamps.
2. **Given** an author has unsaved changes on the current entry, **When** they attempt to select a different entry, **Then** the ledger highlights the unsaved draft status and preserves work or prompts for confirmation to prevent accidental loss.
3. **Given** an author working on a medium or wide screen, **When** they toggle the sidebar visibility, **Then** the sidebar collapses or expands smoothly without layout jumps or text clipping.

---

### Edge Cases

- **Large Content Performance**: What happens when an entry contains a long Markdown body? The editor and debounced preview must maintain smooth typing responsiveness without lag or UI freezes.
- **Unsaved Changes on Navigation / Close**: How does the system handle browser tab closure or accidental navigation when unsaved modifications exist? The system must prompt a confirmation dialog to guard against data loss.
- **Concurrent Disk Modifications**: How does the system handle an entry being modified externally (e.g. in another text editor or Git)? When saving, version conflicts must be detected, retaining the in-memory draft and notifying the author with clear options.
- **MDX and Non-standard Components**: How does the preview handle MDX entries or custom components? The preview should render standard Markdown elements gracefully and display a clear, non-intrusive indicator that MDX runtime components are best verified in the live site view.
- **Empty & Initial States**: What is displayed when no entry is selected, or when an author creates a new entry from scratch? The workbench must present an inviting blank slate with quick-start templates and clear guidance.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The workspace MUST adopt an eye-friendly, comfortable visual palette adhering to the garden's craft workshop design principles (warm paper backgrounds, comfortable text contrast, clear non-glare borders, and distinct visual hierarchy).
- **FR-002**: The writing interface MUST provide a compact collapsible header above the body editor, displaying core fields (Title, Slug, Draft toggle) by default, while allowing secondary metadata (Summary, Tags, Category, Dates, Links, Related) to be expanded or collapsed with a single click.
- **FR-003**: The editor MUST provide a lightweight, single-row micro-toolbar above the text area containing essential formatting actions (Bold, Italic, Inline Code, Link, Bullet List, Numbered List, Quote).
- **FR-004**: The editor MUST support standard authoring keyboard shortcuts for common actions (at minimum: Save `Ctrl/Cmd+S`, Bold `Ctrl/Cmd+B`, Italic `Ctrl/Cmd+I`, Link `Ctrl/Cmd+K`, Inline Code `Ctrl/Cmd+E`).
- **FR-005**: The editor MUST handle the `Tab` and `Shift+Tab` keys within the text area to insert and remove 2-space indentation instead of shifting browser focus.
- **FR-006**: The editor MUST provide real-time writing statistics, including total word count, character count, and estimated reading time.
- **FR-007**: The live preview MUST update automatically with silent debouncing (approx. 300ms after user stops typing) without requiring manual refresh clicks or flashing persistent warning banners.
- **FR-008**: The live preview MUST render the complete entry structure (header, badges, status stamps, summary box, metadata deck, external links, related references, and formatted prose) matching the published site's reading layout and typography.
- **FR-009**: The metadata inspector MUST provide tag auto-completion derived from existing tags across all garden entries to encourage vocabulary reuse.
- **FR-010**: The metadata inspector MUST provide a one-click action to populate date fields (such as `updatedAt` and `publishedAt`) with the current date.
- **FR-011**: The workspace MUST support multiple view arrangements (at minimum: full three-column workbench, dual-column writing & preview, focused editor-only view, and full preview view).
- **FR-012**: The navigation ledger MUST allow searching by title and slug, filtering by entry type and publication status (All / Draft / Local), and sorting by last updated date, creation date, or alphabetical title.
- **FR-013**: The editor MUST preserve unsaved form state across view/layout toggles and warn the author before destructive actions or selecting another entry when unsaved changes exist.
- **FR-014**: The editor MUST strictly operate within the local development environment (`localhost` / loopback) and MUST NOT leak into production build bundles.

### Key Entities

- **Garden Entry**: The central content unit (Prompt, Skill, MCP, Website, Project, Note), comprising an immutable slug, title, summary, type, publication dates, status (draft/local), tags, links, related connections, type-specific fields (e.g. Note category), and Markdown body.
- **Workspace Layout Mode**: The active visual arrangement of the editing console (Three-column, Dual-column focus, Full Editor, Full Preview).
- **Garden Vocabulary**: The aggregated index of existing tags, categories, and entry identifiers used to power autocompletion and prevent content fragmentation.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Authors can write and edit continuously without experiencing visual fatigue caused by harsh contrast or cramped layout (validated through user testing and positive comfort feedback).
- **SC-002**: Common formatting operations (e.g. bolding text, inserting links, structuring lists) require 50% fewer keystrokes and zero manual character-by-character syntax typing through micro-toolbar buttons and shortcuts.
- **SC-003**: Live preview renders within 400ms of typing pause, achieving zero manual preview button clicks during typical drafting sessions.
- **SC-004**: Visual parity between the editor live preview and the final published entry page reaches 95%+ in layout, typography, and card components.
- **SC-005**: 100% of established tags and categories are discoverable via autocompletion, reducing duplicate or typo-induced tags to 0.
- **SC-006**: Zero data loss occurs during layout toggling, accidental tab navigation, or external file conflict scenarios.

## Assumptions

- **A-001**: The local editor is exclusively used by the site author/maintainer in a local desktop browser (Chrome, Edge, Firefox, Safari) during `pnpm dev` for quick, lightweight authoring of short entries. Complex long-form drafting can be performed in external specialized editors.
- **A-002**: The underlying content files remain standard Markdown/MDX in `src/content/entries/` following the existing Content Collections schema.
- **A-003**: The refactoring does not modify public routing, public pages, or production build output.
- **A-004**: The existing optimistic locking mechanism (SHA-256 revision checking) remains the baseline safety check for disk writes.
