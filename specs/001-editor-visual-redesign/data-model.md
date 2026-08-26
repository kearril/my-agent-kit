# Data Model & State Structures: Local Editor Visual Redesign & Writing Comfort Refactor

**Feature**: `001-editor-visual-redesign`
**Date**: 2026-08-26
**Status**: Completed

## 1. Core Entities & Structures

### `EntryFormData` (Client-Side Editing Draft State)
Represents the editable form fields for an active entry in the workbench.

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `slug` | `string` | Yes | Immutable kebab-case identifier (e.g. `my-note`). Read-only in `edit` mode. |
| `title` | `string` | Yes | Entry display title. |
| `summary` | `string` | Yes | Brief description used on cards and summary boxes. |
| `type` | `EntryType` | Yes | One of `prompt`, `skill`, `mcp`, `website`, `project`, `note`. Read-only in `edit` mode. |
| `draft` | `boolean` | Yes | Whether the entry is a draft (default: `false` for published entries, `true` for new drafts). |
| `source` | `'self' \| 'adapted' \| 'external'` | Yes | Content origin (default: `self`). |
| `tags` | `string[]` | No | List of unique tags for precise Explore filtering. |
| `links` | `Array<{ label: string; url: string }>` | No | External reference links. |
| `related` | `string[]` | No | Slugs of related entries within the garden. |
| `createdAt` | `string` | Yes | ISO date string (`YYYY-MM-DD`). |
| `publishedAt` | `string` | Conditional | ISO date string (`YYYY-MM-DD`). Required if `draft: false`. Forbidden if `draft: true`. Immutable once set. |
| `updatedAt` | `string` | Yes | ISO date string (`YYYY-MM-DD`). Defaults to today on edit. |
| `featuredOrder` | `string` | No | Optional integer `1` to `6` for homepage featured cards. |
| `typeFields` | `Record<string, unknown>` | No | Type-specific fields (e.g. `category` for `note`). |
| `body` | `string` | Yes | Markdown content. |
| `extension` | `string` | Yes | File extension (`.md` or `.mdx`, default: `.md`). |
| `isLocal` | `boolean` | Yes | Whether the entry file is a `.local.md` ignored by git. |
| `revision` | `string` | Yes | SHA-256 hash of the disk file for optimistic concurrency control. |

---

### `WorkspaceLayoutState` (Workbench State Model)
Extends `editor-state.ts` to manage panes, collapse states, and focus modes.

| Field | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pane` | `'split' \| 'editor' \| 'preview'` | `'split'` | Active column visibility arrangement. |
| `sidebarCollapsed` | `boolean` | `false` | Whether the left navigation sidebar is folded away. |
| `metadataCollapsed` | `boolean` | `true` | Whether secondary metadata fields (tags, links, category) are folded in the compact header. |
| `selectedSlug` | `string \| null` | `null` | Currently selected entry slug. |
| `mode` | `'idle' \| 'edit' \| 'create'` | `'idle'` | Workspace mode. |
| `dirty` | `boolean` | `false` | Whether uncommitted edits exist in `EntryFormData`. |
| `preview` | `{ html: string } \| null` | `null` | Rendered HTML preview payload. |

---

### `GardenVocabulary` (Client-Side Vocabulary Cache)
Computed derived state used for tag autocompletion and category suggestions.

| Field | Type | Description |
| :--- | :--- | :--- |
| `allTags` | `Array<{ tag: string; count: number }>` | List of unique tags across all entries, sorted by frequency. |
| `allCategories` | `string[]` | List of unique note categories (e.g. `AI`, `架构`, `实践`, `随笔`). |
| `entrySlugMap` | `Map<string, { title: string; type: EntryType }>` | Quick lookup for related entry titles and types. |

---

### `MarkdownFormatAction` (Micro-Toolbar Action Definition)
Defines operations supported by the single-row formatting toolbar.

| Action ID | Label | Prefix | Suffix | Placeholder | Shortcut |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `bold` | **B** | `**` | `**` | `粗体文字` | `Ctrl/Cmd + B` |
| `italic` | *I* | `*` | `*` | `斜体文字` | `Ctrl/Cmd + I` |
| `code` | `</>` | `` ` `` | `` ` `` | `代码` | `Ctrl/Cmd + E` |
| `link` | 🔗 | `[` | `](url)` | `链接文字` | `Ctrl/Cmd + K` |
| `quote` | ❝ | `> ` | `` | `引用文字` | None |
| `bullet-list` | • 列表 | `- ` | `` | `列表项` | None |
| `numbered-list` | 1. 列表 | `1. ` | `` | `列表项` | None |
| `code-block` | ``` 代码块 | ````\n` | `\n```` | `代码内容` | None |

---

## 2. Validation & Invariants

1. **Slug Invariance**: Once an entry is created, `slug` cannot be mutated via `PUT /__garden-editor/api/entries/:slug`.
2. **Draft & PublishedAt Rule**:
   - `draft: true` $\implies$ `publishedAt` MUST be empty / undefined.
   - `draft: false` $\implies$ `publishedAt` MUST be a valid `YYYY-MM-DD` date string.
   - If `initialPublishedAt` exists, `publishedAt` is locked and cannot be changed.
3. **Optimistic Locking**:
   - `PUT` request MUST send `revision`. If `revision !== diskRevision`, server rejects with `409 Conflict`, and client displays a conflict alert without wiping the local draft.
4. **Markdown Formatting Boundary**:
   - Toolbar actions on multi-line selections wrap lines appropriately (e.g. prefixing `- ` to each selected line).
