import React, { useMemo } from 'react';
import {
  buildFullArticlePreview,
  type PreviewData,
} from '../lib/preview-renderer';

export interface ArticleBinderPreviewProps {
  formData: PreviewData;
  previewHtml: string | null;
  isLoading: boolean;
  error: string | null;
  onManualRefresh: () => void;
}

export function ArticleBinderPreview({
  formData,
  previewHtml,
  isLoading,
  error,
  onManualRefresh,
}: ArticleBinderPreviewProps) {
  const documentSrcDoc = useMemo(() => {
    return buildFullArticlePreview({
      ...formData,
      bodyHtml: previewHtml || '',
    });
  }, [formData, previewHtml]);

  return (
    <aside className="workbench-preview-pane" aria-label="条目实时装订册预览">
      <div className="preview-top-header">
        <div className="preview-title-label">
          <span>📖 装订册全真预览</span>
          {isLoading && <span style={{ color: 'var(--teal)' }}>（渲染中…）</span>}
        </div>
        <button
          type="button"
          className="preview-refresh-btn"
          onClick={onManualRefresh}
          title="强制重新渲染预览"
        >
          ↻ 刷新预览
        </button>
      </div>

      <div className="preview-iframe-box">
        {isLoading && (
          <div className="preview-loading-spinner">
            正在渲染实时预览…
          </div>
        )}

        {error ? (
          <div className="editor-alert-banner editor-alert-banner--error">
            {error}
          </div>
        ) : (
          <iframe
            title="装订册全真预览"
            sandbox="allow-same-origin"
            srcDoc={documentSrcDoc}
            className="preview-iframe-element"
          />
        )}
      </div>
    </aside>
  );
}
