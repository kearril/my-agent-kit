import React from 'react';
import {
  ENTRY_TYPES,
  ENTRY_TYPE_DEFINITIONS,
  slugRegex,
  type EntryType,
} from '../../lib/entry-data';
import type { GardenVocabulary } from '../hooks/useGardenVocabulary';
import { TagPicker } from './controls/TagPicker';
import { LinkRepeater } from './controls/LinkRepeater';
import { RelatedPicker } from './controls/RelatedPicker';

export interface EntryFormState {
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
  publishedAt: string;
  initialPublishedAt?: string;
  updatedAt: string;
  featuredOrder: string;
  typeFields: Record<string, unknown>;
  body: string;
  extension: string;
  isLocal: boolean;
  revision: string;
}

export interface CompactHeaderProps {
  formData: EntryFormState;
  mode: 'create' | 'edit' | 'idle';
  fieldErrors: Record<string, string>;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onUpdateForm: (patch: Partial<EntryFormState>) => void;
  vocabulary: GardenVocabulary;
  onQuickToday: (field: 'updatedAt' | 'publishedAt' | 'createdAt') => void;
  onTypeChange: (newType: EntryType) => void;
}

export function CompactHeader({
  formData,
  mode,
  fieldErrors,
  collapsed,
  onToggleCollapsed,
  onUpdateForm,
  vocabulary,
  onQuickToday,
  onTypeChange,
}: CompactHeaderProps) {
  const isCreate = mode === 'create';
  const typeDef = ENTRY_TYPE_DEFINITIONS[formData.type];

  return (
    <div className="compact-header">
      {/* Primary Row: Essential editing fields */}
      <div className="compact-primary-row">
        <input
          type="text"
          className="compact-title-input"
          placeholder="输入条目标题 (必填)..."
          value={formData.title}
          onChange={(e) => onUpdateForm({ title: e.target.value })}
          required
        />

        {isCreate ? (
          <select
            className="compact-slug-badge"
            style={{ background: 'var(--white)', cursor: 'pointer' }}
            value={formData.type}
            onChange={(e) => onTypeChange(e.target.value as EntryType)}
          >
            {ENTRY_TYPES.map((t) => (
              <option key={t} value={t}>
                {ENTRY_TYPE_DEFINITIONS[t].label} ({t})
              </option>
            ))}
          </select>
        ) : (
          <span className={`badge badge-${formData.type}`}>
            {typeDef?.label || formData.type}
          </span>
        )}

        {isCreate ? (
          <input
            type="text"
            className="compact-slug-input"
            placeholder="kebab-case-slug"
            value={formData.slug}
            onChange={(e) =>
              onUpdateForm({ slug: e.target.value.toLowerCase() })
            }
          />
        ) : (
          <span className="compact-slug-badge" title="Slug公开路径（不可变）">
            /{formData.slug}
          </span>
        )}

        <label
          className={`compact-draft-toggle ${formData.draft ? 'is-draft' : ''}`}
          title="草稿不会公开显示"
        >
          <input
            type="checkbox"
            checked={formData.draft}
            onChange={(e) => onUpdateForm({ draft: e.target.checked })}
          />
          <span>{formData.draft ? '草稿' : '已发布'}</span>
        </label>

        <button
          type="button"
          className="compact-expand-btn"
          onClick={onToggleCollapsed}
          aria-expanded={!collapsed}
          title={collapsed ? '展开摘要、标签、分类与外部链接' : '收起高级属性'}
        >
          {collapsed ? '▼ 展开属性' : '▲ 收起属性'}
        </button>
      </div>

      {fieldErrors.title && (
        <div style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 900, padding: '0 14px 4px' }}>
          {fieldErrors.title}
        </div>
      )}
      {isCreate && formData.slug && !slugRegex.test(formData.slug) && (
        <div style={{ color: 'var(--red)', fontSize: '0.75rem', fontWeight: 900, padding: '0 14px 4px' }}>
          Slug 必须为小写 kebab-case 格式（例如 my-note）
        </div>
      )}

      {/* Collapsible Drawer: Secondary metadata */}
      {!collapsed && (
        <div className="compact-drawer">
          {/* Summary */}
          <div className="field-group field-group--full">
            <label className="field-label">
              <span>简短摘要 (Summary)</span>
              {fieldErrors.summary && (
                <span style={{ color: 'var(--red)' }}>{fieldErrors.summary}</span>
              )}
            </label>
            <input
              type="text"
              className="field-input-text"
              placeholder="用于卡片展示与列表的简短说明..."
              value={formData.summary}
              onChange={(e) => onUpdateForm({ summary: e.target.value })}
            />
          </div>

          {/* Note Category (if Note) */}
          {formData.type === 'note' && (
            <div className="field-group">
              <label className="field-label">
                <span>Note 主分类 (Category) *</span>
                {fieldErrors.category && (
                  <span style={{ color: 'var(--red)' }}>{fieldErrors.category}</span>
                )}
              </label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  className="field-input-text"
                  style={{ flex: 1 }}
                  placeholder="如: AI, 实践, 架构, 随笔"
                  value={String(formData.typeFields.category || '')}
                  onChange={(e) =>
                    onUpdateForm({
                      typeFields: {
                        ...formData.typeFields,
                        category: e.target.value,
                      },
                    })
                  }
                />
              </div>
              {vocabulary.allCategories.length > 0 && (
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap', marginTop: '2px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>已有分类:</span>
                  {vocabulary.allCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className="quick-today-btn"
                      style={{ padding: '1px 5px', fontSize: '0.7rem' }}
                      onClick={() =>
                        onUpdateForm({
                          typeFields: {
                            ...formData.typeFields,
                            category: cat,
                          },
                        })
                      }
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          <div className="field-group field-group--full">
            <label className="field-label">
              <span>标签 (Tags)</span>
              {fieldErrors.tags && (
                <span style={{ color: 'var(--red)' }}>{fieldErrors.tags}</span>
              )}
            </label>
            <TagPicker
              tags={formData.tags}
              allTags={vocabulary.allTags}
              onChange={(tags) => onUpdateForm({ tags })}
              errorMessage={fieldErrors.tags}
            />
          </div>

          {/* Dates & Featured */}
          <div className="field-group">
            <label className="field-label">更新日期 (Updated)</label>
            <div className="field-input-row">
              <input
                type="date"
                className="field-input-text"
                value={formData.updatedAt}
                onChange={(e) => onUpdateForm({ updatedAt: e.target.value })}
              />
              <button
                type="button"
                className="quick-today-btn"
                onClick={() => onQuickToday('updatedAt')}
              >
                今天
              </button>
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">发布日期 (Published)</label>
            <div className="field-input-row">
              {formData.initialPublishedAt ? (
                <input
                  type="date"
                  className="field-input-text"
                  value={formData.publishedAt}
                  disabled
                  title="发布日期一经设定不可修改"
                />
              ) : formData.draft ? (
                <input
                  type="text"
                  className="field-input-text"
                  value="草稿状态（发布时填写）"
                  disabled
                />
              ) : (
                <>
                  <input
                    type="date"
                    className="field-input-text"
                    value={formData.publishedAt}
                    onChange={(e) => onUpdateForm({ publishedAt: e.target.value })}
                  />
                  <button
                    type="button"
                    className="quick-today-btn"
                    onClick={() => onQuickToday('publishedAt')}
                  >
                    今天
                  </button>
                </>
              )}
            </div>
          </div>

          <div className="field-group">
            <label className="field-label">精选序号 (Featured 1-6)</label>
            <input
              type="number"
              min="1"
              max="6"
              className="field-input-text"
              placeholder="留空则不进入精选"
              value={formData.featuredOrder}
              onChange={(e) => onUpdateForm({ featuredOrder: e.target.value })}
            />
          </div>

          {/* External Links */}
          <div className="field-group field-group--full">
            <label className="field-label">外部资产与链接 (Links)</label>
            <LinkRepeater
              links={formData.links}
              onChange={(links) => onUpdateForm({ links })}
              errorMessage={fieldErrors.links}
            />
          </div>

          {/* Related Entries */}
          <div className="field-group field-group--full">
            <label className="field-label">关联条目 (Related Connections)</label>
            <RelatedPicker
              related={formData.related}
              currentSlug={formData.slug}
              slugMap={vocabulary.entrySlugMap}
              onChange={(related) => onUpdateForm({ related })}
              errorMessage={fieldErrors.related}
            />
          </div>
        </div>
      )}
    </div>
  );
}
