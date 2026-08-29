# Responsive Layout Contract: Entry Detail Workbench Grid

**Feature**: `004-entry-metadata-panel`  
**Target Files**: `src/styles/article.css`, `src/pages/entries/[slug].astro`  
**Status**: Approved  

---

## 1. 断点与布局模式契约 (Breakpoints & Layout Modes)

| 视口范围 | 布局模式 | 左侧元数据面板形态 | 居中正文卷宗形态 |
| :--- | :--- | :--- | :--- |
| **$\ge 1200\text{px}$** (Desktop Widescreen) | **三栏居中对称 Grid** (`.article-workbench-grid`) | 停靠于左外边缘（`grid-column: 1`），具备 `position: sticky; top: 24px`，单张一体化大卡 | 严格对齐屏幕中轴线居中（`grid-column: 2`，最大宽度 880px） |
| **$< 1200\text{px}$** (Tablet & Mobile) | **单栏流式自适应** (`display: flex; flex-direction: column`) | 置于正文正上方，作为紧凑折叠手风琴卡片（`<details>`） | 居中展示，宽度自适应 100%（外层 padding clamp） |
| **$\le 480\text{px}$** (Small Mobile) | **紧凑单栏流** | 内边距收敛至 12px~16px，触控热区保底 $\ge 44\text{px}$ | 内边距收紧，文字软折行 |

---

## 2. 核心 CSS 布局规格契约 (Core CSS Specifications)

```css
/* 1. 全局容器外壳 */
.article-shell {
  background-color: var(--paper);
  background-image: radial-gradient(rgba(24, 24, 27, 0.08) 1px, transparent 1px);
  background-size: 20px 20px;
  padding: clamp(20px, 3vw, 40px) clamp(16px, 3vw, 48px) 72px;
  min-height: calc(100vh - 72px);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  width: 100%;
}

/* 2. 桌面宽屏三栏居中网格 */
@media (min-width: 1200px) {
  .article-workbench-grid {
    display: grid;
    grid-template-columns: minmax(260px, 1fr) minmax(auto, 880px) minmax(260px, 1fr);
    gap: 32px;
    width: 100%;
    max-width: 1560px;
    margin: 0 auto;
    align-items: start;
  }

  .article-left-wing {
    grid-column: 1;
    justify-self: end;
    width: 100%;
    max-width: 320px;
    position: sticky;
    top: 24px;
    max-height: calc(100vh - 48px);
    overflow-y: auto;
    /* 自定义工坊细滚动条 */
    scrollbar-width: thin;
    scrollbar-color: var(--black) var(--paper-dark);
  }

  .article-main-track {
    grid-column: 2;
    width: 100%;
    max-width: 880px;
  }

  .article-right-wing-spacer {
    grid-column: 3;
    pointer-events: none;
    visibility: hidden;
  }

  /* 桌面端强制展开手风琴，隐藏折叠指示器 */
  .dossier-accordion {
    pointer-events: auto;
  }
  .dossier-accordion > summary {
    cursor: default;
    pointer-events: none;
  }
  .dossier-accordion-indicator {
    display: none !important;
  }
}

/* 3. 窄屏与移动端单栏流式排列 */
@media (max-width: 1199px) {
  .article-workbench-grid {
    display: flex;
    flex-direction: column;
    width: 100%;
    max-width: 880px;
    margin: 0 auto;
    gap: 20px;
  }

  .article-left-wing {
    width: 100%;
    max-width: 100%;
    position: static;
    max-height: none;
    overflow: visible;
  }

  .article-main-track {
    width: 100%;
  }

  .article-right-wing-spacer {
    display: none;
  }

  /* 移动端手风琴折叠交互 */
  .dossier-accordion > summary {
    cursor: pointer;
    user-select: none;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .dossier-accordion-indicator {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }

  .dossier-accordion[open] .indicator-icon {
    transform: rotate(180deg);
  }
}
```

---

## 3. 页面无障碍与键盘焦点契约 (Accessibility Contract)

1. **DOM 树物理阅读顺序**：
   - 导航回退条 (`.article-breadcrumb-bar`) →
   - 桌面左翼/移动顶部元数据档案 (`.entry-metadata-panel`) →
   - 居中正文卷宗 (`.article-content`)。
2. **键盘 Tab 焦点顺序**：
   - 保证焦点自然从返回按钮遍历进入元数据面板各链接/标签，随后平滑流入正文内容与代码复制按钮。
3. **高对比度双层焦点轮廓**：
   - 所有可聚焦元素（外链、标签、手风琴 summary）`:focus-visible` 统一遵循：
     `outline: 3px solid var(--black); box-shadow: 0 0 0 3px var(--teal); outline-offset: 2px;`。
