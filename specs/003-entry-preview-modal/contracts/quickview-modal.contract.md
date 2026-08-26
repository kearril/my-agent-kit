# UI & Interface Contract: Quick-View Modal (速览大弹窗契约)

**Feature**: `003-entry-preview-modal`  
**Contract Version**: 1.0.0  
**Status**: Ratified  

---

## 1. 组件接口规范 (Component Interface)

### 1.1 Props 接口

```typescript
export interface QuickViewModalProps {
  /** 当前激活展示的条目数据，为 null 时不渲染或处于隐藏态 */
  entry: QuickViewEntry | null;
  /** 关闭弹窗的回调函数 */
  onClose: () => void;
  /** 点击弹窗内标签的回调 (可选，用于联动外部筛选) */
  onTagClick?: (tag: string) => void;
}
```

### 1.2 全局事件协议 (Global Event Interface)

允许页面中任意静态卡片或外部模块无缝唤起速览大弹窗：

```typescript
// 唤起速览弹窗全局事件
export interface GardenOpenPreviewEventDetail {
  entry: QuickViewEntry;
  triggerElement?: HTMLElement;
}

// 派发方式 (Astro / Vanilla JS)
window.dispatchEvent(
  new CustomEvent<GardenOpenPreviewEventDetail>('garden:open-entry-preview', {
    detail: { entry, triggerElement: buttonEl }
  })
);
```

---

## 2. DOM 结构与无障碍属性契约 (DOM & ARIA Roles)

```html
<!-- 弹窗遮罩层 -->
<div 
  class="quickview-modal-backdrop" 
  aria-hidden="false"
>
  <!-- 卷宗卡片容器 -->
  <div 
    class="quickview-dossier-card quickview-dossier-card--{entry.type}" 
    role="dialog" 
    aria-modal="true" 
    aria-labelledby="dossier-title"
    tabindex="-1"
  >
    <!-- 1. 顶梁夹具栏 (Pinned Header) -->
    <div class="dossier-top-clamp">
      <div class="dossier-clamp-left">
        <span class="dossier-metal-rivet" aria-hidden="true"></span>
        <span class="dossier-serial-seal">DOSSIER // {entry.type.toUpperCase()}</span>
        <span class="mini-badge mini-badge--{entry.type}">{entry.type.toUpperCase()}</span>
      </div>
      <button 
        type="button" 
        class="dossier-close-btn" 
        aria-label="关闭速览卷宗"
      >
        <svg><!-- Lucide X SVG (2.5px stroke) --></svg>
      </button>
    </div>

    <!-- 2. 纵向滚动内容主体 (Scrollable Body) -->
    <div class="dossier-body-scroll">
      <!-- 标题与元数据 -->
      <div class="dossier-header-section">
        <h2 id="dossier-title" class="dossier-title">{entry.title}</h2>
        <div class="dossier-meta-strip">
          <span>UPDATED: {entry.updatedAt}</span>
          <span>/</span>
          <span>SLUG: {entry.slug}</span>
        </div>
      </div>
      
      <!-- 核心提要便签 -->
      {entry.summary && (
        <div class="dossier-digest-card">
          <div class="dossier-section-heading"><span>[ SPECIMEN DIGEST // 核心提要 ]</span></div>
          <p class="dossier-digest-text">{entry.summary}</p>
        </div>
      )}

      <!-- 外部直达资源甲板 -->
      {entry.links && entry.links.length > 0 && (
        <div class="dossier-links-card">
          <div class="dossier-section-heading"><span>[ EXTERNAL ACCESS // 外部直达资源 ]</span></div>
          <div class="dossier-links-list">
            {entry.links.map(link => (
              <a href={link.url} target="_blank" rel="noopener noreferrer" class="dossier-external-link-btn">
                <span>{link.label}</span>
              </a>
            ))}
          </div>
        </div>
      )}

      <!-- Markdown 正文与指令消费区 (带一键复制按钮) -->
      <div class="dossier-prose-card">
        <div class="dossier-section-heading"><span>[ FULL ARTIFACT & INSTRUCTIONS // 完整正文与指令 ]</span></div>
        <div class="dossier-prose-content">{renderedMarkdownHtml}</div>
      </div>
    </div>

    <!-- 3. 固定底部操作栏 (Pinned Footer) -->
    <div class="dossier-footer-deck">
      <div class="dossier-footer-tags">
        <div class="dossier-tags-matrix">
          {entry.tags.map(tag => (
            <button type="button" class="dossier-tag-chip">#{tag}</button>
          ))}
        </div>
      </div>
      <div class="dossier-footer-actions">
        <a 
          href="{entry.canonicalUrl}" 
          class="dossier-full-page-btn"
          aria-label="前往 {entry.title} 完整档案册"
        >
          <span>前往完整档案册</span>
          <svg><!-- Lucide ArrowUpRight --></svg>
        </a>
      </div>
    </div>
  </div>
</div>
---

## 3. 视觉与交互契约 (Styling & Interaction Contract)

| 属性 | 规格契约 | 规则要求 |
|---|---|---|
| **边框与圆角** | `border: 4px solid var(--black); border-radius: 0;` | 严格禁止圆角 |
| **背景底色** | 主容器 `var(--paper)` (`#fbf9f4`)，摘要盒 `var(--paper-cotton)` (`#f0eae1`) | 温润纸品，杜绝眩光 |
| **阴影规范** | `box-shadow: 8px 8px 0 var(--black);` | 实色硬边，严禁模糊阴影 |
| **尺寸限制** | 桌面端 `max-width: 720px; max-height: 85vh;`，移动端 `width: 92vw;` | 视口受控，自适应居中 |
| **触控热区** | 关闭按钮、底栏跳转按钮 $\ge 44\text{px} \times 44\text{px}$ | 符合 WCAG 2.2 触控标准 |
| **滚动条样式** | 内部主体采用精细黑线硬边滚动条（`scrollbar-width: thin`） | 消除破坏排版的横向滚动条 |
| **弱动效适配** | `@media (prefers-reduced-motion: reduce)` 下禁用缩放与弹跳动画 | 仅进行纯透明度平滑显隐 |
