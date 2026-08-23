import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ENTRY_TYPES,
  ENTRY_TYPE_DEFINITIONS,
  slugRegex,
  type EntryType,
} from '../lib/entry-data';
import {
  createWorkspaceState,
  reduceWorkspace,
} from './editor-state';
import type {
  EditorEntriesResponse,
  EditorEntryDetail,
  EditorEntryResponse,
  EditorEntrySummary,
  EditorErrorResponse,
  EditorPreviewResponse,
  EditorSaveResponse,
} from './server/editor-api';
import './editor.css';

interface EntryFormData {
  slug: string;
  title: string;
  summary: string;
  type: EntryType;
  draft: boolean;
  source: 'self' | 'adapted' | 'external';
  tags: string[];
  links: Array<{ label: string; url: string }>;
  related: string[];
  createdAt: string;
  publishedAt: string;
  initialPublishedAt?: string;
  updatedAt: string;
  featuredOrder: string;
  typeFields: Record<string, unknown>;
  body: string;
  extension: string;
  isLocal: boolean;
  revision: string;
}

function createEmptyFormData(type: EntryType = 'prompt'): EntryFormData {
  const today = new Date().toISOString().slice(0, 10);
  const typeDef = ENTRY_TYPE_DEFINITIONS[type];
  const typeFields: Record<string, unknown> = {};
  if (typeDef?.typeFields) {
    for (const [key, decl] of Object.entries(typeDef.typeFields)) {
      typeFields[key] =
        decl.defaultValue ?? (decl.control === 'checkbox' ? false : '');
    }
  }

  return {
    slug: '',
    title: '',
    summary: '',
    type,
    draft: true,
    source: 'self',
    tags: [],
    links: [],
    related: [],
    createdAt: today,
    publishedAt: '',
    initialPublishedAt: '',
    updatedAt: today,
    featuredOrder: '',
    typeFields,
    body: '',
    extension: '.md',
    isLocal: true,
    revision: '',
  };
}

function toDateInputValue(val?: Date | string | null): string {
  if (!val) return '';
  if (typeof val === 'string') {
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      return d.toISOString().slice(0, 10);
    }
    return val.slice(0, 10);
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }
  return '';
}

function entryDetailToFormData(detail: EditorEntryDetail): EntryFormData {
  const typeDef = ENTRY_TYPE_DEFINITIONS[detail.type];
  const typeFields: Record<string, unknown> = {};
  if (typeDef?.typeFields) {
    for (const [key, decl] of Object.entries(typeDef.typeFields)) {
      const val = (detail as Record<string, unknown>)[key];
      typeFields[key] =
        val !== undefined
          ? val
          : (decl.defaultValue ?? (decl.control === 'checkbox' ? false : ''));
    }
  }

  const publishedDate = toDateInputValue(detail.publishedAt);

  return {
    slug: detail.slug,
    title: detail.title,
    summary: detail.summary,
    type: detail.type,
    draft: Boolean(detail.draft),
    source: detail.source,
    tags: Array.isArray(detail.tags) ? [...detail.tags] : [],
    links: Array.isArray(detail.links)
      ? detail.links.map((l) => ({ label: l.label, url: l.url }))
      : [],
    related: Array.isArray(detail.related) ? [...detail.related] : [],
    createdAt: toDateInputValue(detail.createdAt),
    publishedAt: publishedDate,
    initialPublishedAt: publishedDate,
    updatedAt: toDateInputValue(detail.updatedAt),
    featuredOrder:
      detail.featuredOrder !== undefined && detail.featuredOrder !== null
        ? String(detail.featuredOrder)
        : '',
    typeFields,
    body: detail.body || '',
    extension: detail.extension || '.md',
    isLocal: Boolean(detail.isLocal),
    revision: detail.revision || '',
  };
}

function buildPreviewDocument(html: string, title?: string): string {
  const safeTitle = title
    ? title
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;')
    : 'Preview';
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle}</title>
  <style>
    :root {
      --black: #000000;
      --white: #ffffff;
      --red: #ff6b6b;
      --teal: #4ecdc4;
      --yellow: #ffe66d;
      --mint: #95e1d3;
      --coral: #f38181;
      --dark: #111827;
      --muted: #374151;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      padding: 24px;
      font-family: JetBrains Mono, Fira Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, PingFang SC, Hiragino Sans GB, Microsoft YaHei, monospace;
      color: var(--black);
      background: var(--white);
      line-height: 1.7;
    }
    h1, h2, h3, h4, h5, h6 {
      font-weight: 900;
      text-transform: uppercase;
      margin-top: 1.5em;
      margin-bottom: 0.5em;
      line-height: 1.2;
    }
    h1:first-child { margin-top: 0; }
    h1 { font-size: 1.8rem; border-bottom: 4px solid var(--black); padding-bottom: 8px; }
    h2 { font-size: 1.4rem; border-bottom: 3px solid var(--black); padding-bottom: 4px; }
    h3 { font-size: 1.15rem; }
    p { margin-bottom: 1em; }
    a { color: var(--black); font-weight: 800; text-decoration: underline; }
    ul, ol { margin-left: 24px; margin-bottom: 1em; }
    li { margin-bottom: 0.25em; }
    blockquote {
      border-left: 6px solid var(--black);
      background: #f3f4f6;
      padding: 12px 16px;
      margin: 1.5em 0;
      font-style: italic;
    }
    pre {
      background: var(--dark);
      color: #f9fafb;
      padding: 16px;
      border: 3px solid var(--black);
      box-shadow: 4px 4px 0 var(--black);
      overflow-x: auto;
      margin: 1.5em 0;
      font-size: 0.9rem;
    }
    code {
      font-family: inherit;
      background: #e5e7eb;
      color: var(--black);
      padding: 2px 6px;
      font-size: 0.9em;
      border: 1px solid var(--black);
    }
    pre code {
      background: transparent;
      color: inherit;
      padding: 0;
      border: none;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      border: 3px solid var(--black);
    }
    th, td {
      border: 2px solid var(--black);
      padding: 8px 12px;
      text-align: left;
    }
    th {
      background: var(--yellow);
      font-weight: 900;
    }
    hr {
      border: none;
      border-top: 3px solid var(--black);
      margin: 2em 0;
    }
    img {
      max-width: 100%;
      height: auto;
      border: 3px solid var(--black);
    }
    .preview-relative-image-fallback {
      display: inline-block;
      padding: 6px 10px;
      background: var(--yellow);
      border: 2px solid var(--black);
      font-size: 0.8rem;
      font-weight: 800;
      margin: 4px 0;
    }
  </style>
</head>
<body>
  ${html}
</body>
</html>`;
}

export function LocalEntryEditorApp() {
  const [state, dispatch] = useReducer(
    reduceWorkspace<{ html: string }>,
    undefined,
    () => createWorkspaceState<{ html: string }>(),
  );

  const [entries, setEntries] = useState<EditorEntrySummary[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const [filterText, setFilterText] = useState('');
  const [filterTab, setFilterTab] = useState<'ALL' | 'DRAFT' | 'LOCAL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | EntryType>('ALL');

  const [formData, setFormData] = useState<EntryFormData>(() =>
    createEmptyFormData(),
  );
  const formDataRef = useRef<EntryFormData>(formData);
  formDataRef.current = formData;

  const [tagInput, setTagInput] = useState('');
  const [relatedSearch, setRelatedSearch] = useState('');

  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [bannerAlert, setBannerAlert] = useState<{
    type: 'error' | 'conflict' | 'success';
    message: string;
    details?: unknown;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const previewAbortControllerRef = useRef<AbortController | null>(null);
  const previewSeqRef = useRef<number>(0);

  const detailAbortControllerRef = useRef<AbortController | null>(null);
  const detailRequestSeqRef = useRef<number>(0);

  const fetchEntries = useCallback(async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const res = await fetch('/__garden-editor/api/entries');
      if (!res.ok) {
        throw new Error(`Failed to load entries (${res.status})`);
      }
      const data = (await res.json()) as EditorEntriesResponse;
      setEntries(data.entries);
    } catch (err) {
      setEntriesError(
        err instanceof Error ? err.message : 'Unknown error loading entries',
      );
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const requestPreview = useCallback(
    async (form: EntryFormData) => {
      if (previewAbortControllerRef.current) {
        previewAbortControllerRef.current.abort();
      }

      if (form.extension === '.mdx' || form.slug.endsWith('.mdx')) {
        setPreviewError(
          'MDX preview is not supported. Save the entry and view on the site.',
        );
        dispatch({ type: 'setPreview', preview: null });
        setPreviewLoading(false);
        return;
      }

      const controller = new AbortController();
      previewAbortControllerRef.current = controller;
      const reqId = ++previewSeqRef.current;

      setPreviewLoading(true);
      setPreviewError(null);

      const payload: Record<string, unknown> = {
        slug: form.slug || 'untitled-preview',
        title: form.title || 'Untitled Entry',
        summary: form.summary || 'Summary preview',
        type: form.type,
        draft: form.draft,
        source: form.source,
        tags: form.tags,
        links: form.links.filter((l) => l.label.trim() && l.url.trim()),
        related: form.related,
        createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
        publishedAt:
          !form.draft && form.publishedAt ? form.publishedAt : undefined,
        updatedAt: form.updatedAt || new Date().toISOString().slice(0, 10),
        featuredOrder: form.featuredOrder
          ? Number(form.featuredOrder)
          : undefined,
        body: form.body,
        extension: form.extension,
      };

      const currentTypeDef = ENTRY_TYPE_DEFINITIONS[form.type];
      if (currentTypeDef?.typeFields) {
        for (const [key, decl] of Object.entries(currentTypeDef.typeFields)) {
          const rawVal = form.typeFields[key];
          if (rawVal !== undefined && rawVal !== '') {
            if (decl.control === 'number') {
              payload[key] = Number(rawVal);
            } else if (decl.control === 'checkbox') {
              payload[key] = Boolean(rawVal);
            } else {
              payload[key] = rawVal;
            }
          }
        }
      }

      try {
        const res = await fetch('/__garden-editor/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (reqId !== previewSeqRef.current) return;

        if (res.status === 422) {
          const errData = (await res.json()) as EditorErrorResponse;
          if (reqId !== previewSeqRef.current) return;
          setPreviewError(
            errData.error ||
              'MDX preview is not supported. Save the entry and view on the site.',
          );
          dispatch({ type: 'setPreview', preview: null });
          return;
        }

        if (!res.ok) {
          const errData = (await res.json()) as EditorErrorResponse;
          if (reqId !== previewSeqRef.current) return;
          setPreviewError(errData.error || `Preview failed (${res.status})`);
          dispatch({ type: 'setPreview', preview: null });
          return;
        }

        const previewData = (await res.json()) as EditorPreviewResponse;
        if (reqId !== previewSeqRef.current) return;
        dispatch({ type: 'setPreview', preview: { html: previewData.html } });
      } catch (err) {
        if (reqId !== previewSeqRef.current) return;
        if ((err as Error).name !== 'AbortError') {
          setPreviewError(
            err instanceof Error ? err.message : 'Preview request error',
          );
        }
      } finally {
        if (reqId === previewSeqRef.current) {
          setPreviewLoading(false);
        }
      }
    },
    [dispatch],
  );

  const loadEntry = useCallback(
    async (slug: string) => {
      if (detailAbortControllerRef.current) {
        detailAbortControllerRef.current.abort();
      }
      const controller = new AbortController();
      detailAbortControllerRef.current = controller;
      const reqId = ++detailRequestSeqRef.current;

      setDetailLoading(true);
      setBannerAlert(null);
      setFieldErrors({});
      setSavedUrl(null);

      try {
        const res = await fetch(`/__garden-editor/api/entries/${slug}`, {
          signal: controller.signal,
        });
        if (reqId !== detailRequestSeqRef.current) return;

        if (!res.ok) {
          throw new Error(`Failed to load entry "${slug}" (${res.status})`);
        }
        const data = (await res.json()) as EditorEntryResponse;
        if (reqId !== detailRequestSeqRef.current) return;

        const nextForm = entryDetailToFormData(data.entry);
        formDataRef.current = nextForm;
        setFormData(nextForm);
        setSavedUrl(data.url);
        requestPreview(nextForm);
      } catch (err) {
        if (reqId !== detailRequestSeqRef.current) return;
        if ((err as Error).name === 'AbortError') return;
        setBannerAlert({
          type: 'error',
          message:
            err instanceof Error ? err.message : 'Failed to load entry details',
        });
      } finally {
        if (reqId === detailRequestSeqRef.current) {
          setDetailLoading(false);
        }
      }
    },
    [requestPreview],
  );

  const handleSelectEntry = useCallback(
    (slug: string) => {
      dispatch({ type: 'selectEntry', slug });
      loadEntry(slug);
    },
    [loadEntry],
  );

  const handleNewEntry = useCallback(() => {
    if (detailAbortControllerRef.current) {
      detailAbortControllerRef.current.abort();
    }
    detailRequestSeqRef.current++;
    setDetailLoading(false);

    dispatch({ type: 'startNewEntry' });
    const emptyForm = createEmptyFormData('prompt');
    formDataRef.current = emptyForm;
    setFormData(emptyForm);
    setSavedUrl(null);
    setBannerAlert(null);
    setFieldErrors({});
    requestPreview(emptyForm);
  }, [requestPreview]);

  const updateForm = useCallback(
    (
      updater:
        | Partial<EntryFormData>
        | ((prev: EntryFormData) => EntryFormData),
    ) => {
      const prev = formDataRef.current;
      const next =
        typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
      formDataRef.current = next;
      setFormData(next);
      dispatch({ type: 'markDirty', dirty: true });
      requestPreview(next);
    },
    [requestPreview, dispatch],
  );

  const handleTypeChange = useCallback(
    (newType: EntryType) => {
      const typeDef = ENTRY_TYPE_DEFINITIONS[newType];
      const nextTypeFields: Record<string, unknown> = {};
      if (typeDef?.typeFields) {
        for (const [key, decl] of Object.entries(typeDef.typeFields)) {
          nextTypeFields[key] =
            decl.defaultValue ?? (decl.control === 'checkbox' ? false : '');
        }
      }
      updateForm({
        type: newType,
        typeFields: nextTypeFields,
      });
    },
    [updateForm],
  );

  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim();
    if (!trimmed) return;
    if (!formData.tags.includes(trimmed)) {
      updateForm({ tags: [...formData.tags, trimmed] });
    }
    setTagInput('');
  }, [formData.tags, tagInput, updateForm]);

  const handleRemoveTag = useCallback(
    (tagToRemove: string) => {
      updateForm({ tags: formData.tags.filter((t) => t !== tagToRemove) });
    },
    [formData.tags, updateForm],
  );

  const handleAddLink = useCallback(() => {
    updateForm({
      links: [...formData.links, { label: '', url: '' }],
    });
  }, [formData.links, updateForm]);

  const handleUpdateLink = useCallback(
    (index: number, key: 'label' | 'url', value: string) => {
      const nextLinks = [...formData.links];
      nextLinks[index] = { ...nextLinks[index], [key]: value };
      updateForm({ links: nextLinks });
    },
    [formData.links, updateForm],
  );

  const handleRemoveLink = useCallback(
    (index: number) => {
      updateForm({ links: formData.links.filter((_, i) => i !== index) });
    },
    [formData.links, updateForm],
  );

  const handleToggleRelated = useCallback(
    (slug: string) => {
      const isSelected = formData.related.includes(slug);
      const nextRelated = isSelected
        ? formData.related.filter((s) => s !== slug)
        : [...formData.related, slug];
      updateForm({ related: nextRelated });
    },
    [formData.related, updateForm],
  );

  const handleSave = useCallback(async () => {
    setSaveLoading(true);
    setBannerAlert(null);
    setFieldErrors({});

    const isCreate = state.mode === 'create';
    const cleanLinks = formData.links.filter(
      (l) => l.label.trim() && l.url.trim(),
    );

    const payload: Record<string, unknown> = {
      title: formData.title.trim(),
      summary: formData.summary.trim(),
      type: formData.type,
      draft: formData.draft,
      source: formData.source,
      tags: formData.tags,
      links: cleanLinks,
      related: formData.related,
      createdAt: formData.createdAt,
      updatedAt: formData.updatedAt,
      body: formData.body,
    };

    if (!formData.draft && formData.publishedAt) {
      payload.publishedAt = formData.publishedAt;
    }

    if (formData.featuredOrder.trim()) {
      payload.featuredOrder = Number(formData.featuredOrder);
    }

    const currentTypeDef = ENTRY_TYPE_DEFINITIONS[formData.type];
    if (currentTypeDef?.typeFields) {
      for (const [key, decl] of Object.entries(currentTypeDef.typeFields)) {
        const rawVal = formData.typeFields[key];
        if (rawVal !== undefined && rawVal !== '') {
          if (decl.control === 'number') {
            payload[key] = Number(rawVal);
          } else if (decl.control === 'checkbox') {
            payload[key] = Boolean(rawVal);
          } else {
            payload[key] = rawVal;
          }
        }
      }
    }

    if (isCreate) {
      payload.slug = formData.slug.trim();
    } else {
      payload.revision = formData.revision;
    }

    const endpoint = isCreate
      ? '/__garden-editor/api/entries'
      : `/__garden-editor/api/entries/${formData.slug}`;
    const method = isCreate ? 'POST' : 'PUT';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        const conflictData = (await res.json()) as EditorErrorResponse;
        setBannerAlert({
          type: 'conflict',
          message:
            conflictData.error ||
            `409 Conflict: Entry on disk has revision ${conflictData.actualRevision}, expected ${conflictData.expectedRevision}. Your current form draft is retained.`,
          details: conflictData,
        });
        return;
      }

      if (res.status === 400 || res.status === 422) {
        const errData = (await res.json()) as EditorErrorResponse;
        const errMap: Record<string, string> = {};
        if (Array.isArray(errData.details)) {
          for (const issue of errData.details as Array<{
            path?: Array<string | number>;
            message?: string;
          }>) {
            if (issue.path && issue.path.length > 0) {
              const fullPath = issue.path.join('.');
              const topField = String(issue.path[0]);
              const msg = issue.message || 'Invalid value';
              errMap[fullPath] = msg;
              if (!errMap[topField]) {
                errMap[topField] = msg;
              }
              if (issue.path.length >= 2) {
                const prefix2 = `${issue.path[0]}.${issue.path[1]}`;
                if (!errMap[prefix2]) {
                  errMap[prefix2] = msg;
                }
              }
            }
          }
        }
        setFieldErrors(errMap);
        setBannerAlert({
          type: 'error',
          message:
            errData.error ||
            'Validation failed. Please correct field errors and try again.',
        });
        return;
      }

      if (!res.ok) {
        const errData = (await res.json()) as EditorErrorResponse;
        throw new Error(errData.error || `Save failed (${res.status})`);
      }

      const saveRes = (await res.json()) as EditorSaveResponse;
      const updatedForm = entryDetailToFormData(saveRes.entry);
      formDataRef.current = updatedForm;
      setFormData(updatedForm);
      setSavedUrl(saveRes.url);
      dispatch({ type: 'markSaved', slug: saveRes.entry.slug });
      setBannerAlert({
        type: 'success',
        message: `Saved entry "${saveRes.entry.slug}" successfully.`,
      });

      fetchEntries();
      requestPreview(updatedForm);
    } catch (err) {
      setBannerAlert({
        type: 'error',
        message: err instanceof Error ? err.message : 'Failed to save entry',
      });
    } finally {
      setSaveLoading(false);
    }
  }, [
    state.mode,
    formData,
    fetchEntries,
    requestPreview,
  ]);

  const filteredEntries = useMemo(() => {
    return entries.filter((item) => {
      if (filterTab === 'DRAFT' && !item.draft) return false;
      if (filterTab === 'LOCAL' && !item.isLocal) return false;
      if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
      if (filterText.trim()) {
        const q = filterText.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchSlug = item.slug.toLowerCase().includes(q);
        if (!matchTitle && !matchSlug) return false;
      }
      return true;
    });
  }, [entries, filterTab, typeFilter, filterText]);

  const availableRelatedEntries = useMemo(() => {
    return entries
      .filter((e) => e.slug !== formData.slug)
      .filter((e) => {
        if (!relatedSearch.trim()) return true;
        const q = relatedSearch.toLowerCase().trim();
        return (
          e.title.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q)
        );
      });
  }, [entries, formData.slug, relatedSearch]);

  const paneClass = `workbench-body pane-${state.pane}`;

  return (
    <div className="workbench-container">
      {/* Top Application Toolbar */}
      <header className="workbench-toolbar">
        <div className="toolbar-brand-group">
          <div className="toolbar-brand">LOCAL ENTRY EDITOR</div>
          <div className="toolbar-status-badge">Localhost: 127.0.0.1</div>
          <div className="toolbar-summary">
            {entriesLoading
              ? 'Loading entries...'
              : `${filteredEntries.length} / ${entries.length} ENTRIES`}
          </div>
        </div>

        <div className="toolbar-actions">
          {/* Pane View Toggles */}
          <div className="pane-toggle-group" role="group" aria-label="视图布局切换">
            <button
              type="button"
              className="pane-toggle-button"
              aria-pressed={state.pane === 'editor'}
              onClick={() =>
                state.pane === 'editor'
                  ? dispatch({ type: 'restoreSplit' })
                  : dispatch({ type: 'expandEditor' })
              }
            >
              EXPAND EDITOR
            </button>
            <button
              type="button"
              className="pane-toggle-button"
              aria-pressed={state.pane === 'split'}
              onClick={() => dispatch({ type: 'restoreSplit' })}
            >
              SPLIT
            </button>
            <button
              type="button"
              className="pane-toggle-button"
              aria-pressed={state.pane === 'preview'}
              onClick={() =>
                state.pane === 'preview'
                  ? dispatch({ type: 'restoreSplit' })
                  : dispatch({ type: 'expandPreview' })
              }
            >
              EXPAND PREVIEW
            </button>
          </div>

          <button
            type="button"
            className="new-entry-btn"
            onClick={handleNewEntry}
          >
            + NEW ENTRY
          </button>
        </div>
      </header>

      {/* Main Three-Column Grid */}
      <div className={paneClass}>
        {/* Left Column: Fixed Navigation */}
        <nav className="workbench-nav-pane" aria-label="条目导航">
          <div className="nav-header">
            <h2 className="nav-title">FIND ENTRIES</h2>
          </div>

          <div className="nav-controls">
            <input
              type="text"
              className="nav-search-input"
              placeholder="Search title or slug..."
              value={filterText}
              aria-label="按标题或路径名搜索条目"
              onChange={(e) => setFilterText(e.target.value)}
            />

            <div className="nav-filter-tabs" role="group" aria-label="状态筛选">
              <button
                type="button"
                className="nav-filter-tab"
                aria-pressed={filterTab === 'ALL'}
                onClick={() => setFilterTab('ALL')}
              >
                ALL
              </button>
              <button
                type="button"
                className="nav-filter-tab"
                aria-pressed={filterTab === 'DRAFT'}
                onClick={() => setFilterTab('DRAFT')}
              >
                DRAFT
              </button>
              <button
                type="button"
                className="nav-filter-tab"
                aria-pressed={filterTab === 'LOCAL'}
                onClick={() => setFilterTab('LOCAL')}
              >
                LOCAL
              </button>
            </div>

            <select
              className="nav-type-select"
              value={typeFilter}
              aria-label="按类型筛选条目"
              onChange={(e) =>
                setTypeFilter(e.target.value as 'ALL' | EntryType)
              }
            >
              <option value="ALL">ALL TYPES ({entries.length})</option>
              {ENTRY_TYPES.map((t) => (
                <option key={t} value={t}>
                  {ENTRY_TYPE_DEFINITIONS[t].label} ({t})
                </option>
              ))}
            </select>
          </div>

          <ul className="nav-entry-list">
            {entriesLoading && (
              <li className="nav-empty-message">Loading entries...</li>
            )}
            {entriesError && (
              <li className="nav-empty-message">{entriesError}</li>
            )}
            {!entriesLoading &&
              !entriesError &&
              filteredEntries.length === 0 && (
                <li className="nav-empty-message">
                  No entries found matching filters.
                </li>
              )}
            {!entriesLoading &&
              filteredEntries.map((item) => {
                const isSelected =
                  state.selectedSlug === item.slug && state.mode === 'edit';
                const isUnsaved = isSelected && state.dirty;

                return (
                  <li key={item.slug} className="nav-entry-item">
                    <button
                      type="button"
                      className={`nav-entry-button ${isSelected ? 'is-selected' : ''}`}
                      aria-current={isSelected ? 'page' : undefined}
                      onClick={() => handleSelectEntry(item.slug)}
                    >
                      <div className="entry-item-header">
                        <span className={`badge badge-${item.type}`}>
                          {ENTRY_TYPE_DEFINITIONS[item.type]?.label ||
                            item.type}
                        </span>
                        {item.draft && (
                          <span className="badge badge-draft">DRAFT</span>
                        )}
                        {item.isLocal && (
                          <span className="badge badge-local">LOCAL</span>
                        )}
                        <span className="badge">{item.extension || '.md'}</span>
                      </div>

                      <div className="entry-item-title">{item.title}</div>
                      <div className="entry-item-slug">{item.slug}</div>

                      <div className="entry-item-status-row">
                        {isSelected && (
                          <span className="status-selected-label">
                            [SELECTED]
                          </span>
                        )}
                        {isUnsaved && (
                          <span className="status-unsaved-label">
                            [UNSAVED]
                          </span>
                        )}
                      </div>
                    </button>
                  </li>
                );
              })}
          </ul>
        </nav>

        {/* Center Column: Structured Editor Form */}
        <main className="workbench-editor-pane" aria-label="条目编辑">
          {state.mode === 'idle' ? (
            <div className="editor-empty-state">
              <h2 className="editor-empty-title">NO ENTRY SELECTED</h2>
              <p className="editor-empty-desc">
                Select an entry from the left navigation list to inspect and edit,
                or click <strong>+ NEW ENTRY</strong> to create a new markdown entry.
              </p>
              <button
                type="button"
                className="new-entry-btn"
                onClick={handleNewEntry}
              >
                + NEW ENTRY
              </button>
            </div>
          ) : (
            <>
              <div className="editor-header-bar">
                <div className="editor-header-title">
                  {state.mode === 'create'
                    ? '+ CREATE NEW ENTRY'
                    : `EDIT: ${formData.slug}`}
                </div>
                <div className="editor-header-meta">
                  {state.mode === 'edit' && (
                    <span>
                      Revision: {formData.revision || 'unknown'} |{' '}
                      {formData.extension}
                    </span>
                  )}
                </div>
              </div>

              <div className="editor-scroll-container">
                {detailLoading && (
                  <div className="editor-alert editor-alert--conflict">
                    Loading entry details from disk...
                  </div>
                )}

                {/* Banner Alerts */}
                {bannerAlert && (
                  <div
                    className={`editor-alert editor-alert--${bannerAlert.type}`}
                    role="alert"
                  >
                    <div>{bannerAlert.message}</div>
                  </div>
                )}

                {/* Section 1: BASIC INFO */}
                <section className="form-section">
                  <div className="form-section-header form-section-header--basic">
                    1. BASIC INFO
                  </div>
                  <div className="form-section-body">
                    <div className="form-group">
                      <label htmlFor="field-title" className="field-label">
                        Title <span className="field-required">*</span>
                      </label>
                      <input
                        id="field-title"
                        type="text"
                        className="field-input"
                        value={formData.title}
                        onChange={(e) => updateForm({ title: e.target.value })}
                        placeholder="Entry title..."
                        required
                      />
                      {fieldErrors.title && (
                        <div className="field-error-message">
                          {fieldErrors.title}
                        </div>
                      )}
                    </div>

                    <div className="form-group">
                      <label htmlFor="field-summary" className="field-label">
                        Summary <span className="field-required">*</span>
                      </label>
                      <input
                        id="field-summary"
                        type="text"
                        className="field-input"
                        value={formData.summary}
                        onChange={(e) =>
                          updateForm({ summary: e.target.value })
                        }
                        placeholder="Brief summary description..."
                        required
                      />
                      {fieldErrors.summary && (
                        <div className="field-error-message">
                          {fieldErrors.summary}
                        </div>
                      )}
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label htmlFor="field-type" className="field-label">
                          Type <span className="field-required">*</span>
                        </label>
                        {state.mode === 'create' ? (
                          <select
                            id="field-type"
                            className="field-input"
                            value={formData.type}
                            onChange={(e) =>
                              handleTypeChange(e.target.value as EntryType)
                            }
                          >
                            {ENTRY_TYPES.map((t) => (
                              <option key={t} value={t}>
                                {ENTRY_TYPE_DEFINITIONS[t].label} ({t})
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="field-readonly" id="field-type">
                            {ENTRY_TYPE_DEFINITIONS[formData.type]?.label ||
                              formData.type}{' '}
                            ({formData.type})
                          </div>
                        )}
                        {fieldErrors.type && (
                          <div className="field-error-message">
                            {fieldErrors.type}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label htmlFor="field-slug" className="field-label">
                          Slug <span className="field-required">*</span>
                        </label>
                        {state.mode === 'create' ? (
                          <input
                            id="field-slug"
                            type="text"
                            className="field-input"
                            value={formData.slug}
                            onChange={(e) =>
                              updateForm({ slug: e.target.value.toLowerCase() })
                            }
                            placeholder="kebab-case-slug"
                            required
                          />
                        ) : (
                          <div className="field-readonly" id="field-slug">
                            {formData.slug}
                          </div>
                        )}
                        {fieldErrors.slug && (
                          <div className="field-error-message">
                            {fieldErrors.slug}
                          </div>
                        )}
                        {state.mode === 'create' &&
                          formData.slug &&
                          !slugRegex.test(formData.slug) && (
                            <div className="field-error-message">
                              Slug must be lowercase ASCII kebab-case (e.g. my-new-entry)
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 2: IDENTITY & PUBLISHING */}
                <section className="form-section">
                  <div className="form-section-header form-section-header--publishing">
                    2. IDENTITY & PUBLISHING
                  </div>
                  <div className="form-section-body">
                    <div className="form-group-row">
                      <label className="checkbox-option">
                        <input
                          type="checkbox"
                          checked={formData.draft}
                          onChange={(e) =>
                            updateForm({ draft: e.target.checked })
                          }
                        />
                        <span>DRAFT (草稿状态)</span>
                      </label>

                      <div className="form-group">
                        <label
                          htmlFor="field-featured-order"
                          className="field-label"
                        >
                          Featured Order (精选序号 1–6)
                        </label>
                        <input
                          id="field-featured-order"
                          type="number"
                          min="1"
                          max="6"
                          className="field-input"
                          value={formData.featuredOrder}
                          onChange={(e) =>
                            updateForm({ featuredOrder: e.target.value })
                          }
                          placeholder="Optional (1-6)"
                        />
                        {fieldErrors.featuredOrder && (
                          <div className="field-error-message">
                            {fieldErrors.featuredOrder}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="form-group-row">
                      <div className="form-group">
                        <label
                          htmlFor="field-created-at"
                          className="field-label"
                        >
                          Created At <span className="field-required">*</span>
                        </label>
                        <input
                          id="field-created-at"
                          type="date"
                          className="field-input"
                          value={formData.createdAt}
                          onChange={(e) =>
                            updateForm({ createdAt: e.target.value })
                          }
                          required
                        />
                        {fieldErrors.createdAt && (
                          <div className="field-error-message">
                            {fieldErrors.createdAt}
                          </div>
                        )}
                      </div>

                      <div className="form-group">
                        <label
                          htmlFor="field-published-at"
                          className="field-label"
                        >
                          Published At {!formData.draft && <span className="field-required">*</span>}
                        </label>
                        {formData.initialPublishedAt ? (
                          <>
                            <div className="field-readonly" id="field-published-at">
                              {formData.publishedAt}
                            </div>
                            <span className="field-help-text">
                              Published date is immutable once set.
                            </span>
                          </>
                        ) : formData.draft ? (
                          <>
                            <input
                              id="field-published-at"
                              type="date"
                              className="field-input"
                              value=""
                              disabled
                            />
                            <span className="field-help-text">
                              Draft entries cannot set PublishedAt (set when published)
                            </span>
                          </>
                        ) : (
                          <>
                            <input
                              id="field-published-at"
                              type="date"
                              className="field-input"
                              value={formData.publishedAt}
                              onChange={(e) =>
                                updateForm({ publishedAt: e.target.value })
                              }
                              required
                            />
                            {fieldErrors.publishedAt && (
                              <div className="field-error-message">
                                {fieldErrors.publishedAt}
                              </div>
                            )}
                          </>
                        )}
                      </div>

                      <div className="form-group">
                        <label
                          htmlFor="field-updated-at"
                          className="field-label"
                        >
                          Updated At <span className="field-required">*</span>
                        </label>
                        <input
                          id="field-updated-at"
                          type="date"
                          className="field-input"
                          value={formData.updatedAt}
                          onChange={(e) =>
                            updateForm({ updatedAt: e.target.value })
                          }
                          required
                        />
                        {fieldErrors.updatedAt && (
                          <div className="field-error-message">
                            {fieldErrors.updatedAt}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 3: ORGANIZE (Tags & Related) */}
                <section className="form-section">
                  <div className="form-section-header form-section-header--organize">
                    3. ORGANIZE
                  </div>
                  <div className="form-section-body">
                    {/* Tags */}
                    <div className="form-group">
                      <label htmlFor="field-tag-input" className="field-label">Tags</label>
                      <div className="tag-container">
                        {formData.tags.map((tag) => (
                          <span key={tag} className="tag-chip">
                            #{tag}
                            <button
                              type="button"
                              className="tag-remove-btn"
                              aria-label={`移除标签 ${tag}`}
                              onClick={() => handleRemoveTag(tag)}
                            >
                              ✕
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="tag-input-row">
                        <input
                          id="field-tag-input"
                          type="text"
                          className="field-input"
                          placeholder="Add new tag..."
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddTag();
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="tag-add-btn"
                          onClick={handleAddTag}
                        >
                          + ADD TAG
                        </button>
                      </div>
                      {(fieldErrors.tags ||
                        fieldErrors['tags.0'] ||
                        Object.keys(fieldErrors).find((k) =>
                          k.startsWith('tags.'),
                        )) && (
                        <div className="field-error-message">
                          {fieldErrors.tags ||
                            fieldErrors['tags.0'] ||
                            Object.entries(fieldErrors).find(([k]) =>
                              k.startsWith('tags.'),
                            )?.[1]}
                        </div>
                      )}
                    </div>

                    {/* Related Entries */}
                    <div className="form-group">
                      <label htmlFor="field-related-search" className="field-label">Related Entries (关联条目)</label>
                      <div className="related-box">
                        <input
                          id="field-related-search"
                          type="text"
                          className="field-input"
                          placeholder="Search entries to link..."
                          value={relatedSearch}
                          onChange={(e) => setRelatedSearch(e.target.value)}
                        />
                        <div className="related-list">
                          {availableRelatedEntries.length === 0 ? (
                            <div className="field-help-text" style={{ padding: '8px' }}>
                              No matching entries to link
                            </div>
                          ) : (
                            availableRelatedEntries.map((e) => {
                              const isChecked = formData.related.includes(
                                e.slug,
                              );
                              return (
                                <label
                                  key={e.slug}
                                  className={`related-item ${isChecked ? 'is-checked' : ''}`}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() =>
                                      handleToggleRelated(e.slug)
                                    }
                                  />
                                  <span>
                                    <strong>[{e.type}]</strong> {e.title}{' '}
                                    <span style={{ color: 'var(--muted)' }}>
                                      ({e.slug})
                                    </span>
                                  </span>
                                </label>
                              );
                            })
                          )}
                        </div>
                        {formData.related.length > 0 && (
                          <div className="field-help-text">
                            Selected: {formData.related.join(', ')}
                          </div>
                        )}
                      </div>
                      {(fieldErrors.related ||
                        fieldErrors['related.0'] ||
                        Object.keys(fieldErrors).find((k) =>
                          k.startsWith('related.'),
                        )) && (
                        <div className="field-error-message">
                          {fieldErrors.related ||
                            fieldErrors['related.0'] ||
                            Object.entries(fieldErrors).find(([k]) =>
                              k.startsWith('related.'),
                            )?.[1]}
                        </div>
                      )}
                    </div>
                  </div>
                </section>

                {/* Section 4: SOURCE & LINKS */}
                <section className="form-section">
                  <div className="form-section-header form-section-header--source">
                    4. SOURCE & LINKS
                  </div>
                  <div className="form-section-body">
                    {/* Source Radio Group */}
                    <div className="form-group">
                      <span className="field-label">Source (条目来源)</span>
                      <div className="radio-group" role="radiogroup" aria-label="条目来源">
                        {(
                          [
                            ['self', '原创 (Self)'],
                            ['adapted', '改编 (Adapted)'],
                            ['external', '外部收录 (External)'],
                          ] as const
                        ).map(([val, label]) => (
                          <label
                            key={val}
                            className={`radio-option ${formData.source === val ? 'is-selected' : ''}`}
                          >
                            <input
                              type="radio"
                              name="entry-source"
                              value={val}
                              checked={formData.source === val}
                              onChange={() => updateForm({ source: val })}
                            />
                            <span>{label}</span>
                          </label>
                        ))}
                      </div>
                      {fieldErrors.source && (
                        <div className="field-error-message">
                          {fieldErrors.source}
                        </div>
                      )}
                    </div>

                    {/* Links Repeater */}
                    <div className="form-group">
                      <span className="field-label">Links (相关链接)</span>
                      {fieldErrors.links && (
                        <div className="field-error-message">
                          {fieldErrors.links}
                        </div>
                      )}
                      <div className="link-list">
                        {formData.links.map((link, idx) => (
                          <div key={idx} className="link-row-container">
                            <div className="link-row">
                              <div className="form-group" style={{ flex: 1 }}>
                                <input
                                  type="text"
                                  className="field-input"
                                  placeholder="Link label..."
                                  aria-label={`链接 ${idx + 1} 标签`}
                                  value={link.label}
                                  onChange={(e) =>
                                    handleUpdateLink(
                                      idx,
                                      'label',
                                      e.target.value,
                                    )
                                  }
                                />
                                {fieldErrors[`links.${idx}.label`] && (
                                  <div className="field-error-message">
                                    {fieldErrors[`links.${idx}.label`]}
                                  </div>
                                )}
                              </div>
                              <div className="form-group" style={{ flex: 2 }}>
                                <input
                                  type="url"
                                  className="field-input"
                                  placeholder="https://..."
                                  aria-label={`链接 ${idx + 1} 网址`}
                                  value={link.url}
                                  onChange={(e) =>
                                    handleUpdateLink(idx, 'url', e.target.value)
                                  }
                                />
                                {fieldErrors[`links.${idx}.url`] && (
                                  <div className="field-error-message">
                                    {fieldErrors[`links.${idx}.url`]}
                                  </div>
                                )}
                              </div>
                              <button
                                type="button"
                                className="link-delete-btn"
                                aria-label={`删除链接 ${idx + 1}`}
                                onClick={() => handleRemoveLink(idx)}
                              >
                                DELETE
                              </button>
                            </div>
                            {fieldErrors[`links.${idx}`] &&
                              !fieldErrors[`links.${idx}.label`] &&
                              !fieldErrors[`links.${idx}.url`] && (
                                <div
                                  className="field-error-message"
                                  style={{ marginTop: '4px' }}
                                >
                                  {fieldErrors[`links.${idx}`]}
                                </div>
                              )}
                          </div>
                        ))}
                        <button
                          type="button"
                          className="link-add-btn"
                          onClick={handleAddLink}
                        >
                          + ADD LINK
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 5: TYPE DETAILS */}
                {(() => {
                  const currentTypeDef = ENTRY_TYPE_DEFINITIONS[formData.type];
                  const typeFieldEntries = currentTypeDef
                    ? Object.entries(currentTypeDef.typeFields)
                    : [];
                  if (typeFieldEntries.length === 0) return null;

                  return (
                    <section className="form-section">
                      <div className="form-section-header form-section-header--details">
                        5. TYPE DETAILS ({currentTypeDef.label})
                      </div>
                      <div className="form-section-body">
                        {typeFieldEntries.map(([fieldKey, decl]) => {
                          const fieldId = `field-type-${fieldKey}`;
                          const val = formData.typeFields[fieldKey] ?? '';
                          const errorMsg =
                            fieldErrors[fieldKey] ||
                            fieldErrors[`typeFields.${fieldKey}`];

                          const handleFieldChange = (newVal: unknown) => {
                            updateForm({
                              typeFields: {
                                ...formData.typeFields,
                                [fieldKey]: newVal,
                              },
                            });
                          };

                          return (
                            <div key={fieldKey} className="form-group">
                              <label htmlFor={fieldId} className="field-label">
                                {decl.label}{' '}
                                {decl.required && (
                                  <span className="field-required">*</span>
                                )}
                              </label>
                              {decl.control === 'textarea' ? (
                                <textarea
                                  id={fieldId}
                                  className="field-input"
                                  style={{
                                    minHeight: '80px',
                                    resize: 'vertical',
                                  }}
                                  value={String(val)}
                                  placeholder={decl.placeholder}
                                  required={decl.required}
                                  onChange={(e) =>
                                    handleFieldChange(e.target.value)
                                  }
                                />
                              ) : decl.control === 'number' ? (
                                <input
                                  id={fieldId}
                                  type="number"
                                  className="field-input"
                                  value={String(val)}
                                  placeholder={decl.placeholder}
                                  required={decl.required}
                                  onChange={(e) =>
                                    handleFieldChange(e.target.value)
                                  }
                                />
                              ) : decl.control === 'date' ? (
                                <input
                                  id={fieldId}
                                  type="date"
                                  className="field-input"
                                  value={String(val)}
                                  required={decl.required}
                                  onChange={(e) =>
                                    handleFieldChange(e.target.value)
                                  }
                                />
                              ) : decl.control === 'checkbox' ? (
                                <label className="checkbox-option">
                                  <input
                                    id={fieldId}
                                    type="checkbox"
                                    checked={Boolean(val)}
                                    onChange={(e) =>
                                      handleFieldChange(e.target.checked)
                                    }
                                  />
                                  <span>{decl.label}</span>
                                </label>
                              ) : decl.control === 'select' && decl.options ? (
                                <select
                                  id={fieldId}
                                  className="field-input"
                                  value={String(val)}
                                  required={decl.required}
                                  onChange={(e) =>
                                    handleFieldChange(e.target.value)
                                  }
                                >
                                  <option value="">
                                    {decl.placeholder || 'Select option...'}
                                  </option>
                                  {decl.options.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                      {opt.label}
                                    </option>
                                  ))}
                                </select>
                              ) : decl.control === 'radio' && decl.options ? (
                                <div
                                  className="radio-group"
                                  role="radiogroup"
                                  aria-label={decl.label}
                                >
                                  {decl.options.map((opt) => (
                                    <label
                                      key={opt.value}
                                      className={`radio-option ${String(val) === opt.value ? 'is-selected' : ''}`}
                                    >
                                      <input
                                        type="radio"
                                        name={fieldId}
                                        value={opt.value}
                                        checked={String(val) === opt.value}
                                        onChange={() =>
                                          handleFieldChange(opt.value)
                                        }
                                      />
                                      <span>{opt.label}</span>
                                    </label>
                                  ))}
                                </div>
                              ) : (
                                <input
                                  id={fieldId}
                                  type="text"
                                  className="field-input"
                                  value={String(val)}
                                  placeholder={decl.placeholder}
                                  required={decl.required}
                                  onChange={(e) =>
                                    handleFieldChange(e.target.value)
                                  }
                                />
                              )}
                              {decl.helpText && (
                                <span className="field-help-text">
                                  {decl.helpText}
                                </span>
                              )}
                              {errorMsg && (
                                <div className="field-error-message">
                                  {errorMsg}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })()}

                {/* Section 6: MARKDOWN BODY */}
                <section className="form-section">
                  <div className="form-section-header form-section-header--body">
                    6. MARKDOWN BODY
                  </div>
                  <div className="form-section-body">
                    <div className="form-group">
                      <label htmlFor="field-body" className="field-label">
                        Markdown Content
                      </label>
                      <textarea
                        id="field-body"
                        className="markdown-textarea"
                        value={formData.body}
                        onChange={(e) => updateForm({ body: e.target.value })}
                        placeholder="# Markdown content here..."
                      />
                    </div>
                  </div>
                </section>
              </div>

              {/* Editor Footer Action Bar */}
              <div className="editor-action-bar">
                <div className="action-status-area">
                  <span
                    className={`save-status-text ${state.dirty ? 'is-dirty' : 'is-saved'}`}
                  >
                    {state.dirty ? 'UNSAVED CHANGES' : 'ALL CHANGES SAVED'}
                  </span>
                  {savedUrl && (
                    <a
                      href={savedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="live-entry-link"
                    >
                      View Live Entry ({savedUrl})
                    </a>
                  )}
                </div>

                <div className="editor-buttons">
                  <button
                    type="button"
                    className="save-button"
                    disabled={saveLoading}
                    onClick={handleSave}
                  >
                    {saveLoading ? 'SAVING...' : 'SAVE ENTRY'}
                  </button>
                </div>
              </div>
            </>
          )}
        </main>

        {/* Right Column: Sandboxed Preview Pane */}
        <aside className="workbench-preview-pane" aria-label="条目预览">
          <div className="preview-header-bar">
            <div className="preview-header-title">PREVIEW</div>
            <div className="preview-header-tag">
              {formData.extension === '.mdx' ? 'MDX (LIMIT)' : 'LIVE HTML'}
            </div>
          </div>

          {/* Boundaries / notices */}
          {formData.extension === '.mdx' ? (
            <div className="preview-boundary-notice preview-boundary-notice--mdx">
              MDX preview is not supported. Save the entry and view on the site.
            </div>
          ) : (
            <div className="preview-boundary-notice">
              Notice: Local relative images (e.g. ./img.png) cannot be previewed in the sandbox.
            </div>
          )}

          <div className="preview-iframe-wrapper">
            {previewLoading && (
              <div className="preview-loading-overlay">
                <div>Rendering live preview...</div>
              </div>
            )}

            {previewError && !previewLoading && (
              <div className="preview-error-overlay">
                <div>{previewError}</div>
              </div>
            )}

            {!previewLoading && !previewError && (
              <iframe
                title="条目实时预览"
                sandbox="allow-same-origin"
                srcDoc={buildPreviewDocument(
                  state.preview?.html ||
                    `<p style="color: var(--muted); font-style: italic;">No preview content available.</p>`,
                  formData.title,
                )}
                className="preview-iframe"
              />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<LocalEntryEditorApp />);
}
