import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import {
  ENTRY_TYPE_DEFINITIONS,
  parseEditorEntry,
  type EditorEntryData,
  type EditorEntryInput,
  type EntryType,
} from '../../lib/entry-data';

export type EntryRevision = string;

export class EntryNotFoundError extends Error {
  readonly slug: string;

  constructor(slug: string) {
    super(`Entry not found: "${slug}"`);
    this.name = 'EntryNotFoundError';
    this.slug = slug;
  }
}

export class EntryConflictError extends Error {
  readonly slug: string;
  readonly expectedRevision: string;
  readonly actualRevision: string;

  constructor(slug: string, expectedRevision: string, actualRevision: string) {
    super(
      `Conflict for entry "${slug}": expected revision "${expectedRevision}", but found "${actualRevision}"`,
    );
    this.name = 'EntryConflictError';
    this.slug = slug;
    this.expectedRevision = expectedRevision;
    this.actualRevision = actualRevision;
  }
}

export class EntryPathConflictError extends Error {
  readonly pathOrSlug: string;

  constructor(pathOrSlug: string, message?: string) {
    super(message ?? `Entry path conflict: "${pathOrSlug}" already exists`);
    this.name = 'EntryPathConflictError';
    this.pathOrSlug = pathOrSlug;
  }
}

export type StoredEntry = EditorEntryData & {
  body: string;
  filePath: string;
  extension: string;
  revision: EntryRevision;
  isLocal: boolean;
  data: EditorEntryData;
  [key: string]: unknown;
};

export type EntryListItem = EditorEntryData & {
  filePath: string;
  extension: string;
  isLocal: boolean;
  data: EditorEntryData;
  [key: string]: unknown;
};

export interface CreateEntryStoreOptions {
  entriesRoot: string;
  today?: () => Date;
}

export interface EntryStore {
  list(): Promise<EntryListItem[]>;
  load(slug: string): Promise<StoredEntry>;
  create(input: EditorEntryInput & { body?: string }): Promise<StoredEntry>;
  save(
    slug: string,
    revision: string,
    input: EditorEntryInput & { body?: string },
  ): Promise<StoredEntry>;
}

function computeRevision(content: Buffer | string): EntryRevision {
  const buf = typeof content === 'string' ? Buffer.from(content, 'utf8') : content;
  return crypto.createHash('sha256').update(buf).digest('hex');
}

function formatDateForFrontmatter(val: Date | string): string {
  if (val instanceof Date) {
    return val.toISOString().slice(0, 10);
  }
  if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}/.test(val)) {
    return val.slice(0, 10);
  }
  return new Date(val).toISOString().slice(0, 10);
}

function parseFrontmatterAndBody(raw: string): {
  frontmatterYaml: string;
  body: string;
} {
  if (!raw.startsWith('---')) {
    throw new Error('File does not start with Frontmatter delimiter "---"');
  }

  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (match) {
    return {
      frontmatterYaml: match[1],
      body: match[2],
    };
  }

  const endMatch = raw.match(/^---\r?\n([\s\S]*?)\r?\n---$/);
  if (endMatch) {
    return {
      frontmatterYaml: endMatch[1],
      body: '',
    };
  }

  throw new Error('Invalid Frontmatter format: missing closing "---" delimiter');
}

function serializeFrontmatterAndBody(data: EditorEntryData, body?: string): string {
  const orderedObj: Record<string, unknown> = {};

  orderedObj.slug = data.slug;
  orderedObj.title = data.title;
  orderedObj.type = data.type;
  orderedObj.summary = data.summary;
  orderedObj.tags = data.tags;
  orderedObj.source = data.source;
  orderedObj.links = data.links;
  orderedObj.related = data.related;
  orderedObj.createdAt = formatDateForFrontmatter(data.createdAt);

  if (data.publishedAt !== undefined && data.publishedAt !== null) {
    orderedObj.publishedAt = formatDateForFrontmatter(data.publishedAt);
  }

  orderedObj.updatedAt = formatDateForFrontmatter(data.updatedAt);

  // Type-specific fields from registry
  const typeDef = ENTRY_TYPE_DEFINITIONS[data.type];
  if (typeDef?.typeFields) {
    for (const fieldKey of Object.keys(typeDef.typeFields)) {
      if (fieldKey in data && (data as Record<string, unknown>)[fieldKey] !== undefined) {
        orderedObj[fieldKey] = (data as Record<string, unknown>)[fieldKey];
      }
    }
  }

  if (data.featuredOrder !== undefined && data.featuredOrder !== null) {
    orderedObj.featuredOrder = data.featuredOrder;
  }

  orderedObj.draft = data.draft;

  const yamlStr = stringifyYaml(orderedObj, { lineWidth: 0 });
  const cleanYaml = yamlStr.trim();
  const safeBody = body ?? '';

  return `---\n${cleanYaml}\n---\n${safeBody}`;
}

async function getEntryFiles(dir: string): Promise<string[]> {
  const results: string[] = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const nested = await getEntryFiles(fullPath);
        results.push(...nested);
      } else if (entry.isFile() && (entry.name.endsWith('.md') || entry.name.endsWith('.mdx'))) {
        results.push(fullPath);
      }
    }
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw err;
  }
  return results;
}

interface ParsedFileEntry {
  data: EditorEntryData;
  body: string;
  filePath: string;
  extension: string;
  isLocal: boolean;
  revision: EntryRevision;
}

async function readAndParseFile(
  filePath: string,
  resolvedRoot: string,
): Promise<ParsedFileEntry | null> {
  const resolvedPath = path.resolve(filePath);
  if (!resolvedPath.startsWith(resolvedRoot + path.sep) && resolvedPath !== resolvedRoot) {
    throw new Error(`Access denied: file path "${filePath}" is outside entriesRoot`);
  }

  try {
    const rawBytes = await fs.readFile(resolvedPath);
    const rawText = rawBytes.toString('utf8');
    const { frontmatterYaml, body } = parseFrontmatterAndBody(rawText);
    const parsedRaw = parseYaml(frontmatterYaml);
    const data = parseEditorEntry(parsedRaw);
    const revision = computeRevision(rawBytes);
    const baseName = path.basename(resolvedPath);
    const extension = path.extname(resolvedPath);
    const isLocal = baseName.includes('.local.');

    return {
      data,
      body,
      filePath: resolvedPath,
      extension,
      isLocal,
      revision,
    };
  } catch {
    return null;
  }
}

export function createEntryStore(options: CreateEntryStoreOptions): EntryStore {
  const resolvedRoot = path.resolve(options.entriesRoot);
  const getToday = options.today ?? (() => new Date());

  async function scanAll(): Promise<ParsedFileEntry[]> {
    const files = await getEntryFiles(resolvedRoot);
    const results: ParsedFileEntry[] = [];
    for (const file of files) {
      const parsed = await readAndParseFile(file, resolvedRoot);
      if (parsed) {
        results.push(parsed);
      }
    }
    return results;
  }

  return {
    async list(): Promise<EntryListItem[]> {
      const all = await scanAll();
      return all.map((entry) => {
        const item: EntryListItem = {
          ...entry.data,
          filePath: entry.filePath,
          extension: entry.extension,
          isLocal: entry.isLocal,
          data: entry.data,
        };
        return item;
      });
    },

    async load(slug: string): Promise<StoredEntry> {
      const all = await scanAll();
      const found = all.find((entry) => entry.data.slug === slug);
      if (!found) {
        throw new EntryNotFoundError(slug);
      }

      // Reread to get fresh bytes & revision
      const fresh = await readAndParseFile(found.filePath, resolvedRoot);
      if (!fresh) {
        throw new EntryNotFoundError(slug);
      }

      return {
        ...fresh.data,
        body: fresh.body,
        filePath: fresh.filePath,
        extension: fresh.extension,
        revision: fresh.revision,
        isLocal: fresh.isLocal,
        data: fresh.data,
      };
    },

    async create(input: EditorEntryInput & { body?: string }): Promise<StoredEntry> {
      const all = await scanAll();
      const now = getToday();

      // Check slug uniqueness
      const existingSlugEntry = all.find((e) => e.data.slug === input.slug);
      if (existingSlugEntry) {
        throw new EntryPathConflictError(
          input.slug,
          `Entry with slug "${input.slug}" already exists`,
        );
      }

      // Target path
      const targetDir = path.join(resolvedRoot, input.type);
      const targetPath = path.join(targetDir, `${input.slug}.md`);

      // Check if file exists on disk
      try {
        await fs.access(targetPath);
        throw new EntryPathConflictError(
          targetPath,
          `Destination file already exists at "${targetPath}"`,
        );
      } catch (err: unknown) {
        if (err instanceof EntryPathConflictError) {
          throw err;
        }
        // File does not exist, safe to proceed
      }

      // Prepare metadata input with defaults (exclude body from schema validation)
      const { body: inputBody, ...metadataInput } = input;
      const preparedInput: EditorEntryInput = {
        ...metadataInput,
        draft: metadataInput.draft ?? true,
        createdAt: metadataInput.createdAt ?? now,
        updatedAt: metadataInput.updatedAt ?? now,
        tags: metadataInput.tags ?? [],
        links: metadataInput.links ?? [],
        related: metadataInput.related ?? [],
      };

      const knownSlugs = new Set(all.map((e) => e.data.slug));
      const existingFeaturedOrders = new Map<number, string>();
      for (const e of all) {
        if (e.data.featuredOrder !== undefined) {
          existingFeaturedOrders.set(e.data.featuredOrder, e.data.slug);
        }
      }

      // Validate through registry
      const validatedData = parseEditorEntry(preparedInput, {
        knownSlugs,
        existingFeaturedOrders,
      });

      // Serialize
      const body = inputBody ?? '';
      const fileText = serializeFrontmatterAndBody(validatedData, body);
      // Write
      await fs.mkdir(targetDir, { recursive: true });
      await fs.writeFile(targetPath, fileText, 'utf8');

      const rawBytes = Buffer.from(fileText, 'utf8');
      const revision = computeRevision(rawBytes);
      const baseName = path.basename(targetPath);
      const extension = path.extname(targetPath);
      const isLocal = baseName.includes('.local.');

      return {
        ...validatedData,
        body,
        filePath: targetPath,
        extension,
        revision,
        isLocal,
        data: validatedData,
      };
    },

    async save(
      slug: string,
      revision: string,
      input: EditorEntryInput & { body?: string },
    ): Promise<StoredEntry> {
      const all = await scanAll();
      const existing = all.find((e) => e.data.slug === slug);
      if (!existing) {
        throw new EntryNotFoundError(slug);
      }

      // Reread file and check revision
      let currentBytes: Buffer;
      try {
        currentBytes = await fs.readFile(existing.filePath);
      } catch {
        throw new EntryNotFoundError(slug);
      }

      const currentRevision = computeRevision(currentBytes);
      if (currentRevision !== revision) {
        throw new EntryConflictError(slug, revision, currentRevision);
      }

      const now = getToday();

      // Prepare metadata input with updatedAt updated to today (exclude body from schema validation)
      const { body: inputBody, ...metadataInput } = input;
      const preparedInput: EditorEntryInput = {
        ...metadataInput,
        updatedAt: now,
        tags: metadataInput.tags ?? [],
        links: metadataInput.links ?? [],
        related: metadataInput.related ?? [],
      };
      const knownSlugs = new Set(all.map((e) => e.data.slug));
      const existingFeaturedOrders = new Map<number, string>();
      for (const e of all) {
        if (e.data.featuredOrder !== undefined) {
          existingFeaturedOrders.set(e.data.featuredOrder, e.data.slug);
        }
      }

      // Validate through registry with existing entry immutability checks
      const validatedData = parseEditorEntry(preparedInput, {
        currentSlug: slug,
        knownSlugs,
        existingFeaturedOrders,
        existingEntry: {
          slug: existing.data.slug,
          type: existing.data.type,
          createdAt: existing.data.createdAt,
          publishedAt: existing.data.publishedAt,
        },
      });

      // Preserve existing body if not provided in input
      const body = inputBody !== undefined ? inputBody : existing.body;
      const fileText = serializeFrontmatterAndBody(validatedData, body);
      // Write back to existing filePath
      await fs.writeFile(existing.filePath, fileText, 'utf8');

      const rawBytes = Buffer.from(fileText, 'utf8');
      const newRevision = computeRevision(rawBytes);

      return {
        ...validatedData,
        body,
        filePath: existing.filePath,
        extension: existing.extension,
        revision: newRevision,
        isLocal: existing.isLocal,
        data: validatedData,
      };
    },
  };
}
