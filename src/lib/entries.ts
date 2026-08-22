import { getCollection, type CollectionEntry } from 'astro:content';
import { getPublicConnections, sortByUpdatedAt, type EntryGraphNode } from './entry-graph';
import { getEntryPath, type EntryPathTarget } from './entry-path';

export { getEntryPath, type EntryPathTarget };

export type GardenEntry = CollectionEntry<'entries'>;
export type NoteEntry = Extract<GardenEntry, { data: { type: 'note' } }>;

interface EntryGraphWrapper extends EntryGraphNode {
	entry: GardenEntry;
}

function toGraphWrapper(entry: GardenEntry): EntryGraphWrapper {
	return {
		id: entry.id,
		related: entry.data.related.map((item) => (typeof item === 'string' ? item : item.id)),
		updatedAt: entry.data.updatedAt,
		entry,
	};
}

function validateFeaturedPositions(entries: GardenEntry[]) {
	const positions = new Map<number, string>();

	for (const entry of entries) {
		const position = entry.data.featuredOrder;
		if (position === undefined) continue;

		const existing = positions.get(position);
		if (existing) {
			throw new Error(`featuredOrder ${position} is used by both "${existing}" and "${entry.id}".`);
		}

		positions.set(position, entry.id);
	}
}

export async function getPublicEntries(): Promise<GardenEntry[]> {
	const entries = await getCollection('entries');
	validateFeaturedPositions(entries);
	return entries.filter((entry) => !entry.data.draft);
}

export async function getPublicEntry(slug: string): Promise<GardenEntry | undefined> {
	return (await getPublicEntries()).find((entry) => entry.id === slug);
}

export async function getEntryConnections(slug: string): Promise<{
	related: GardenEntry[];
	backlinks: GardenEntry[];
}> {
	const entries = await getPublicEntries();
	const wrappers = entries.map(toGraphWrapper);
	const connections = getPublicConnections(wrappers, slug);

	return {
		related: connections.related.map((item) => item.entry),
		backlinks: connections.backlinks.map((item) => item.entry),
	};
}

export async function getHomepageEntries() {
	const entries = await getPublicEntries();
	const wrappers = entries.map(toGraphWrapper);
	const sorted = sortByUpdatedAt(wrappers).map((item) => item.entry);

	return {
		featured: entries
			.filter((entry) => entry.data.featuredOrder !== undefined)
			.sort((left, right) => left.data.featuredOrder! - right.data.featuredOrder!)
			.slice(0, 6),
		recent: sorted.filter((entry) => entry.data.type !== 'note').slice(0, 5),
		notes: sorted.filter((entry): entry is NoteEntry => entry.data.type === 'note'),
	};
}

export function getNoteSlug(entry: { id: string }) {
	return entry.id;
}

export async function getPublicNotes() {
	const entries = await getPublicEntries();
	const wrappers = entries.map(toGraphWrapper);
	const sorted = sortByUpdatedAt(wrappers).map((item) => item.entry);
	return sorted.filter((entry): entry is NoteEntry => entry.data.type === 'note');
}
