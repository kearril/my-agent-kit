import React from 'react';
import type { WorkspacePane } from '../editor-state';

export interface StudioToolbarProps {
  entriesCount: number;
  filteredCount: number;
  isLoading: boolean;
  pane: WorkspacePane;
  sidebarCollapsed: boolean;
  onToggleSidebar: () => void;
  onSetPane: (pane: WorkspacePane) => void;
  onNewEntry: () => void;
  onSave: () => void;
  isSaving: boolean;
  isDirty: boolean;
  hasSelectedEntry: boolean;
}

export function StudioToolbar({
  entriesCount,
  filteredCount,
  isLoading,
  pane,
  sidebarCollapsed,
  onToggleSidebar,
  onSetPane,
  onNewEntry,
  onSave,
  isSaving,
  isDirty,
  hasSelectedEntry,
}: StudioToolbarProps) {
  return (
    <header className="workbench-toolbar">
      <div className="toolbar-brand-group">
        <button
          type="button"
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? '展开卷宗侧栏' : '收起卷宗侧栏'}
          title={sidebarCollapsed ? '展开卷宗侧栏' : '收起卷宗侧栏'}
        >
          {sidebarCollapsed ? '☰ 展开卷宗' : '◧ 收起侧栏'}
        </button>
        <div className="toolbar-brand">Paracosm Studio</div>
        <div className="toolbar-status-badge">127.0.0.1 本地工坊</div>
        <div className="toolbar-summary">
          {isLoading
            ? '加载中…'
            : `${filteredCount} / ${entriesCount} 条目`}
        </div>
      </div>

      <div className="toolbar-actions">
        <div className="pane-toggle-group" role="group" aria-label="视图布局切换">
          <button
            type="button"
            className="pane-toggle-button"
            aria-pressed={pane === 'split'}
            onClick={() => onSetPane('split')}
            title="双栏视图（写作 + 实时预览）"
          >
            双栏对照
          </button>
          <button
            type="button"
            className="pane-toggle-button"
            aria-pressed={pane === 'editor'}
            onClick={() => onSetPane('editor')}
            title="专注写作（仅编辑区）"
          >
            专注写作
          </button>
          <button
            type="button"
            className="pane-toggle-button"
            aria-pressed={pane === 'preview'}
            onClick={() => onSetPane('preview')}
            title="装订册全预览（仅预览区）"
          >
            全页预览
          </button>
        </div>

        <button
          type="button"
          className="new-entry-btn"
          onClick={onNewEntry}
        >
          + 新建条目
        </button>

        {hasSelectedEntry && (
          <button
            type="button"
            className="toolbar-save-btn"
            disabled={isSaving || !isDirty}
            onClick={onSave}
            title="快捷键: Ctrl+S / Cmd+S"
          >
            {isSaving ? '保存中…' : isDirty ? '保存改动 (Ctrl+S)' : '已保存'}
          </button>
        )}
      </div>
    </header>
  );
}
