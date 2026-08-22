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
    publishedAt: '2026-08-01',
    updatedAt: '2026-08-03',
    canonicalUrl: '/entries/astro-guide/',
  },
  {
    slug: 'garden-note',
    type: 'note',
    title: 'Garden Notes',
    summary: 'A personal digital garden.',
    tags: ['写作'],
    publishedAt: '2026-08-02',
    updatedAt: '2026-08-04',
    canonicalUrl: '/entries/garden-note/',
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
    expect(filterExploreIndex(entries, { query: 'guide', type: 'website', tag: '开发' }).map((entry) => entry.slug)).toEqual([
      'astro-guide',
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
    ];

    const result = createExploreIndex(rawEntries);
    expect(result).toHaveLength(2);
    expect(result[0].slug).toBe('newer-item');
    expect(result[0].publishedAt).toBe('2026-08-03');
    expect(result[0].updatedAt).toBe('2026-08-06');
    expect(result[0].canonicalUrl).toBe('/entries/newer-item/');
    expect(result[1].slug).toBe('older-item');
  });
});
