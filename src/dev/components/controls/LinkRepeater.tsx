import React from 'react';

export interface LinkItem {
  label: string;
  url: string;
}

export interface LinkRepeaterProps {
  links: LinkItem[];
  onChange: (newLinks: LinkItem[]) => void;
  errorMessage?: string;
}

const COMMON_LINK_PRESETS = ['官方仓库', '在线演示', '参考文档', '协议规范'];

export function LinkRepeater({
  links,
  onChange,
  errorMessage,
}: LinkRepeaterProps) {
  const handleUpdate = (index: number, key: keyof LinkItem, val: string) => {
    const nextLinks = [...links];
    nextLinks[index] = { ...nextLinks[index], [key]: val };
    onChange(nextLinks);
  };

  const handleRemove = (index: number) => {
    onChange(links.filter((_, i) => i !== index));
  };

  const handleAdd = (labelPreset = '') => {
    onChange([...links, { label: labelPreset, url: '' }]);
  };

  return (
    <div className="link-repeater-list">
      {links.map((link, idx) => (
        <div key={idx} className="link-item-row">
          <input
            type="text"
            placeholder="链接名称 (如: 官方仓库)"
            value={link.label}
            onChange={(e) => handleUpdate(idx, 'label', e.target.value)}
            aria-label={`链接 ${idx + 1} 标签`}
          />
          <input
            type="url"
            placeholder="https://..."
            value={link.url}
            onChange={(e) => handleUpdate(idx, 'url', e.target.value)}
            aria-label={`链接 ${idx + 1} 地址`}
          />
          <button
            type="button"
            className="link-delete-icon-btn"
            onClick={() => handleRemove(idx)}
            title="删除此链接"
          >
            ✕
          </button>
        </div>
      ))}

      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="link-add-small-btn"
          onClick={() => handleAdd('')}
        >
          + 添加外部链接
        </button>
        <span style={{ fontSize: '0.72rem', color: 'var(--muted)', fontWeight: 700 }}>
          快速模版:
        </span>
        {COMMON_LINK_PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            className="quick-today-btn"
            onClick={() => handleAdd(preset)}
          >
            {preset}
          </button>
        ))}
      </div>

      {errorMessage && (
        <div style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 800 }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
}
