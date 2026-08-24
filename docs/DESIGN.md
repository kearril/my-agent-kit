# 俏皮野兽派设计规范

```text
style_name: 俏皮野兽派（手账工坊与波普拼贴）
style_slug: neo-brutalist-playful-scrapbook
```

这份文档是 Paracosm Garden 的首页各区块、条目卡片、筛选和大卡片弹窗的唯一视觉规范依据。它融合了野兽派的硬朗骨架（纯黑粗边、硬直角、硬边缘偏移阴影）与手账工坊的温润触感（复古特种纸基底、胶带贴纸、橡胶印章、档案夹板）。

## 什么时候使用

- 实现页面或组件前，先用它确定颜色、布局、组件、动效和可访问性边界。
- 把任务交给 AI 或其他开发者时，附上相关章节，避免风格漂移。
- 交付前按文末检查清单验收，而不是只凭主观感觉判断。

## 核心气质

俏皮野兽派是 Neo-Brutalist 的活泼变体：保留硬边缘、粗边框和无圆角结构，通过鲜艳色块、轻微倾斜、几何装饰、和纸胶带与复古档案夹板增加手作质感。

必须同时满足：

- 硬朗：炭黑墨线粗边框（`2.5px ~ 4px solid var(--black)`）、实色块、硬边缘偏移阴影（`4px ~ 8px`）
- 多彩与温润：采用复古手账特种纸品色系（肉桂红、奶油黄、棉麻白、鼠尾草绿、牛皮夹板色）与高饱和印章强调色
- 俏皮手作：轻微旋转（便签与印章）、胶带贴纸、图钉、回形针、折角与明确的按压反馈
- 克制：旋转严格不超过 3 度，动效不制造布局跳动，不抢走焦点

## 视觉 Token

### 颜色体系（方案 A · 复古手账与档案工坊）

| 角色 | 变量名 | 色值 | 用途 |
| --- | --- | --- | --- |
| 炭黑油墨色 | `--black` | `#18181b` | 边框、文字、深色元素 |
| 高光反色 | `--white` | `#ffffff` | 纯白卡片、反色高光 |
| 主和纸底色 | `--paper` | `#fbf9f4` | 页面主背景温润纸色 |
| 工坊底纸色 | `--paper-dark` | `#efece4` | 工作台网格底纹底色 |
| 肉桂砖红纸 | `--paper-cinnamon` | `#f09a8f` | 灵感便签纸 |
| 奶油暖黄纸 | `--paper-butter` | `#fce4a6` | 想法便签纸 |
| 棉麻复古白卡 | `--paper-cotton` | `#faf8f5` | 经验便签纸 |
| 鼠尾草灰绿纸 | `--paper-sage` | `#b7d5c4` | 收藏便签纸 |
| 档案夹板色 | `--board-kraft` | `#e6e0d4` | 手账档案大夹板底色 |
| 印章番茄红 | `--red` | `#e63946` | 印章戳记、核心高亮、主按钮 |
| 鼠尾草青 | `--teal` | `#2a9d8f` | 状态指示灯、青色点缀 |
| 复古芥末黄 | `--yellow` | `#e9c46a` | 和纸胶带、高光标签、次按钮 |
| 薄荷绿 | `--mint` | `#95e1d3` | 辅助绿色 |
| 复古肉粉 | `--coral` | `#e76f51` | 辅助粉色 |
| 晒图蓝 | `--blue` | `#457b9d` | 协议、阴影与辅助蓝 |
| 深灰文字 | `--dark` | `#27272a` | 正文文字 |
| 弱化文字 | `--muted` | `#52525b` | 辅助元数据、说明文字 |

使用纯色或微点阵/方格坐标底纹，不使用模糊渐变。文字对比度必须达到 WCAG AA 标准。
### 边框、阴影和形状

```text
边框：border: 4px solid var(--black)
圆角：border-radius: 0
小阴影：box-shadow: 4px 4px 0 var(--black)
中阴影：box-shadow: 6px 6px 0 var(--black)
大阴影：box-shadow: 8px 8px 0 var(--black)
彩色阴影：box-shadow: 6px 6px 0 var(--red)
```

阴影必须是实色硬边偏移，不能使用模糊阴影。卡片、按钮、输入框、弹窗都保持直角。

### 布局和间距

```text
区块：py-12 md:py-20 lg:py-28
容器：px-4 md:px-8 lg:px-12
卡片：p-4 md:p-6
小间距：gap-3 md:gap-4
中间距：gap-4 md:gap-6
大间距：gap-6 md:gap-8
```

正文行宽控制在约 65 至 75 个字符，移动端优先避免横向溢出。不要用嵌套卡片堆叠层次。

### 字体和排版

- 标题和关键标签：`font-black uppercase`
- 正文和辅助信息：`font-mono`
- 不使用 Inter、Roboto、Geist 等过度常见的默认品牌字体
- 不使用 `font-light`、`font-thin` 或 `font-normal` 制造柔弱层级
- 标题可以很大，但必须保留清晰的信息层级和可读行高

## 组件规则

### 按钮

按钮应具备完整的硬边反馈：

```css
.button {
  min-height: 44px;
  border: 4px solid var(--black);
  border-radius: 0;
  background: var(--red);
  color: var(--black);
  box-shadow: 6px 6px 0 var(--black);
  font-weight: 900;
}

.button:hover { transform: translate(3px, 3px); box-shadow: none; }
.button:focus-visible { outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal); }
.button:active { transform: translate(4px, 4px); box-shadow: none; }
```

可以增加 `hover:scale-105`，但不能让缩放造成内容溢出或布局跳动。按钮的触控区域不小于 44px。

### 卡片

条目卡片是数字花园的主要容器：

```css
.entry-card {
  border: 4px solid var(--black);
  border-radius: 0;
  background: var(--white);
  box-shadow: 6px 6px 0 var(--teal);
  padding: clamp(16px, 3vw, 24px);
}

.entry-card:hover { transform: translate(3px, 3px); }
```

卡片可以按类型或索引使用不同强调色，但结构、边框和交互语言保持一致。点击卡片打开大卡片弹窗，不依赖卡片上的小型难点按钮作为唯一入口。

### 输入框和筛选控件

```css
.search-input {
  min-height: 44px;
  border: 4px solid var(--black);
  border-radius: 0;
  font: inherit;
}

.search-input:focus-visible { outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal); }
```

搜索框、类型筛选、标签筛选和排序控件都必须有清晰的标签、键盘焦点和移动端可操作尺寸。不要依赖 placeholder 代替可访问名称。

### 大卡片弹窗

- 使用直角、4px 纯黑边框和白色背景。
- 遮罩可以使用纯黑半透明色，但不能使用 `backdrop-blur`。
- 弹窗打开时锁定背景滚动，关闭后恢复原滚动位置。
- 支持关闭按钮、背景点击和 Esc 关闭。
- 打开后焦点进入弹窗，关闭后焦点回到触发卡片。
- 移动端接近全屏，桌面端保持适合阅读的最大宽度。
- 条目弹窗内容包括类型、来源、摘要、正文、资产链接、标签、关联条目和更新时间；不显示已移除的 `status` 字段。

### 图标和装饰

禁止使用 emoji 或直接输入的符号字符作为装饰。优先使用 Lucide React 等线性 SVG 图标，以及 CSS 几何形状、方块、圆点和线条。图标不能取代按钮文字或可访问名称。

## 首页应用

首页是一个可持续生长的手账式数字花园入口：

1. 固定导航（SiteHeader）：站点名回到 Hero，锚点依次指向关于（#about）、精选（#featured）、更新（#updates）、Notes（#notes）和探索（#explore）。
2. Hero 首屏（手账工坊与档案夹板）：
   - **顶部胶带**：`[ DIGITAL GARDEN · 想法与工具的生长地 ]`。
   - **主标题 & 印章**：`I GROW` + 双线纯文字红印章 `[SEEDS & ARTIFACTS]` + `WHAT FASCINATES ME.`。
   - **正文手账便签**：装入微倾斜白底便签框，文案聚焦“持续培育和记录所有令我为之驻足的事物”。
   - **行动按钮**：`开始探索 ↘`（跳转 `#featured`）与 `了解本园`（跳转 `#about`）。
   - **右侧手账大夹板（Clipboard Deck）**：牛皮纸色长夹板，顶部带工业金属大压板、左侧标尺刻度线、右侧索引便签（`TAB 01 · ARTIFACTS`），内含 4 张温润特种纸便签（灵感、想法、经验、收藏）呈 Z 字交错排布，点缀红色档案印章与 `#GARDEN-2026` 吊牌。
   - **底部花园收成收据（Garden Harvest Receipt）**：横贯底部的白底撕纸小票，记录植物隐喻指标（`RAW SPARKS` / `PRACTICE` / `CURATED GEMS` / `DEEP THOUGHTS`），右侧印有条形码与 `HARVESTED` 印章。
   - **底部过渡条**：黑黄斜纹和纸胶带过渡条横贯切分到下一区块。
3. 关于本园（About Section · 数字自留地与档案卷宗）：
   - **顶部胶带与标题**：黄色和纸胶带 `SECTION 02 // ABOUT`，大标题 `ABOUT GARDEN · 关于本园 · 数字自留地`。
   - **第一层（自留地概览便签）**：棉麻白卡（`--paper-cotton`）搭配红色胶带角与 `[ FIELD REPORT // 01 ]` 标签，阐明个人数字资产库与不设固定边界的定位。
   - **第二层（收录载体标本卷宗 · 一体化手账明细册）**：轻型特种纸底色（`--paper-dark`），包含 7 行点线连接明细（`PROMPT`, `SKILL`, `MCP`, `WEBSITE`, `PROJECT`, `NOTE`, `+ MORE`），彻底消除小卡片视觉疲劳，支持未来无限追加新载体。
   - **第三层（左右对开构建逻辑与收录边界）**：
     - **左卡【构建逻辑】**：鼠尾草灰绿纸（`--paper-sage`）黑字排版，白色三维立体索引块（`01`, `02`, `03`）承载网状关联、完整上下文与动态维护。
     - **右卡【收录边界】**：奶油暖黄便签（`--paper-butter`）搭配红胶带与红色警告/星标，明确不含实际资产与个人体验标准，底部加盖 `[ PERSONAL ARCHIVE ONLY ]` 档案红印。
   - **底部过渡条**：黑黄斜纹和纸胶带过渡条（`.about-bottom-tape`）封底。
4. 精选收录（Featured）：读取 `featuredOrder: 1` 至 `6` 的真实条目卡片。
5. 近期更新（Updates）：非 Note 条目的时间线沉淀。
6. Notes：文章横条列表，支持浮卡预览与独立长文页。
7. 探索（Explore）：全量条目探索引擎，支持搜索、类型过滤、标签过滤与瀑布流。
8. 页脚（SiteFooter）：黑底手账工坊页脚，承接站点信息与色票。
首页区块使用 `py-12 md:py-20 lg:py-28` 的节奏；卡片网格使用 `gap-4 md:gap-6`。类型和标签的颜色可以多彩，但不能改变扁平条目模型。Note 的 `category` 作为文章主分类显示，不替代多标签。

### 响应式规则

- 桌面端显示完整锚点导航；移动端保留站点名与 44px 以上的菜单按钮，展开同一组锚点。
- Hero 在移动端先显示文案与“开始探索”，手账夹板移至下方，自适应为纵向单列卡片流动，不能遮挡文本或造成横向溢出。
- 精选区桌面端为 6 张等尺寸卡片；窄屏按阅读顺序改为单列或双列，不压缩触控目标。
- 类型筛选在移动端保持单行可横向滚动；标签默认显示少量常用项，通过“更多标签”展开。
- Notes 横条在移动端改为纵向信息顺序；摘要浮卡不依赖 hover，必须可通过“预览”展开。
- 大卡片弹窗移动端接近全屏；独立 Note 页面直接承载长正文，不放进条目弹窗。
## 交互与动效

基础过渡：

```text
transition-all duration-300 ease-out
hover:translate-x-[3px] hover:translate-y-[3px]
active:translate-x-[4px] active:translate-y-[4px]
focus-visible: outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal)
```

可以使用轻微缩放、方向变化和青、粉、黄之间的硬边阴影变化，始终将旋转控制在 3 度以内。

设计提示词中出现的 `cubic-bezier(0.34,1.56,0.64,1)` 只作为“俏皮回弹”的灵感，不作为默认实现；最终交付检查禁止 bounce 或 elastic 缓动，因此项目默认使用 `ease-out` 等不带弹性的过渡。

所有动效都必须：

- 不引发布局位移
- 不抢走键盘焦点
- 在 `prefers-reduced-motion: reduce` 下减弱或关闭
- 在移动端保持稳定，不依赖 hover 才能完成操作

## 绝对禁止

- 圆角：统一使用 `border-radius: 0`
- 模糊阴影：不使用 `shadow-sm`、`shadow`、`shadow-md`、`shadow-lg` 等默认模糊阴影
- 渐变：不使用 `bg-gradient-*` 或渐变文字
- 柔和灰色：不使用 `bg-gray-50`、`bg-gray-100`、`text-gray-300`、`text-gray-400`、`text-gray-500`
- 轻量字体：不使用 `font-light`、`font-thin`、`font-normal`
- 玻璃态：不使用 `backdrop-blur`
- 过度旋转：不得超过 3 度
- Emoji 或直接输入的符号字符装饰；需要图标时使用 Lucide 等 SVG 图标或 CSS 几何形状
- 嵌套卡片
- 依赖颜色单独表达状态
- 没有 reduced-motion 方案的装饰性动效

## 可访问性

- 文字对比度达到 WCAG AA 或更高。
- 每个交互元素都有可访问名称和清晰键盘焦点。
- 触控目标不小于 44px。
- 弹窗管理焦点，Esc 可关闭，背景滚动可恢复。
- 搜索无结果、加载中、加载完成和错误状态都有明确文本。
- 不使用颜色作为唯一的类型、状态或错误提示。
- 尊重 `prefers-reduced-motion`。

## 交付检查清单

### Token 检查

- [ ] 按钮为直角，并使用 4px 纯黑边框。
- [ ] 按钮有硬边阴影、hover 位移、active 反馈和 focus 状态。
- [ ] 卡片为直角、白底、4px 纯黑边框。
- [ ] 输入控件为直角、4px 纯黑边框，并有清晰焦点。
- [ ] 页面使用规定的区块、容器和卡片间距。

### 禁止项检查

- [ ] 没有圆角、模糊阴影、渐变或玻璃态。
- [ ] 没有柔和灰色、轻量字体或 Inter、Roboto、Geist。
- [ ] 没有超过 3 度的旋转。
- [ ] 没有 emoji 或直接输入的符号字符装饰；图标使用 SVG 或 CSS 几何形状。
- [ ] 没有嵌套卡片；单侧粗边只用于文章正文的二级标题与引用块。
- [ ] 没有 bounce / elastic 默认动效。

### 响应式与无障碍检查

- [ ] 手机、平板和桌面端没有横向溢出。
- [ ] 卡片长标题、无图条目和空状态仍然稳定。
- [ ] 搜索、筛选、加载更多和弹窗可用键盘完成。
- [ ] 弹窗打开和关闭后的焦点、滚动位置正确。
- [ ] reduced-motion 模式下不会出现强制动画。
- [ ] 页面一眼仍然属于俏皮野兽派。
