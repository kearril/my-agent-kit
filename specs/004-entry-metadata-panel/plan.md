# Implementation Plan: Entry Detail Metadata Card Panel (条目详情页独立元数据卡片面板)

**Branch**: `004-entry-metadata-panel` | **Date**: 2026-08-29 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-entry-metadata-panel/spec.md`

## Summary

本次重构对 Paracosm Garden 的条目详情页（`/entries/<slug>/`）进行界面重组与信息解耦：
1. **正文卷宗纯粹化与中轴居中**：主阅读容器（`article-content`）严格保持在视口水平中轴线上，仅承载大标题、摘要导读框与 Markdown 正文，彻底剥离所有非正文元数据，提供纯粹的沉浸式纸品阅读体验。
2. **桌面左侧外缘一体化元数据档案大卡**：在桌面宽屏（$\ge 1200\text{px}$）下，采用对称三栏居中 CSS Grid（`article-workbench-grid`），将单张一体化的元数据档案大卡（`EntryMetadataPanel.astro`）停靠在居中正文左侧外边缘，具备 `position: sticky; top: 24px` 顶部粘性与独立内滚动支持。
3. **窄屏与移动端折叠手风琴卡片**：在窄屏视口（$< 1200\text{px}$）下，基于原生 HTML5 `<details>` 与 `<summary>` 将元数据大卡自适应为正文上方的紧凑折叠手风琴卡片，默认展示基础标牌，点击可展开查看完整标签矩阵、外部资源与关联图谱。
4. **静态优先与零 JS 运行时依赖**：组件由纯 Astro 静态渲染，移动端折叠依赖原生语义，在无脚本极限环境下保持 100% 功能完备与无障碍可达。

## Technical Context

**Language/Version**: TypeScript 5.8+ / Astro 7.2+  
**Primary Dependencies**: Astro, `@lucide/astro` (零运行时开销图标库)  
**Storage**: Astro Content Collections (`src/content/entries/`) 与内容图谱计算 (`src/lib/entries.ts`)  
**Testing**: Vitest (`pnpm test`), Astro Build (`pnpm build`)  
**Target Platform**: 现代桌面端、平板与移动端浏览器 (Chromium, Firefox, Safari)  
**Project Type**: 纯 Astro 静态页面与服务端组件渲染 (SSG)  
**Performance Goals**: 页面首屏渲染 0 额外客户端 JS 开销，0 额外网络 API 请求，60fps 滚动性能  
**Constraints**: 严格遵守 `docs/DESIGN.md` 与宪法（直角无圆角、纯黑粗墨边框 2.5px~4px、硬实色偏移阴影 4px~8px、工坊特种纸底色、无渐变、无 Emoji、触控热区 $\ge 44\text{px} \times 44\text{px}$）  
**Scale/Scope**: `src/pages/entries/[slug].astro`、`src/components/article/EntryMetadataPanel.astro`、`src/styles/article.css`

## Constitution Check

*GATE: Evaluated against Paracosm Garden Constitution v1.0.1. All criteria PASS.*

- [x] **I. Static-First Astro & Island Boundaries**: 详情页与独立元数据面板完全由 Astro 服务端静态生成，零客户端 React Island 引入，移动端折叠依托原生 HTML5 `<details>`，保持纯粹的静态输出与部署边界。
- [x] **II. Content Collections as Source of Truth**: 直接复用 Content Collections 与 `src/lib/entries.ts` 计算的条目数据与双向图谱，不维护重复数据源。
- [x] **III. Stable Public Content Identity**: 不变路由 `/entries/<slug>/` 继续作为条目的唯一公开访问路径，元数据面板中所有关联链接均指向此规范地址。
- [x] **IV. Intentional Simplicity & Clear Boundaries**: 0 新增依赖；组件清晰划分为页面组装（`[slug].astro`）、元数据卡片（`EntryMetadataPanel.astro`）与样式表（`article.css`），职责分明。
- [x] **V. Verifiable Quality & Traceable Delivery**: 全量覆盖 `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`，并通过 `pnpm test` 与 `pnpm build` 双重验证。
- [x] **Design & Accessibility**: 严格执行直角、纯黑粗墨线、实色偏移阴影、工坊特种纸底色、SVG 图标与双层高对比度焦点环，触控热区保底 $\ge 44\text{px} \times 44\text{px}$。

## Project Structure

### Documentation (this feature)

```text
specs/004-entry-metadata-panel/
├── spec.md              # 需求规格说明书
├── plan.md              # 本技术实施方案
├── research.md          # Phase 0 技术决策与栅格调研
├── data-model.md        # Phase 1 实体数据模型与不变量
├── quickstart.md        # Phase 1 端到端验收指南
├── checklists/
│   └── requirements.md  # 质量检查清单
└── contracts/           # Phase 1 接口与布局契约
    ├── metadata-panel.contract.md
    └── responsive-layout.contract.md
```

### Source Code Touch-Points (源码改动触达清单)

```text
src/
├── components/
│   └── article/
│       └── EntryMetadataPanel.astro   # [NEW] 独立的元数据档案大卡与折叠手风琴组件
├── pages/
│   └── entries/
│       └── [slug].astro               # [REFACTOR] 纯净居中正文组装、三栏网格挂载
└── styles/
    └── article.css                    # [REFACTOR] 三栏居中栅格、元数据大卡与折叠样式
```

## Complexity Tracking

> **Constitution Check 无违规项，零额外复杂性引入**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|:---|:---|:---|
| None | 完全基于原生 CSS Grid + HTML5 原生语义 + Astro 静态组件实现 | N/A |
