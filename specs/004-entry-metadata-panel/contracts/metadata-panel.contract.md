# Component Contract: EntryMetadataPanel.astro

**Feature**: `004-entry-metadata-panel`  
**Target File**: `src/components/article/EntryMetadataPanel.astro`  
**Status**: Approved  

---

## 1. 组件接口规范 (Component Props Interface)

```typescript
import type { CollectionEntry } from 'astro:content';

export interface Props {
  /** 当前展示的条目实体 */
  entry: CollectionEntry<'entries'>;
  /** 由内容图谱计算出的双向关联条目集合 */
  related: CollectionEntry<'entries'>[];
  /** 由反向引用图谱计算出的被引用条目集合 */
  backlinks: CollectionEntry<'entries'>[];
}
```

---

## 2. DOM 语义化结构契约 (DOM Structure Contract)

```html
<aside class="entry-metadata-panel" aria-label="标本档案与元数据">
  <details class="dossier-accordion" open>
    <!-- 移动端折叠头部 / 桌面端一体化大卡顶部标牌 -->
    <summary class="dossier-summary">
      <div class="dossier-badge-cluster">
        <span class="mini-badge mini-badge--{entry.data.type}">
          {entry.data.type.toUpperCase()}
        </span>
        {entry.data.type === 'note' && entry.data.category && (
          <span class="dossier-category-badge">VOL // {entry.data.category}</span>
        )}
        <span class="dossier-specimen-id">ID // {entry.id}</span>
      </div>
      <div class="dossier-accordion-indicator" aria-hidden="true">
        <span class="indicator-label">档案明细</span>
        <svg class="indicator-icon" ...><!-- ChevronDown --></svg>
      </div>
    </summary>

    <!-- 卡片主体内容区 -->
    <div class="dossier-body">
      <!-- 分区 1：时序戳记 -->
      <div class="dossier-section dossier-section--dates">
        {entry.data.publishedAt && (
          <div class="dossier-meta-item">
            <svg ...><!-- Calendar --></svg>
            <span class="meta-label">首次收录:</span>
            <time datetime="{entry.data.publishedAt.toISOString()}">
              {formatDate(entry.data.publishedAt)}
            </time>
          </div>
        )}
        <div class="dossier-meta-item">
          <svg ...><!-- Clock --></svg>
          <span class="meta-label">最近修订:</span>
          <time datetime="{entry.data.updatedAt.toISOString()}">
            {formatDate(entry.data.updatedAt)}
          </time>
        </div>
      </div>

      <!-- 分区 2：标签主题矩阵 (若存在) -->
      {entry.data.tags && entry.data.tags.length > 0 && (
        <div class="dossier-section dossier-section--tags">
          <div class="dossier-section-title">
            <svg ...><!-- Tag --></svg>
            <span>标本标签矩阵</span>
          </div>
          <div class="dossier-tags-matrix">
            {entry.data.tags.map(tag => (
              <a class="dossier-tag-chip" href={`/?tag=${encodeURIComponent(tag)}`}>
                <span>#{tag}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <!-- 分区 3：外部直达资源 (若存在) -->
      {entry.data.links && entry.data.links.length > 0 && (
        <div class="dossier-section dossier-section--links">
          <div class="dossier-section-title">
            <svg ...><!-- Link --></svg>
            <span>外部直达资源</span>
          </div>
          <ul class="dossier-link-list">
            {entry.data.links.map(link => (
              <li>
                <a href={link.url} target="_blank" rel="noopener noreferrer" class="dossier-link-item">
                  <span class="dossier-link-label">{link.label}</span>
                  <svg ...><!-- ExternalLink --></svg>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <!-- 分区 4：双向知识网络与反向引用 (若存在) -->
      {(related.length > 0 || backlinks.length > 0) && (
        <div class="dossier-section dossier-section--graph">
          <div class="dossier-section-title">
            <svg ...><!-- Layers --></svg>
            <span>知识图谱关联</span>
          </div>
          
          {related.length > 0 && (
            <div class="dossier-graph-group">
              <span class="dossier-graph-subtitle">双向关联 (Related)</span>
              <ul class="dossier-graph-list">
                {related.map(item => (
                  <li>
                    <a href={getEntryPath(item)} class="dossier-graph-item">
                      <span class={`mini-badge mini-badge--${item.data.type}`}>
                        {item.data.type.toUpperCase()}
                      </span>
                      <span class="dossier-graph-title">{item.data.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {backlinks.length > 0 && (
            <div class="dossier-graph-group">
              <span class="dossier-graph-subtitle">反向引用 (Backlinks)</span>
              <ul class="dossier-graph-list">
                {backlinks.map(item => (
                  <li>
                    <a href={getEntryPath(item)} class="dossier-graph-item">
                      <span class={`mini-badge mini-badge--${item.data.type}`}>
                        {item.data.type.toUpperCase()}
                      </span>
                      <span class="dossier-graph-title">{item.data.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  </details>
</aside>
```

---

## 3. 样式类名契约 (CSS Class Contract)

| 类名 | 作用与职责 |
| :--- | :--- |
| `.entry-metadata-panel` | 侧边独立面板外层容器，负责尺寸、粘性定位与阴影边界 |
| `.dossier-accordion` | `<details>` 原生折叠根容器，在桌面端保持展开并移除折叠手势 |
| `.dossier-summary` | `<summary>` 标牌栏，桌面端作为大卡头部，移动端作为点击折叠栏 |
| `.dossier-badge-cluster` | 包含类型徽章、分类卷号与标本编号的水平胶囊组 |
| `.dossier-accordion-indicator` | 移动端折叠指示按钮（展开 ▾ / 收起 ▴），桌面端隐藏 |
| `.dossier-body` | 卡片内容容器，包含全部元数据分区 |
| `.dossier-section` | 功能分区容器，底部具备 `1.5px dashed rgba(24, 24, 27, 0.25)` 虚线分隔 |
| `.dossier-section-title` | 分区标题，包含统一 2.5px 粗线 SVG 图标与加粗大写字体 |
| `.dossier-tag-chip` | 标签胶囊链接，具备 `:hover` 按压与 `:focus-visible` 焦点环 |
| `.dossier-link-item` | 外部资源直达超链接，具备外链小箭头与安全属性 |
| `.dossier-graph-item` | 知识图谱关联条目微型卡片，展示类型徽章与条目标题 |
