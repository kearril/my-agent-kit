import React, { useMemo, useState } from 'react';
import type { TagCount } from '../../hooks/useGardenVocabulary';

export interface TagPickerProps {
  tags: string[];
  allTags: TagCount[];
  onChange: (newTags: string[]) => void;
  errorMessage?: string;
}

export function TagPicker({
  tags,
  allTags,
  onChange,
  errorMessage,
}: TagPickerProps) {
  const [inputVal, setInputVal] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const availableSuggestions = useMemo(() => {
    const query = inputVal.trim().toLowerCase();
    return allTags
      .filter((item) => !tags.includes(item.tag))
      .filter((item) => {
        if (!query) return true;
        return item.tag.toLowerCase().includes(query);
      })
      .slice(0, 8);
  }, [allTags, tags, inputVal]);

  const handleAdd = (tagToAdd: string) => {
    const trimmed = tagToAdd.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputVal('');
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="tag-picker-container">
      {tags.length > 0 && (
        <div className="tag-chips-wrapper">
          {tags.map((tag) => (
            <span key={tag} className="tag-chip-item">
              #{tag}
              <button
                type="button"
                className="tag-remove-x"
                onClick={() => handleRemove(tag)}
                aria-label={`移除标签 ${tag}`}
              >
                ✕
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="tag-input-with-autocomplete">
        <div style={{ display: 'flex', gap: '6px' }}>
          <input
            type="text"
            className="field-input-text"
            style={{ flex: 1 }}
            placeholder="输入标签 (如: AI, 开发)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAdd(inputVal);
              }
            }}
          />
          <button
            type="button"
            className="quick-today-btn"
            onClick={() => handleAdd(inputVal)}
          >
            + 添加
          </button>
        </div>

        {isFocused && availableSuggestions.length > 0 && (
          <ul className="tag-suggestions-dropdown" role="listbox">
            {availableSuggestions.map((item) => (
              <li
                key={item.tag}
                className="tag-suggestion-item"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleAdd(item.tag);
                }}
              >
                #{item.tag}{' '}
                <span style={{ color: 'var(--muted)', fontSize: '0.72rem' }}>
                  ({item.count} 篇)
                </span>
              </li>
            ))}
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
