import { describe, expect, it } from 'vitest';
import {
  createExploreIndex,
  filterExploreIndex,
  getVisibleEntries,
  type ExploreEntry,
  type RawGardenEntry,
} from '../../src/lib/explore-index';

const entries: ExploreEntry[] = [
  {
    slug: 'astro-guide',
    type: 'website',
    title: 'Astro Guide',
    summary: 'Static site documentation.',
    tags: ['开发'],
    body: '# Astro Guide\nDocumentation content here.',
    links: [{ label: 'Official Doc', url: 'https://docs.astro.build' }],
    publishedAt: '2026-08-01',
    updatedAt: '2026-08-03',
    canonicalUrl: '/entries/astro-guide/',
  },
  {
    slug: 'garden-project',
    type: 'project',
    title: 'Garden Project',
    summary: 'A personal digital garden.',
    tags: ['写作'],
    body: 'A personal digital garden notes.',
    links: [],
    publishedAt: '2026-08-02',
    updatedAt: '2026-08-04',
    canonicalUrl: '/entries/garden-project/',
  },
];

describe('Explore index', () => {
  it('matches only title and summary case-insensitively', () => {
    expect(filterExploreIndex(entries, { query: 'STATIC', type: null, tag: null }).map((entry) => entry.slug)).toEqual([
      'astro-guide',
    ]);
  });

  it('does not match a tag as a keyword', () => {
    expect(filterExploreIndex(entries, { query: '开发', type: null, tag: null })).toEqual([]);
  });

  it('intersects query, type, and exact tag filters', () => {
    expect(filterExploreIndex(entries, { query: '', type: 'website', tag: '开发' }).map((entry) => entry.slug)).toEqual([
      'astro-guide',
    ]);
    expect(filterExploreIndex(entries, { query: '', type: 'project', tag: '写作' }).map((entry) => entry.slug)).toEqual([
      'garden-project',
    ]);
  });

  it('returns only the requested visible page size', () => {
    expect(getVisibleEntries(entries, 1).map((entry) => entry.slug)).toEqual(['astro-guide']);
  });

  it('creates public explore index sorted by updatedAt descending and excludes drafts', () => {
    const rawEntries: RawGardenEntry[] = [
      {
        id: 'draft-item',
        data: {
          draft: true,
          type: 'prompt',
          title: 'Draft Item',
          summary: 'Draft summary',
          tags: ['test'],
          updatedAt: new Date('2026-08-05T00:00:00Z'),
        },
      },
      {
        id: 'older-item',
        data: {
          draft: false,
          type: 'skill',
          title: 'Older Skill',
          summary: 'Older summary',
          tags: ['tools'],
          publishedAt: new Date('2026-08-01T00:00:00Z'),
          updatedAt: new Date('2026-08-02T00:00:00Z'),
        },
      },
      {
        id: 'newer-item',
        data: {
          draft: false,
          type: 'mcp',
          title: 'Newer MCP',
          summary: 'Newer summary',
          tags: ['mcp'],
          publishedAt: new Date('2026-08-03T00:00:00Z'),
          updatedAt: new Date('2026-08-06T00:00:00Z'),
        },
      },
      {
        id: 'note-item',
        data: {
          draft: false,
          type: 'note',
          title: 'Note Item',
          summary: 'Note summary',
          tags: ['note'],
          publishedAt: new Date('2026-08-04T00:00:00Z'),
          updatedAt: new Date('2026-08-07T00:00:00Z'),
        },
      },
    ];

    const result = createExploreIndex(rawEntries);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('newer-item');
    expect(result[0].publishedAt).toBe('2026-08-03');
    expect(result[0].updatedAt).toBe('2026-08-06');
    expect(result[0].canonicalUrl).toBe('/entries/newer-item/');
    expect(result[1].slug).toBe('older-item');
  });

  it('provides compatible QuickViewEntry structures with body and links for modal previews', () => {
    const entry = entries[0];
    expect(entry.slug).toBe('astro-guide');
    expect(entry.canonicalUrl).toBe('/entries/astro-guide/');
    expect(entry.body).toContain('# Astro Guide');
    expect(entry.links).toHaveLength(1);
    expect(entry.links[0].label).toBe('Official Doc');
  });
});
