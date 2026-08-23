import { z } from 'astro/zod';

export const ENTRY_TYPES = ['prompt', 'skill', 'mcp', 'website', 'project', 'note'] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export type EditorControl =
  | 'text'
  | 'textarea'
  | 'select'
  | 'radio'
  | 'tags'
  | 'related'
  | 'links'
  | 'checkbox'
  | 'number'
  | 'date';

export interface FieldControlDescriptor {
  name: string;
  label: string;
  control: EditorControl;
  required?: boolean;
  defaultValue?: unknown;
  options?: Array<{ label: string; value: string }>;
  placeholder?: string;
  helpText?: string;
}

export interface TypeFieldDeclaration extends FieldControlDescriptor {
  schema: z.ZodTypeAny;
}

export interface EntryTypeDefinition {
  type: EntryType;
  label: string;
  directory: string;
  description?: string;
  typeFields: Record<string, TypeFieldDeclaration>;
}

export const ENTRY_TYPE_DEFINITIONS: Record<EntryType, EntryTypeDefinition> = {
  prompt: {
    type: 'prompt',
    label: '提示词',
    directory: 'prompt',
    description: '结构化 AI 提示词与交互模板',
    typeFields: {},
  },
  skill: {
    type: 'skill',
    label: '技能',
    directory: 'skill',
    description: '编码智能体专属技能与操作流',
    typeFields: {},
  },
  mcp: {
    type: 'mcp',
    label: 'MCP 服务',
    directory: 'mcp',
    description: 'Model Context Protocol 工具与配置',
    typeFields: {},
  },
  website: {
    type: 'website',
    label: '优质站点',
    directory: 'website',
    description: '精选工具、资源与灵感站点',
    typeFields: {},
  },
  project: {
    type: 'project',
    label: '项目实战',
    directory: 'project',
    description: '完整开源项目与架构实践',
    typeFields: {},
  },
  note: {
    type: 'note',
    label: '知识札记',
    directory: 'note',
    description: '深度技术札记与实践总结',
    typeFields: {
      category: {
        name: 'category',
        label: '分类',
        control: 'text',
        required: true,
        defaultValue: '',
        placeholder: '例如：实践、思考、指南',
        helpText: '札记专属分类名称',
        schema: z.string().trim().min(1, 'category is required'),
      },
    },
  },
};

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function getSharedEntryFields(relatedSchema: z.ZodTypeAny = z.string().trim().min(1)) {
  return {
    slug: z.string().regex(slugRegex, 'slug must be lowercase ASCII kebab-case'),
    title: z.string().trim().min(1, 'title is required'),
    summary: z.string().trim().min(1, 'summary is required'),
    tags: z.array(z.string().trim().min(1)).default([]),
    source: z.enum(['self', 'adapted', 'external']),
    links: z
      .array(
        z
          .object({
            label: z.string().trim().min(1, 'link label is required'),
            url: z.string().url('valid URL is required'),
          })
          .strict(),
      )
      .default([]),
    related: z.array(relatedSchema).default([]),
    createdAt: z.coerce.date(),
    publishedAt: z.coerce.date().optional(),
    updatedAt: z.coerce.date(),
    featuredOrder: z
      .number()
      .int('featuredOrder must be an integer')
      .min(1, 'featuredOrder must be at least 1')
      .max(6, 'featuredOrder must be at most 6')
      .optional(),
    draft: z.boolean().default(false),
  };
}

export function refineEntryDates(
  data: {
    draft?: boolean;
    publishedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
  },
  ctx: z.RefinementCtx,
) {
  if (data.draft && data.publishedAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'draft entries cannot set publishedAt',
      path: ['publishedAt'],
    });
  }
  if (!data.draft && !data.publishedAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'public entries require publishedAt',
      path: ['publishedAt'],
    });
  }
  if (data.updatedAt < data.createdAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'updatedAt cannot precede createdAt',
      path: ['updatedAt'],
    });
  }
  if (data.publishedAt && data.publishedAt < data.createdAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'publishedAt cannot precede createdAt',
      path: ['publishedAt'],
    });
  }
}

export function createCollectionEntrySchema(relatedSchema?: z.ZodTypeAny) {
  const schemas = ENTRY_TYPES.map((type) => {
    const def = ENTRY_TYPE_DEFINITIONS[type];
    const typeFieldsSchema: Record<string, z.ZodTypeAny> = {};
    for (const [key, fieldDecl] of Object.entries(def.typeFields)) {
      typeFieldsSchema[key] = fieldDecl.schema;
    }
    return z
      .object({
        ...getSharedEntryFields(relatedSchema),
        type: z.literal(type),
        ...typeFieldsSchema,
      })
      .strict()
      .superRefine(refineEntryDates);
  });

  return z.union([schemas[0], schemas[1], ...schemas.slice(2)] as [
    (typeof schemas)[0],
    (typeof schemas)[1],
    ...(typeof schemas),
  ]);
}

export interface ParseEditorEntryOptions {
  knownSlugs?: string[] | Set<string> | readonly string[];
  currentSlug?: string;
  existingEntry?: {
    slug: string;
    type: EntryType;
    createdAt: Date | string;
    publishedAt?: Date | string;
    [key: string]: unknown;
  };
  existingFeaturedOrders?:
    | Map<number, string>
    | Record<number, string>
    | Array<{ slug: string; featuredOrder?: number }>;
  today?: Date | string;
}

export type EditorSharedData = {
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  source: 'self' | 'adapted' | 'external';
  links: Array<{ label: string; url: string }>;
  related: string[];
  createdAt: Date;
  publishedAt?: Date;
  updatedAt: Date;
  featuredOrder?: number;
  draft: boolean;
};

export type NoteEditorData = EditorSharedData & {
  type: 'note';
  category: string;
};

export type StandardEditorData = EditorSharedData & {
  type: 'prompt' | 'skill' | 'mcp' | 'website' | 'project';
};

export type EditorEntryData = NoteEditorData | StandardEditorData;

export type EditorEntryInput = {
  slug: string;
  title: string;
  summary: string;
  tags?: string[];
  source: 'self' | 'adapted' | 'external';
  links?: Array<{ label: string; url: string }>;
  related?: string[];
  createdAt?: Date | string;
  publishedAt?: Date | string;
  updatedAt?: Date | string;
  featuredOrder?: number;
  draft?: boolean;
} & (
  | { type: 'note'; category: string }
  | { type: 'prompt' }
  | { type: 'skill' }
  | { type: 'mcp' }
  | { type: 'website' }
  | { type: 'project' }
);

export function createEditorEntrySchema(options?: ParseEditorEntryOptions) {
  const schemas = ENTRY_TYPES.map((type) => {
    const def = ENTRY_TYPE_DEFINITIONS[type];
    const typeFieldsSchema: Record<string, z.ZodTypeAny> = {};
    for (const [key, fieldDecl] of Object.entries(def.typeFields)) {
      typeFieldsSchema[key] = fieldDecl.schema;
    }
    return z
      .object({
        ...getSharedEntryFields(z.string().trim().min(1)),
        type: z.literal(type),
        ...typeFieldsSchema,
      })
      .strict();
  });

  const unionSchema = z.discriminatedUnion(
    'type',
    schemas as unknown as [
      (typeof schemas)[0],
      (typeof schemas)[1],
      ...(typeof schemas),
    ],
  );

  return unionSchema.superRefine((data, ctx) => {
    refineEntryDates(data, ctx);

    if (options?.knownSlugs) {
      const knownSet =
        options.knownSlugs instanceof Set
          ? options.knownSlugs
          : new Set(options.knownSlugs);
      data.related.forEach((rel: string, idx: number) => {
        if (rel === data.slug || (options.currentSlug && rel === options.currentSlug)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `entry cannot reference itself in related entries: "${rel}"`,
            path: ['related', idx],
          });
        } else if (!knownSet.has(rel)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `referenced slug "${rel}" in related entries does not exist`,
            path: ['related', idx],
          });
        }
      });
    }

    if (data.featuredOrder !== undefined && options?.existingFeaturedOrders) {
      const effectiveSlug = options.currentSlug ?? data.slug;
      let occupant: string | undefined;

      if (options.existingFeaturedOrders instanceof Map) {
        occupant = options.existingFeaturedOrders.get(data.featuredOrder);
      } else if (Array.isArray(options.existingFeaturedOrders)) {
        const found = options.existingFeaturedOrders.find(
          (item) => item.featuredOrder === data.featuredOrder && item.slug !== effectiveSlug,
        );
        occupant = found?.slug;
      } else if (typeof options.existingFeaturedOrders === 'object') {
        occupant = (options.existingFeaturedOrders as Record<number, string>)[data.featuredOrder];
      }

      if (occupant && occupant !== effectiveSlug) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `featuredOrder ${data.featuredOrder} is already used by "${occupant}"`,
          path: ['featuredOrder'],
        });
      }
    }

    if (options?.existingEntry) {
      const existing = options.existingEntry;
      if (data.slug !== existing.slug) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'slug cannot be changed for existing entry',
          path: ['slug'],
        });
      }
      if (data.type !== existing.type) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'type cannot be changed for existing entry',
          path: ['type'],
        });
      }
      if (existing.createdAt) {
        const existingCreated = new Date(existing.createdAt).getTime();
        if (data.createdAt.getTime() !== existingCreated) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'createdAt cannot be changed for existing entry',
            path: ['createdAt'],
          });
        }
      }
      if (existing.publishedAt) {
        const existingPublished = new Date(existing.publishedAt).getTime();
        if (!data.publishedAt || data.publishedAt.getTime() !== existingPublished) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'publishedAt cannot be changed once published',
            path: ['publishedAt'],
          });
        }
      }
    }

    if (options?.currentSlug && data.slug !== options.currentSlug && !options?.existingEntry) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'slug cannot be changed',
        path: ['slug'],
      });
    }
  });
}

export function parseEditorEntry(
  input: unknown,
  options?: ParseEditorEntryOptions,
): EditorEntryData {
  const schema = createEditorEntrySchema(options);
  return schema.parse(input) as EditorEntryData;
}
