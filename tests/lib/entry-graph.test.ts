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
