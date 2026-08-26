# Technical Research & Architecture Decisions: Entry Card Quick-View Modal (条目卡片速览大弹窗)

**Feature**: `003-entry-preview-modal`  
**Date**: 2026-08-26  
**Status**: Completed  

---

## 1. Quick-View Modal 架构设计与 Island 边界 (Modal Architecture & Island Boundary)

### 决策 (Decision)
将速览大弹窗（Quick-View Modal）作为核心状态组件内置于已有的 `src/components/islands/ExploreIsland.tsx` React Island 中，同时提供全站自定义事件监听接口（`window.addEventListener('garden:open-entry-preview', ...)`）。
- **Explore 探索区**：卡片直接调用 React 内部的 `setActiveModalEntry(entry)`，实现 0 延迟即时展开。
- **Featured 精选收录区**：Astro 静态组件渲染带 `data-entry-preview` 的标本卡片，通过轻量级事件派发与 ExploreIsland 弹窗联动；若 ExploreIsland 挂载，派发自定义事件唤起统一弹窗；若无 JS，卡片作为标准超链接直接跳转。

### 理由 (Rationale)
1. **遵守 Constitution 第一原则（Static-First Astro & Island Boundaries）**：不引入新的全局 React 根容器，不将首页改成 SPA，继续复用 `ExploreIsland.tsx` 现有的客户端 Island 状态生命周期。
2. **零额外包体积与极简复用**：直接复用 `ExploreEntry` 结构体，无需向服务器发起额外 API 请求或加载冗余依赖。
3. **完美支持多板块卡片**：既满足 Explore 网格的原生状态驱动，又兼顾 Featured 静态卡片的事件派发与渐进增强。

### 被拒绝的替代方案 (Alternatives Considered)
- **方案 B：将整个首页重构为 React SPA**：违反 Constitution 原则 I，严重破坏首屏静态加载性能与 SEO。
- **方案 C：为每个卡片使用原生 HTML `<dialog>` 并在 Astro 中各自嵌入内联脚本**：难以统一管理焦点陷阱、Esc 事件与复杂手账纸卡动画，且会导致多个 `<dialog>` 实例分散在 DOM 各处造成样式与状态碎片化。

---

## 2. 卡片双触点交互与防误触机制 (Card Dual-Action & Event Propagation)

### 决策 (Decision)
重构条目卡片的 DOM 结构与点击层级，将原本整张包裹卡片的 `<a>` 标签解耦为**“卡片主体速览区”**与**“底栏右下角直达入口”**两层：
- **卡片主体**：在 React 中为可点击的卡片容器（`role="button"` 或带 `tabindex="0"` 的触发容器），绑定 `onClick` 打开弹窗；在静态 HTML 回退中保留外层 `href`。
- **底栏直达按钮**：独立子元素 `<a href={entry.canonicalUrl} className="specimen-direct-btn" onClick={(e) => e.stopPropagation()}>进入详情 <LucideExternalLink /></a>`，阻止事件冒泡到卡片主体，确保直接导航。

### 理由 (Rationale)
1. **防止交互冲突与误触**：明确区隔“卡片大面积速览”与“小面积直达详情”，用户点击卡片空白区或标题看弹窗，点击右下角按钮直接进详情。
2. **标准语义与新标签页支持**：底栏直达按钮保留真实的 `href` 属性，支持桌面端鼠标中键、右键“在新标签页打开”，符合 Web 规范与用户直觉。
3. **清晰的键盘导航**：`Tab` 键可先后聚焦“卡片主体（速览）”与“直达按钮（跳转）”，各自呈现独立的双层硬边 `focus-visible` 焦点环。

### 被拒绝的替代方案 (Alternatives Considered)
- **仅靠在 `<a>` 内部嵌套另一个 `<a>`**：HTML 标准严格禁止 `<a>` 内部嵌套 `<a>`（会导致浏览器 DOM 解析错乱）。
- **长按或悬停显示直达按钮**：在移动端或快速浏览时不可靠，增加用户认知负担。

---

## 3. 无障碍焦点陷阱、滚动锁定与退出机制 (Accessibility, Focus Trap & Scroll Lock)

### 决策 (Decision)
在 React 弹窗组件中实现严密的模态对话框无障碍生命周期（Accessible Modal Lifecycle）：
1. **DOM 属性**：弹窗容器标记 `role="dialog"`, `aria-modal="true"`, `aria-labelledby="modal-entry-title"`。
2. **焦点陷阱 (Focus Trap)**：
   - 弹窗唤起时，记录当前触发元素（`triggerElementRef.current = document.activeElement`）。
   - 自动聚焦弹窗内首个可聚焦元素（右上角关闭按钮）。
   - 监听 `KeyDown` 事件，拦截 `Tab` 与 `Shift+Tab`，使键盘焦点严格在弹窗内可聚焦元素之间循环，不泄露至底层背景。
3. **退出响应**：
   - 监听全局 `KeyDown`（`e.key === 'Escape'`），触发关闭。
   - 弹窗外层遮罩点击触发关闭。
   - 右上角关闭按钮触发关闭。
4. **焦点还原与滚动解锁 (Cleanup)**：
   - 弹窗打开时设置 `document.body.style.overflow = 'hidden'` 并添加安全 padding 防止布局抖动。
   - 弹窗关闭后，恢复 `document.body.style.overflow = ''`，并自动调用 `triggerElementRef.current?.focus()` 将焦点还原至触发卡片。

### 理由 (Rationale)
1. 符合 WAI-ARIA 1.2 对话框（Modal Dialog）权威规范。
2. 彻底杜绝页面穿透滚动、键盘焦点丢失在不可见背景等严重可用性问题。
3. 纯原生 TypeScript/React 实现，无需引入第三方模态库（如 `@radix-ui/react-dialog` 或 `react-modal`），保证 0 新增外部依赖。

---

## 4. 视口受控高度与内部滚动排版 (Viewport-Constrained Height & Internal Scrolling)

### 决策 (Decision)
弹窗采用三段式手账装订纸卡结构：
- **容器结构**：
  - `max-width: 720px`（桌面端黄金宽度），`width: 92vw`。
  - `max-height: 85vh`（视口高度受控）。
  - `display: flex; flex-direction: column;`。
- **固定头部 (Pinned Header)**：包含序号标本戳、分类类型徽章、标题与右上角关闭按钮（触控热区 $44\text{px} \times 44\text{px}$）。
- **滚动主体区 (Scrollable Body)**：`flex: 1; overflow-y: auto;`，采用温润工程浅色背景（`#fbf9f4` / `#f0eae1`）、舒适行高（1.75）、标签矩阵与完整摘要，消除破坏排版的横向溢出。
- **固定底部 (Pinned Footer)**：包含更新日期、标签摘要与突出的“前往条目详情页 / 查看全文 ↗”实体操作按钮。

### 理由 (Rationale)
1. 完美解决长内容撑破视口、移动端无法点击底部按钮的体验缺陷。
2. 头部关闭与底部跳转始终在视野范围内，无需来回滚动查找操作控件。
3. 符合 `docs/DESIGN.md` 复古手账工坊与俏皮野兽派设计语言（直角无圆角、粗墨边框、硬边实色阴影）。

---

## 5. 渐进增强与无脚本静态回退 (Progressive Enhancement & No-JS Fallback)

### 决策 (Decision)
- 在 Astro 服务端渲染（SSR / SSG）阶段，输出的静态 HTML 中卡片保留规范 `href="/entries/<slug>/"` 链接。
- `<noscript>` 标签中提供完全无脚本的静态标本网格（`ExploreFallback.astro` 与原生 `FeaturedSection.astro`）。
- 仅当客户端 JavaScript 成功解析执行后，水合为具有点击弹窗拦截的交互式卡片。

### 理由 (Rationale)
1. 保证搜索引擎蜘蛛（SEO）、无脚本环境或弱网环境下的 100% 内容可达性。
2. 满足 Constitution 原则 I 与核心质量要求。
