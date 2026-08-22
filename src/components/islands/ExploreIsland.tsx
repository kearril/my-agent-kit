import { useMemo, useState } from 'react';
import {
  filterExploreIndex,
  getVisibleEntries,
  type ExploreEntry,
  type ExploreEntryType,
} from '../../lib/explore-index';

const PAGE_SIZE = 6;

const ENTRY_TYPES: readonly { type: ExploreEntryType; label: string }[] = [
  { type: 'prompt', label: 'PROMPT' },
  { type: 'skill', label: 'SKILL' },
  { type: 'mcp', label: 'MCP' },
  { type: 'website', label: 'WEBSITE' },
  { type: 'project', label: 'PROJECT' },
  { type: 'note', label: 'NOTE' },
];

interface Props {
  entries: ExploreEntry[];
}

export default function ExploreIsland({ entries }: Props) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ExploreEntryType | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const availableTags = useMemo(() => {
    const tagSet = new Set(entries.flatMap((entry) => entry.tags));
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, 'zh-CN'));
  }, [entries]);

  const filteredEntries = useMemo(() => {
    return filterExploreIndex(entries, {
      query,
      type: selectedType,
      tag: selectedTag,
    });
  }, [entries, query, selectedType, selectedTag]);

  const visibleEntries = useMemo(() => {
    return getVisibleEntries(filteredEntries, visibleCount);
  }, [filteredEntries, visibleCount]);

  const isFiltered = query.trim().length > 0 || selectedType !== null || selectedTag !== null;

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setVisibleCount(PAGE_SIZE);
  };

  const handleAllTypesClick = () => {
    setSelectedType(null);
    setVisibleCount(PAGE_SIZE);
  };

  const handleTypeSelect = (type: ExploreEntryType) => {
    setSelectedType((current) => (current === type ? null : type));
    setVisibleCount(PAGE_SIZE);
  };

  const handleTagSelect = (tag: string) => {
    setSelectedTag((current) => (current === tag ? null : tag));
    setVisibleCount(PAGE_SIZE);
  };

  const handleClearFilters = () => {
    setQuery('');
    setSelectedType(null);
    setSelectedTag(null);
    setVisibleCount(PAGE_SIZE);
  };

  const handleLoadMore = () => {
    setVisibleCount((current) => current + PAGE_SIZE);
  };

  if (entries.length === 0) {
    return (
      <div className="explore-container">
        <div className="empty-state explore-empty">
          <p>暂无公开内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-container">
      <div className="explore-controls">
        <div className="explore-search-bar">
          <label htmlFor="explore-search-input" className="sr-only">
            搜索条目
          </label>
          <span className="search-icon-box" aria-hidden="true">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            id="explore-search-input"
            type="search"
            className="explore-search-input"
            value={query}
            onChange={handleQueryChange}
            placeholder="搜索标题或摘要（Prompt / Skill / MCP / 网站 / 项目 / 笔记）..."
            autoComplete="off"
            spellCheck="false"
          />
          {query && (
            <button
              type="button"
              className="explore-search-clear"
              onClick={() => {
                setQuery('');
                setVisibleCount(PAGE_SIZE);
              }}
              aria-label="清除搜索输入"
            >
              ×
            </button>
          )}
        </div>

        <div className="explore-filter-group">
          <div className="explore-types-bar" role="group" aria-label="条目类型筛选">
            <button
              type="button"
              className={`explore-type-btn ${selectedType === null ? 'explore-type-btn--active' : ''}`}
              onClick={handleAllTypesClick}
              aria-pressed={selectedType === null}
            >
              ALL 全部
            </button>
            {ENTRY_TYPES.map(({ type, label }) => (
              <button
                key={type}
                type="button"
                className={`explore-type-btn explore-type-btn--${type} ${selectedType === type ? 'explore-type-btn--active' : ''}`}
                onClick={() => handleTypeSelect(type)}
                aria-pressed={selectedType === type}
              >
                {label}
              </button>
            ))}
          </div>

          {availableTags.length > 0 && (
            <div className="explore-tags-bar" role="group" aria-label="标签筛选">
              <span className="explore-tags-label">TAGS:</span>
              {availableTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`explore-tag-btn ${selectedTag === tag ? 'explore-tag-btn--active' : ''}`}
                  onClick={() => handleTagSelect(tag)}
                  aria-pressed={selectedTag === tag}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>

        {isFiltered && (
          <div className="explore-status-bar">
            <span className="explore-status-count">
              找到 {filteredEntries.length} 条匹配内容
            </span>
            <button
              type="button"
              className="explore-clear-btn"
              onClick={handleClearFilters}
            >
              清除所有筛选
            </button>
          </div>
        )}
      </div>

      {filteredEntries.length === 0 ? (
        <div className="empty-state explore-empty">
          <p>当前筛选无结果</p>
          {isFiltered && (
            <button
              type="button"
              className="button button--yellow explore-empty-reset"
              onClick={handleClearFilters}
            >
              重置筛选
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="explore-grid" role="list">
            {visibleEntries.map((entry) => (
              <a
                key={entry.slug}
                className="explore-card"
                href={entry.canonicalUrl}
              >
                <div className="explore-card-header">
                  <span className={`mini-badge mini-badge--${entry.type}`}>
                    {entry.type}
                  </span>
                  <time className="explore-card-date" dateTime={entry.updatedAt}>
                    {entry.updatedAt}
                  </time>
                </div>
                <h3 className="explore-card-title">{entry.title}</h3>
                <p className="explore-card-summary">{entry.summary}</p>
                {entry.tags.length > 0 && (
                  <div className="explore-card-tags">
                    {entry.tags.map((tag) => (
                      <span key={tag} className="explore-tag-chip">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </a>
            ))}
          </div>

          {filteredEntries.length > visibleEntries.length && (
            <div className="explore-load-more-wrapper">
              <button
                type="button"
                className="button button--yellow explore-load-more-btn"
                onClick={handleLoadMore}
                aria-label="加载更多条目"
              >
                加载更多 ({filteredEntries.length - visibleEntries.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
