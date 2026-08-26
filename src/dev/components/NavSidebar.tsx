import React, { useMemo, useState } from 'react';
import {
  ENTRY_TYPES,
  ENTRY_TYPE_DEFINITIONS,
  type EntryType,
} from '../../lib/entry-data';
import type { EditorEntrySummary } from '../server/editor-api';

export interface NavSidebarProps {
  entries: EditorEntrySummary[];
  selectedSlug: string | null;
  isDirty: boolean;
  isLoading: boolean;
  error: string | null;
  onSelectEntry: (slug: string) => void;
}

export type FilterTab = 'ALL' | 'DRAFT' | 'LOCAL';
export type SortOption = 'updated-desc' | 'created-desc' | 'title-asc';

export function NavSidebar({
  entries,
  selectedSlug,
  isDirty,
  isLoading,
  error,
  onSelectEntry,
}: NavSidebarProps) {
  const [filterText, setFilterText] = useState('');
  const [filterTab, setFilterTab] = useState<FilterTab>('ALL');
  const [typeFilter, setTypeFilter] = useState<'ALL' | EntryType>('ALL');
  const [sortOption, setSortOption] = useState<SortOption>('updated-desc');

  const filteredEntries = useMemo(() => {
    const q = filterText.toLowerCase().trim();

    return entries
      .filter((item) => {
        if (filterTab === 'DRAFT' && !item.draft) return false;
        if (filterTab === 'LOCAL' && !item.isLocal) return false;
        if (typeFilter !== 'ALL' && item.type !== typeFilter) return false;
        if (q) {
          const matchTitle = (item.title || '').toLowerCase().includes(q);
          const matchSlug = (item.slug || '').toLowerCase().includes(q);
          if (!matchTitle && !matchSlug) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'updated-desc') {
          const dateA = new Date(a.updatedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.updatedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        } else if (sortOption === 'created-desc') {
          const dateA = new Date(a.createdAt || 0).getTime();
          const dateB = new Date(b.createdAt || 0).getTime();
          return dateB - dateA;
        } else {
          return (a.title || a.slug).localeCompare(b.title || b.slug);
        }
      });
  }, [entries, filterText, filterTab, typeFilter, sortOption]);

  return (
    <nav className="workbench-nav-pane" aria-label="标本卷宗导航">
      <div className="nav-header">
        <span className="nav-title">🗂 标本卷宗目录</span>
        <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>
          {filteredEntries.length} 篇
        </span>
      </div>

      <div className="nav-controls">
        <input
          type="text"
          className="nav-search-input"
          placeholder="搜索标题或 Slug..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          aria-label="按标题或路径名搜索条目"
        />

        <div className="nav-filter-row">
          <div className="nav-filter-tabs" role="group" aria-label="状态筛选">
            <button
              type="button"
              className="nav-filter-tab"
              aria-pressed={filterTab === 'ALL'}
              onClick={() => setFilterTab('ALL')}
            >
              全部
            </button>
            <button
              type="button"
              className="nav-filter-tab"
              aria-pressed={filterTab === 'DRAFT'}
              onClick={() => setFilterTab('DRAFT')}
            >
              草稿
            </button>
            <button
              type="button"
              className="nav-filter-tab"
              aria-pressed={filterTab === 'LOCAL'}
              onClick={() => setFilterTab('LOCAL')}
            >
              本地
            </button>
          </div>

          <select
            className="nav-sort-select"
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value as SortOption)}
            aria-label="条目排序"
          >
            <option value="updated-desc">更新时间 ↓</option>
            <option value="created-desc">创建时间 ↓</option>
            <option value="title-asc">标题 A-Z</option>
          </select>
        </div>

        <select
          className="nav-type-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as 'ALL' | EntryType)}
          aria-label="按类型筛选"
        >
          <option value="ALL">全部类型 ({entries.length})</option>
          {ENTRY_TYPES.map((t) => (
            <option key={t} value={t}>
              {ENTRY_TYPE_DEFINITIONS[t].label} ({t})
            </option>
          ))}
        </select>
      </div>

      <ul className="nav-entry-list">
        {isLoading && <li className="nav-empty-message">正在加载卷宗…</li>}
        {error && <li className="nav-empty-message" style={{ color: 'var(--red)' }}>{error}</li>}
        {!isLoading && !error && filteredEntries.length === 0 && (
          <li className="nav-empty-message">没有匹配的条目。</li>
        )}

        {!isLoading &&
          filteredEntries.map((item) => {
            const isSelected = selectedSlug === item.slug;
            const isUnsaved = isSelected && isDirty;
            const dateDisplay = item.updatedAt
              ? String(item.updatedAt).slice(0, 10)
              : '';

            return (
              <li key={item.slug} className="nav-entry-item">
                <button
                  type="button"
                  className={`nav-entry-button ${isSelected ? 'is-selected' : ''}`}
                  onClick={() => onSelectEntry(item.slug)}
                  aria-current={isSelected ? 'page' : undefined}
                >
                  <div className="entry-item-header">
                    <span className={`badge badge-${item.type}`}>
                      {ENTRY_TYPE_DEFINITIONS[item.type]?.label || item.type}
                    </span>
                    {item.draft && <span className="badge badge-draft">草稿</span>}
                    {item.isLocal && <span className="badge badge-local">本地</span>}
                    {isUnsaved && <span className="status-unsaved-dot">● 未保存</span>}
                  </div>

                  <div className="entry-item-title">{item.title || item.slug}</div>

                  <div className="entry-item-meta-row">
                    <span>/{item.slug}</span>
                    <span>{dateDisplay}</span>
                  </div>
                </button>
              </li>
            );
          })}
      </ul>
    </nav>
  );
}
