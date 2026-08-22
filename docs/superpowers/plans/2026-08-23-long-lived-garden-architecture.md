# Long-Lived Garden Architecture Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the existing static showcase into a publicly deployable, content-addressable digital garden with stable entry URLs, build-time discovery artifacts, and a Cloudflare Pages release path.

**Architecture:** Preserve Astro as the static rendering core and Content Collections as the public content source. Introduce immutable collection IDs via frontmatter slugs, render every entry at `/entries/<slug>/`, derive backlinks and Explore data at build time, and hydrate only Explore filtering/search as a React Island. Cloudflare Pages receives builds from the public GitHub repository; it does not add runtime application infrastructure.

**Tech Stack:** Astro 7, TypeScript strict mode, MDX, Astro Content Collections, React 19 Islands, native modular CSS, Vitest for pure content-query behavior, `@astrojs/sitemap`, `@astrojs/rss`, Cloudflare Pages.

**Spec:** `docs/superpowers/specs/2026-08-23-long-lived-digital-garden-design.md`

## Global Constraints

- Canonical production origin is exactly `https://kearril.com`; `www.kearril.com` redirects to the apex domain.
- Astro must explicitly use `output: 'static'`; do not install `@astrojs/cloudflare`, create Workers, databases, CMSes, runtime APIs, or object storage.
- Every entry has an immutable, unique lowercase ASCII kebab-case slug. File names, titles, and types must not define identity or public URLs.
- Every public entry is served from `/entries/<slug>/`; the current unpublished `/notes/<slug>/` route is removed rather than redirected.
- Public entries require `publishedAt`; all entries require `createdAt` and `updatedAt`; drafts cannot have `publishedAt`.
- `tags` default to an empty array, are exact Explore filters only, and are excluded from keyword matching.
- `related` remains a one-way slug reference. Backlinks are derived at build time; relation kinds are out of scope.
- Keep original screenshots and diagrams small, versioned with content under `src/content/assets/<entry-slug>/`, and prefer WebP/AVIF. Do not create R2, Cloudflare Images, or `media.kearril.com`.
- Keep native CSS in `src/styles/` as the only styling system. Do not reintroduce Tailwind, CSS-in-JS, or a UI kit.
- All content pages and Explore fallback links work without JavaScript. React owns only Explore state.
- Search only `title` and `summary`; type and tags are separate exact filters; full-text search is out of scope.
- First release includes canonical metadata, `robots.txt`, `sitemap-index.xml`, and `/feed.xml`; no analytics, comments, advertising, or tracking.
- Use pnpm. Run `pnpm build` for all content/schema/route changes. Check UI and Island work in Cloudflare Preview before merging high-risk changes.

---

## File Structure

```text
src/
├── content.config.ts                         # Validates stable slug, public dates, tags, and references.
├── content/
│   ├── entries/*.local.md                    # Migrated local demonstration content.
│   └── assets/<entry-slug>/                  # Future small, versioned content images.
├── lib/
│   ├── entry-graph.ts                        # Pure sorting/backlink functions with Vitest coverage.
│   ├── entry-path.ts                         # Pure immutable collection-ID URL formatter.
│   ├── entries.ts                            # Astro Collection queries and public entry projection.
│   └── explore-index.ts                      # Pure DTO, search/filter, and pagination functions.
├── components/
│   ├── home/ExploreSection.astro             # Static fallback plus Island mount point.
│   ├── home/ExploreFallback.astro            # No-JavaScript entry-link fallback.
│   └── islands/ExploreIsland.tsx             # Browser-only search/filter/load-more state.
├── pages/
│   ├── entries/[slug].astro                  # Canonical entry route for every content type.
│   ├── feed.xml.ts                           # Static summary-only RSS feed.
│   └── robots.txt.ts                         # Static crawl policy that references sitemap-index.xml.
├── layouts/BaseLayout.astro                  # Canonical and social-neutral base metadata.
└── styles/
    ├── article.css                           # Shared entry-page article and metadata styles.
    └── home.css                              # Explore control, result, fallback, and empty-state styles.

tests/lib/
├── entry-graph.test.ts                       # Backlink, ordering, and public-connection contracts.
└── explore-index.test.ts                     # Search, exact filtering, and load-more contracts.
```

Existing `src/pages/notes/[slug].astro` is deleted only after `src/pages/entries/[slug].astro` builds all note entries. Existing home sections are updated to use `getEntryPath()` rather than constructing note URLs locally.

---

### Task 1: Establish test and pure graph foundations

**Files:**
- Modify: `package.json`
- Create: `src/lib/entry-graph.ts`
- Create: `tests/lib/entry-graph.test.ts`

**Interfaces:**
- Produces `EntryGraphNode`, `getBacklinks()`, `sortByUpdatedAt()`, and `getPublicConnections()`.
- Later tasks adapt `GardenEntry` collection data to `EntryGraphNode`; no Astro virtual module is imported by these pure functions.

- [ ] **Step 1: Add the test runner and script.**

Run:

```bash
pnpm add -D vitest
```

Add the script below without changing the existing Astro scripts:

```json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

- [ ] **Step 2: Write failing graph behavior tests.**

Create `tests/lib/entry-graph.test.ts` with these executable contracts:

```ts
import { describe, expect, it } from 'vitest';
import { getBacklinks, getPublicConnections, sortByUpdatedAt, type EntryGraphNode } from '../../src/lib/entry-graph';

const entries: EntryGraphNode[] = [
  { id: 'astro-guide', related: [], updatedAt: new Date('2026-08-10') },
  { id: 'garden-design', related: ['astro-guide'], updatedAt: new Date('2026-08-12') },
  { id: 'rss-guide', related: ['astro-guide'], updatedAt: new Date('2026-08-11') },
];

describe('entry graph', () => {
  it('derives backlinks without requiring duplicate authored references', () => {
    expect(getBacklinks(entries, 'astro-guide').map((entry) => entry.id)).toEqual(['garden-design', 'rss-guide']);
  });

  it('sorts entries by latest substantive update', () => {
    expect(sortByUpdatedAt(entries).map((entry) => entry.id)).toEqual(['garden-design', 'rss-guide', 'astro-guide']);
  });

  it('returns authored related entries and derived backlinks separately', () => {
    expect(getPublicConnections(entries, 'garden-design')).toEqual({
      related: [entries[0]],
      backlinks: [],
    });
  });
});
```

- [ ] **Step 3: Run the test to establish the failing baseline.**

Run:

```bash
pnpm test -- tests/lib/entry-graph.test.ts
```

Expected: failure because `src/lib/entry-graph.ts` does not exist.

- [ ] **Step 4: Implement the pure graph module.**

Create `src/lib/entry-graph.ts`:

```ts
export interface EntryGraphNode {
  id: string;
  related: readonly string[];
  updatedAt: Date;
}

export function sortByUpdatedAt<T extends EntryGraphNode>(entries: readonly T[]) {
  return [...entries].sort((left, right) => right.updatedAt.valueOf() - left.updatedAt.valueOf());
}

export function getBacklinks<T extends EntryGraphNode>(entries: readonly T[], targetId: string) {
  return entries.filter((entry) => entry.related.includes(targetId));
}

export function getPublicConnections<T extends EntryGraphNode>(entries: readonly T[], targetId: string) {
  const target = entries.find((entry) => entry.id === targetId);

  return {
    related: target ? entries.filter((entry) => target.related.includes(entry.id)) : [],
    backlinks: getBacklinks(entries, targetId),
  };
}
```

- [ ] **Step 5: Run the focused test and then the full test command.**

Run:

```bash
pnpm test -- tests/lib/entry-graph.test.ts && pnpm test
```

Expected: all three contracts pass.

- [ ] **Step 6: Commit the test foundation.**

```bash
git add package.json pnpm-lock.yaml src/lib/entry-graph.ts tests/lib/entry-graph.test.ts
git commit -m "test: cover entry graph behavior"
```

### Task 2: Migrate the collection contract to stable public entries

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/content/entries/*.local.md`
- Create: `src/lib/entry-path.ts`
- Modify: `src/lib/entries.ts`
- Modify: `docs/CONTENT.md`
- Test: `tests/lib/entry-graph.test.ts`

**Interfaces:**
- Consumes the graph functions from Task 1.
- Produces `getEntryPath(entry)`, `getPublicEntries()`, `getPublicEntry(slug)`, `getHomepageEntries()`, and `getEntryConnections(slug)`.
- `src/lib/entry-path.ts` is the only URL formatter; it returns `/entries/${entry.id}/` without importing Astro.

- [ ] **Step 1: Extend the failing graph test with missing-target behavior.**

Add this case to `tests/lib/entry-graph.test.ts`:

```ts
it('returns empty connections for a missing target', () => {
  expect(getPublicConnections(entries, 'missing-entry')).toEqual({ related: [], backlinks: [] });
});
```

Run:

```bash
pnpm test -- tests/lib/entry-graph.test.ts
```

Expected: pass only after confirming the existing Task 1 implementation already protects the missing-target case; otherwise make the minimal correction in `getPublicConnections()`.

- [ ] **Step 2: Add the stable slug and date validation contract.**

In `src/content.config.ts`, add `slug` and date fields to the shared entry schema using these constraints:

```ts
slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase ASCII kebab-case'),
tags: z.array(z.string().trim().min(1)).default([]),
createdAt: z.coerce.date(),
publishedAt: z.coerce.date().optional(),
updatedAt: z.coerce.date(),
```

Apply a `.superRefine()` to each strict entry branch that rejects:

```ts
if (data.draft && data.publishedAt) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'draft entries cannot set publishedAt', path: ['publishedAt'] });
}
if (!data.draft && !data.publishedAt) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'public entries require publishedAt', path: ['publishedAt'] });
}
if (data.updatedAt < data.createdAt) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'updatedAt cannot precede createdAt', path: ['updatedAt'] });
}
if (data.publishedAt && data.publishedAt < data.createdAt) {
  ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'publishedAt cannot precede createdAt', path: ['publishedAt'] });
}
```

Keep `related: z.array(reference('entries')).default([])`. Astro receives the frontmatter `slug` as the collection entry ID, so each `related` value must be the immutable slug.

- [ ] **Step 3: Migrate every local demo entry before building.**

For every `src/content/entries/*.local.md` file:

1. Add an immutable kebab-case `slug` matching its current conceptual content, not its `.local.md` file name.
2. Add `publishedAt` equal to its existing public demonstration date.
3. Change every `related` value to the referenced entry’s new slug.
4. Preserve `createdAt`, `updatedAt`, type, summary, category, links, and draft state.
5. Leave the `.local.md` names untouched; this proves file names are no longer identity.

- [ ] **Step 4: Replace filename-derived URL helpers with collection-ID helpers.**

Create `src/lib/entry-path.ts`:

```ts
export interface EntryPathTarget {
  id: string;
}

export function getEntryPath(entry: EntryPathTarget) {
  return `/entries/${entry.id}/`;
}
```

In `src/lib/entries.ts`, remove `getNoteSlug()`, import and re-export `getEntryPath` from `./entry-path`, then add:

```ts
export async function getPublicEntry(slug: string) {
  return (await getPublicEntries()).find((entry) => entry.id === slug);
}
```

Adapt collection entries to the graph interface with `id`, `data.related`, and `data.updatedAt`; use `sortByUpdatedAt()` and `getPublicConnections()` from Task 1. `getEntryConnections(slug)` must return only public related entries and public backlinks.

Retain `getHomepageEntries()`, but its `notes` array is selected by `type === 'note'`; it no longer owns note URL generation.

- [ ] **Step 5: Rewrite `docs/CONTENT.md` as the public contract.**

Document exactly:

```text
slug: required, unique, immutable lowercase ASCII kebab-case public identity
createdAt: first recorded date; normally not rendered
publishedAt: required on public entries; first public date and never changed
updatedAt: material public update date
related: one-way immutable slug references; backlinks are derived by the site
tags: optional exact Explore filters; excluded from keyword search
```

Document `/entries/<slug>/` as the only public entry URL and remove text claiming file names generate public identity or that Note owns a separate route.

- [ ] **Step 6: Verify the collection migration.**

Run:

```bash
pnpm test && pnpm build
```

Expected: tests pass; build validates every migrated local entry, slug reference, date rule, and generated static path.

- [ ] **Step 7: Commit the public content contract.**

```bash
git add src/content.config.ts src/content/entries src/lib/entry-path.ts src/lib/entries.ts docs/CONTENT.md tests/lib/entry-graph.test.ts
git commit -m "feat: establish stable public entry identity"
```

### Task 3: Render every entry at its canonical route

**Files:**
- Create: `src/pages/entries/[slug].astro`
- Delete: `src/pages/notes/[slug].astro`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/home/FeaturedSection.astro`
- Modify: `src/components/home/UpdatesSection.astro`
- Modify: `src/components/home/NotesSection.astro`
- Modify: `src/styles/article.css`
- Modify: `src/styles/responsive.css`
- Test: `tests/lib/entry-path.test.ts`

**Interfaces:**
- Consumes `getEntryPath()` from `src/lib/entry-path.ts`, plus `getPublicEntries()`, `getPublicEntry()`, and `getEntryConnections()` from Task 2.
- Produces statically generated `/entries/<slug>/` pages for all public collection entries.
- `BaseLayout` accepts `canonicalPath?: string` and emits exactly one canonical link when provided.

- [ ] **Step 1: Add and run an immutable path helper test.**

Create `tests/lib/entry-path.test.ts`:

```ts
import { expect, it } from 'vitest';
import { getEntryPath } from '../../src/lib/entry-path';

it('uses the immutable collection ID rather than a title or file name', () => {
  expect(getEntryPath({ id: 'building-a-long-lived-garden' })).toBe('/entries/building-a-long-lived-garden/');
});
```

Run:

```bash
pnpm test -- tests/lib/entry-path.test.ts
```

Expected: pass. The test imports only `src/lib/entry-path.ts`, so it never requires Astro virtual-module resolution.

- [ ] **Step 2: Create the canonical static entry route.**

Create `src/pages/entries/[slug].astro` using this control flow:

```astro
---
import { render } from 'astro:content';
import BaseLayout from '../../layouts/BaseLayout.astro';
import SiteHeader from '../../components/layout/SiteHeader.astro';
import { getEntryConnections, getPublicEntries, getPublicEntry } from '../../lib/entries';
import { getEntryPath } from '../../lib/entry-path';

export async function getStaticPaths() {
  return (await getPublicEntries()).map((entry) => ({ params: { slug: entry.id } }));
}

const entry = await getPublicEntry(Astro.params.slug ?? '');
if (!entry) throw new Error(`Could not find public entry "${Astro.params.slug}".`);
const { Content } = await render(entry);
const { related, backlinks } = await getEntryConnections(entry.id);
---
```

Render semantic `<article>` content for every type. Render `category` only when `entry.data.type === 'note'`. Render `publishedAt` and `updatedAt`, then external `links`, authored `related`, and derived `backlinks` only when each collection is non-empty. Use `getEntryPath()` for every internal entry link.

- [ ] **Step 3: Add canonical metadata without changing the visual system.**

Extend `BaseLayout.astro` props:

```ts
interface Props {
  title: string;
  description: string;
  canonicalPath?: string;
}
```

Emit a canonical link only when `canonicalPath` is supplied:

```astro
{canonicalPath ? <link rel="canonical" href={new URL(canonicalPath, Astro.site).href} /> : null}
```

Pass `canonicalPath={getEntryPath(entry)}` from the new entry page and `canonicalPath="/"` from `src/pages/index.astro`.

- [ ] **Step 4: Point all existing home content cards to the canonical route.**

In Featured, Updates, and Notes sections, replace display-only card/title markup with an accessible `<a href={getEntryPath(entry)}>` that preserves the existing card/row styling. Remove `getNoteSlug` imports. Keep `article` only as a semantic wrapper when it does not prevent the full card from being a keyboard-accessible link.

- [ ] **Step 5: Delete the unpublished type-specific route and adapt CSS.**

Delete `src/pages/notes/[slug].astro`. Generalize `article.css` labels from Note-only language to entry-page language while preserving the existing neo-brutalist tokens, border, hard shadow, line width, and reduced-motion rules. Add responsive styles for link lists and connections without nested cards or rounded corners.

- [ ] **Step 6: Verify route generation and surface behavior.**

Run:

```bash
pnpm test && pnpm build
```

Then start a local preview and open one Note and one non-Note generated from local demos. Confirm each renders at `/entries/<slug>/`, each home link uses that route, and each page has one canonical URL.

- [ ] **Step 7: Commit the route migration.**

```bash
git add src/pages/entries src/pages/index.astro src/pages/notes src/layouts/BaseLayout.astro src/components/home src/styles/article.css src/styles/responsive.css src/lib/entries.ts src/lib/entry-path.ts tests/lib/entry-path.test.ts
git commit -m "feat: render canonical entry pages"
```

### Task 4: Build the static Explore index and Island

**Files:**
- Create: `src/lib/explore-index.ts`
- Create: `tests/lib/explore-index.test.ts`
- Create: `src/components/home/ExploreFallback.astro`
- Create: `src/components/islands/ExploreIsland.tsx`
- Modify: `src/components/home/ExploreSection.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/styles/home.css`
- Modify: `src/styles/responsive.css`

**Interfaces:**
- `ExploreEntry` contains `slug`, `type`, `title`, `summary`, `tags`, `publishedAt`, `updatedAt`, and `canonicalUrl`.
- `createExploreIndex(entries)` is called by Astro at build time; `filterExploreIndex(index, query)` and `getVisibleEntries(entries, count)` are pure and consumed by the React Island.
- The Island receives only `ExploreEntry[]`, never MDX bodies or draft data.

- [ ] **Step 1: Write failing Explore index tests.**

Create `tests/lib/explore-index.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { filterExploreIndex, getVisibleEntries, type ExploreEntry } from '../../src/lib/explore-index';

const entries: ExploreEntry[] = [
  { slug: 'astro-guide', type: 'website', title: 'Astro Guide', summary: 'Static site documentation.', tags: ['开发'], publishedAt: '2026-08-01', updatedAt: '2026-08-03', canonicalUrl: '/entries/astro-guide/' },
  { slug: 'garden-note', type: 'note', title: 'Garden Notes', summary: 'A personal digital garden.', tags: ['写作'], publishedAt: '2026-08-02', updatedAt: '2026-08-04', canonicalUrl: '/entries/garden-note/' },
];

describe('Explore index', () => {
  it('matches only title and summary case-insensitively', () => {
    expect(filterExploreIndex(entries, { query: 'STATIC', type: null, tag: null }).map((entry) => entry.slug)).toEqual(['astro-guide']);
  });

  it('does not match a tag as a keyword', () => {
    expect(filterExploreIndex(entries, { query: '开发', type: null, tag: null })).toEqual([]);
  });

  it('intersects query, type, and exact tag filters', () => {
    expect(filterExploreIndex(entries, { query: 'guide', type: 'website', tag: '开发' }).map((entry) => entry.slug)).toEqual(['astro-guide']);
  });

  it('returns only the requested visible page size', () => {
    expect(getVisibleEntries(entries, 1).map((entry) => entry.slug)).toEqual(['astro-guide']);
  });
});
```

- [ ] **Step 2: Run the test to establish the failing baseline.**

Run:

```bash
pnpm test -- tests/lib/explore-index.test.ts
```

Expected: failure because `src/lib/explore-index.ts` does not exist.

- [ ] **Step 3: Implement the pure index functions.**

Create `src/lib/explore-index.ts` with these signatures:

```ts
export type ExploreEntryType = 'prompt' | 'skill' | 'mcp' | 'website' | 'project' | 'note';

export interface ExploreEntry {
  slug: string;
  type: ExploreEntryType;
  title: string;
  summary: string;
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  canonicalUrl: string;
}

export interface ExploreFilters {
  query: string;
  type: ExploreEntryType | null;
  tag: string | null;
}

export function filterExploreIndex(entries: readonly ExploreEntry[], filters: ExploreFilters) {
  const query = filters.query.trim().toLocaleLowerCase();
  return entries.filter((entry) => {
    const matchesQuery = !query || `${entry.title} ${entry.summary}`.toLocaleLowerCase().includes(query);
    const matchesType = !filters.type || entry.type === filters.type;
    const matchesTag = !filters.tag || entry.tags.includes(filters.tag);
    return matchesQuery && matchesType && matchesTag;
  });
}

export function getVisibleEntries(entries: readonly ExploreEntry[], count: number) {
  return entries.slice(0, count);
}
```

Add `createExploreIndex()` in the same module or `src/lib/entries.ts`; it must map only public entries and serialize dates as `YYYY-MM-DD` strings.

- [ ] **Step 4: Verify pure search/filter behavior.**

Run:

```bash
pnpm test -- tests/lib/explore-index.test.ts && pnpm test
```

Expected: all search/filter/pagination and graph/path contracts pass.

- [ ] **Step 5: Replace the Explore placeholder with progressive enhancement.**

Create `ExploreFallback.astro` that renders a semantic list of entry links with title, summary, type, and canonical `href`. It must not use client JavaScript.

Replace `ExploreSection.astro` placeholder text with:

```astro
---
import ExploreFallback from './ExploreFallback.astro';
import ExploreIsland from '../islands/ExploreIsland';
import type { ExploreEntry } from '../../lib/explore-index';

interface Props { entries: ExploreEntry[]; }
const { entries } = Astro.props;
---

<ExploreIsland client:load entries={entries} />
<noscript><ExploreFallback entries={entries} /></noscript>
```

Update `src/pages/index.astro` to call the build-time index helper and pass it to `ExploreSection`.

- [ ] **Step 6: Implement the React Island with accessible controls.**

Create `ExploreIsland.tsx` with `useMemo` for filtered entries and `useState` for `query`, `type`, `tag`, and visible count. The component must:

- expose a labelled search input;
- provide an "all types" control plus each exact type;
- derive tags with `new Set(entries.flatMap((entry) => entry.tags))` and sort them with `localeCompare`;
- reset visible count whenever any filter changes;
- render a clear-filters button only when a filter is active;
- render explicit "暂无公开内容" and "当前筛选无结果" states distinctly;
- use anchors with `href={entry.canonicalUrl}` for every result;
- provide a 44px-or-larger load-more button only when hidden matches remain.

- [ ] **Step 7: Style the Island without changing the CSS architecture.**

Add semantic Explore classes in `home.css` and responsive overrides in `responsive.css`. Reuse existing token variables, `.button`, hard borders, square corners, solid hard shadows, focus-visible styling, and reduced-motion behavior. Do not add inline style objects, gradients, blur, rounded corners, or a dependency.

- [ ] **Step 8: Verify static and interactive surfaces.**

Run:

```bash
pnpm test && pnpm build
```

In Cloudflare Preview, verify desktop and mobile search by title/summary, exact type/tag intersection, a tag keyword yielding no text-search match, clear filters, load more, keyboard focus, empty states, and result links. Disable JavaScript once and verify the `<noscript>` fallback has working entry links.

- [ ] **Step 9: Commit Explore.**

```bash
git add src/lib/explore-index.ts tests/lib/explore-index.test.ts src/components/home/ExploreSection.astro src/components/home/ExploreFallback.astro src/components/islands/ExploreIsland.tsx src/pages/index.astro src/styles/home.css src/styles/responsive.css
git commit -m "feat: add static Explore discovery"
```

### Task 5: Add canonical discovery artifacts and site metadata

**Files:**
- Modify: `package.json`
- Modify: `pnpm-lock.yaml`
- Modify: `astro.config.mjs`
- Create: `src/pages/feed.xml.ts`
- Create: `src/pages/robots.txt.ts`
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/lib/entries.ts`

**Interfaces:**
- Consumes `getPublicEntries()` from `src/lib/entries.ts` and `getEntryPath()` from `src/lib/entry-path.ts`.
- Produces static `feed.xml`, `robots.txt`, and sitemap integration output at `sitemap-index.xml`.
- `BaseLayout` emits canonical URLs from `Astro.site`; route pages pass canonical paths.

- [ ] **Step 1: Add failing build assertions for required artifacts.**

Create a temporary local demo build expectation by running:

```bash
pnpm build
```

Expected before implementation: `dist/feed.xml`, `dist/robots.txt`, and `dist/sitemap-index.xml` do not all exist. Record this as the failing artifact baseline in the task branch PR description; do not add a source-text test for generated markup.

- [ ] **Step 2: Install static discovery integrations.**

Run:

```bash
pnpm add @astrojs/rss @astrojs/sitemap
```

- [ ] **Step 3: Configure the fixed static origin.**

Update `astro.config.mjs`:

```ts
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://kearril.com',
  output: 'static',
  integrations: [react(), mdx(), sitemap()],
});
```

Do not set `base` and do not add a deployment adapter.

- [ ] **Step 4: Implement summary-only RSS.**

Create `src/pages/feed.xml.ts`:

```ts
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublicEntries } from '../lib/entries';
import { getEntryPath } from '../lib/entry-path';

export const GET: APIRoute = async (context) => {
  const entries = await getPublicEntries();
  return rss({
    title: 'Paracosm Garden',
    description: 'Kearril 的公开数字花园更新。',
    site: context.site,
    items: entries.map((entry) => ({
      title: entry.data.title,
      description: `${entry.data.summary}\n\n首次公开：${entry.data.publishedAt!.toISOString().slice(0, 10)}；最近更新：${entry.data.updatedAt.toISOString().slice(0, 10)}`,
      link: getEntryPath(entry),
      pubDate: entry.data.updatedAt,
    })),
  });
};
```

Sort `entries` by `updatedAt` descending before mapping. The non-null assertion is safe because `getPublicEntries()` must return only entries with `draft === false` and schema validation requires `publishedAt` for those entries.

- [ ] **Step 5: Implement crawl policy from the configured origin.**

Create `src/pages/robots.txt.ts`:

```ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = ({ site }) => {
  if (!site) throw new Error('Astro site must be configured to generate robots.txt.');

  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('sitemap-index.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
```

- [ ] **Step 6: Ensure pages carry canonical metadata.**

Confirm the Task 3 `BaseLayout` change uses `new URL(canonicalPath, Astro.site).href`. Pass `canonicalPath="/"` from the home page and `canonicalPath={getEntryPath(entry)}` from every entry page. Do not add analytics, ad, tracking, social-network, or cookie scripts.

- [ ] **Step 7: Verify generated artifacts and public URL content.**

Run:

```bash
pnpm test && pnpm build
```

Inspect `dist/feed.xml`, `dist/robots.txt`, and `dist/sitemap-index.xml` with the file reader. Verify feed items contain `/entries/<slug>/`; robots references `https://kearril.com/sitemap-index.xml`; sitemap excludes drafts; canonical links use `https://kearril.com`.

- [ ] **Step 8: Commit discovery artifacts.**

```bash
git add package.json pnpm-lock.yaml astro.config.mjs src/pages/feed.xml.ts src/pages/robots.txt.ts src/layouts/BaseLayout.astro src/lib/entries.ts src/pages/index.astro src/pages/entries
git commit -m "feat: publish garden discovery artifacts"
```

### Task 6: Replace obsolete project decisions and publish operational instructions

**Files:**
- Modify: `README.md`
- Modify: `AGENTS.md`
- Modify: `docs/README.md`
- Modify: `docs/CONTENT.md`
- Modify: `docs/DEVELOPMENT.md`
- Modify: `docs/DEPLOYMENT.md`
- Modify: `docs/DECISIONS.md`
- Modify: `docs/AI-WORKFLOW.md`
- Modify: `docs/superpowers/specs/2026-08-23-long-lived-digital-garden-design.md`

**Interfaces:**
- Documents only confirmed behavior implemented by Tasks 1–5.
- `docs/DEPLOYMENT.md` is the exact operator runbook for Cloudflare Pages and `kearril.com`; it must not instruct a GitHub Pages deployment.

- [ ] **Step 1: Identify the obsolete statements before changing them.**

Read each file listed above and locate every statement that says or implies:

```text
GitHub Pages is the initial deployment platform.
Note pages are only /notes/<slug>/.
File names generate stable public IDs or routes.
Explore excludes Note entries or has no independent item pages.
Tailwind is installed or should be installed.
```

- [ ] **Step 2: Update the project entry documents.**

Make these exact factual updates:

- `README.md`: describe Cloudflare Pages, `kearril.com`, canonical `/entries/<slug>/`, public Git content boundary, and generated feed/sitemap.
- `AGENTS.md`: replace GitHub Pages release references with Cloudflare Pages; state that public routes are `/entries/<slug>/`; keep Astro/static/React constraints.
- `docs/README.md`: point deployment and content model readers to the new authoritative directions.
- `docs/CONTENT.md`: retain the Task 2 field contract and document tags as filter-only.
- `docs/DEVELOPMENT.md`: require `pnpm test && pnpm build` for content-query changes and Cloudflare Preview for high-risk UI/config changes.
- `docs/AI-WORKFLOW.md`: update the deployment row of the quality table to Cloudflare Pages and Cloudflare Preview.

- [ ] **Step 3: Append superseding decisions rather than rewriting history.**

Add dated records to `docs/DECISIONS.md` that explicitly supersede the prior GitHub Pages, Note-only route, Explore-only modal, and Tailwind-related operating directions where applicable. Each record states decision, reason, and impact:

```text
Cloudflare Pages is the static deployment target for kearril.com.
All public entries use immutable slugs and /entries/<slug>/.
The site is static-core with a local Explore Island and static fallback.
Native modular CSS remains the sole styling system.
```

- [ ] **Step 4: Rewrite `docs/DEPLOYMENT.md` as the Cloudflare Pages runbook.**

Include this ordered procedure:

1. Create a public GitHub repository named `paracosm-garden`, set the local primary branch to `main`, and push the repository.
2. In Cloudflare Pages, create a project from that GitHub repository, select `main`, set build command `pnpm build`, output directory `dist`, and Node build environment `22.12.0`.
3. In Pages Custom Domains, add `kearril.com` before changing DNS, permit Cloudflare to create the required Pages DNS record, then add `www.kearril.com` and configure its redirect to `https://kearril.com`.
4. Wait for Cloudflare Pages domain verification and HTTPS issuance; never use wildcard DNS for this site.
5. Confirm the repository’s source connection, production build, branch preview builds, root domain, `www` redirect, entry route, feed, robots, and sitemap.

State that Cloudflare Pages Git integration performs deployment and that no GitHub Actions deploy token, CNAME file, or hand-uploaded `dist` directory is used.

- [ ] **Step 5: Validate documentation and project output.**

Run:

```bash
git diff --check && pnpm test && pnpm build
```

Expected: no whitespace errors, all pure behavior tests pass, and static build succeeds.

- [ ] **Step 6: Commit the documentation cutover.**

```bash
git add README.md AGENTS.md docs
git commit -m "docs: document Cloudflare garden operations"
```

### Task 7: Connect the verified project to production hosting

**Files:**
- Modify through Cloudflare Pages UI: project build settings and custom domains
- Modify through GitHub UI: public repository visibility and Cloudflare Pages installation authorization
- Modify: `docs/DEPLOYMENT.md` only if the actual dashboard labels or verified DNS behavior differs from Task 6

**Interfaces:**
- Consumes a passing `main` build from Tasks 1–6.
- Produces a production deployment at `https://kearril.com`, preview deployments for non-`main` branches, and no source-code secrets.

- [ ] **Step 1: Publish the verified source repository.**

Create the public GitHub repository `paracosm-garden`, rename the local production branch to `main` if needed, add the remote, and push:

```bash
git branch -M main
git remote add origin https://github.com/<your-github-account>/paracosm-garden.git
git push -u origin main
```

Use the actual GitHub account name in place of the angle-bracketed account segment. Do not push unpublished personal files, local environment files, `dist`, or `node_modules`.

- [ ] **Step 2: Configure Cloudflare Pages Git deployment.**

In Cloudflare Dashboard:

1. Open **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**.
2. Authorize only the `paracosm-garden` repository.
3. Select `main` as the production branch.
4. Set build command to `pnpm build` and build output directory to `dist`.
5. Set build environment Node version to `22.12.0`.
6. Trigger the first build and wait for a successful deployment.

- [ ] **Step 3: Bind the apex domain before changing DNS records.**

In the Pages project **Custom domains** panel, add `kearril.com`. Complete the Pages-provided verification flow first. Because the domain is already managed in the same Cloudflare account, allow the dashboard to create or update only the explicit DNS record it proposes for this Pages project.

- [ ] **Step 4: Add the `www` alias and canonical redirect.**

Add `www.kearril.com` as an explicit custom domain for the same Pages project. Configure a Cloudflare Redirect Rule with:

```text
When hostname equals www.kearril.com
Then static redirect to https://kearril.com${http.request.uri.path}
Status code: 301
Preserve query string: enabled
```

Do not add `*.kearril.com` DNS or redirect rules.

- [ ] **Step 5: Verify the deployed surface.**

After DNS and HTTPS are active, test:

```text
https://kearril.com/
https://www.kearril.com/
https://kearril.com/entries/<one-published-demo-slug>/
https://kearril.com/feed.xml
https://kearril.com/robots.txt
https://kearril.com/sitemap-index.xml
```

Expected: root page returns HTTPS; `www` performs one 301 redirect to the apex while retaining path and query; entry page has its canonical URL; feed, robots, and sitemap load; no draft appears in Explore, RSS, or sitemap.

- [ ] **Step 6: Verify a high-risk preview lifecycle.**

Create a branch that changes only a visible copy string, push it, and confirm Cloudflare creates a preview URL. View the preview, merge the branch only after confirming the build and appearance, then confirm production updates from `main`.

- [ ] **Step 7: Record only verified dashboard facts.**

If Cloudflare’s actual build, custom-domain, or redirect UI differs from Task 6, update `docs/DEPLOYMENT.md` with the observed procedure and run:

```bash
git diff --check && pnpm build
```

Commit that documentation correction separately:

```bash
git add docs/DEPLOYMENT.md
git commit -m "docs: record verified Pages deployment"
```

## Plan Self-Review

### Spec coverage

| Spec requirement | Implementing task |
| --- | --- |
| Stable slugs, three dates, public drafts boundary, tags, references | Task 2 |
| Canonical `/entries/<slug>/` for every type, no Note-only route, backlinks | Tasks 2–3 |
| Small local assets, no R2/Images | Task 2 documentation and Task 6 operations docs |
| Static Astro core and local React Explore Island | Task 4 |
| Title/summary-only search, type/tag exact filters, no-JS fallback | Task 4 |
| `site`, canonical URLs, robots, sitemap, RSS, public indexing | Task 5 |
| Native CSS only and existing visual constraints | Tasks 3–4 and Task 6 |
| Hybrid publishing, Cloudflare Pages, root domain, `www` redirect | Tasks 6–7 |
| Build, Preview, smoke, and behavior verification | Tasks 1–7 |

### Placeholder and consistency check

- All task files, interfaces, commands, test names, output artifacts, URLs, and commit messages are specified.
- `getEntryPath()`, `getPublicEntries()`, `getPublicEntry()`, `getEntryConnections()`, `EntryGraphNode`, `ExploreEntry`, `filterExploreIndex()`, and `getVisibleEntries()` are defined before later tasks consume them. `getEntryPath()` remains in a pure module so Vitest never imports Astro virtual modules.
- `entry.id` is the stable frontmatter slug in every task; no later task reconstructs an identity from a title or filename.
- The only user-specific value needed during Task 7 is the GitHub account path, which cannot be inferred from the repository; it is entered in the explicit `git remote add` command at deployment time.
