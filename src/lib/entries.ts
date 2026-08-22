import { getCollection, type CollectionEntry } from 'astro:content';

export type GardenEntry = CollectionEntry<'entries'>;
export type NoteEntry = Extract<GardenEntry, { data: { type: 'note' } }>;

export function getNoteSlug(entry: NoteEntry) {
	if (entry.filePath?.endsWith('.local.md') || entry.filePath?.endsWith('.local.mdx')) {
		return entry.id.replace(/local$/, '');
	}

	return entry.id.replace(/\.local\.(md|mdx)$/, '').replace(/\.(md|mdx)$/, '');
}

function byLastUpdate(left: GardenEntry, right: GardenEntry) {
	return right.data.updatedAt.valueOf() - left.data.updatedAt.valueOf();
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

export async function getPublicEntries() {
	const entries = await getCollection('entries');
	validateFeaturedPositions(entries);
	return entries.filter((entry) => !entry.data.draft);
}

export async function getHomepageEntries() {
	const entries = await getPublicEntries();

	return {
		featured: entries
			.filter((entry) => entry.data.featuredOrder !== undefined)
			.sort((left, right) => left.data.featuredOrder! - right.data.featuredOrder!)
			.slice(0, 6),
		recent: entries.filter((entry) => entry.data.type !== 'note').sort(byLastUpdate).slice(0, 5),
		notes: entries.filter((entry): entry is NoteEntry => entry.data.type === 'note').sort(byLastUpdate),
	};
}

export async function getPublicNotes() {
	const entries = await getPublicEntries();
	return entries.filter((entry): entry is NoteEntry => entry.data.type === 'note').sort(byLastUpdate);
}
