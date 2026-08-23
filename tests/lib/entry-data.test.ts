import { describe, expect, it } from 'vitest';
import { z } from 'astro/zod';
import {
  ENTRY_TYPE_DEFINITIONS,
  ENTRY_TYPES,
  createCollectionEntrySchema,
  parseEditorEntry,
  type EditorEntryData,
  type EditorEntryInput,
  type EntryType,
} from '../../src/lib/entry-data';

describe('entry data registry and validation', () => {
  const baseValidPrompt: EditorEntryInput = {
    slug: 'test-prompt',
    title: 'Test Prompt Title',
    summary: 'A summary for test prompt',
    type: 'prompt',
    tags: ['ai', 'prompt'],
    source: 'self',
    links: [{ label: 'Source', url: 'https://example.com' }],
    related: ['existing-note'],
    createdAt: new Date('2026-08-20T00:00:00Z'),
    publishedAt: new Date('2026-08-21T00:00:00Z'),
    updatedAt: new Date('2026-08-22T00:00:00Z'),
    featuredOrder: 1,
    draft: false,
  };

  const baseValidNote: EditorEntryInput = {
    slug: 'test-note',
    title: 'Test Note Title',
    summary: 'A summary for test note',
    type: 'note',
    category: '实践',
    tags: ['garden'],
    source: 'self',
    links: [],
    related: [],
    createdAt: new Date('2026-08-20T00:00:00Z'),
    publishedAt: new Date('2026-08-21T00:00:00Z'),
    updatedAt: new Date('2026-08-22T00:00:00Z'),
    draft: false,
  };

  const validationOptions = {
    knownSlugs: ['existing-note', 'other-entry', 'test-prompt', 'test-note'],
    currentSlug: 'test-prompt',
  };

  describe('ENTRY_TYPES and ENTRY_TYPE_DEFINITIONS', () => {
    it('defines exactly the six supported entry types', () => {
      expect(ENTRY_TYPES).toEqual(['prompt', 'skill', 'mcp', 'website', 'project', 'note']);
      expect(Object.keys(ENTRY_TYPE_DEFINITIONS).sort()).toEqual([...ENTRY_TYPES].sort());
    });

    it('defines note with category as the only type-specific field', () => {
      expect(ENTRY_TYPE_DEFINITIONS.note.typeFields).toHaveProperty('category');
      expect(ENTRY_TYPE_DEFINITIONS.note.typeFields.category.label).toBeDefined();
      expect(ENTRY_TYPE_DEFINITIONS.note.typeFields.category.control).toBe('text');
      expect(ENTRY_TYPE_DEFINITIONS.note.typeFields.category.required).toBe(true);

      const nonNoteTypes: EntryType[] = ['prompt', 'skill', 'mcp', 'website', 'project'];
      for (const type of nonNoteTypes) {
        expect(Object.keys(ENTRY_TYPE_DEFINITIONS[type].typeFields)).toHaveLength(0);
      }
    });

    it('provides type label and directory for all types', () => {
      for (const type of ENTRY_TYPES) {
        const def = ENTRY_TYPE_DEFINITIONS[type];
        expect(def.type).toBe(type);
        expect(def.directory).toBe(type);
        expect(typeof def.label).toBe('string');
        expect(def.label.length).toBeGreaterThan(0);
      }
    });
  });

  describe('parseEditorEntry', () => {
    it('parses a valid note with category and exposes typed slug', () => {
      const parsed: EditorEntryData = parseEditorEntry(baseValidNote, {
        ...validationOptions,
        currentSlug: 'test-note',
      });
      const parsedSlug: string = parsed.slug;
      expect(parsedSlug).toBe('test-note');
      expect(parsed).toMatchObject({
        type: 'note',
        category: '实践',
        slug: 'test-note',
      });
    });

    it('parses all other standard entry types without category', () => {
      const standardTypes: EntryType[] = ['prompt', 'skill', 'mcp', 'website', 'project'];
      for (const type of standardTypes) {
        const input = { ...baseValidPrompt, type, slug: `test-${type}` };
        const parsed = parseEditorEntry(input, {
          ...validationOptions,
          knownSlugs: [...validationOptions.knownSlugs, `test-${type}`],
          currentSlug: `test-${type}`,
        });
        expect(parsed.type).toBe(type);
      }
    });

    it('rejects a note with empty or missing category', () => {
      expect(() =>
        parseEditorEntry({ ...baseValidNote, category: '' }, { ...validationOptions, currentSlug: 'test-note' }),
      ).toThrow(/category/i);

      const noteWithoutCategory = { ...baseValidNote };
      delete (noteWithoutCategory as Record<string, unknown>).category;
      expect(() =>
        parseEditorEntry(noteWithoutCategory, { ...validationOptions, currentSlug: 'test-note' }),
      ).toThrow(/category/i);
    });

    it('rejects unexpected / unrecognized fields', () => {
      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, unexpected: 'x' }, validationOptions),
      ).toThrow(/unrecognized/i);

      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, category: 'unexpected-for-prompt' }, validationOptions),
      ).toThrow(/unrecognized/i);
    });

    it('rejects related slugs that do not exist in knownSlugs', () => {
      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, related: ['missing'] }, validationOptions),
      ).toThrow(/related/i);
    });

    it('rejects self-referencing related slugs', () => {
      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, related: ['test-prompt'] }, validationOptions),
      ).toThrow(/related/i);
    });

    it('enforces publishedAt rules for public vs draft entries', () => {
      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, draft: false, publishedAt: undefined }, validationOptions),
      ).toThrow(/publishedAt/i);

      expect(() =>
        parseEditorEntry(
          { ...baseValidPrompt, draft: true, publishedAt: new Date('2026-08-21T00:00:00Z') },
          validationOptions,
        ),
      ).toThrow(/publishedAt/i);

      // Draft without publishedAt should succeed
      const validDraft = parseEditorEntry(
        { ...baseValidPrompt, draft: true, publishedAt: undefined },
        validationOptions,
      );
      expect(validDraft.draft).toBe(true);
      expect(validDraft.publishedAt).toBeUndefined();
    });

    it('enforces date ordering constraints', () => {
      expect(() =>
        parseEditorEntry(
          {
            ...baseValidPrompt,
            createdAt: new Date('2026-08-22T00:00:00Z'),
            updatedAt: new Date('2026-08-20T00:00:00Z'),
          },
          validationOptions,
        ),
      ).toThrow(/updatedAt/i);

      expect(() =>
        parseEditorEntry(
          {
            ...baseValidPrompt,
            createdAt: new Date('2026-08-22T00:00:00Z'),
            publishedAt: new Date('2026-08-20T00:00:00Z'),
          },
          validationOptions,
        ),
      ).toThrow(/publishedAt/i);
    });
    it('enforces required createdAt and updatedAt fields', () => {
      const withoutCreatedAt = { ...baseValidPrompt };
      delete (withoutCreatedAt as Record<string, unknown>).createdAt;
      expect(() => parseEditorEntry(withoutCreatedAt, validationOptions)).toThrow();

      const withoutUpdatedAt = { ...baseValidPrompt };
      delete (withoutUpdatedAt as Record<string, unknown>).updatedAt;
      expect(() => parseEditorEntry(withoutUpdatedAt, validationOptions)).toThrow();
    });

    it('enforces slug grammar (lowercase ASCII kebab-case)', () => {
      const invalidSlugs = ['Test-Slug', 'test_slug', 'test slug', 'test--slug', '-test', 'test-', '测试'];
      for (const slug of invalidSlugs) {
        expect(() =>
          parseEditorEntry({ ...baseValidPrompt, slug }, { ...validationOptions, currentSlug: slug }),
        ).toThrow(/slug/i);
      }
    });

    it('validates featuredOrder range and detects duplicates', () => {
      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, featuredOrder: 0 }, validationOptions),
      ).toThrow(/featuredOrder/i);

      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, featuredOrder: 7 }, validationOptions),
      ).toThrow(/featuredOrder/i);

      expect(() =>
        parseEditorEntry({ ...baseValidPrompt, featuredOrder: 1.5 }, validationOptions),
      ).toThrow(/featuredOrder/i);

      // Duplicate check
      expect(() =>
        parseEditorEntry(
          { ...baseValidPrompt, featuredOrder: 2 },
          {
            ...validationOptions,
            existingFeaturedOrders: new Map([[2, 'other-entry']]),
          },
        ),
      ).toThrow(/featuredOrder/i);

      // Same slug occupying the order should succeed
      expect(
        parseEditorEntry(
          { ...baseValidPrompt, featuredOrder: 2 },
          {
            ...validationOptions,
            existingFeaturedOrders: new Map([[2, 'test-prompt']]),
          },
        ).featuredOrder,
      ).toBe(2);
    });

    it('enforces immutability constraints when existingEntry is supplied', () => {
      const existingEntry = {
        slug: 'test-prompt',
        type: 'prompt' as const,
        createdAt: new Date('2026-08-20T00:00:00Z'),
        publishedAt: new Date('2026-08-21T00:00:00Z'),
      };

      // Changing slug
      expect(() =>
        parseEditorEntry(
          { ...baseValidPrompt, slug: 'changed-slug' },
          { ...validationOptions, existingEntry },
        ),
      ).toThrow(/slug/i);

      // Changing type
      expect(() =>
        parseEditorEntry(
          { ...baseValidPrompt, type: 'note', category: '实践' },
          { ...validationOptions, existingEntry },
        ),
      ).toThrow(/type/i);

      // Changing createdAt
      expect(() =>
        parseEditorEntry(
          { ...baseValidPrompt, createdAt: new Date('2026-08-01T00:00:00Z') },
          { ...validationOptions, existingEntry },
        ),
      ).toThrow(/createdAt/i);

      // Changing publishedAt
      expect(() =>
        parseEditorEntry(
          { ...baseValidPrompt, publishedAt: new Date('2026-08-05T00:00:00Z') },
          { ...validationOptions, existingEntry },
        ),
      ).toThrow(/publishedAt/i);
    });
  });

  describe('createCollectionEntrySchema', () => {
    it('creates a schema compatible with custom related schemas', () => {
      const schema = createCollectionEntrySchema(z.string());

      const validNoteResult = schema.safeParse(baseValidNote);
      expect(validNoteResult.success).toBe(true);

      const validPromptResult = schema.safeParse(baseValidPrompt);
      expect(validPromptResult.success).toBe(true);

      const invalidNoteResult = schema.safeParse({ ...baseValidNote, category: '' });
      expect(invalidNoteResult.success).toBe(false);

      const unexpectedResult = schema.safeParse({ ...baseValidPrompt, extra: 123 });
      expect(unexpectedResult.success).toBe(false);
    });
  });
});
