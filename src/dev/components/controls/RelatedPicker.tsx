import React, { useMemo, useState } from 'react';
import type { EntryType } from '../../../lib/entry-data';

export interface RelatedPickerProps {
  related: string[];
  currentSlug: string;
  slugMap: Map<string, { title: string; type: EntryType }>;
  onChange: (newRelated: string[]) => void;
  errorMessage?: string;
}

export function RelatedPicker({
  related,
  currentSlug,
  slugMap,
  onChange,
  errorMessage,
}: RelatedPickerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const availableEntries = useMemo(() => {
    const list: Array<{ slug: string; title: string; type: EntryType }> = [];
    for (const [slug, meta] of slugMap.entries()) {
      if (slug !== currentSlug) {
        list.push({ slug, title: meta.title, type: meta.type });
      }
    }

    if (!searchQuery.trim()) {
      return list.slice(0, 10);
    }
    const q = searchQuery.toLowerCase().trim();
    return list
      .filter((e) => e.title.toLowerCase().includes(q) || e.slug.toLowerCase().includes(q))
      .slice(0, 10);
  }, [slugMap, currentSlug, searchQuery]);

  const handleToggle = (slug: string) => {
    if (related.includes(slug)) {
      onChange(related.filter((s) => s !== slug));
    } else {
      onChange([...related, slug]);
    }
  };

  return (
    <div className="tag-picker-container">
      {related.length > 0 && (
        <div className="tag-chips-wrapper">
          {related.map((slug) => {
            const meta = slugMap.get(slug);
            const label = meta ? `${meta.title} (${slug})` : slug;
            return (
              <span key={slug} className="tag-chip-item" style={{ background: 'var(--board-kraft)' }}>
                ◈ {label}
                <button
                  type="button"
                  className="tag-remove-x"
                  onClick={() => handleToggle(slug)}
                  aria-label={`移除关联 ${slug}`}
                >
                  ✕
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="tag-input-with-autocomplete">
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            className="field-input-text"
            style={{ flex: 1 }}
            placeholder="搜索要关联的条目标题或 Slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          />
          <button
            type="button"
            className="quick-today-btn"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? '收起列表' : '浏览条目'}
          </button>
        </div>

        {isOpen && availableEntries.length > 0 && (
          <ul className="tag-suggestions-dropdown" role="listbox">
            {availableEntries.map((item) => {
              const isChecked = related.includes(item.slug);
              return (
                <li
                  key={item.slug}
                  className="tag-suggestion-item"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: isChecked ? 'var(--paper-butter)' : undefined,
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleToggle(item.slug);
                  }}
                >
                  <span>
                    <strong>[{item.type}]</strong> {item.title}{' '}
                    <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                      ({item.slug})
                    </span>
                  </span>
                  <span>{isChecked ? '✓ 已选' : '+ 选择'}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {errorMessage && (
        <div style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 800 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
