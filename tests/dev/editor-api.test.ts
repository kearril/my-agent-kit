import type { IncomingMessage, ServerResponse } from 'node:http';
import { describe, expect, it, vi } from 'vitest';
import {
  createEditorApi,
  type CreateEditorApiOptions,
  type EditorApiRequest,
  type EditorApiResponse,
} from '../../src/dev/server/editor-api';
import { localEditor } from '../../src/integrations/local-editor';
import {
  EntryConflictError,
  EntryNotFoundError,
  EntryPathConflictError,
  type EntryListItem,
  type EntryStore,
  type StoredEntry,
} from '../../src/dev/server/entry-store';
import {
  parseEditorEntry,
  type EditorEntryData,
  type EditorEntryInput,
} from '../../src/lib/entry-data';

describe('Editor API', () => {
  const baseNoteData: EditorEntryData = {
    slug: 'existing-note',
    title: 'Existing Note Title',
    summary: 'A summary for existing note',
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

  const storedNote: StoredEntry = {
    ...baseNoteData,
    body: '## Existing Body\n\nSome content.',
    filePath: '/absolute/path/to/src/content/entries/note/existing-note.md',
    extension: '.md',
    revision: 'rev-12345',
    isLocal: false,
    data: baseNoteData,
  };

  const createFakeStore = (overrides?: Partial<EntryStore>): EntryStore => {
    return {
      list: vi.fn(async (): Promise<EntryListItem[]> => [
        {
          ...baseNoteData,
          filePath: '/absolute/path/to/src/content/entries/note/existing-note.md',
          extension: '.md',
          isLocal: false,
          data: baseNoteData,
        },
      ]),
      load: vi.fn(async (slug: string): Promise<StoredEntry> => {
        if (slug === 'existing-note') {
          return storedNote;
        }
        throw new EntryNotFoundError(slug);
      }),
      create: vi.fn(async (input: EditorEntryInput & { body?: string }): Promise<StoredEntry> => {
        if (input.slug === 'conflict-slug') {
          throw new EntryPathConflictError(input.slug);
        }
        const { body: inputBody, ...metadata } = input;
        const validated = parseEditorEntry(metadata);
        return {
          ...validated,
          body: inputBody ?? '',
          filePath: `/absolute/path/to/src/content/entries/${validated.type}/${validated.slug}.md`,
          extension: '.md',
          revision: 'rev-new-created',
          isLocal: false,
          data: validated,
        };
      }),
      save: vi.fn(
        async (
          slug: string,
          revision: string,
          input: EditorEntryInput & { body?: string },
        ): Promise<StoredEntry> => {
          if (slug !== 'existing-note') {
            throw new EntryNotFoundError(slug);
          }
          if (revision !== 'rev-12345') {
            throw new EntryConflictError(slug, 'rev-12345', revision);
          }
          const { body: inputBody, ...metadata } = input;
          const validated = parseEditorEntry(metadata, {
            existingEntry: {
              slug: storedNote.data.slug,
              type: storedNote.data.type,
              createdAt: storedNote.data.createdAt,
              publishedAt: storedNote.data.publishedAt,
            },
            currentSlug: slug,
          });
          return {
            ...storedNote,
            ...validated,
            body: inputBody ?? storedNote.body,
            revision: 'rev-updated-67890',
            data: validated,
          };
        },
      ),
      ...overrides,
    };
  };

  describe('Loopback Access Control', () => {
    it('rejects non-loopback addresses with 403', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const res = await api({
        method: 'GET',
        pathname: '/__garden-editor/api/entries',
        remoteAddress: '10.0.0.5',
      });

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ error: expect.stringMatching(/loopback|forbidden/i) });
      expect(refreshContent).toHaveBeenCalledTimes(0);
    });

    it('rejects public IPv4 and IPv6 addresses with 403', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const remoteIps = ['192.168.1.1', '172.16.0.1', '8.8.8.8', 'fe80::1', '2001:db8::1', '::ffff:192.168.1.1', 'localhost'];
      for (const ip of remoteIps) {
        const res = await api({
          method: 'GET',
          pathname: '/__garden-editor/api/entries',
          remoteAddress: ip,
        });
        expect(res.status).toBe(403);
      }
    });

    it('allows 127.0.0.1, ::1, and IPv4-mapped loopback', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const loopbacks = ['127.0.0.1', '127.0.0.2', '::1', '::ffff:127.0.0.1'];
      for (const ip of loopbacks) {
        const res = await api({
          method: 'GET',
          pathname: '/__garden-editor/api/entries',
          remoteAddress: ip,
        });
        expect(res.status).toBe(200);
      }
    });
  });

  describe('Payload and Routing Validation', () => {
    it('rejects payloads exceeding the size limit with 413', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const largeBody = 'a'.repeat(3 * 1024 * 1024); // 3MB
      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/entries',
        remoteAddress: '127.0.0.1',
        body: largeBody,
      });

      expect(res.status).toBe(413);
      expect(res.body).toMatchObject({ error: expect.stringMatching(/too large/i) });
    });

    it('rejects invalid JSON string body with 400', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/entries',
        remoteAddress: '127.0.0.1',
        body: '{ invalid json ',
      });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({ error: expect.stringMatching(/json/i) });
    });

    it('returns 404 for unknown endpoints', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const res = await api({
        method: 'GET',
        pathname: '/__garden-editor/api/unknown-route',
        remoteAddress: '127.0.0.1',
      });

      expect(res.status).toBe(404);
    });
  });

  describe('GET /__garden-editor/api/entries', () => {
    it('returns entry list without exposing filesystem paths', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const res = await api({
        method: 'GET',
        pathname: '/__garden-editor/api/entries',
        remoteAddress: '127.0.0.1',
      });

      expect(res.status).toBe(200);
      const json = JSON.stringify(res.body);
      expect(json).not.toContain('/absolute/path/to');
      expect(res.body).toMatchObject({
        entries: expect.arrayContaining([
          expect.objectContaining({
            slug: 'existing-note',
            title: 'Existing Note Title',
            type: 'note',
          }),
        ]),
      });
    });
  });

  describe('GET /__garden-editor/api/entries/:slug', () => {
    it('returns detail for existing entry with public URL and without exposing filesystem paths', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const res = await api({
        method: 'GET',
        pathname: '/__garden-editor/api/entries/existing-note',
        remoteAddress: '127.0.0.1',
      });

      expect(res.status).toBe(200);
      const json = JSON.stringify(res.body);
      expect(json).not.toContain('/absolute/path/to');
      expect(res.body).toMatchObject({
        entry: expect.objectContaining({
          slug: 'existing-note',
          title: 'Existing Note Title',
          body: '## Existing Body\n\nSome content.',
          revision: 'rev-12345',
        }),
        url: '/entries/existing-note/',
      });
    });

    it('returns 404 when entry does not exist', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const res = await api({
        method: 'GET',
        pathname: '/__garden-editor/api/entries/non-existent-slug',
        remoteAddress: '127.0.0.1',
      });

      expect(res.status).toBe(404);
      expect(res.body).toMatchObject({ error: expect.stringMatching(/not found/i) });
    });
  });

  describe('POST /__garden-editor/api/entries', () => {
    const validCreatePayload: EditorEntryInput & { body: string } = {
      slug: 'new-note',
      title: 'New Note Title',
      summary: 'A summary for new note',
      type: 'note',
      category: '实践',
      tags: ['test'],
      source: 'self',
      links: [],
      related: [],
      createdAt: new Date('2026-08-23T00:00:00Z'),
      publishedAt: new Date('2026-08-23T00:00:00Z'),
      updatedAt: new Date('2026-08-23T00:00:00Z'),
      draft: false,
      body: '## New Content',
    };

    it('creates an entry, invokes refreshContent exactly once, and returns url', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/entries',
        remoteAddress: '127.0.0.1',
        body: validCreatePayload,
      });

      expect(res.status).toBe(201);
      expect(refreshContent).toHaveBeenCalledTimes(1);
      expect(res.body).toMatchObject({
        entry: expect.objectContaining({
          slug: 'new-note',
          title: 'New Note Title',
          revision: 'rev-new-created',
        }),
        url: '/entries/new-note/',
      });
      expect(JSON.stringify(res.body)).not.toContain('/absolute/path/to');
    });

    it('returns 409 when path/slug conflict occurs and does not invoke refreshContent', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/entries',
        remoteAddress: '127.0.0.1',
        body: { ...validCreatePayload, slug: 'conflict-slug' },
      });

      expect(res.status).toBe(409);
      expect(refreshContent).toHaveBeenCalledTimes(0);
      expect(res.body).toMatchObject({
        error: expect.stringMatching(/conflict|exists/i),
      });
      expect(JSON.stringify(res.body)).not.toContain('/absolute/path/to');
    });

    it('returns 422 on schema validation errors and does not invoke refreshContent', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/entries',
        remoteAddress: '127.0.0.1',
        body: { ...validCreatePayload, title: '' }, // empty title invalid
      });

      expect(res.status).toBe(422);
      expect(refreshContent).toHaveBeenCalledTimes(0);
      expect(res.body).toMatchObject({
        error: expect.stringMatching(/validation/i),
      });
    });
  });

  describe('PUT /__garden-editor/api/entries/:slug', () => {
    const validUpdatePayload = {
      ...baseNoteData,
      title: 'Updated Note Title',
      revision: 'rev-12345',
      body: '## Updated Content',
    };

    it('saves an entry, invokes refreshContent exactly once, and returns url', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const res = await api({
        method: 'PUT',
        pathname: '/__garden-editor/api/entries/existing-note',
        remoteAddress: '127.0.0.1',
        body: validUpdatePayload,
      });

      expect(res.status).toBe(200);
      expect(refreshContent).toHaveBeenCalledTimes(1);
      expect(res.body).toMatchObject({
        entry: expect.objectContaining({
          slug: 'existing-note',
          title: 'Updated Note Title',
          revision: 'rev-updated-67890',
        }),
        url: '/entries/existing-note/',
      });
      expect(JSON.stringify(res.body)).not.toContain('/absolute/path/to');
    });

    it('returns 409 on revision conflict and does not invoke refreshContent', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const stalePayload = {
        ...validUpdatePayload,
        revision: 'rev-stale-99999',
      };

      const res = await api({
        method: 'PUT',
        pathname: '/__garden-editor/api/entries/existing-note',
        remoteAddress: '127.0.0.1',
        body: stalePayload,
      });

      expect(res.status).toBe(409);
      expect(refreshContent).toHaveBeenCalledTimes(0);
      expect(res.body).toMatchObject({
        error: expect.stringMatching(/conflict|revision|modified/i),
      });
    });

    it('returns 400 when revision is missing from payload', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const payloadWithoutRevision = {
        ...validUpdatePayload,
        revision: undefined,
      };

      const res = await api({
        method: 'PUT',
        pathname: '/__garden-editor/api/entries/existing-note',
        remoteAddress: '127.0.0.1',
        body: payloadWithoutRevision,
      });

      expect(res.status).toBe(400);
      expect(refreshContent).toHaveBeenCalledTimes(0);
      expect(res.body).toMatchObject({
        error: expect.stringMatching(/revision/i),
      });
    });

    it('returns 404 when saving a non-existent entry', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const res = await api({
        method: 'PUT',
        pathname: '/__garden-editor/api/entries/non-existent',
        remoteAddress: '127.0.0.1',
        body: validUpdatePayload,
      });

      expect(res.status).toBe(404);
      expect(refreshContent).toHaveBeenCalledTimes(0);
    });
  });

  describe('POST /__garden-editor/api/preview', () => {
    it('renders safe Markdown preview with escaped raw HTML and unsupported relative image notices', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const markdownPayload = {
        ...baseNoteData,
        extension: '.md',
        body: '# Test Heading\n\n<script>alert("xss")</script>\n\n<p onclick="steal()">click</p>\n\n![remote](https://example.com/img.png)\n\n![local](./images/pic.png)',
      };

      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/preview',
        remoteAddress: '::1',
        body: markdownPayload,
      });

      expect(res.status).toBe(200);
      expect(refreshContent).toHaveBeenCalledTimes(0);
      const preview = res.body as { html: string };
      expect(preview.html).toContain('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
      expect(preview.html).toContain('&lt;p onclick=&quot;steal()&quot;&gt;');
      expect(preview.html).not.toContain('<script>');
      expect(preview.html).toContain('<img src="https://example.com/img.png"');
      expect(preview.html).toContain('unsupported in preview');
      expect(preview.html).not.toContain('<img src="./images/pic.png"');
    });

    it('rejects MDX preview with 422', async () => {
      const store = createFakeStore();
      const refreshContent = vi.fn();
      const api = createEditorApi({ store, refreshContent });

      const mdxPayload = {
        ...baseNoteData,
        extension: '.mdx',
        body: '# MDX Document\n\n<CustomComponent prop="val" />',
      };

      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/preview',
        remoteAddress: '::1',
        body: mdxPayload,
      });

      expect(res.status).toBe(422);
      expect(refreshContent).toHaveBeenCalledTimes(0);
      expect(res.body).toMatchObject({
        error: expect.stringMatching(/mdx/i),
      });
    });

    it('rejects invalid metadata schema in preview with 422', async () => {
      const store = createFakeStore();
      const api = createEditorApi({ store });

      const invalidPayload = {
        ...baseNoteData,
        title: '', // invalid empty title
        body: '# Valid body',
      };

      const res = await api({
        method: 'POST',
        pathname: '/__garden-editor/api/preview',
        remoteAddress: '127.0.0.1',
        body: invalidPayload,
      });

      expect(res.status).toBe(422);
      expect(res.body).toMatchObject({
        error: expect.stringMatching(/validation/i),
      });
    });
  });

  describe('localEditor Astro Integration', () => {
    it('returns an AstroIntegration with name "local-editor" and astro:server:setup hook', () => {
      const integration = localEditor();
      expect(integration.name).toBe('local-editor');
      expect(integration.hooks?.['astro:server:setup']).toBeTypeOf('function');
    });

    it('registers Vite middleware that serves the editor HTML shell and forwards API calls', async () => {
      const integration = localEditor();
      let middleware:
        | ((
            req: IncomingMessage,
            res: ServerResponse,
            next: (err?: unknown) => void,
          ) => Promise<void>)
        | undefined;

      const mockServer = {
        middlewares: {
          use: vi.fn((fn) => {
            middleware = fn;
          }),
        },
        transformIndexHtml: vi.fn(
          async (_url: string, html: string) => `<!-- transformed -->${html}`,
        ),
      };
      const mockRefresh = vi.fn();

      const setupHook = integration.hooks?.['astro:server:setup'] as unknown as (options: {
        server: typeof mockServer;
        refreshContent?: () => Promise<void>;
      }) => Promise<void>;

      await setupHook({
        server: mockServer,
        refreshContent: mockRefresh,
      });
      expect(mockServer.middlewares.use).toHaveBeenCalledTimes(1);
      expect(middleware).toBeDefined();

      // Test 1: HTML shell request
      const htmlReq = {
        url: '/__garden-editor/',
        method: 'GET',
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
      };
      let htmlContent = '';
      const htmlRes = {
        statusCode: 0,
        setHeader: vi.fn(),
        end: vi.fn((data: string) => {
          htmlContent = data;
        }),
      };
      const nextSpy = vi.fn();

      await middleware!(
        htmlReq as unknown as IncomingMessage,
        htmlRes as unknown as ServerResponse,
        nextSpy,
      );
      expect(nextSpy).toHaveBeenCalledTimes(0);
      expect(htmlContent).toContain('/src/dev/editor.tsx');
      expect(mockServer.transformIndexHtml).toHaveBeenCalledWith('/__garden-editor/', expect.any(String));

      // Test 2: Unrelated route passes through to next()
      const otherReq = {
        url: '/entries/my-note',
        method: 'GET',
        headers: {},
        socket: { remoteAddress: '127.0.0.1' },
      };
      const otherRes = {
        statusCode: 0,
        setHeader: vi.fn(),
        end: vi.fn(),
      };
      const nextSpy2 = vi.fn();
      await middleware!(
        otherReq as unknown as IncomingMessage,
        otherRes as unknown as ServerResponse,
        nextSpy2,
      );
      expect(nextSpy2).toHaveBeenCalledTimes(1);
      expect(otherRes.end).toHaveBeenCalledTimes(0);

      // Test 3: Non-loopback request to HTML shell is rejected with 403
      const nonLoopbackShellReq = {
        url: '/__garden-editor/',
        method: 'GET',
        headers: {},
        socket: { remoteAddress: '10.0.0.5' },
      };
      let nonLoopbackShellBody = '';
      const nonLoopbackShellRes = {
        statusCode: 0,
        setHeader: vi.fn(),
        end: vi.fn((data: string) => {
          nonLoopbackShellBody = data;
        }),
      };
      const nextSpy3 = vi.fn();
      await middleware!(
        nonLoopbackShellReq as unknown as IncomingMessage,
        nonLoopbackShellRes as unknown as ServerResponse,
        nextSpy3,
      );
      expect(nextSpy3).toHaveBeenCalledTimes(0);
      expect(nonLoopbackShellRes.statusCode).toBe(403);
      expect(nonLoopbackShellBody).toContain('Forbidden');

      // Test 4: Non-loopback request to API is rejected with 403
      const nonLoopbackApiReq = {
        url: '/__garden-editor/api/entries',
        method: 'GET',
        headers: {},
        socket: { remoteAddress: '192.168.1.50' },
      };
      let nonLoopbackApiBody = '';
      const nonLoopbackApiRes = {
        statusCode: 0,
        setHeader: vi.fn(),
        end: vi.fn((data: string) => {
          nonLoopbackApiBody = data;
        }),
      };
      const nextSpy4 = vi.fn();
      await middleware!(
        nonLoopbackApiReq as unknown as IncomingMessage,
        nonLoopbackApiRes as unknown as ServerResponse,
        nextSpy4,
      );
      expect(nextSpy4).toHaveBeenCalledTimes(0);
      expect(nonLoopbackApiRes.statusCode).toBe(403);
      expect(nonLoopbackApiBody).toContain('Forbidden');

      // Test 5: Streaming request exceeding 2MB is terminated early with 413
      async function* createLargeStream() {
        // Yield 1MB twice + a bit more
        yield Buffer.alloc(1024 * 1024, 'a');
        yield Buffer.alloc(1024 * 1024, 'a');
        yield Buffer.alloc(1024, 'a');
      }

      const largeReq = Object.assign(createLargeStream(), {
        url: '/__garden-editor/api/entries',
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        socket: { remoteAddress: '127.0.0.1' },
      });
      let largeResBody = '';
      const largeRes = {
        statusCode: 0,
        setHeader: vi.fn(),
        end: vi.fn((data: string) => {
          largeResBody = data;
        }),
      };
      const nextSpy5 = vi.fn();
      await middleware!(
        largeReq as unknown as IncomingMessage,
        largeRes as unknown as ServerResponse,
        nextSpy5,
      );
      expect(nextSpy5).toHaveBeenCalledTimes(0);
      expect(largeRes.statusCode).toBe(413);
      expect(largeResBody).toContain('Payload too large');
    });
  });
});
