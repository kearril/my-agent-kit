import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { createCollectionEntrySchema } from './lib/entry-data';

const entries = defineCollection({
	loader: glob({
		base: './src/content/entries',
		pattern: '**/*.{md,mdx}',
	}),
	schema: createCollectionEntrySchema(reference('entries')),
});

export const collections = { entries };
