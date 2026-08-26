import React, { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ENTRY_TYPE_DEFINITIONS,
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
  EditorSaveResponse,
} from './server/editor-api';
import { StudioToolbar } from './components/StudioToolbar';
import { NavSidebar } from './components/NavSidebar';
import { CompactHeader, type EntryFormState } from './components/CompactHeader';
import { MarkdownToolbar } from './components/MarkdownToolbar';
import { ArticleBinderPreview } from './components/ArticleBinderPreview';
import { useEditorShortcuts } from './hooks/useEditorShortcuts';
import { useDebouncedPreview } from './hooks/useDebouncedPreview';
import { useGardenVocabulary } from './hooks/useGardenVocabulary';
import { computeContentStats } from './lib/markdown-actions';
import './editor.css';

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

function createEmptyFormData(type: EntryType = 'prompt'): EntryFormState {
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

function entryDetailToFormData(detail: EditorEntryDetail): EntryFormState {
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

export function LocalEntryEditorApp() {
  const [state, dispatch] = useReducer(
    reduceWorkspace<{ html: string }>,
    undefined,
    () => createWorkspaceState<{ html: string }>(),
  );

  const [entries, setEntries] = useState<EditorEntrySummary[]>([]);
  const [entriesLoading, setEntriesLoading] = useState(true);
  const [entriesError, setEntriesError] = useState<string | null>(null);

  const [formData, setFormData] = useState<EntryFormState>(() =>
    createEmptyFormData(),
  );
  const formDataRef = useRef<EntryFormState>(formData);
  formDataRef.current = formData;

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [bannerAlert, setBannerAlert] = useState<{
    type: 'error' | 'conflict' | 'success';
    message: string;
    details?: unknown;
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const [previewError, setPreviewError] = useState<string | null>(null);

  const detailAbortControllerRef = useRef<AbortController | null>(null);
  const detailRequestSeqRef = useRef<number>(0);

  const vocabulary = useGardenVocabulary(entries);

  // Fetch Entry List
  const fetchEntries = useCallback(async () => {
    setEntriesLoading(true);
    setEntriesError(null);
    try {
      const res = await fetch('/__garden-editor/api/entries');
      if (!res.ok) {
        throw new Error(`加载条目失败（${res.status}）`);
      }
      const data = (await res.json()) as EditorEntriesResponse;
      setEntries(data.entries);
    } catch (err) {
      setEntriesError(
        err instanceof Error ? err.message : '加载条目时发生未知错误',
      );
    } finally {
      setEntriesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Form State Mutator
  const updateForm = useCallback(
    (patch: Partial<EntryFormState>) => {
      const next = { ...formDataRef.current, ...patch };
      formDataRef.current = next;
      setFormData(next);
      dispatch({ type: 'markDirty', dirty: true });
    },
    [],
  );

  // Debounced Live Preview
  const { isLoading: previewLoading, triggerInstant: triggerInstantPreview } =
    useDebouncedPreview({
      formData,
      delayMs: 300,
      onPreviewSuccess: useCallback((html: string) => {
        dispatch({ type: 'setPreview', preview: { html } });
        setPreviewError(null);
      }, []),
      onPreviewError: useCallback((err: string | null) => {
        setPreviewError(err);
      }, []),
    });

  // Load Single Entry
  const loadEntry = useCallback(async (slug: string) => {
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
        throw new Error(`加载条目“${slug}”失败（${res.status}）`);
      }
      const data = (await res.json()) as EditorEntryResponse;
      if (reqId !== detailRequestSeqRef.current) return;

      const nextForm = entryDetailToFormData(data.entry);
      formDataRef.current = nextForm;
      setFormData(nextForm);
      setSavedUrl(data.url);
    } catch (err) {
      if (reqId !== detailRequestSeqRef.current) return;
      if ((err as Error).name === 'AbortError') return;
      setBannerAlert({
        type: 'error',
        message: err instanceof Error ? err.message : '加载条目详情失败',
      });
    } finally {
      if (reqId === detailRequestSeqRef.current) {
        setDetailLoading(false);
      }
    }
  }, []);

  const handleSelectEntry = useCallback(
    (slug: string) => {
      if (state.dirty && state.selectedSlug && state.selectedSlug !== slug) {
        const confirmed = window.confirm(
          '当前条目有尚未保存的改动。切换到其他条目可能会丢失这些修改，确认切换吗？',
        );
        if (!confirmed) return;
      }
      dispatch({ type: 'selectEntry', slug });
      loadEntry(slug);
    },
    [state.dirty, state.selectedSlug, loadEntry],
  );

  const handleNewEntry = useCallback(() => {
    if (state.dirty) {
      const confirmed = window.confirm(
        '当前条目有尚未保存的改动，确认创建新条目吗？',
      );
      if (!confirmed) return;
    }
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
  }, [state.dirty]);

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

  const handleQuickToday = useCallback(
    (field: 'updatedAt' | 'publishedAt' | 'createdAt') => {
      const today = new Date().toISOString().slice(0, 10);
      updateForm({ [field]: today });
    },
    [updateForm],
  );

  // Save Draft to Disk
  const handleSave = useCallback(async () => {
    setSaveLoading(true);
    setBannerAlert(null);
    setFieldErrors({});

    const currentForm = formDataRef.current;
    const isCreate = state.mode === 'create';
    const cleanLinks = currentForm.links.filter(
      (l) => l.label.trim() && l.url.trim(),
    );

    const payload: Record<string, unknown> = {
      title: currentForm.title.trim(),
      summary: currentForm.summary.trim(),
      type: currentForm.type,
      draft: currentForm.draft,
      source: currentForm.source,
      tags: currentForm.tags,
      links: cleanLinks,
      related: currentForm.related,
      createdAt: currentForm.createdAt,
      updatedAt: currentForm.updatedAt,
      body: currentForm.body,
    };

    if (!currentForm.draft && currentForm.publishedAt) {
      payload.publishedAt = currentForm.publishedAt;
    }

    if (currentForm.featuredOrder.trim()) {
      payload.featuredOrder = Number(currentForm.featuredOrder);
    }

    const currentTypeDef = ENTRY_TYPE_DEFINITIONS[currentForm.type];
    if (currentTypeDef?.typeFields) {
      for (const [key, decl] of Object.entries(currentTypeDef.typeFields)) {
        const rawVal = currentForm.typeFields[key];
        if (rawVal !== undefined && rawVal !== '') {
          payload[key] =
            decl.control === 'number'
              ? Number(rawVal)
              : decl.control === 'checkbox'
                ? Boolean(rawVal)
                : rawVal;
        }
      }
    }

    if (isCreate) {
      payload.slug = currentForm.slug.trim();
    } else {
      payload.revision = currentForm.revision;
    }

    const endpoint = isCreate
      ? '/__garden-editor/api/entries'
      : `/__garden-editor/api/entries/${currentForm.slug}`;
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
            `检测到版本冲突：磁盘版本为 ${conflictData.actualRevision}，当前表单基于 ${conflictData.expectedRevision}。已保留当前表单草稿。`,
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
              if (!errMap[topField]) errMap[topField] = msg;
            }
          }
        }
        setFieldErrors(errMap);
        setBannerAlert({
          type: 'error',
          message: errData.error || '校验失败。请修正字段错误后重试。',
        });
        return;
      }

      if (!res.ok) {
        const errData = (await res.json()) as EditorErrorResponse;
        throw new Error(errData.error || `保存失败（${res.status}）`);
      }

      const saveRes = (await res.json()) as EditorSaveResponse;
      const updatedForm = entryDetailToFormData(saveRes.entry);
      formDataRef.current = updatedForm;
      setFormData(updatedForm);
      setSavedUrl(saveRes.url);
      dispatch({ type: 'markSaved', slug: saveRes.entry.slug });
      setBannerAlert({
        type: 'success',
        message: `条目 "${saveRes.entry.slug}" 已成功保存到磁盘。`,
      });

      fetchEntries();
    } catch (err) {
      setBannerAlert({
        type: 'error',
        message: err instanceof Error ? err.message : '保存条目时发生错误',
      });
    } finally {
      setSaveLoading(false);
    }
  }, [state.mode, fetchEntries]);

  // Hook shortcuts
  useEditorShortcuts({
    textareaRef,
    onSave: handleSave,
    onContentChange: useCallback((nextBody: string) => {
      updateForm({ body: nextBody });
    }, [updateForm]),
  });

  const contentStats = useMemo(() => {
    return computeContentStats(formData.body || '');
  }, [formData.body]);

  const paneClass = `workbench-body pane-${state.pane} ${
    state.sidebarCollapsed ? 'sidebar-collapsed' : ''
  }`;

  return (
    <div className="workbench-container">
      {/* Top Application Header */}
      <StudioToolbar
        entriesCount={entries.length}
        filteredCount={entries.length}
        isLoading={entriesLoading}
        pane={state.pane}
        sidebarCollapsed={state.sidebarCollapsed}
        onToggleSidebar={() => dispatch({ type: 'toggleSidebar' })}
        onSetPane={(pane) => dispatch({ type: 'setPane', pane })}
        onNewEntry={handleNewEntry}
        onSave={handleSave}
        isSaving={saveLoading}
        isDirty={state.dirty}
        hasSelectedEntry={state.mode !== 'idle'}
      />

      {/* Main Grid View */}
      <div className={paneClass}>
        {/* Left Specimen Ledger Sidebar */}
        <NavSidebar
          entries={entries}
          selectedSlug={state.selectedSlug}
          isDirty={state.dirty}
          isLoading={entriesLoading}
          error={entriesError}
          onSelectEntry={handleSelectEntry}
        />

        {/* Center Editing Canvas */}
        <main className="workbench-editor-pane" aria-label="条目编辑区">
          {state.mode === 'idle' ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                textAlign: 'center',
              }}
            >
              <h2 style={{ fontSize: '1.4rem', fontWeight: 900, marginBottom: '12px' }}>
                🗂 尚未选择条目
              </h2>
              <p style={{ color: 'var(--muted)', maxWidth: '420px', lineHeight: 1.6, marginBottom: '20px' }}>
                从左侧卷宗列表中选择一个条目进行快速查看与编辑，或点击右上角
                <strong> + 新建条目 </strong>开始撰写新的手账便签。
              </p>
              <button
                type="button"
                className="new-entry-btn"
                onClick={handleNewEntry}
              >
                + 创建新条目
              </button>
            </div>
          ) : (
            <>
              {/* Alert Banners */}
              {bannerAlert && (
                <div
                  className={`editor-alert-banner editor-alert-banner--${bannerAlert.type}`}
                  role="alert"
                >
                  <span>{bannerAlert.message}</span>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', boxShadow: 'none' }}
                    onClick={() => setBannerAlert(null)}
                  >
                    ✕
                  </button>
                </div>
              )}

              {detailLoading && (
                <div className="editor-alert-banner editor-alert-banner--conflict">
                  正在从磁盘加载条目详情…
                </div>
              )}

              {/* Compact Header for metadata */}
              <CompactHeader
                formData={formData}
                mode={state.mode}
                fieldErrors={fieldErrors}
                collapsed={state.metadataCollapsed}
                onToggleCollapsed={() => dispatch({ type: 'toggleMetadata' })}
                onUpdateForm={updateForm}
                vocabulary={vocabulary}
                onQuickToday={handleQuickToday}
                onTypeChange={handleTypeChange}
              />

              {/* Single-Row Markdown Micro-Toolbar */}
              <MarkdownToolbar
                textareaRef={textareaRef}
                onContentChange={(nextBody) => updateForm({ body: nextBody })}
                wordCount={contentStats.wordCount}
                charCount={contentStats.charCount}
                readingTimeMinutes={contentStats.readingTimeMinutes}
              />

              {/* Full-Height Writing Textarea */}
              <div className="markdown-editor-wrapper">
                <textarea
                  ref={textareaRef}
                  id="field-body"
                  className="markdown-textarea-main"
                  placeholder="# 在这里开始输入 Markdown 正文...&#10;&#10;使用上方微型工具栏或快捷键 (Ctrl+B / Ctrl+K / Tab 缩进) 快速排版。"
                  value={formData.body}
                  onChange={(e) => updateForm({ body: e.target.value })}
                />
              </div>

              {/* Footer Status Bar */}
              <footer className="editor-status-bar">
                <div className="status-indicator">
                  <span
                    className={
                      state.dirty ? 'status-badge-dirty' : 'status-badge-saved'
                    }
                  >
                    {state.dirty ? '● 有未保存修改' : '✓ 全部改动已保存'}
                  </span>
                  {savedUrl && (
                    <a
                      href={savedUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="live-site-link"
                    >
                      ↗ 查看前台站点条目
                    </a>
                  )}
                </div>

                <div style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                  {state.mode === 'create' ? '新建草稿模式' : `版本: ${formData.revision.slice(0, 8)}`}
                </div>
              </footer>
            </>
          )}
        </main>

        {/* Right Authentic Article Binder Preview */}
        <ArticleBinderPreview
          formData={{
            ...formData,
            bodyHtml: state.preview?.html || '',
          }}
          previewHtml={state.preview?.html || null}
          isLoading={previewLoading}
          error={previewError}
          onManualRefresh={triggerInstantPreview}
        />
      </div>
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<LocalEntryEditorApp />);
}
