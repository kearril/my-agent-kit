import { useCallback, useEffect, useRef, useState } from 'react';
import { ENTRY_TYPE_DEFINITIONS, type EntryType } from '../../lib/entry-data';
import type { EditorErrorResponse, EditorPreviewResponse } from '../server/editor-api';

export interface PreviewableForm {
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
  publishedAt?: string;
  updatedAt: string;
  featuredOrder?: string;
  typeFields: Record<string, unknown>;
  body: string;
  extension: string;
}

export interface UseDebouncedPreviewOptions {
  formData: PreviewableForm;
  delayMs?: number;
  onPreviewSuccess: (html: string) => void;
  onPreviewError: (error: string | null) => void;
}
export interface UseDebouncedPreviewResult {
  isLoading: boolean;
  triggerInstant: () => void;
}

export function useDebouncedPreview({
  formData,
  delayMs = 300,
  onPreviewSuccess,
  onPreviewError,
}: UseDebouncedPreviewOptions): UseDebouncedPreviewResult {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const seqRef = useRef<number>(0);
  const timerRef = useRef<NodeJS.Timeout | number | null>(null);

  const requestPreview = useCallback(
    async (form: PreviewableForm) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (form.extension === '.mdx' || form.slug.endsWith('.mdx')) {
        onPreviewError('暂不支持 MDX 实时预览。请在站点页面中查看。');
        setIsLoading(false);
        return;
      }

      const controller = new AbortController();
      abortControllerRef.current = controller;
      const reqId = ++seqRef.current;

      setIsLoading(true);
      onPreviewError(null);

      const payload: Record<string, unknown> = {
        slug: form.slug || 'untitled-preview',
        title: form.title || '未命名条目',
        summary: form.summary || '',
        type: form.type,
        draft: form.draft,
        source: form.source,
        tags: form.tags,
        links: (form.links || []).filter((l) => l.label.trim() && l.url.trim()),
        related: form.related || [],
        createdAt: form.createdAt || new Date().toISOString().slice(0, 10),
        publishedAt: !form.draft && form.publishedAt ? form.publishedAt : undefined,
        updatedAt: form.updatedAt || new Date().toISOString().slice(0, 10),
        featuredOrder: form.featuredOrder ? Number(form.featuredOrder) : undefined,
        body: form.body,
        extension: form.extension || '.md',
      };

      const currentTypeDef = ENTRY_TYPE_DEFINITIONS[form.type];
      if (currentTypeDef?.typeFields) {
        for (const [key, decl] of Object.entries(currentTypeDef.typeFields)) {
          const rawVal = form.typeFields[key];
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

      try {
        const res = await fetch('/__garden-editor/api/preview', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });

        if (reqId !== seqRef.current) return;

        if (!res.ok) {
          const errData = (await res.json()) as EditorErrorResponse;
          if (reqId !== seqRef.current) return;
          onPreviewError(errData.error || `预览请求失败（${res.status}）`);
          return;
        }

        const previewData = (await res.json()) as EditorPreviewResponse;
        if (reqId !== seqRef.current) return;
        onPreviewSuccess(previewData.html);
      } catch (err) {
        if (reqId !== seqRef.current) return;
        if ((err as Error).name !== 'AbortError') {
          onPreviewError(
            err instanceof Error ? err.message : '预览请求时发生异常',
          );
        }
      } finally {
        if (reqId === seqRef.current) {
          setIsLoading(false);
        }
      }
    },
    [onPreviewSuccess, onPreviewError],
  );

  const triggerInstant = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    requestPreview(formData);
  }, [formData, requestPreview]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      requestPreview(formData);
    }, delayMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [formData, delayMs, requestPreview]);

  return {
    isLoading,
    triggerInstant,
  };
}
