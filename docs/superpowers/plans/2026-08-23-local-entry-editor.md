# Local Entry Editor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a localhost-only Astro development editor that creates and edits typed Content Collection Markdown/MDX source entries without shipping an editor route, bundle, or write API in the static production site.

**Architecture:** A dev-only Astro Integration mounts a loopback-protected Vite middleware adapter. The adapter delegates to framework-free editor API and file-store modules; those modules validate a central entry-type registry, serialize YAML Frontmatter, perform revision checks, and refresh Astro content after a successful write. A React/Vite development module renders the approved desktop three-column workbench and consumes the localhost API.

**Tech Stack:** Astro 7 static output and Integration hooks, Vite dev middleware, React 19, TypeScript strict mode, Vitest 4, `yaml` and `marked` as direct development dependencies.

**Spec:** `docs/superpowers/specs/2026-08-23-local-entry-editor-design.md`

## Global Constraints

- Use pnpm; add `yaml` and `marked` as direct development dependencies and commit matching `package.json` and `pnpm-lock.yaml` changes.
- Content Collections remain the only content source of truth; the editor writes only `src/content/entries/` source files.
- `slug` is lowercase ASCII kebab-case, globally unique, immutable after creation, and maps to `/entries/<slug>/`.
- Existing entry `type`, source path, extension, `createdAt`, and first nonempty `publishedAt` are read-only in the editor.
- New entries default to `draft: true`; `createdAt` and `updatedAt` are today; an entry made public must have `publishedAt`.
- Existing `updatedAt` becomes today only after a successful explicit save.
- Type-specific Frontmatter fields are strict, flat top-level fields defined in one type registry. Never introduce a free `metadata` object or accept unknown fields.
- The editor supports all local source entries, including draft and `*.local.md(x)` entries; it does not delete, batch-edit, migrate type, rename slug, or move files.
- The editor is desktop-only. It uses a persistent left navigation column, editable and preview columns, and explicit expand controls that hide only the opposite main column.
- The editor exists only at `http://localhost` development runtime. Reject non-loopback socket addresses; production `dist` contains no `__garden-editor` route or editor JavaScript.
- Preview only unsaved `.md` data; raw HTML is escaped, local relative images show an unsupported notice, and `.mdx` preview is disabled.
- Follow `docs/DESIGN.md`: square 4px black borders, hard shadows, no gradients/blur/rounded corners, visible keyboard focus, 44px controls, textual status, and reduced-motion support.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `package.json` | Add dev-only parser and Markdown renderer dependencies. |
| `pnpm-lock.yaml` | Lock dependency resolution. |
| `src/lib/entry-data.ts` | Type registry, shared field definitions, editor input types, and reusable schema refinement. |
| `src/content.config.ts` | Construct the Content Collection schema from shared entry definitions while retaining collection reference validation. |
| `tests/lib/entry-data.test.ts` | Validate common and type-specific input constraints independently of Astro routes. |
| `src/dev/server/entry-store.ts` | Read raw source with `filePath`, parse/serialize Frontmatter, produce revisions, and safely create/save source entries. |
| `tests/dev/entry-store.test.ts` | Exercise temporary-directory read/create/save/conflict behavior without the dev server. |
| `src/dev/server/editor-api.ts` | Convert list/detail/create/save/preview requests into stable JSON responses and status codes. |
| `tests/dev/editor-api.test.ts` | Verify API validation, loopback rejection, errors, preview boundaries, and refresh behavior with a fake store. |
| `src/integrations/local-editor.ts` | Register the Vite dev-only middleware and adapt Node request/response streams to `editor-api`. |
| `astro.config.mjs` | Register `localEditor()` alongside existing integrations. |
| `src/dev/editor-state.ts` | Pure desktop workbench state transitions: selection, dirty state, preview freshness, and expanded pane. |
| `tests/dev/editor-state.test.ts` | Test workbench state transitions without a browser DOM. |
| `src/dev/editor.tsx` | Render the approved toolbar, persistent navigation, structured form, preview pane, API handling, and accessible actions. |
| `src/dev/editor.css` | Implement desktop three-column layout, focus modes, form sections, and approved visual language. |

### Task 1: Establish the typed entry registry and dependencies

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Create: `src/lib/entry-data.ts`
- Modify: `src/content.config.ts`
- Create: `tests/lib/entry-data.test.ts`

**Interfaces:**
- Produces `ENTRY_TYPE_DEFINITIONS`, `ENTRY_TYPES`, `EditorEntryInput`, `parseEditorEntry(input, options)`, and `createCollectionEntrySchema(relatedSchema)` from `src/lib/entry-data.ts`.
- `parseEditorEntry` accepts all flat metadata and a body-independent input; options supply known slugs, the current slug, and the operation date.
- `createCollectionEntrySchema` receives Astro's `reference('entries')` field schema, so the collection retains Astro relationship validation rather than replacing it with editor-only string validation.

- [ ] **Step 1: Add the direct dev dependencies and write the initial failing schema tests.**

  Run:

  ```bash
  pnpm add -D yaml marked
  ```

  Create `tests/lib/entry-data.test.ts` with fixtures for a valid `note`, a valid base `prompt`, and tests that assert:

  ```ts
  expect(parseEditorEntry(validNote, validationOptions)).toMatchObject({
    type: 'note',
    category: '实践',
  });
  expect(() => parseEditorEntry({ ...validNote, category: '' }, validationOptions)).toThrow(/category/i);
  expect(() => parseEditorEntry({ ...validPrompt, unexpected: 'x' }, validationOptions)).toThrow(/unrecognized/i);
  expect(() => parseEditorEntry({ ...validPrompt, related: ['missing'] }, validationOptions)).toThrow(/related/i);
  expect(() => parseEditorEntry({ ...validPrompt, draft: false, publishedAt: undefined }, validationOptions)).toThrow(/publishedAt/i);
  ```

- [ ] **Step 2: Run the focused test and verify it fails because the registry module is absent.**

  Run: `pnpm test -- tests/lib/entry-data.test.ts`

  Expected: failure resolving `../../src/lib/entry-data`.

- [ ] **Step 3: Implement a single strict type-definition registry.**

  Create `src/lib/entry-data.ts` with the shared field schema and a typed `ENTRY_TYPE_DEFINITIONS` record for `prompt`, `skill`, `mcp`, `website`, `project`, and `note`. Define only `note.category` as type-specific today. Make every field declaration include its schema, editor control descriptor, default value where applicable, and directory/type label. Build `parseEditorEntry()` from a discriminated union with `.strict()` and common date rules. Enforce slug grammar, public/draft `publishedAt` rules, date ordering, referenced-slug existence, duplicate featured order input supplied by the caller, and immutable field checks for existing entries.

  Expose `createCollectionEntrySchema(relatedSchema)` so `src/content.config.ts` derives its union from the same registry while using `reference('entries')` for persisted collection relationship fields. Replace the duplicated inline union in `content.config.ts`; do not change collection name, glob base, glob pattern, or public entry behavior.

- [ ] **Step 4: Run focused tests and the existing suite.**

  Run:

  ```bash
  pnpm test -- tests/lib/entry-data.test.ts
  pnpm test
  ```

  Expected: new strict-schema tests and all existing 10 tests pass.

- [ ] **Step 5: Commit the registry milestone.**

  ```bash
  git add package.json pnpm-lock.yaml src/lib/entry-data.ts src/content.config.ts tests/lib/entry-data.test.ts
  git commit -m "feat: centralize entry type definitions"
  ```

### Task 2: Implement source-file storage with canonical Frontmatter and optimistic concurrency

**Files:**
- Create: `src/dev/server/entry-store.ts`
- Create: `tests/dev/entry-store.test.ts`

**Interfaces:**
- Produces `EntryStore`, `StoredEntry`, `EntryListItem`, `EntryRevision`, `createEntryStore({ entriesRoot, today })`, and typed errors `EntryNotFoundError`, `EntryConflictError`, `EntryPathConflictError`.
- `EntryStore.list()` returns all entries, including local/draft entries, without bodies.
- `EntryStore.load(slug)` returns body, flat metadata, actual `filePath`, extension, and revision.
- `EntryStore.create(input)` writes only `<entriesRoot>/<type>/<slug>.md`; `EntryStore.save(slug, revision, input)` writes only the loaded existing path.

- [ ] **Step 1: Write failing temporary-directory store tests.**

  Create source fixtures in a Vitest `beforeEach` temporary directory. Test the store with exact observable contracts:

  ```ts
  await expect(store.create(validDraftPrompt)).resolves.toMatchObject({
    filePath: expect.stringMatching(/prompt[\\/]new-prompt\.md$/),
    revision: expect.any(String),
  });
  expect(await readFile(created.filePath, 'utf8')).toContain('draft: true');
  await expect(store.save('existing-note', 'stale-revision', editedNote)).rejects.toBeInstanceOf(EntryConflictError);
  await expect(store.create({ ...validDraftPrompt, slug: 'existing-note' })).rejects.toBeInstanceOf(EntryPathConflictError);
  ```

  Include assertions that source-body bytes are unchanged except when the caller changes `body`, serialized YAML uses the documented stable common-field order followed by registered type fields, and existing `.mdx` saves preserve their extension and path.

- [ ] **Step 2: Run the focused store test and verify it fails because the module is absent.**

  Run: `pnpm test -- tests/dev/entry-store.test.ts`

  Expected: failure resolving `../../src/dev/server/entry-store`.

- [ ] **Step 3: Implement parse, list, load, create, and save operations.**

  Use Node `fs/promises`, `path`, `crypto`, and `yaml`; do not use a shell or a free-form YAML string replacer. Reject file paths outside the supplied `entriesRoot`. Parse only a Frontmatter document beginning at byte zero with `---` delimiters. Create the revision from the original raw file bytes using SHA-256. On save, reread the raw file and require that revision match before writing. Reject duplicate destination paths and preserve the existing file's path/extension. Serialize the ordered Frontmatter map and append the caller body unchanged after the closing delimiter. Call the registry validator before any write.

- [ ] **Step 4: Run the focused store test and the complete unit suite.**

  Run:

  ```bash
  pnpm test -- tests/dev/entry-store.test.ts
  pnpm test
  ```

  Expected: temporary source files validate all create/save/conflict paths; the complete suite passes.

- [ ] **Step 5: Commit the source-storage milestone.**

  ```bash
  git add src/dev/server/entry-store.ts tests/dev/entry-store.test.ts
  git commit -m "feat: add local entry source store"
  ```

### Task 3: Add a loopback-only dev API and Astro Integration

**Files:**
- Create: `src/dev/server/editor-api.ts`
- Create: `tests/dev/editor-api.test.ts`
- Create: `src/integrations/local-editor.ts`
- Modify: `astro.config.mjs`

**Interfaces:**
- `createEditorApi({ store, refreshContent, renderMarkdown })` accepts `{ method, pathname, remoteAddress, body }` and returns `{ status, headers, body }`.
- Routes: `GET /__garden-editor/api/entries`, `GET /__garden-editor/api/entries/:slug`, `POST /__garden-editor/api/entries`, `PUT /__garden-editor/api/entries/:slug`, and `POST /__garden-editor/api/preview`.
- The Integration's `localEditor()` uses `astro:server:setup`; it maps Node/Vite HTTP streams to the pure API and calls the injected `refreshContent()` only after a successful source mutation.

- [ ] **Step 1: Write failing API tests with a fake store and refresh spy.**

  In `tests/dev/editor-api.test.ts`, define a fake `EntryStore` and assert:

  ```ts
  expect((await api({ method: 'GET', pathname: '/__garden-editor/api/entries', remoteAddress: '10.0.0.5' })).status).toBe(403);
  expect((await api({ method: 'PUT', pathname: '/__garden-editor/api/entries/existing-note', remoteAddress: '127.0.0.1', body: stalePayload })).status).toBe(409);
  expect(refreshContent).toHaveBeenCalledTimes(0);
  expect((await api({ method: 'POST', pathname: '/__garden-editor/api/preview', remoteAddress: '::1', body: markdownPayload })).toMatchObject({ status: 200 });
  expect(preview.body.html).toContain('&lt;script');
  expect((await api({ method: 'POST', pathname: '/__garden-editor/api/preview', remoteAddress: '::1', body: mdxPayload })).toMatchObject({ status: 422 });
  ```

  Add success assertions that exactly one create/save response invokes `refreshContent()` and returns the current `/entries/<slug>/` URL.

- [ ] **Step 2: Run the focused API test and verify it fails because the module is absent.**

  Run: `pnpm test -- tests/dev/editor-api.test.ts`

  Expected: failure resolving `../../src/dev/server/editor-api`.

- [ ] **Step 3: Implement API routing and safe Markdown preview.**

  Require loopback addresses exactly `127.0.0.1`, `::1`, or IPv4-mapped loopback. Cap request body size before JSON parsing. Map store errors to 404, 409, and field-validation responses without returning filesystem paths. Use `marked` GFM rendering with an `html()` renderer override that returns escaped token text. Reject preview requests for `.mdx`; replace relative image URLs in preview output with an explicit unsupported-image notice. Return data only as JSON; do not expose an endpoint that writes arbitrary paths.

- [ ] **Step 4: Implement the Vite middleware adapter and config registration.**

  Create `localEditor()` with the development `astro:server:setup` hook. Serve `/__garden-editor/` with an HTML document that loads `/src/dev/editor.tsx` through Vite only in dev, forward `/__garden-editor/api/` to `createEditorApi()`, and otherwise call `next()`. The adapter must preserve status/content-type, read request body once, and invoke the hook's `refreshContent` after successful store mutation. Import and append `localEditor()` in `astro.config.mjs` without altering `site`, `output`, MDX, React, or sitemap config.

- [ ] **Step 5: Run focused API tests and a production build guard.**

  Run:

  ```bash
  pnpm test -- tests/dev/editor-api.test.ts
  pnpm build
  test ! -e dist/__garden-editor
  ```

  Expected: API contracts pass; build completes; no static editor directory exists.

- [ ] **Step 6: Commit the local API milestone.**

  ```bash
  git add src/dev/server/editor-api.ts tests/dev/editor-api.test.ts src/integrations/local-editor.ts astro.config.mjs
  git commit -m "feat: add dev-only entry editor api"
  ```

### Task 4: Build and test the desktop workbench state model

**Files:**
- Create: `src/dev/editor-state.ts`
- Create: `tests/dev/editor-state.test.ts`

**Interfaces:**
- Produces `EditorWorkspaceState`, `WorkspacePane`, `createWorkspaceState()`, and `reduceWorkspace(state, action)`.
- `WorkspacePane` is `'split' | 'editor' | 'preview'`.
- Actions include `selectEntry`, `startNewEntry`, `markDirty`, `markSaved`, `setPreview`, `expandEditor`, `expandPreview`, and `restoreSplit`.

- [ ] **Step 1: Write failing reducer tests for the approved workbench interactions.**

  Assert the persistent navigation and lossless focus changes:

  ```ts
  const selected = reduceWorkspace(createWorkspaceState(), { type: 'selectEntry', slug: 'existing-note' });
  expect(reduceWorkspace(selected, { type: 'expandEditor' })).toMatchObject({ pane: 'editor', selectedSlug: 'existing-note' });
  expect(reduceWorkspace(selected, { type: 'expandPreview' })).toMatchObject({ pane: 'preview', selectedSlug: 'existing-note' });
  expect(reduceWorkspace({ ...selected, dirty: true }, { type: 'restoreSplit' })).toMatchObject({ pane: 'split', dirty: true });
  ```

  Add tests that selecting a different entry clears stale preview and that `markSaved` clears only dirty state after the API returns a new revision.

- [ ] **Step 2: Run the focused reducer test and verify it fails because the module is absent.**

  Run: `pnpm test -- tests/dev/editor-state.test.ts`

  Expected: failure resolving `../../src/dev/editor-state`.

- [ ] **Step 3: Implement only deterministic workbench state transitions.**

  Keep API calls and React effects out of this module. Reject impossible pane/action states through exhaustive TypeScript handling. Preserve selected slug and form state across expand/restore actions; never encode mobile breakpoints or drawer state.

- [ ] **Step 4: Run focused state tests and all tests.**

  Run:

  ```bash
  pnpm test -- tests/dev/editor-state.test.ts
  pnpm test
  ```

  Expected: split/focus/restore and stale-preview contracts pass with the existing suite.

- [ ] **Step 5: Commit the workbench-state milestone.**

  ```bash
  git add src/dev/editor-state.ts tests/dev/editor-state.test.ts
  git commit -m "feat: add editor workspace state"
  ```

### Task 5: Implement the desktop React editor and style system

**Files:**
- Create: `src/dev/editor.tsx`
- Create: `src/dev/editor.css`

**Interfaces:**
- Consumes the API payloads from Task 3 and `EditorWorkspaceState` reducer from Task 4.
- Renders the three desktop regions: persistent `FIND ENTRIES` navigation, structured metadata/Markdown editor, and sandboxed preview pane.
- Produces no imported module from any public route or layout.

- [ ] **Step 1: Implement the component hierarchy with semantic regions.**

  Render an application toolbar with `LOCAL ENTRY EDITOR`, localhost status, count/filter summary, and `+ NEW ENTRY`. Render `<nav aria-label="条目导航">` as the fixed left column; include title/slug search, `ALL / DRAFT / LOCAL`, type filters, and entry rows with explicit selected/unsaved text. Render the middle `<main>` editor column and `<aside aria-label="条目预览">` preview column. Derive visible fields from `ENTRY_TYPE_DEFINITIONS`: `BASIC INFO`, `IDENTITY & PUBLISHING`, `ORGANIZE`, `SOURCE & LINKS`, `TYPE DETAILS`, and `MARKDOWN BODY`.

  Use individual labels and field-level server validation messages. Use a textarea only for the Markdown body. Implement links as `label`/`url` repeaters, tags as confirmed values, related as title/slug search-plus-multiselect, and source as a labelled three-choice radio group. Existing immutable controls render as read-only values, not disabled ambiguous inputs.

- [ ] **Step 2: Implement API, preview, and state interactions.**

  Fetch the list on startup and fetch raw entry details only after selection. Keep draft input in React state. Make `SAVE` explicit; include current revision in PUT and show 409 with current form retained. Send current form state to preview without saving. Render preview HTML only in a sandboxed iframe with a descriptive title; show the `.mdx` and relative-image boundaries described in the spec. Wire `EXPAND EDITOR`, `EXPAND PREVIEW`, and restore control to the Task 4 reducer and set `aria-pressed` correctly.

- [ ] **Step 3: Implement desktop-only CSS following existing tokens.**

  Import `editor.css` only from `editor.tsx`. Build a viewport-height grid with a fixed `300–320px` navigation column and normal `60/40` editor/preview columns with `560px` and `420px` minimums. Use CSS classes driven by `split`, `editor`, and `preview` state to hide only the opposite main panel. Do not add mobile media-query layouts. Use 4px black borders, hard token shadows, square controls, visible focus styles, readable error/status text, and `prefers-reduced-motion` overrides. Use dividers and headings rather than nested cards.

- [ ] **Step 4: Run static type/build checks before browser smoke testing.**

  Run:

  ```bash
  pnpm test
  pnpm build
  ```

  Expected: all tests and static build pass; `dist` remains editor-free.

- [ ] **Step 5: Browser-smoke the real development surface.**

  Start `pnpm dev`, open the localhost editor URL printed by Astro, and verify in a desktop viewport:

  1. Toolbar, persistent navigation, and normal three-column layout appear without horizontal overflow.
  2. `EXPAND EDITOR` and `EXPAND PREVIEW` preserve selection and unsaved draft while hiding only the opposite main column.
  3. A new draft entry validates its slug, writes `<slug>.md`, appears in navigation, and loads its actual entry URL after saving.
  4. Existing `.md` body preview renders unsaved text; raw HTML is literal; local relative image is flagged; `.mdx` preview is unavailable with its specified message.
  5. Keyboard traversal reaches every action, shows focus, and exposes textual empty/loading/error/saved/conflict states.

  Stop the dev server when finished.

- [ ] **Step 6: Commit the editor UI milestone.**

  ```bash
  git add src/dev/editor.tsx src/dev/editor.css
  git commit -m "feat: add local entry editor workbench"
  ```

### Task 6: Perform final regression and production-isolation verification

**Files:**
- Modify only files needed to correct failures discovered in this task.

**Interfaces:**
- Verifies all interfaces from Tasks 1–5 without introducing new public runtime interfaces.

- [ ] **Step 1: Run the complete automated contract suite.**

  Run:

  ```bash
  pnpm test
  pnpm build
  ```

  Expected: every Vitest test passes and Astro builds all public pages, feed, robots, and sitemap.

- [ ] **Step 2: Verify the production artifact lacks editor content.**

  Run:

  ```bash
  test ! -e dist/__garden-editor
  git diff --check
  ```

  Expected: no development editor route exists in `dist`; no whitespace errors exist.

- [ ] **Step 3: Re-run the development browser smoke path after the final build.**

  Start `pnpm dev`, repeat the five checks from Task 5 Step 5, and specifically confirm an external/non-loopback request to the editor API receives `403`. Stop the dev server.


## Plan Self-Review

- **Spec coverage:** Task 1 covers strict shared/type-specific schema and future type registration; Task 2 covers real source persistence, canonical YAML, revisions, and no path migration; Task 3 covers localhost-only API, development hook, refresh, preview restrictions, and production exclusion; Task 4 covers the approved focus-state contract; Task 5 covers all desktop UI, structured fields, accessibility, and browser surface; Task 6 covers final public-output isolation and regression verification.
- **Placeholders:** Every implementation step identifies exact modules, contracts, tests, commands, and expected outcomes; no placeholder implementation or commit command remains.
- **Type consistency:** `ENTRY_TYPE_DEFINITIONS` and `parseEditorEntry` originate in Task 1; `EntryStore` in Task 2; `createEditorApi` in Task 3; and `EditorWorkspaceState` in Task 4. Tasks 3 and 5 consume those names without redefining their responsibilities.
