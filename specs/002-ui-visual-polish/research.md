# Research & Architecture Decisions: UI Visual Polish & Reading Comfort

**Feature**: `002-ui-visual-polish`  
**Date**: 2026-08-26  
**Status**: Completed

---

## 1. Long-Form Reading Typography & Binder Layout (长文排版与装订册布局)

### Context & Problem
数字化花园中的条目（Prompt、Skill、MCP、Website、Project 和 Note）包含大量技术长文、配置代码与系统提示词。当前文章页虽然具备基础样式，但在大屏显示器（2K/4K）与移动端阅读时，行宽过长或行高过紧容易造成阅读疲劳，视觉缺乏手账工坊的装订册实体感。

### Decision
1. **长文装订册容器（Reading Binder Container）**：
   - 设定整体容器最大宽度为 `960px`，正文阅读核心段落最大宽度约束在约 `720px`（约 `65~75` 字符黄金行宽），水平居中排布；
   - 底色采用护眼温润的和纸米白底色（`#fbf9f4` / `--paper`），内嵌 `24px × 24px` 的微透浅墨方格网底纹（`rgba(24, 24, 27, 0.04)`）；
   - 外框采用 `3.5px solid var(--black)` 纯黑墨线，搭配 `8px 8px 0 var(--black)` 硬边实色偏移阴影。
2. **排印节奏（Typographic Rhythm）**：
   - 正文字体行高设定为 `1.8`（`line-height: 1.8`），段落间距为 `1.75em`，中英文混排使用标准空格与字间距；
   - 二级标题 `<h2>` 与三级标题 `<h3>` 采用硬直角单侧墨线装饰与大写等宽字体，标题上方预留充足的 `2.5rem` 呼吸留白。
3. **摘要档案盒（Summary Box）与提示盒（Callouts）**：
   - 文章头部摘要采用手账牛皮纸底色（`--board-kraft` / `#e6e0d4`）、左侧粗黑标尺（`6px solid var(--black)`）与印章戳记；
   - 引用与提示块针对 Tip（提示）、Warning（注意）、Note（随笔）分别应用奶油黄（`--paper-butter`）、肉桂粉（`--paper-cinnamon`）与鼠尾草绿（`--paper-sage`）纸品底色。

### Alternatives Considered
- *全宽流式排版（Full-width fluid layout）*：被拒绝。在宽屏下每行文字超过 120 个字符，视线折返极易丢失行首，严重破坏阅读舒适度。
- *无纸张质感的极简白底*：被拒绝。违背 `docs/DESIGN.md` 中复古手账工坊的核心美学原则。

---

## 2. Engineering Paper Code & Prompt Blocks (特种浅色工程纸代码/提示词块)

### Context & Problem
传统的深黑（`#18181b` / `#27272a`）代码块在浅色手账纸品背景上对比度过于刺目突兀，且代码超出边界时常出现横向滚动条，打断阅读连贯性。

### Decision
1. **纸品底色与墨线边框**：
   - 采用 `#f0eae1`（浅色特种工程纸品底色）与深墨色文字（`var(--dark)` / `#27272a`）；
   - 边框为 `2.5px solid var(--black)`，硬边阴影为 `4px 4px 0 var(--black)`。
2. **智能软折行**：
   - 全局设置 `white-space: pre-wrap; word-break: break-word;`，消除破坏版面美感的横向滚动条，让代码、配置与长提示词像印在工程纸页上一样舒适。
3. **右上角一键复制控件与反馈**：
   - 44px 舒适触控热区，常态显示 Lucide `Copy` 图标；
   - 点击后即时写入剪贴板，100ms 内平滑替换为 Lucide `Check` 图标并展示复古印章提示 `COPIED!`，1.5 秒后自动恢复。

### Alternatives Considered
- *深色暗黑代码高亮（Dark Highlighting）*：被拒绝。强烈的明暗反差会破坏长时间阅读的舒适度，且与手账工坊纸品基调脱节。
- *强制横向滚动（No-wrap with horizontal scroll）*：被拒绝。移动端与小卡片中极难单手滚动且容易误触发页面滑动手势。

---

## 3. Tactile Physical Button & Card System (实体物理按压体系与便签微动效)

### Context & Problem
需要统一全站所有按钮、卡片、标签和链接的物理交互反馈，让访客在每一次悬停、点击和键盘导航时都能感受到如同拨动实体机械按键与翻阅手账卡片的真实触感。

### Decision
1. **三态物理按压（Hover / Active / Focus）**：
   - **Hover**：`transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--black);`（按钮/卡片轻微上浮，阴影外扩）；
   - **Active**：`transform: translate(3px, 3px); box-shadow: 0 0 0 var(--black);`（如同物理微动按键被深压触发）；
   - **Focus-visible**：`outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal);`（高对比度双层硬边焦点环，无障碍首选）。
2. **手账便签卡片悬停归正（Playful Straighten-up）**：
   - 便签卡片在网格中默认带有轻微手作倾斜（如 `rotate(-1.5deg)` 或 `rotate(1.2deg)`）；
   - 鼠标悬停时平滑过渡至 `rotate(0deg)` 并配合硬阴影延展，动效时长 `0.18s ease-out`，无回弹、不引发布局重排。
3. **动效减弱适配（Reduced Motion Support）**：
   - 在 `@media (prefers-reduced-motion: reduce)` 下，所有 `transform` 位移和旋转归零，仅保留颜色与边框高亮切换。

### Alternatives Considered
- *弹性回弹缓动（Bounce / Elastic Bezier）*：被拒绝。`docs/DESIGN.md` 第 173 行明确禁止使用弹性回弹，避免视疲劳与布局晃动。

---

## 4. Washi Tape Dividers & Ledger Table Lists (和纸封口胶带与标本明细卷宗)

### Context & Problem
首页长页面在滚动时若仅靠空白分隔容易显得平淡；而列表如果散落成大量重复卡片则会降低信息扫描效率。

### Decision
1. **和纸封口胶带过渡条（Washi Tape Dividers）**：
   - 区块分界处使用纯 CSS 斜纹绘制的和纸胶带过渡条（`repeating-linear-gradient(-45deg, var(--red), var(--red) 4px, var(--yellow) 4px, var(--yellow) 8px)`），搭配 2.5px 纯黑上下边框与轻微手作倾斜（≤ 1°），增强工坊手作封口质感。
2. **标本明细卷宗（Ledger Table）**：
   - 最新动态与随笔列表采用单页特种纸底色（`--paper-dark`）、纯黑外框与点线连接（Dot-leader）排布；
   - 悬停时单行高亮（`var(--paper-butter)`），左侧墨线标尺微滑 4px，日期与类型徽章右对齐清晰呈现。

---

## 5. Standardized SVG Icon System via Lucide (微型线性 SVG 图标点缀)

### Context & Problem
`docs/DESIGN.md` 第 191 行严禁使用原生 Emoji 作为页面装饰符号。需要统一使用线宽协调、纯黑墨线轮廓的微型 SVG 图标进行语义点缀。

### Decision
1. **技术选型**：
   - Astro 静态页面直接使用已安装的 `@lucide/astro`（纯服务端零客户端运行时 JS）；
   - React Island（`ExploreIsland.tsx`）使用内联标准 Lucide SVG 路径组件或同等线宽的 SVG 元素（`stroke-width: 2.25px`）。
2. **资产类型图标映射表**：
   - `Prompt`: `Sparkles` / `Terminal`
   - `Skill`: `Wrench` / `Bot`
   - `MCP`: `Layers` / `Network`
   - `Website`: `Compass` / `Globe`
   - `Project`: `FolderGit2` / `Hammer`
   - `Note`: `StickyNote` / `PenTool`
3. **操作与元数据图标**：
   - `Date`: `Calendar`
   - `Reading Time`: `Clock`
   - `Tags`: `Tag`
   - `External Link`: `ExternalLink`
   - `Copy`: `Copy` / `Check`
   - `Back`: `ArrowLeft`
