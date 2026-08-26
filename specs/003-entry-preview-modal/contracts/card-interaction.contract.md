# UI & Interaction Contract: Entry Specimen Card (条目标本卡片双触点契约)

**Feature**: `003-entry-preview-modal`  
**Contract Version**: 1.0.0  
**Status**: Ratified  

---

## 1. 卡片双触点布局规范 (Dual-Action Card Layout)

标本卡片采用直角手账卡片结构，明确划分为“主体速览区”与“底栏直达区”：

```html
<!-- 条目标本卡片容器 (React Island / Explore 场景) -->
<div 
  class="explore-specimen-card explore-specimen-card--{entry.type}" 
  role="button"
  tabindex="0"
  aria-label="速览条目: {entry.title}"
  data-slug="{entry.slug}"
>
  <!-- 卡片头部栏 -->
  <div class="card-top-row">
    <span class="specimen-seq-tag">NO. {itemNum}</span>
    <span class="mini-badge mini-badge--{entry.type}">{entry.type.toUpperCase()}</span>
  </div>

  <!-- 卡片标题与摘要 -->
  <h3 class="card-title">{entry.title}</h3>
  <p class="card-summary">{entry.summary}</p>

  <!-- 卡片标签集 -->
  {entry.tags.length > 0 && (
    <div class="card-tags-list">
      {entry.tags.map(tag => (
        <span class="specimen-pill-tag">#{tag}</span>
      ))}
    </div>
  )}

  <!-- 卡片底栏 (区隔为日期元数据与右下角直达按钮) -->
  <div class="card-footer-row">
    <time datetime="{entry.updatedAt}" class="card-date-label">
      {entry.updatedAt}
    </time>
    
    <!-- 专属直达详情页实体按钮 -->
    <a 
      href="{entry.canonicalUrl}" 
      class="specimen-direct-btn"
      aria-label="直接进入 {entry.title} 详情页"
    >
      <span>进入详情</span>
      <svg class="direct-btn-icon"><!-- Lucide ArrowUpRight SVG --></svg>
    </a>
  </div>
</div>
```

---

## 2. 事件分发与防冒泡规则 (Event Propagation Rules)

| 操作行为 | 触发目标 | 事件处理逻辑 | 预期响应 |
|---|---|---|---|
| **点击卡片主体** | `.explore-specimen-card` / `.specimen-card` | `handleCardClick(entry)` | 原地唤起 `QuickViewModal`，不触发页面跳转 |
| **点击底栏直达按钮** | `.specimen-direct-btn` | `e.stopPropagation()` | 阻止事件向上冒泡至卡片主体，直接导航至 `/entries/<slug>/` |
| **右键 / 中键点击直达按钮** | `.specimen-direct-btn` | 浏览器默认行为 | 在新标签页或窗口中打开 `/entries/<slug>/` |
| **卡片键盘回车/空格** | `.explore-specimen-card` (`KeyDown Enter/Space`) | `handleCardKeyDown(e)` | 原地唤起 `QuickViewModal` |
| **直达按钮键盘回车** | `.specimen-direct-btn` | 标准链接激活 | 直接导航至详情页 |

---

## 3. 静态渐进增强与无 JS 回退契约 (Progressive Enhancement Fallback)

在 Astro 服务端渲染生成的静态 HTML 或 `<noscript>` 回退中：
- 静态卡片整体保持为外层 `<a href="{canonicalUrl}" class="specimen-card">` 形式。
- 底栏展示普通文本提示或装饰箭头，确保无 JS 时访客点击卡片任意区域均能 100% 访问详情页。
- 客户端水合激活后，将卡片主体劫持为弹窗速览触发器，底栏按钮维持直达能力。

---

## 4. 视觉设计与交互反馈 (Styling & Visual Feedback)

```css
/* 专属直达按钮基础样式 (俏皮野兽派手作微按钮) */
.specimen-direct-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  font-size: 0.82rem;
  font-weight: 800;
  color: var(--black);
  background: var(--paper-cotton);
  border: 2px solid var(--black);
  box-shadow: 2px 2px 0 var(--black);
  text-decoration: none;
  cursor: pointer;
  min-height: 44px; /* 触控热区保底 */
  transition: transform 120ms ease, box-shadow 120ms ease, background-color 120ms ease;
}

.specimen-direct-btn:hover {
  background: var(--yellow);
  transform: translate(-1.5px, -1.5px);
  box-shadow: 3.5px 3.5px 0 var(--black);
}

.specimen-direct-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0 var(--black);
}

.specimen-direct-btn:focus-visible {
  outline: 3px solid var(--black);
  outline-offset: 2px;
}
```
