# Implementation Plan: Entry Card Quick-View Modal (条目卡片速览大弹窗)

**Branch**: `003-entry-preview-modal` | **Date**: 2026-08-26 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/003-entry-preview-modal/spec.md`

## Summary

本特性为数字花园的条目卡片体系（Explore 探索区与 Featured 精选收录区）增加原地大卡片速览弹窗（Quick-View Modal），并将卡片点击行为优化为双触点交互模型：
1. **卡片主体速览**：点击卡片主体不再触发整页跳转，而是原地弹出直角手账纸卡质感的速览大弹窗，完整展示条目标题、分类徽章、完整摘要、标签矩阵与更新时间，保持当前搜索与筛选上下文不中断。
2. **专属直达入口**：卡片底栏右下角保留独立的“进入详情 ↗”实体按钮，支持一键直接导航至规范详情页 `/entries/<slug>/`，并保留鼠标右键/中键在新标签页打开的能力。
3. **无障碍与视口受控**：弹窗最大高度限制在 $\le 85\text{vh}$ 内，头部标题栏与底部操作栏固定可见，中间主体区域支持平滑纵向滚动；集成严格的焦点陷阱（Focus Trap）、`Esc` 退出、遮罩点击退出、滚动锁定（Body Scroll Lock）与焦点精准恢复机制。
4. **静态优先与优雅降级**：客户端无 JS 时保持标准 HTML 超链接跳转，不破坏静态可达性。

## Technical Context

**Language/Version**: TypeScript 5.8+ / Astro 7.2+ / React 19  
**Primary Dependencies**: Astro, `@astrojs/react`, `@lucide/astro` (零运行时依赖图标库)  
**Storage**: Astro Content Collections (`src/content/entries/`) 与内存索引 (`src/lib/explore-index.ts`)  
**Testing**: Vitest (`pnpm test`), Astro Build (`pnpm build`)  
**Target Platform**: 现代桌面端、平板与移动端浏览器 (Chromium, Firefox, Safari)  
**Project Type**: 静态站点生成 (SSG) 与局部交互 React Island  
**Performance Goals**: 原地弹窗唤起延迟 $< 100\text{ms}$，0 额外网络 API 请求，60fps 硬件加速过渡，滚动锁定 0 布局抖动  
**Constraints**: 直角无圆角 (`border-radius: 0`)、纯黑粗边框 (`2.5px ~ 4px`)、实色硬边阴影 (`4px ~ 8px`)、无渐变、无 Emoji、触控热区 $\ge 44\text{px} \times 44\text{px}$、严格遵循 `prefers-reduced-motion: reduce`  
**Scale/Scope**: `ExploreIsland.tsx`、`FeaturedSection.astro`、`explore.css` / `home.css` 以及相关契约与测试

## Constitution Check

*GATE: Evaluated against Paracosm Garden Constitution v1.0.1. All criteria PASS.*

- [x] **I. Static-First Astro & Island Boundaries**: 弹窗与交互逻辑依托已有的 `src/components/islands/ExploreIsland.tsx` React Island，Featured 静态卡片使用轻量事件派发，不把整站改成 React SPA，服务端生成保持静态输出。
- [x] **II. Content Collections as Source of Truth**: 弹窗直接复用 Content Collections 计算出的 Explore 索引数据，不维护重复数据源。
- [x] **III. Stable Public Content Identity**: 规范 URL `/entries/<slug>/` 继续保持不可变，卡片直达按钮与弹窗底部主按钮 100% 链接至此规范路径。
- [x] **IV. Intentional Simplicity & Clear Boundaries**: 0 新增第三方重型依赖；纯原生 React + CSS 实现焦点陷阱与模态状态，逻辑归属于 Island 与样式表。
- [x] **V. Verifiable Quality & Traceable Delivery**: 全量覆盖 `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`，并通过 `pnpm test` 与 `pnpm build` 验证。
- [x] **Design & Accessibility**: 严格执行直角、粗墨边框、硬边阴影、特种纸背景色、SVG 图标标准，配备完整 WAI-ARIA 对话框属性、键盘焦点循环管理与滚动锁定。

## Project Structure

### Documentation (this feature)

```text
specs/003-entry-preview-modal/
├── spec.md              # 需求规格说明书
├── plan.md              # 本技术实施方案
├── research.md          # Phase 0 技术决策与架构调研
├── data-model.md        # Phase 1 实体数据模型与状态流转图
├── quickstart.md        # Phase 1 端到端验证指南
├── checklists/
│   └── requirements.md  # 质量检查清单
├── contracts/           # Phase 1 接口与视觉契约
│   ├── quickview-modal.contract.md
│   └── card-interaction.contract.md
└── tasks.md             # Phase 2 实施任务清单 (/speckit.tasks 生成)
```

### Source Code Touch-Points (仓库源码触达清单)

```text
src/
├── styles/
│   ├── home.css             # 卡片双触点样式 (.specimen-direct-btn) 与精选展架适配
│   ├── tokens.css           # 弹窗层级 z-index 与背景纸品 token
│   └── responsive.css       # 移动端 44px 触控保底与 85vh 视口高度适配
├── components/
│   ├── islands/
│   │   ├── ExploreIsland.tsx       # 集成 QuickViewModal 弹窗、卡片双触点与全局事件监听
│   │   └── QuickViewModal.tsx      # (可选/内置) 独立的速览大弹窗 React 子组件
│   ├── home/
│   │   ├── FeaturedSection.astro   # 精选卡片双触点改造与事件派发支持
│   │   └── ExploreFallback.astro   # 无脚本静态回退网格
│   └── layout/
└── lib/
    └── explore-index.ts     # 条目快速索引与数据类型定义
```

## Complexity Tracking

> **Constitution Check 无违规项，零额外复杂性引入**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|:---|:---|:---|
| None | 完全基于现有 React Island + 原生 CSS + Astro Content Collections 实现 | N/A |
