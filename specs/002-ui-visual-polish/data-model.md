# Data Model & Visual Entity Mapping: UI Visual Polish

**Feature**: `002-ui-visual-polish`  
**Date**: 2026-08-26  
**Status**: Completed

---

## 1. Visual Entity Models

### Reading Binder (长文装订册容器)
文章条目长文展示的核心实体。

| 属性 / 字段 | 类型 | 说明与视觉规格 |
| :--- | :--- | :--- |
| `containerWidth` | `string` | 容器整体最大宽度 `960px`，居中排布 |
| `proseWidth` | `string` | 正文阅读黄金宽度约 `720px`（65~75 字符） |
| `background` | `string` | 主纸品色 `var(--paper)` (`#fbf9f4`) |
| `gridOverlay` | `string` | 微透浅墨工程方格网 `24px × 24px` |
| `outerBorder` | `string` | `3.5px solid var(--black)` |
| `outerShadow` | `string` | `8px 8px 0 var(--black)` |
| `lineHeight` | `number` | `1.8` |
| `paragraphSpacing` | `string` | `1.75em` |

### Washi Tape Strip (和纸封口胶带过渡条)
区块间的物理分隔实体。

| 属性 / 字段 | 类型 | 说明与视觉规格 |
| :--- | :--- | :--- |
| `height` | `string` | `12px ~ 16px` |
| `pattern` | `string` | `repeating-linear-gradient(-45deg, var(--red), var(--red) 4px, var(--yellow) 4px, var(--yellow) 8px)` |
| `border` | `string` | `2.5px solid var(--black)` 上下封边 |
| `rotation` | `string` | 手作微倾斜 `rotate(-0.75deg)` ~ `rotate(0.75deg)` |
| `shadow` | `string` | `2px 2px 0 var(--black)` |

### Specimen Ledger Row (标本明细卷宗行)
更新动态与随笔列表的单行明细实体。

| 属性 / 字段 | 类型 | 说明与视觉规格 |
| :--- | :--- | :--- |
| `badge` | `object` | 类型色标徽章（纸品底色 + 1.5px 纯黑框） |
| `title` | `string` | 条目标题（加粗黑字，悬停下划线） |
| `dotLeader` | `string` | 点线连接符（`border-bottom: 2px dotted var(--black)`） |
| `date` | `string` | 格式化时间戳（`YYYY-MM-DD`，等宽字体） |
| `hoverState` | `object` | `background: var(--paper-butter); transform: translateX(4px);` |

---

## 2. Asset Type Visual Token & Icon Mapping (内容资产类型视觉映射)

| 资产类型 (`type`) | 专属纸品底色 Token | 色值 | 配套 Lucide 图标 | 寓意与用途 |
| :--- | :--- | :--- | :--- | :--- |
| `prompt` | `--paper-cinnamon` | `#f09a8f` | `Sparkles` / `Terminal` | 提示词指令火花 |
| `skill` | `--paper-butter` | `#fce4a6` | `Wrench` / `Bot` | 智能体技能工具 |
| `mcp` | `--paper-cotton` | `#faf8f5` | `Layers` / `Network` | 协议分层上下文 |
| `website` | `--paper-sage` | `#b7d5c4` | `Compass` / `Globe` | 网站灵感罗盘 |
| `project` | `--coral` | `#e76f51` | `FolderGit2` / `Hammer` | 实物工程产物 |
| `note` | `--teal` (白字) | `#2a9d8f` | `StickyNote` / `PenTool` | 随笔手账便签 |

---

## 3. Interactive State Model (交互状态模型)

```text
[ Element State: Default ]
      │
      ├── (Pointer Enter / Hover) ──> [ Lift State: translate(-2px, -2px), shadow: +2px, rotate: 0deg ]
      │
      ├── (Pointer Down / Active) ──> [ Press State: translate(3px, 3px), shadow: 0px ]
      │
      └── (Keyboard Focus) ─────────> [ Focus Ring State: outline: 4px solid var(--black), shadow: 6px 6px 0 var(--teal) ]
```
