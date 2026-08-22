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
