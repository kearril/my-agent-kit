import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as os from 'node:os';
import * as crypto from 'node:crypto';
import {
  createEntryStore,
  EntryConflictError,
  EntryNotFoundError,
  EntryPathConflictError,
  type EntryListItem,
  type EntryStore,
  type StoredEntry,
} from '../../src/dev/server/entry-store';
import type { EditorEntryInput } from '../../src/lib/entry-data';

describe('EntryStore', () => {
  let tempDir: string;
  let store: EntryStore;
  const mockToday = new Date('2026-08-23T12:00:00Z');

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'entry-store-test-'));
    store = createEntryStore({
      entriesRoot: tempDir,
      today: () => mockToday,
    });
  });

  afterEach(async () => {
    await fs.rm(tempDir, { recursive: true, force: true });
  });

  const validPromptInput: EditorEntryInput & { body?: string } = {
    slug: 'new-prompt',
    title: 'New Prompt Title',
    summary: 'A summary for new prompt',
    type: 'prompt',
    tags: ['ai', 'testing'],
    source: 'self',
    links: [{ label: 'Site', url: 'https://example.com' }],
    related: [],
    createdAt: new Date('2026-08-20T00:00:00Z'),
    updatedAt: new Date('2026-08-20T00:00:00Z'),
    draft: true,
    body: '## Prompt Body\n\nThis is prompt content.\n',
  };

  const validNoteInput: EditorEntryInput & { body?: string } = {
    slug: 'new-note',
    title: 'New Note Title',
    summary: 'A summary for new note',
    type: 'note',
    category: '实践',
    tags: ['garden'],
    source: 'self',
    links: [],
    related: [],
    createdAt: new Date('2026-08-20T00:00:00Z'),
    publishedAt: new Date('2026-08-20T00:00:00Z'),
    updatedAt: new Date('2026-08-20T00:00:00Z'),
    draft: false,
    body: '\n# Note Heading\n\nContent paragraph.\n',
  };

  describe('create', () => {
    it('creates a new source file at <entriesRoot>/<type>/<slug>.md with canonical frontmatter', async () => {
      const created = await store.create(validPromptInput);

      expect(created).toMatchObject({
        slug: 'new-prompt',
        title: 'New Prompt Title',
        type: 'prompt',
        draft: true,
        body: '## Prompt Body\n\nThis is prompt content.\n',
        extension: '.md',
        isLocal: false,
      });

      expect(created.filePath).toMatch(/prompt[/\\]new-prompt\.md$/);
      expect(created.revision).toEqual(expect.any(String));

      const fileContent = await fs.readFile(created.filePath, 'utf8');
      expect(fileContent.startsWith('---\n')).toBe(true);
      expect(fileContent).toContain('slug: new-prompt\n');
      expect(fileContent).toContain('title: New Prompt Title\n');
      expect(fileContent).toContain('type: prompt\n');
      expect(fileContent).toContain('summary: A summary for new prompt\n');
      expect(fileContent).toContain('draft: true\n');
      expect(fileContent).toContain('---\n## Prompt Body\n\nThis is prompt content.\n');

      // Verify SHA-256 revision matches file bytes exactly
      const rawBytes = await fs.readFile(created.filePath);
      const expectedRevision = crypto.createHash('sha256').update(rawBytes).digest('hex');
      expect(created.revision).toBe(expectedRevision);
    });

    it('defaults draft to true, createdAt and updatedAt to today when omitted', async () => {
      const minimalInput: EditorEntryInput & { body?: string } = {
        slug: 'minimal-prompt',
        title: 'Minimal Prompt',
        summary: 'Minimal summary',
        type: 'prompt',
        source: 'self',
        // draft, createdAt, updatedAt omitted
      };

      const created = await store.create(minimalInput);
      expect(created.draft).toBe(true);
      expect(created.createdAt.toISOString()).toBe(mockToday.toISOString());
      expect(created.updatedAt.toISOString()).toBe(mockToday.toISOString());

      const fileContent = await fs.readFile(created.filePath, 'utf8');
      expect(fileContent).toContain('createdAt: 2026-08-23\n');
      expect(fileContent).toContain('updatedAt: 2026-08-23\n');
      expect(fileContent).toContain('draft: true\n');
    });

    it('serializes Frontmatter in stable common field order followed by type-specific fields', async () => {
      const created = await store.create(validNoteInput);
      const fileContent = await fs.readFile(created.filePath, 'utf8');

      const expectedOrder = [
        'slug: new-note',
        'title: New Note Title',
        'type: note',
        'summary: A summary for new note',
        'tags:',
        'source: self',
        'links: []',
        'related: []',
        'createdAt: 2026-08-20',
        'publishedAt: 2026-08-20',
        'updatedAt: 2026-08-20',
        'category: 实践',
        'draft: false',
      ];

      let lastIndex = -1;
      for (const item of expectedOrder) {
        const idx = fileContent.indexOf(item);
        expect(idx).toBeGreaterThan(-1);
        expect(idx).toBeGreaterThan(lastIndex);
        lastIndex = idx;
      }
    });

    it('rejects with EntryPathConflictError if slug already exists in store', async () => {
      await store.create(validPromptInput);

      await expect(
        store.create({
          ...validPromptInput,
          title: 'Different Title',
        }),
      ).rejects.toBeInstanceOf(EntryPathConflictError);
    });

    it('rejects with EntryPathConflictError if file already exists at target path', async () => {
      const targetDir = path.join(tempDir, 'prompt');
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(path.join(targetDir, 'existing-file.md'), '---\nslug: different-slug\n---\n');

      await expect(
        store.create({
          ...validPromptInput,
          slug: 'existing-file',
        }),
      ).rejects.toBeInstanceOf(EntryPathConflictError);
    });

    it('rejects validation errors from registry schema before creating file', async () => {
      // Invalid slug
      await expect(
        store.create({
          ...validPromptInput,
          slug: 'Invalid_Slug_With_Uppercase',
        }),
      ).rejects.toThrow();

      // Unknown fields
      await expect(
        store.create({
          ...validPromptInput,
          slug: 'valid-slug',
          unexpected: 'value',
        } as unknown as EditorEntryInput),
      ).rejects.toThrow();

      // Missing category for note
      await expect(
        store.create({
          ...validNoteInput,
          slug: 'note-without-cat',
          category: '',
        }),
      ).rejects.toThrow();
    });
  });

  describe('load', () => {
    it('loads an existing .md entry with full metadata, body, filePath, extension and revision', async () => {
      const created = await store.create(validPromptInput);
      const loaded = await store.load('new-prompt');

      expect(loaded).toEqual(created);
      expect(loaded.body).toBe(validPromptInput.body);
      expect(loaded.extension).toBe('.md');
      expect(loaded.isLocal).toBe(false);
    });

    it('loads existing .mdx entry and recognizes .mdx extension', async () => {
      const noteDir = path.join(tempDir, 'note');
      await fs.mkdir(noteDir, { recursive: true });
      const rawMdx = `---
slug: mdx-note
title: MDX Note Title
type: note
summary: MDX summary
tags: []
source: self
links: []
related: []
createdAt: 2026-08-20
publishedAt: 2026-08-20
updatedAt: 2026-08-20
category: 指南
draft: false
---

import { Component } from './component';

<Component />
`;
      const mdxPath = path.join(noteDir, 'mdx-note.mdx');
      await fs.writeFile(mdxPath, rawMdx, 'utf8');

      const loaded = await store.load('mdx-note');
      expect(loaded.slug).toBe('mdx-note');
      expect(loaded.type).toBe('note');
      expect(loaded.category).toBe('指南');
      expect(loaded.extension).toBe('.mdx');
      expect(loaded.filePath).toBe(mdxPath);
      expect(loaded.body).toBe('\nimport { Component } from \'./component\';\n\n<Component />\n');
      expect(loaded.isLocal).toBe(false);
    });

    it('identifies *.local.md and *.local.mdx files as isLocal: true', async () => {
      const promptDir = path.join(tempDir, 'prompt');
      await fs.mkdir(promptDir, { recursive: true });
      const localFile = `---
slug: local-prompt
title: Local Prompt
type: prompt
summary: Local prompt summary
tags: []
source: self
links: []
related: []
createdAt: 2026-08-20
updatedAt: 2026-08-20
draft: true
---

Local body
`;
      await fs.writeFile(path.join(promptDir, 'visual-test.local.md'), localFile, 'utf8');

      const loaded = await store.load('local-prompt');
      expect(loaded.isLocal).toBe(true);
      expect(loaded.slug).toBe('local-prompt');
    });

    it('throws EntryNotFoundError when slug is not found', async () => {
      await expect(store.load('non-existent-slug')).rejects.toBeInstanceOf(EntryNotFoundError);
    });

    it('throws when frontmatter is missing or invalid', async () => {
      const promptDir = path.join(tempDir, 'prompt');
      await fs.mkdir(promptDir, { recursive: true });
      await fs.writeFile(path.join(promptDir, 'broken.md'), '# No frontmatter here\n', 'utf8');

      // The broken file should not be loadable
      await expect(store.load('broken')).rejects.toBeInstanceOf(EntryNotFoundError);
    });
  });

  describe('save', () => {
    it('saves modifications to existing entry and updates updatedAt to today', async () => {
      const created = await store.create(validNoteInput);
      const originalRevision = created.revision;

      const editedNote: EditorEntryInput & { body?: string } = {
        slug: 'new-note',
        title: 'Updated Note Title',
        summary: 'Updated summary',
        type: 'note',
        category: '指南',
        tags: ['garden', 'updated'],
        source: 'adapted',
        links: [{ label: 'Updated Link', url: 'https://updated.com' }],
        related: [],
        createdAt: new Date('2026-08-20T00:00:00Z'),
        publishedAt: new Date('2026-08-20T00:00:00Z'),
        updatedAt: new Date('2026-08-20T00:00:00Z'), // should become mockToday
        draft: false,
        body: '\n# Updated Note Body\n',
      };

      const saved = await store.save('new-note', originalRevision, editedNote);

      expect(saved.title).toBe('Updated Note Title');
      expect(saved.category).toBe('指南');
      expect(saved.updatedAt.toISOString()).toBe(mockToday.toISOString());
      expect(saved.revision).not.toBe(originalRevision);
      expect(saved.body).toBe('\n# Updated Note Body\n');

      // Check on disk
      const diskContent = await fs.readFile(saved.filePath, 'utf8');
      expect(diskContent).toContain('title: Updated Note Title\n');
      expect(diskContent).toContain('updatedAt: 2026-08-23\n');
      expect(diskContent).toContain('category: 指南\n');
      expect(diskContent).toContain('---\n\n# Updated Note Body\n');
    });

    it('uses the route slug when saving an edit payload without slug', async () => {
      const created = await store.create(validPromptInput);
      const { slug: _slug, ...editPayload } = validPromptInput;

      const saved = await store.save('new-prompt', created.revision, {
        ...editPayload,
        title: 'Saved Through Route Identity',
      });

      expect(saved.slug).toBe('new-prompt');
      expect(saved.title).toBe('Saved Through Route Identity');
    });

    it('preserves existing file path and extension on save (.mdx and custom file names)', async () => {
      const promptDir = path.join(tempDir, 'prompt');
      await fs.mkdir(promptDir, { recursive: true });
      const initialMdx = `---
slug: custom-path-prompt
title: Custom Path
type: prompt
summary: Summary
tags: []
source: self
links: []
related: []
createdAt: 2026-08-20
updatedAt: 2026-08-20
draft: true
---

Original body
`;
      const customFilePath = path.join(promptDir, 'my-custom-name.local.mdx');
      await fs.writeFile(customFilePath, initialMdx, 'utf8');

      const loaded = await store.load('custom-path-prompt');
      const saved = await store.save('custom-path-prompt', loaded.revision, {
        slug: 'custom-path-prompt',
        title: 'New Title',
        summary: 'Summary',
        type: 'prompt',
        source: 'self',
        tags: [],
        links: [],
        related: [],
        createdAt: new Date('2026-08-20T00:00:00Z'),
        updatedAt: new Date('2026-08-20T00:00:00Z'),
        draft: true,
        body: 'New body content',
      });

      expect(saved.filePath).toBe(customFilePath);
      expect(saved.extension).toBe('.mdx');
      expect(saved.isLocal).toBe(true);

      const diskContent = await fs.readFile(customFilePath, 'utf8');
      expect(diskContent).toContain('title: New Title\n');
      expect(diskContent).toContain('---\nNew body content');
    });

    it('rejects with EntryConflictError when revision is stale or mismatched', async () => {
      const created = await store.create(validPromptInput);

      await expect(
        store.save('new-prompt', 'stale-revision-hex-12345', {
          ...validPromptInput,
          title: 'Conflict Title',
        }),
      ).rejects.toBeInstanceOf(EntryConflictError);

      // Verify file on disk was not modified
      const fileContent = await fs.readFile(created.filePath, 'utf8');
      expect(fileContent).toContain('title: New Prompt Title\n');
    });

    it('rejects with EntryNotFoundError when saving non-existent entry', async () => {
      await expect(
        store.save('does-not-exist', 'some-rev', {
          ...validPromptInput,
          slug: 'does-not-exist',
        }),
      ).rejects.toBeInstanceOf(EntryNotFoundError);
    });

    it('enforces immutable fields on save via schema validation', async () => {
      const created = await store.create(validNoteInput);

      // Attempting to change slug
      await expect(
        store.save('new-note', created.revision, {
          ...validNoteInput,
          slug: 'changed-slug',
        }),
      ).rejects.toThrow();

      // Attempting to change type
      await expect(
        store.save('new-note', created.revision, {
          ...validNoteInput,
          type: 'prompt',
        } as unknown as EditorEntryInput),
      ).rejects.toThrow();

      // Attempting to change createdAt
      await expect(
        store.save('new-note', created.revision, {
          ...validNoteInput,
          createdAt: new Date('2026-01-01T00:00:00Z'),
        }),
      ).rejects.toThrow();

      // Attempting to change publishedAt after publication
      await expect(
        store.save('new-note', created.revision, {
          ...validNoteInput,
          publishedAt: new Date('2026-08-25T00:00:00Z'),
        }),
      ).rejects.toThrow();
    });

    it('preserves exact caller body bytes unchanged', async () => {
      const created = await store.create(validPromptInput);

      const complexBody = '\r\n\t```js\nconst x = 1;\n```\n\n- item 1\n- item 2\n\n';
      const saved = await store.save('new-prompt', created.revision, {
        ...validPromptInput,
        body: complexBody,
      });

      expect(saved.body).toBe(complexBody);
      const diskContent = await fs.readFile(saved.filePath, 'utf8');
      const expectedEnd = `---\n${complexBody}`;
      expect(diskContent.endsWith(expectedEnd)).toBe(true);
    });

    it('preserves existing on-disk body when body is omitted on save', async () => {
      const created = await store.create(validPromptInput);
      const originalBody = validPromptInput.body!;

      const { body: _, ...inputWithoutBody } = validPromptInput;
      const saved = await store.save('new-prompt', created.revision, {
        ...inputWithoutBody,
        title: 'Updated Prompt Title Without Body',
      });

      expect(saved.body).toBe(originalBody);
      expect(saved.title).toBe('Updated Prompt Title Without Body');

      const diskContent = await fs.readFile(saved.filePath, 'utf8');
      expect(diskContent).toContain('title: Updated Prompt Title Without Body\n');
      expect(diskContent.endsWith(`---\n${originalBody}`)).toBe(true);
    });
  });

  describe('list', () => {
    it('lists all entries across types without bodies', async () => {
      await store.create(validPromptInput);
      await store.create(validNoteInput);

      const list = await store.list();
      expect(list).toHaveLength(2);

      const promptItem = list.find((e) => e.slug === 'new-prompt');
      const noteItem = list.find((e) => e.slug === 'new-note');

      expect(promptItem).toBeDefined();
      expect(promptItem).toMatchObject({
        slug: 'new-prompt',
        title: 'New Prompt Title',
        type: 'prompt',
        draft: true,
        isLocal: false,
        extension: '.md',
      });
      expect((promptItem as unknown as StoredEntry).body).toBeUndefined();

      expect(noteItem).toBeDefined();
      expect(noteItem).toMatchObject({
        slug: 'new-note',
        title: 'New Note Title',
        type: 'note',
        category: '实践',
        draft: false,
        isLocal: false,
        extension: '.md',
      });
      expect((noteItem as unknown as StoredEntry).body).toBeUndefined();
    });

    it('includes local and draft entries in list', async () => {
      await store.create(validPromptInput); // draft

      const noteDir = path.join(tempDir, 'note');
      await fs.mkdir(noteDir, { recursive: true });
      const localFile = `---
slug: visual-test-note
title: Visual Test
type: note
summary: Summary
tags: []
source: self
links: []
related: []
createdAt: 2026-08-20
updatedAt: 2026-08-20
category: 实践
draft: true
---
`;
      await fs.writeFile(path.join(noteDir, 'test.local.md'), localFile, 'utf8');

      const list = await store.list();
      expect(list).toHaveLength(2);

      const localItem = list.find((e) => e.slug === 'visual-test-note');
      expect(localItem).toBeDefined();
      expect(localItem?.isLocal).toBe(true);
      expect(localItem?.draft).toBe(true);
    });

    it('returns an empty array when entriesRoot is empty', async () => {
      const list = await store.list();
      expect(list).toEqual([]);
    });
  });

  describe('cross-entry validation and relationships', () => {
    it('validates related entries exist among existing entries', async () => {
      await store.create(validPromptInput); // slug: new-prompt

      // creating note referencing 'new-prompt' should succeed
      await expect(
        store.create({
          ...validNoteInput,
          slug: 'referencing-note',
          related: ['new-prompt'],
        }),
      ).resolves.toBeDefined();

      // creating note referencing non-existent slug should fail
      await expect(
        store.create({
          ...validNoteInput,
          slug: 'broken-ref-note',
          related: ['non-existent-entry'],
        }),
      ).rejects.toThrow(/non-existent-entry/);
    });

    it('validates featuredOrder uniqueness across entries in store', async () => {
      await store.create({
        ...validNoteInput,
        slug: 'featured-1',
        featuredOrder: 1,
      });

      // creating another entry with featuredOrder 1 should fail
      await expect(
        store.create({
          ...validPromptInput,
          slug: 'featured-dup',
          featuredOrder: 1,
        }),
      ).rejects.toThrow(/featuredOrder 1 is already used/);

      // saving the existing entry keeping featuredOrder 1 should succeed
      const loaded = await store.load('featured-1');
      await expect(
        store.save('featured-1', loaded.revision, {
          ...validNoteInput,
          slug: 'featured-1',
          featuredOrder: 1,
        }),
      ).resolves.toBeDefined();
    });

    it('works with default today function when today option is omitted', async () => {
      const defaultStore = createEntryStore({
        entriesRoot: tempDir,
      });

      const created = await defaultStore.create({
        slug: 'default-today-note',
        title: 'Default Today Note',
        summary: 'Summary',
        type: 'note',
        category: '实践',
        source: 'self',
      });

      expect(created.createdAt).toBeInstanceOf(Date);
      expect(created.updatedAt).toBeInstanceOf(Date);
      expect(created.draft).toBe(true);
    });
  });
});
