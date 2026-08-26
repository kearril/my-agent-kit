import React from 'react';
import {
  applyMarkdownFormat,
  type MarkdownActionType,
} from '../lib/markdown-actions';

export interface MarkdownToolbarProps {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onContentChange: (nextBody: string) => void;
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
}

export function MarkdownToolbar({
  textareaRef,
  onContentChange,
  wordCount,
  charCount,
  readingTimeMinutes,
}: MarkdownToolbarProps) {
  const handleAction = (action: MarkdownActionType) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const nextValue = applyMarkdownFormat(textarea, action);
    onContentChange(nextValue);
  };

  return (
    <div className="markdown-toolbar">
      <div className="toolbar-buttons-left">
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('bold')}
          title="加粗 (Ctrl+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('italic')}
          title="斜体 (Ctrl+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('code')}
          title="行内代码 (Ctrl+E)"
        >
          &lt;/&gt;
        </button>
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('link')}
          title="插入链接 (Ctrl+K)"
        >
          🔗 链接
        </button>
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('quote')}
          title="引用块"
        >
          ❝ 引用
        </button>
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('bullet-list')}
          title="无序列表"
        >
          • 列表
        </button>
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('numbered-list')}
          title="有序列表"
        >
          1. 列表
        </button>
        <button
          type="button"
          className="md-action-btn"
          onClick={() => handleAction('code-block')}
          title="代码块"
        >
          ``` 代码块
        </button>
      </div>

      <div className="toolbar-stats-right">
        <span>{wordCount} 字</span>
        <span>{charCount} 字符</span>
        <span>约 {readingTimeMinutes} 分钟</span>
      </div>
    </div>
  );
}
