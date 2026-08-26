import { useEffect, useMemo, useState } from 'react';
import {
  filterExploreIndex,
  getVisibleEntries,
  type ExploreEntry,
  type ExploreEntryType,
  type GardenOpenPreviewEventDetail,
  type QuickViewEntry,
} from '../../lib/explore-index';
import QuickViewModal from './QuickViewModal';

const PAGE_SIZE = 6;

const ENTRY_TYPES: readonly { type: ExploreEntryType; label: string; desc: string }[] = [
  { type: 'prompt', label: 'PROMPT', desc: '提示词' },
  { type: 'skill', label: 'SKILL', desc: '智能体技能' },
  { type: 'mcp', label: 'MCP', desc: '上下文协议' },
  { type: 'website', label: 'WEBSITE', desc: '网站收藏' },
  { type: 'project', label: 'PROJECT', desc: '精选项目' },
];

interface Props {
  entries: ExploreEntry[];
}

export default function ExploreIsland({ entries }: Props) {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ExploreEntryType | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [activeModalEntry, setActiveModalEntry] = useState<QuickViewEntry | null>(null);
  const [modalTriggerEl, setModalTriggerEl] = useState<HTMLElement | null>(null);

  // Register global listener for cross-section modal triggers (e.g. FeaturedSection)
  useEffect(() => {
    const handleOpenPreview = (e: Event) => {
      const customEvent = e as CustomEvent<GardenOpenPreviewEventDetail>;
      if (customEvent.detail && customEvent.detail.entry) {
        setActiveModalEntry(customEvent.detail.entry);
        setModalTriggerEl(customEvent.detail.triggerElement || null);
      }
    };

    window.addEventListener('garden:open-entry-preview', handleOpenPreview);
    return () => {
      window.removeEventListener('garden:open-entry-preview', handleOpenPreview);
    };
  }, []);
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
      <div className="explore-empty-terminal">
        <div className="empty-terminal-header">
          <span className="empty-terminal-dot" />
          <span className="empty-terminal-title">[ ARCHIVE EMPTY // 暂无公开资产 ]</span>
        </div>
        <p className="empty-terminal-msg">数字资产库正在装填中，稍后将呈现丰富工具与协议。</p>
      </div>
    );
  }

  return (
    <div className="explore-cockpit-layout">
      {/* Left: Cockpit Tuner Deck (Sticky Panel) */}
      <aside className="cockpit-tuner-panel" aria-label="检索调谐座舱">
        <div className="cockpit-panel-header">
          <div className="cockpit-header-tag">
            <span className="cockpit-radar-dot" aria-hidden="true" />
            <span className="cockpit-radar-label">TUNER DECK // CH-05</span>
          </div>
          <span className="cockpit-power-status">LIVE ●</span>
        </div>

        {/* Module 1: Search Radar Scanner */}
        <div className="cockpit-module">
          <label htmlFor="explore-search-input" className="cockpit-module-label">
            [ 01 · 调谐搜索雷达 // SCANNER ]
          </label>
          <div className="cockpit-search-box">
            <span className="search-radar-icon" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              id="explore-search-input"
              type="search"
              className="cockpit-search-input"
              value={query}
              onChange={handleQueryChange}
              placeholder="检索标题、摘要或指令..."
              autoComplete="off"
              spellCheck="false"
            />
            {query && (
              <button
                type="button"
                className="cockpit-clear-query-btn"
                onClick={() => setQuery('')}
                aria-label="清空搜索词"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Module 2: 5-Band Channel Selector */}
        <div className="cockpit-module">
          <div className="cockpit-module-header">
            <span className="cockpit-module-label">[ 02 · 资产波段切换 // BANDS ]</span>
            {selectedType && (
              <button type="button" className="cockpit-mini-reset" onClick={handleAllTypesClick}>
                重置
              </button>
            )}
          </div>
          <div className="cockpit-bands-grid" role="group" aria-label="资产类型波段切换">
            <button
              type="button"
              className={`band-switch-btn ${selectedType === null ? 'band-switch-btn--active' : ''}`}
              onClick={handleAllTypesClick}
              aria-pressed={selectedType === null}
            >
              <span className="band-led" aria-hidden="true" />
              <span className="band-name">ALL · 全部频段</span>
            </button>
            {ENTRY_TYPES.map(({ type, label, desc }) => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  className={`band-switch-btn band-switch-btn--${type} ${isSelected ? 'band-switch-btn--active' : ''}`}
                  onClick={() => handleTypeSelect(type)}
                  aria-pressed={isSelected}
                >
                  <span className="band-led" aria-hidden="true" />
                  <span className="band-name">{label}</span>
                  <span className="band-desc">{desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Module 3: Tag Matrix Cloud */}
        {availableTags.length > 0 && (
          <div className="cockpit-module">
            <div className="cockpit-module-header">
              <span className="cockpit-module-label">[ 03 · 标签矩阵云 // TAGS ]</span>
              {selectedTag && (
                <button
                  type="button"
                  className="cockpit-mini-reset"
                  onClick={() => setSelectedTag(null)}
                >
                  清除标签
                </button>
              )}
            </div>
            <div className="cockpit-tags-matrix" role="group" aria-label="标签筛选">
              {availableTags.map((tag) => {
                const isSelected = selectedTag === tag;
                return (
                  <button
                    key={tag}
                    type="button"
                    className={`cockpit-tag-btn ${isSelected ? 'cockpit-tag-btn--active' : ''}`}
                    onClick={() => handleTagSelect(tag)}
                    aria-pressed={isSelected}
                  >
                    #{tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Module 4: Cockpit Status & Global Reset */}
        <div className="cockpit-status-deck">
          <div className="status-metrics">
            <span className="status-metric-item">
              <span className="status-label">MATCHED:</span>
              <strong className="status-value">{filteredEntries.length}</strong>
            </span>
            <span className="status-metric-item">
              <span className="status-label">CHANNELS:</span>
              <strong className="status-value">5/5</strong>
            </span>
          </div>
          {isFiltered && (
            <button
              type="button"
              className="cockpit-global-reset-btn"
              onClick={handleClearFilters}
            >
              ✕ 重置所有过滤参数
            </button>
          )}
        </div>
      </aside>

      {/* Right: Specimen Feed Deck */}
      <main className="specimen-feed-deck" aria-label="资产检索结果">
        {/* Feed Top Status Bar */}
        <div className="feed-status-bar">
          <div className="feed-status-left">
            <span className="feed-status-tag">SPECIMEN FEED</span>
            <span className="feed-status-count">
              已锁定 <strong>{Math.min(visibleEntries.length, filteredEntries.length)}</strong> /{' '}
              <strong>{filteredEntries.length}</strong> 件标本
            </span>
          </div>
          <div className="feed-status-right">
            <span className="feed-live-indicator">
              <span className="live-dot" /> LIVE CATALOG
            </span>
          </div>
        </div>

        {/* Results Grid (2 Columns on Desktop, 1 Column on Mobile) */}
        {filteredEntries.length > 0 ? (
          <>
            <div className="explore-specimen-grid" role="list">
              {visibleEntries.map((entry, index) => {
                const itemNum = String(index + 1).padStart(2, '0');
                return (
                  <div
                    key={entry.slug}
                    className={`explore-specimen-card explore-specimen-card--${entry.type}`}
                    role="button"
                    tabIndex={0}
                    aria-label={`速览条目: ${entry.title}`}
                    onClick={(e) => {
                      setModalTriggerEl(e.currentTarget);
                      setActiveModalEntry(entry);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setModalTriggerEl(e.currentTarget);
                        setActiveModalEntry(entry);
                      }
                    }}
                  >
                    <div className="card-top-row">
                      <span className="specimen-seq-tag">NO. {itemNum}</span>
                      <span className={`mini-badge mini-badge--${entry.type}`}>
                        {entry.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="card-title">{entry.title}</h3>
                    <p className="card-summary">{entry.summary}</p>
                    {entry.tags.length > 0 && (
                      <div className="card-tags-list">
                        {entry.tags.map((tag) => (
                          <span key={tag} className="specimen-pill-tag">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="card-footer-row">
                      <time dateTime={entry.updatedAt} className="card-date-label">
                        {entry.updatedAt}
                      </time>
                      <a
                        href={entry.canonicalUrl}
                        className="specimen-direct-btn"
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`直接进入 ${entry.title} 详情页`}
                      >
                        <span>进入详情</span>
                        <svg
                          className="direct-btn-icon"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          aria-hidden="true"
                        >
                          <line x1="7" y1="17" x2="17" y2="7" />
                          <polyline points="7 7 17 7 17 17" />
                        </svg>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {visibleEntries.length < filteredEntries.length && (
              <div className="feed-load-more-box">
                <button type="button" className="specimen-load-more-btn" onClick={handleLoadMore}>
                  加载更多资产 ({filteredEntries.length - visibleEntries.length} 剩余)
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="explore-empty-terminal">
            <div className="empty-terminal-header">
              <span className="empty-terminal-dot" />
              <span className="empty-terminal-title">BUFFER EMPTY // 404 NO MATCH</span>
            </div>
            <p className="empty-terminal-msg">
              未检索到匹配的工具或资产。请尝试调整关键词、切换波段或重置标签过滤。
            </p>
            <button
              type="button"
              className="empty-terminal-reset-btn"
              onClick={handleClearFilters}
            >
              ✕ 一键重置所有过滤参数
            </button>
          </div>
        )}
      </main>

      {/* Quick-View Modal */}
      <QuickViewModal
        entry={activeModalEntry}
        onClose={() => setActiveModalEntry(null)}
        onTagClick={handleTagSelect}
        triggerElement={modalTriggerEl}
      />
    </div>
  );
}
