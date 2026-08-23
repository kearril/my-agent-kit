import { Marked } from 'marked';
import { z } from 'astro/zod';
import {
  parseEditorEntry,
  type EditorEntryData,
  type EditorEntryInput,
} from '../../lib/entry-data';
import {
  EntryConflictError,
  EntryNotFoundError,
  EntryPathConflictError,
  type EntryListItem,
  type EntryStore,
  type StoredEntry,
} from './entry-store';

export interface EditorApiRequest {
  method: string;
  pathname: string;
  remoteAddress?: string;
  body?: unknown;
  headers?: Record<string, string | string[] | undefined>;
}

export interface EditorApiResponse<T = unknown> {
  status: number;
  headers: Record<string, string>;
  body: T;
}

export type EditorEntrySummary = Omit<EntryListItem, 'filePath'>;

export type EditorEntryDetail = Omit<StoredEntry, 'filePath'>;

export interface EditorEntriesResponse {
  entries: EditorEntrySummary[];
}

export interface EditorEntryResponse {
  entry: EditorEntryDetail;
  url: string;
}

export interface EditorSaveResponse {
  entry: EditorEntryDetail;
  url: string;
}

export interface EditorPreviewResponse {
  html: string;
  title?: string;
  summary?: string;
  data?: EditorEntryData;
}

export interface EditorErrorResponse {
  error: string;
  details?: unknown;
  expectedRevision?: string;
  actualRevision?: string;
}

export interface CreateEditorApiOptions {
  store: EntryStore;
  refreshContent?: () => Promise<void> | void;
  renderMarkdown?: (content: string) => Promise<string> | string;
  maxBodySizeBytes?: number;
}

export type EditorApiHandler = (
  req: EditorApiRequest,
) => Promise<EditorApiResponse<unknown>>;

export const DEFAULT_MAX_BODY_SIZE_BYTES = 2 * 1024 * 1024; // 2MB

export function isLoopbackAddress(remoteAddress?: string): boolean {
  if (!remoteAddress) return false;
  const trimmed = remoteAddress.trim().toLowerCase();
  if (trimmed === '127.0.0.1' || trimmed === '::1') {
    return true;
  }
  // IPv4 loopback network 127.0.0.0/8
  if (/^127(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(trimmed)) {
    return true;
  }
  // IPv4-mapped IPv6 loopback ::ffff:127.0.0.0/8
  if (/^::ffff:127(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/.test(trimmed)) {
    return true;
  }
  return false;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function isRelativeUrl(url: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  return !/^(?:[a-z+]+:|\/\/)/i.test(trimmed);
}

export function createDefaultMarkdownRenderer(): (
  content: string,
) => Promise<string> {
  const marked = new Marked({
    gfm: true,
    renderer: {
      html({ text }: { text: string }) {
        return escapeHtml(text);
      },
      image({
        href,
        title,
        text,
      }: {
        href: string;
        title?: string | null;
        text: string;
      }) {
        if (isRelativeUrl(href)) {
          return `<div class="editor-unsupported-image" role="note" aria-label="Unsupported relative image">[Relative image "${escapeHtml(text || href)}" unsupported in preview]</div>`;
        }
        return false;
      },
    },
  });

  return async (content: string): Promise<string> => {
    const result = marked.parse(content);
    return typeof result === 'string' ? result : await result;
  };
}

function sanitizeSummary(item: EntryListItem): EditorEntrySummary {
  const { filePath: _omitted, ...rest } = item;
  return rest;
}

function sanitizeDetail(entry: StoredEntry): EditorEntryDetail {
  const { filePath: _omitted, ...rest } = entry;
  return rest;
}

function jsonResponse<T>(status: number, body: T): EditorApiResponse<T> {
  return {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    body,
  };
}

function parseRequestBody(
  rawBody: unknown,
  maxSize: number,
): { parsed?: unknown; errorResponse?: EditorApiResponse<EditorErrorResponse> } {
  if (rawBody === undefined || rawBody === null) {
    return { parsed: undefined };
  }

  if (typeof rawBody === 'string') {
    const byteLength = Buffer.byteLength(rawBody, 'utf8');
    if (byteLength > maxSize) {
      return {
        errorResponse: jsonResponse(413, { error: 'Payload too large' }),
      };
    }
    if (!rawBody.trim()) {
      return { parsed: undefined };
    }
    try {
      return { parsed: JSON.parse(rawBody) };
    } catch {
      return {
        errorResponse: jsonResponse(400, { error: 'Invalid JSON payload' }),
      };
    }
  }

  if (Buffer.isBuffer(rawBody)) {
    if (rawBody.length > maxSize) {
      return {
        errorResponse: jsonResponse(413, { error: 'Payload too large' }),
      };
    }
    const str = rawBody.toString('utf8');
    if (!str.trim()) {
      return { parsed: undefined };
    }
    try {
      return { parsed: JSON.parse(str) };
    } catch {
      return {
        errorResponse: jsonResponse(400, { error: 'Invalid JSON payload' }),
      };
    }
  }

  if (typeof rawBody === 'object') {
    return { parsed: rawBody };
  }

  return {
    errorResponse: jsonResponse(400, { error: 'Invalid request body' }),
  };
}

function mapStoreError(err: unknown): EditorApiResponse<EditorErrorResponse> {
  if (err instanceof EntryNotFoundError) {
    return jsonResponse(404, {
      error: `Entry not found: "${err.slug}"`,
    });
  }
  if (err instanceof EntryConflictError) {
    return jsonResponse(409, {
      error: `Conflict for entry "${err.slug}": expected revision "${err.expectedRevision}", but found "${err.actualRevision}"`,
      expectedRevision: err.expectedRevision,
      actualRevision: err.actualRevision,
    });
  }
  if (err instanceof EntryPathConflictError) {
    return jsonResponse(409, {
      error: `Entry conflict: slug or path "${err.pathOrSlug}" already exists`,
    });
  }
  if (err instanceof z.ZodError) {
    return jsonResponse(422, {
      error: 'Validation failed',
      details: err.issues,
    });
  }
  return jsonResponse(500, {
    error: 'Internal server error',
  });
}

export function createEditorApi(options: CreateEditorApiOptions): EditorApiHandler {
  const { store, refreshContent } = options;
  const maxBodySizeBytes =
    options.maxBodySizeBytes ?? DEFAULT_MAX_BODY_SIZE_BYTES;
  const renderMarkdown =
    options.renderMarkdown ?? createDefaultMarkdownRenderer();

  return async (req: EditorApiRequest): Promise<EditorApiResponse<unknown>> => {
    // 1. Loopback check
    if (!isLoopbackAddress(req.remoteAddress)) {
      return jsonResponse(403, {
        error: 'Forbidden: loopback access only',
      });
    }

    const method = req.method.toUpperCase();
    const pathname = req.pathname.replace(/\/+$/, '') || '/';

    // 2. Parse body if applicable
    const { parsed: body, errorResponse } = parseRequestBody(
      req.body,
      maxBodySizeBytes,
    );
    if (errorResponse) {
      return errorResponse;
    }

    // 3. Route matching
    try {
      // GET /__garden-editor/api/entries
      if (method === 'GET' && pathname === '/__garden-editor/api/entries') {
        const list = await store.list();
        return jsonResponse<EditorEntriesResponse>(200, {
          entries: list.map(sanitizeSummary),
        });
      }

      // GET /__garden-editor/api/entries/:slug
      if (
        method === 'GET' &&
        pathname.startsWith('/__garden-editor/api/entries/')
      ) {
        const slug = pathname.slice('/__garden-editor/api/entries/'.length);
        if (!slug || slug.includes('/')) {
          return jsonResponse(404, { error: 'Entry not found' });
        }
        const entry = await store.load(slug);
        return jsonResponse<EditorEntryResponse>(200, {
          entry: sanitizeDetail(entry),
          url: `/entries/${entry.slug}/`,
        });
      }

      // POST /__garden-editor/api/entries
      if (method === 'POST' && pathname === '/__garden-editor/api/entries') {
        const input = (body ?? {}) as EditorEntryInput & { body?: string };
        const created = await store.create(input);
        if (refreshContent) {
          await refreshContent();
        }
        return jsonResponse<EditorSaveResponse>(201, {
          entry: sanitizeDetail(created),
          url: `/entries/${created.slug}/`,
        });
      }
      // PUT /__garden-editor/api/entries/:slug
      if (
        method === 'PUT' &&
        pathname.startsWith('/__garden-editor/api/entries/')
      ) {
        const slug = pathname.slice('/__garden-editor/api/entries/'.length);
        if (!slug || slug.includes('/')) {
          return jsonResponse(404, { error: 'Entry not found' });
        }

        const payload = (body ?? {}) as {
          revision?: unknown;
        } & EditorEntryInput & { body?: string };

        if (
          typeof payload.revision !== 'string' ||
          !payload.revision.trim()
        ) {
          return jsonResponse(400, {
            error: 'Missing or invalid revision string',
          });
        }
        const { revision, ...entryInput } = payload;
        const saved = await store.save(slug, revision, entryInput);
        if (refreshContent) {
          await refreshContent();
        }
        return jsonResponse<EditorSaveResponse>(200, {
          entry: sanitizeDetail(saved),
          url: `/entries/${saved.slug}/`,
        });
      }

      // POST /__garden-editor/api/preview
      if (method === 'POST' && pathname === '/__garden-editor/api/preview') {
        const payload = (body ?? {}) as Record<string, unknown>;
        const ext = typeof payload.extension === 'string' ? payload.extension.toLowerCase() : '';
        const isMdx =
          ext === '.mdx' ||
          ext === 'mdx' ||
          Boolean(payload.isMdx) ||
          (typeof payload.slug === 'string' && payload.slug.endsWith('.mdx'));

        if (isMdx) {
          return jsonResponse(422, {
            error: 'MDX preview is not supported. Save the entry and view on the site.',
          });
        }

        const {
          body: inputBody,
          extension: _ext,
          isLocal: _isLocal,
          revision: _rev,
          filePath: _fp,
          ...metadataInput
        } = payload;

        // Validate metadata schema
        const validated = parseEditorEntry(metadataInput);

        // Render Markdown safely
        const bodyText = typeof inputBody === 'string' ? inputBody : '';
        const renderedHtml = await renderMarkdown(bodyText);

        return jsonResponse<EditorPreviewResponse>(200, {
          html: renderedHtml,
          title: validated.title,
          summary: validated.summary,
          data: validated,
        });
      }

      // Unknown endpoint
      return jsonResponse(404, { error: 'Not found' });
    } catch (err) {
      return mapStoreError(err);
    }
  };
}
