import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sharedEntryFields = {
	title: z.string().trim().min(1),
	summary: z.string().trim().min(1),
	tags: z.array(z.string().trim().min(1)),
	source: z.enum(['self', 'adapted', 'external']),
	links: z
		.array(
			z.object({
				label: z.string().trim().min(1),
				url: z.string().url(),
			}),
		)
		.default([]),
	related: z.array(reference('entries')).default([]),
	createdAt: z.coerce.date(),
	updatedAt: z.coerce.date(),
	featuredOrder: z.number().int().min(1).max(6).optional(),
	draft: z.boolean().default(false),
};

const entries = defineCollection({
	loader: glob({
		base: './src/content/entries',
		pattern: '*.{md,mdx}',
	}),
	schema: z.union([
		z
			.object({
				...sharedEntryFields,
				type: z.literal('note'),
				category: z.string().trim().min(1),
			})
			.strict(),
		z
			.object({
				...sharedEntryFields,
				type: z.enum(['prompt', 'skill', 'mcp', 'website', 'project']),
			})
			.strict(),
	]),
});

export const collections = { entries };
