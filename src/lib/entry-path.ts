export interface EntryPathTarget {
  id: string;
}

export function getEntryPath(entry: EntryPathTarget) {
  return `/entries/${entry.id}/`;
}
