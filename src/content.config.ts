import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const sharedEntryFields = {
	slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase ASCII kebab-case'),
	title: z.string().trim().min(1),
	summary: z.string().trim().min(1),
	tags: z.array(z.string().trim().min(1)).default([]),
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
	publishedAt: z.coerce.date().optional(),
	updatedAt: z.coerce.date(),
	featuredOrder: z.number().int().min(1).max(6).optional(),
	draft: z.boolean().default(false),
};

const entries = defineCollection({
	loader: glob({
		base: './src/content/entries',
		pattern: '**/*.{md,mdx}',
	}),
	schema: z.union([
		z
			.object({
				...sharedEntryFields,
				type: z.literal('note'),
				category: z.string().trim().min(1),
			})
			.strict()
			.superRefine((data, ctx) => {
				if (data.draft && data.publishedAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'draft entries cannot set publishedAt', path: ['publishedAt'] });
				}
				if (!data.draft && !data.publishedAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'public entries require publishedAt', path: ['publishedAt'] });
				}
				if (data.updatedAt < data.createdAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'updatedAt cannot precede createdAt', path: ['updatedAt'] });
				}
				if (data.publishedAt && data.publishedAt < data.createdAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'publishedAt cannot precede createdAt', path: ['publishedAt'] });
				}
			}),
		z
			.object({
				...sharedEntryFields,
				type: z.enum(['prompt', 'skill', 'mcp', 'website', 'project']),
			})
			.strict()
			.superRefine((data, ctx) => {
				if (data.draft && data.publishedAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'draft entries cannot set publishedAt', path: ['publishedAt'] });
				}
				if (!data.draft && !data.publishedAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'public entries require publishedAt', path: ['publishedAt'] });
				}
				if (data.updatedAt < data.createdAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'updatedAt cannot precede createdAt', path: ['updatedAt'] });
				}
				if (data.publishedAt && data.publishedAt < data.createdAt) {
					ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'publishedAt cannot precede createdAt', path: ['publishedAt'] });
				}
			}),
	]),
});

export const collections = { entries };
