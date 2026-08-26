import { useMemo } from 'react';
import type { EntryType } from '../../lib/entry-data';
import type { EditorEntrySummary } from '../server/editor-api';

export interface TagCount {
  tag: string;
  count: number;
}

export interface GardenVocabulary {
  allTags: TagCount[];
  allCategories: string[];
  entrySlugMap: Map<string, { title: string; type: EntryType }>;
}

/**
 * Pure extractor that computes tags, categories, and slug mappings from an entry list.
 */
export function extractGardenVocabulary(
  entries: EditorEntrySummary[],
): GardenVocabulary {
  const tagCountMap = new Map<string, number>();
  const categorySet = new Set<string>();
  const slugMap = new Map<string, { title: string; type: EntryType }>();

  for (const entry of entries) {
    if (entry.slug) {
      slugMap.set(entry.slug, {
        title: entry.title || entry.slug,
        type: entry.type,
      });
    }

    if (Array.isArray(entry.tags)) {
      for (const rawTag of entry.tags) {
        const t = String(rawTag).trim();
        if (t) {
          tagCountMap.set(t, (tagCountMap.get(t) || 0) + 1);
        }
      }
    }

    if (entry.type === 'note' && (entry as Record<string, unknown>).category) {
      const cat = String((entry as Record<string, unknown>).category).trim();
      if (cat) {
        categorySet.add(cat);
      }
    }
  }

  const allTags: TagCount[] = Array.from(tagCountMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));

  const allCategories = Array.from(categorySet).sort((a, b) =>
    a.localeCompare(b),
  );

  return {
    allTags,
    allCategories,
    entrySlugMap: slugMap,
  };
}

/**
 * Extracts and aggregates all unique tags (with usage frequency) and Note categories
 * from the loaded entry list in memory.
 */
export function useGardenVocabulary(
  entries: EditorEntrySummary[],
): GardenVocabulary {
  return useMemo(() => extractGardenVocabulary(entries), [entries]);
}
