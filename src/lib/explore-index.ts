export type ExploreEntryType = 'prompt' | 'skill' | 'mcp' | 'website' | 'project';
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

export interface RawGardenEntry {
  id: string;
  data: {
    type: ExploreEntryType | 'note';
    title: string;
    summary: string;
    tags: string[];
    publishedAt?: Date;
    updatedAt: Date;
    draft?: boolean;
  };
}

function formatDateString(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function createExploreIndex(entries: readonly RawGardenEntry[]): ExploreEntry[] {
  const publicEntries = entries.filter((entry) => !entry.data.draft && entry.data.type !== 'note') as Array<RawGardenEntry & { data: { type: ExploreEntryType } }>;
  const sorted = [...publicEntries].sort((a, b) => b.data.updatedAt.valueOf() - a.data.updatedAt.valueOf());
  return sorted.map((entry) => ({
    slug: entry.id,
    type: entry.data.type,
    title: entry.data.title,
    summary: entry.data.summary,
    tags: [...entry.data.tags],
    publishedAt: entry.data.publishedAt ? formatDateString(entry.data.publishedAt) : formatDateString(entry.data.updatedAt),
    updatedAt: formatDateString(entry.data.updatedAt),
    canonicalUrl: `/entries/${entry.id}/`,
  }));
}

export function filterExploreIndex(entries: readonly ExploreEntry[], filters: ExploreFilters): ExploreEntry[] {
  const query = filters.query.trim().toLocaleLowerCase();
  return entries.filter((entry) => {
    const matchesQuery = !query || `${entry.title} ${entry.summary}`.toLocaleLowerCase().includes(query);
    const matchesType = !filters.type || entry.type === filters.type;
    const matchesTag = !filters.tag || entry.tags.includes(filters.tag);
    return matchesQuery && matchesType && matchesTag;
  });
}

export function getVisibleEntries(entries: readonly ExploreEntry[], count: number): ExploreEntry[] {
  return entries.slice(0, count);
}
