import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { getPublicEntries } from '../lib/entries';
import { getEntryPath } from '../lib/entry-path';

export const GET: APIRoute = async (context) => {
	const entries = await getPublicEntries();
	const sortedEntries = [...entries].sort(
		(left, right) => right.data.updatedAt.valueOf() - left.data.updatedAt.valueOf(),
	);

	return rss({
		title: 'Paracosm Garden',
		description: 'Kearril 的公开数字花园更新。',
		site: context.site,
		items: sortedEntries.map((entry) => ({
			title: entry.data.title,
			description: `${entry.data.summary}\n\n首次公开：${entry.data.publishedAt!.toISOString().slice(0, 10)}；最近更新：${entry.data.updatedAt.toISOString().slice(0, 10)}`,
			link: getEntryPath(entry),
			pubDate: entry.data.updatedAt,
		})),
	});
};
