# Research & Technical Decisions: Entry Detail Metadata Card Panel (条目详情页独立元数据卡片面板)

**Branch**: `004-entry-metadata-panel` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

本文档记录条目详情页（`/entries/<slug>/`）界面重构过程中的关键技术调研、布局栅格推演与架构决策。

---

## 1. 桌面端居中正文与左侧外缘粘性面板布局方案 (Desktop Centered Layout)

### 需求与约束
- 居中正文卷宗（`article-content`）必须在页面视口中轴线上**严格水平居中**，保证黄金阅读行宽（65~75字符）与视觉平衡；
- 独立的元数据卡片面板（`entry-metadata-panel`，宽约 280px）在桌面宽屏（$\ge 1200\text{px}$）下放置于居中正文**左侧的外边缘空白区域**；
- 当访客滚动长文时，左侧元数据面板需具备顶部粘性跟随（`position: sticky`），且在元数据内容较多时具备安全内滚动，严禁溢出视口底部。

### 方案评估

| 方案 | 布局机制 | 居中精确性 | 复杂度与稳定性 | 结论 |
| :--- | :--- | :--- | :--- | :--- |
| **A. 三栏居中对称 CSS Grid (Center-Anchored Grid)** | `grid-template-columns: minmax(280px, 1fr) minmax(auto, 880px) minmax(280px, 1fr)` | **100% 严格居中**（中间列天然对齐中轴线） | 极高稳定性，无负外边距偏移风险 | **采用 (Selected)** |
| **B. 居中容器 + 负 Margin / 绝对定位挂靠** | `margin: 0 auto;` 容器左侧使用 `position: absolute` 或负 `margin-left` | 良好，但 1200px~1300px 边缘易产生遮挡或双滚动条 | 易产生视口计算边界抖动与溢出 bug | 否决 |
| **C. 非对称 Flexbox + 虚拟占位** | Flex 左右排列，右侧添加同等宽度的空 `div` 抵消偏心 | 居中依赖右侧空 DOM，DOM 结构冗余 | 存在无语义空节点与 SEO 噪音 | 否决 |

### 决策详情 (Decision)
选用 **方案 A：三栏居中对称 CSS Grid**。
- 容器结构：
  ```css
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
  }
  .article-main-track {
    grid-column: 2;
    width: 100%;
    max-width: 880px;
  }
  .article-right-wing-spacer {
    grid-column: 3;
    /* 保持对称空白，未来可扩展阅读目录 TOC，但保持当前中轴严格对称 */
  }
  ```
- **Rationale**: 确保正文卷宗在宽屏下永远处于屏幕物理正中心，左侧卡片贴合正文左边缘，右侧保留等宽外缘留白，视觉结构极其稳健。

---

## 2. 窄屏与移动端折叠抽屉卡片实现方案 (Mobile Accordion Strategy)

### 需求与约束
- 当视口宽度 $< 1200\text{px}$ 时，左侧外缘空白不足，页面自动切换为单栏流式排列；
- 元数据面板转为置于居中正文卷宗正上方的“手风琴折叠档案卡（Collapsible Dossier Accordion）”；
- 默认展示紧凑核心标牌（分类徽章、标本编号、时间戳），提供清晰的展开/收起触发器；
- 必须遵循数字花园宪法 I（静态优先），在客户端 JavaScript 禁用环境下 100% 保持可用。

### 方案评估

| 方案 | 技术形态 | JS 运行时开销 | 无脚本静态回退 | 无障碍可访问性 | 结论 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **A. 原生 HTML5 `<details>` + `<summary>` + 野兽派自定义样式** | 浏览器原生组件 | **0 KB (零运行时)** | **100% 原生可用** | 内置 WAI-ARIA 属性与键盘触发 | **采用 (Selected)** |
| **B. React 客户端 Island** | 引入 `useState` 管理开闭 | 引入 React 运行时 | 无脚本无法折叠展开 | 需额外编写焦点管理与 ARIA 属性 | 否决 (违背宪法 I) |
| **C. CSS Checkbox / `:target` Hack** | 隐藏 checkbox 或 hash 锚点 | 0 KB | 仅部分支持 | 读屏器支持欠佳，无法正常表述展开状态 | 否决 |

### 决策详情 (Decision)
选用 **方案 A：原生 HTML5 `<details>` + `<summary>`** 配合定制野兽派样式。
- 桌面端（$\ge 1200\text{px}$）通过 CSS 强制展开 (`display: block` 或 `<details open>`) 并隐藏折叠触发器；
- 窄屏端（$< 1200\text{px}$）通过 `<summary>` 自定义呈现“标本核心标牌 + 展开完整档案 ▾ / 收起 ▴”实体按钮；
- 展开内容区平滑展开标签矩阵、外部资源链接与双向关联图谱。

---

## 3. 组件拆分与职责划分 (Component Architecture)

### 需求与约束
- 遵循 Constitution IV（意图简单与清晰边界），不引入过度的细碎组件抽象；
- 将元数据面板的渲染逻辑从 `[slug].astro` 中有效解耦，保持长文正文与元数据档案逻辑边界清晰。

### 架构设计

```text
src/
├── components/
│   └── article/
│       └── EntryMetadataPanel.astro   # [NEW] 独立的元数据档案卡片组件（单张一体化卡片 + 移动端折叠）
├── pages/
│   └── entries/
│       └── [slug].astro               # [REFACTOR] 纯净居中正文组装、数据查询与三栏网格挂载
└── styles/
    └── article.css                    # [REFACTOR] 元数据面板、折叠卡、三栏栅格与正文排印样式
```

### 职责边界
1. **`[slug].astro`**：
   - 负责静态路由生成 `getStaticPaths`；
   - 负责条目数据 `getPublicEntry` 与关联图谱 `getEntryConnections` 获取；
   - 负责渲染纯正文容器 `.article-content`（标题、摘要导读与 Markdown `<Content />`）；
   - 负责引入并挂载 `<EntryMetadataPanel entry={entry} related={related} backlinks={backlinks} />`。
2. **`EntryMetadataPanel.astro`**：
   - 负责单张一体化工坊档案大卡的内部结构化分区（标本身份与时间 → 标签矩阵 → 外链资源 → 关联图谱）；
   - 负责动态隐去空数据分区（如无外链或无关联条目时自动隐藏）；
   - 负责移动端 `<details>`/`<summary>` 折叠形态的结构输出。
3. **`article.css`**：
   - 维护 `.article-workbench-grid` 桌面三栏居中与移动单栏流式响应式媒体查询；
   - 维护 `.entry-metadata-panel` 的俏皮野兽派视觉 token（纸品底色、粗墨边框、硬边阴影、虚线分区）；
   - 维护 `.prose` 纯正文排印样式与代码复制按钮布局。

---

## 4. 视觉 Token 与无障碍映射 (Design Token & Accessibility Mapping)

### 样式规则
- **底纸基调**：元数据卡片采用棉麻复古白卡底色 `--paper-cotton` (`#faf8f5`)，与主正文特种纸底色（`#fbf5e8` 辅以 24px 网格底纹）形成细腻的纸品层次分界。
- **边框与阴影**：
  - 卡片边框：`3px solid var(--black)`（桌面与移动折叠卡统一）；
  - 卡片阴影：`6px 6px 0 var(--black)`（无模糊、硬直角实色偏移阴影）；
  - 分区虚线：`1.5px dashed rgba(24, 24, 27, 0.25)`。
- **无障碍与交互保底**：
  - 外链与关联卡片项设置内边距与触控保底（$\ge 44\text{px} \times 44\text{px}$）；
  - 所有可聚焦链接与 `<summary>` 在 `:focus-visible` 下提供双层高对比度焦点环（`outline: 3px solid var(--black); box-shadow: 0 0 0 3px var(--teal);`）；
  - `@media (prefers-reduced-motion: reduce)` 下禁用所有位移 transition 与手风琴展开动效。
