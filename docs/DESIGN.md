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

## 设计模式与组件规范

### 1. 按钮体系（Buttons）

所有按钮为直角无圆角，具备完整的硬边按压与位移反馈：

```css
.button {
  min-height: 44px;
  border: 4px solid var(--black);
  border-radius: 0;
  background: var(--red);
  color: var(--black);
  box-shadow: 6px 6px 0 var(--black);
  font-weight: 900;
  transition: transform 0.18s ease-out, box-shadow 0.18s ease-out;
}
.button:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0 var(--black); }
.button:active { transform: translate(3px, 3px); box-shadow: none; }
.button:focus-visible { outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal); }
```

### 2. 卡片与便签体系（Cards & Paper Sheets）

- **条目卡片（Entry Cards）**：直角、4px 纯黑边框、6px 硬边阴影、特种纸背景（`--white` 或 `--paper-cotton`）。
- **便签白卡（Paper Sheets）**：微倾斜（≤ 2°），可搭配胶带角与高光底色，hover 时平滑归位（`rotate: 0deg`）并位移。
- **阴影规则**：实色硬边偏移（`4px ~ 8px`），禁止模糊阴影。

### 3. 和纸胶带与微标签（Washi Tapes & Badges）

- **胶带标签（Tape Eyebrow）**：倾斜 1°~2°，亮黄色或暖红色底，纯黑细/粗框，硬直角切边。
- **分类色标徽章（Type Badges）**：按资产类型匹配专属纸品底色（如 Prompt 肉桂红、Skill 奶油黄、MCP 棉麻白、Website 鼠尾草绿等），纯黑墨线边框与 2px 硬阴影。

### 4. 标本明细卷宗（Ledger Tables）

- 替代散落小卡片的列表容器，采用单页特种纸底（`--paper-dark`），4px 纯黑外框。
- 内部条目采用点线连接（Dot-leader）排布，hover 时呈现单行高亮与轻微横向位移。

### 5. 印章与戳记（Stamps & Seals）

- 纯文字双线边框或单线框，使用 `--red` 番茄红色系，微倾斜（≤ 2.5°）。
- 禁止使用 Unicode 特殊符号代替文字印章，印章内容采用等宽全大写字母或直观简短中文。

### 6. 输入框与筛选控件（Inputs & Filters）

```css
.search-input {
  min-height: 44px;
  border: 4px solid var(--black);
  border-radius: 0;
  font: inherit;
}
.search-input:focus-visible { outline: 4px solid var(--black); box-shadow: 6px 6px 0 var(--teal); }
```

### 7. 大卡片弹窗（Modal Dialogs）

- 直角、4px 纯黑边框、特种纸底色，无 `backdrop-blur`。
- 弹窗锁定背景滚动，Esc 或点击遮罩关闭，焦点自动捕获与恢复。

### 8. 区块过渡胶带（Section Dividers）

- 区块底部使用黑黄斜纹（或红黄斜纹）和纸胶带过渡条横贯切分，强化工坊手作封口质感。

### 9. 图标与几何装饰

- 绝对禁止使用直接输入的 emoji 或 Unicode 符号字符作为装饰。
- 装饰图形一律采用纯 CSS 几何形状（方块、菱形、线条）或 Lucide 等 SVG 线性图标。

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
