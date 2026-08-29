---

description: "Task list for Entry Detail Metadata Card Panel implementation"
---

# Tasks: Entry Detail Metadata Card Panel (条目详情页独立元数据卡片面板)

**Input**: Design documents from `/specs/004-entry-metadata-panel/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Organization**: Tasks are grouped by user story to enable independent implementation, testing, and MVP delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`)
- Every task includes exact file paths

---

## Phase 1: Setup (Shared Infrastructure & Types)

**Purpose**: Establish component scaffolding, TypeScript interfaces, and layout tokens.

- [X] T001 [P] Create `EntryMetadataPanel.astro` component scaffolding and define `Props` interface in `src/components/article/EntryMetadataPanel.astro`
- [X] T002 [P] Define workbench grid width and layer variables in `src/styles/tokens.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Establish the 3-column center-anchored CSS Grid and mobile layout foundations that MUST be complete before user story styling.

**⚠️ CRITICAL**: Foundational grid definitions must be in place before wiring component styles.

- [X] T003 Define desktop 3-column center-anchored grid (`.article-workbench-grid`, `.article-left-wing`, `.article-main-track`, `.article-right-wing-spacer`) in `src/styles/article.css`
- [X] T004 [P] Define mobile single-column stream layout and `<details>` accordion container base styles in `src/styles/article.css`

**Checkpoint**: Foundation ready — User Story 1 (MVP) can now begin.

---

## Phase 3: User Story 1 - 独立元数据卡片面板的结构与信息呈现 (Priority: P1) 🎯 MVP

**Goal**: 访客进入任意条目详情页时，能够看到左侧外边缘独立的单张一体化元数据档案大卡，集中呈现分类徽章、标本编号、时间戳、标签矩阵、外链与关联图谱，与正文形成清晰区隔。

**Independent Test**: 访问任意详情页，验证左侧呈现完整的单张元数据卡片面板，包含分类、时间、标签、外链与关联图谱，数据渲染准确无遗漏。

### Implementation for User Story 1

- [X] T005 [US1] Implement specimen identity badge cluster (`.dossier-badge-cluster`) and timestamps section (`.dossier-section--dates`) in `src/components/article/EntryMetadataPanel.astro`
- [X] T006 [P] [US1] Implement tag matrix section (`.dossier-section--tags`) and external links section (`.dossier-section--links`) with empty-state guards in `src/components/article/EntryMetadataPanel.astro`
- [X] T007 [P] [US1] Implement bidirectional related entries and backlinks graph section (`.dossier-section--graph`) in `src/components/article/EntryMetadataPanel.astro`
- [X] T008 [US1] Mount `<EntryMetadataPanel entry={entry} related={related} backlinks={backlinks} />` inside `.article-left-wing` in `src/pages/entries/[slug].astro`

**Checkpoint**: User Story 1 is fully functional as an MVP increment — metadata is rendered inside the dedicated standalone card panel.

---

## Phase 4: User Story 2 - 正文阅读区域的沉浸专注体验 (Priority: P1)

**Goal**: 居中正文卷宗（`article-content`）彻底剥离所有非正文元数据，仅承载大标题、摘要框与 Markdown 渲染正文，保持严格的中轴居中与舒适的黄金行宽（65~75 字符）。

**Independent Test**: 纵向通读居中正文卷宗，验证其顶部仅有大标题与摘要框，末尾紧随 Markdown 内容结束，无任何穿插或尾部堆叠的标签、外链与关联卡片，且正文在中轴线上严格水平居中。

### Implementation for User Story 2

- [X] T009 [US2] Refactor `src/pages/entries/[slug].astro` to remove inline meta badges, date decks, tag chips, external links sections, and connection sections from `.article-content`
- [X] T010 [US2] Refine `.article-content` and `.article-main-track` styles in `src/styles/article.css` to enforce 65~75 char golden reading line-width, workshop paper background, and centered alignment

**Checkpoint**: User Story 1 AND User Story 2 work together — clean centered prose body paired with decoupled standalone metadata panel.

---

## Phase 5: User Story 3 - 多端响应式布局与顺畅阅读流 (Priority: P2)

**Goal**: 桌面宽屏（$\ge 1200\text{px}$）下左侧面板实现顶部粘性跟随（`top: 24px`）与安全内滚动；窄屏与移动端（$< 1200\text{px}$）下自适应为正文上方的紧凑折叠手风琴档案卡（`<details>`/`<summary>`）。

**Independent Test**: 在桌面宽屏（1440px）滚动长文，验证左侧面板悬停在顶部且支持独立滚动；缩放到移动端（393px），验证正文上方呈现紧凑档案卡，点击“档案明细 ▾”可平滑展开/收起完整元数据。

### Implementation for User Story 3

- [X] T011 [US3] Implement desktop sticky positioning (`position: sticky; top: 24px`), `max-height: calc(100vh - 48px)`, and custom slim scrollbar styles in `src/styles/article.css`
- [X] T012 [US3] Implement mobile `<summary>` indicator toggle (`.dossier-accordion-indicator`) and chevron icon rotation styles for `<details[open]>` in `src/styles/article.css`
- [X] T013 [US3] Add responsive clamp paddings and prevent horizontal viewport overflow across all breakpoints in `src/styles/responsive.css`

**Checkpoint**: Full multi-device layout responsiveness is operational across widescreen, tablet, and mobile.

---

## Phase 6: User Story 4 - 元数据卡片内部的高效交互与知识导航 (Priority: P2)

**Goal**: 元数据面板内部各元素提供高质感交互反馈：标签芯片支持点击跳至探索页带参筛选、外链超链接支持新标签页打开、关联图谱微型卡片支持无缝导航至关联条目。

**Independent Test**: 在元数据面板中依次点击标签、外链和关联图谱卡片，验证所有超链接的导航行为符合预期且具有触控/悬停反馈。

### Implementation for User Story 4

- [X] T014 [US4] Style tag matrix chips (`.dossier-tag-chip`) with tactile borders, hover background shift, and explore query links in `src/styles/article.css`
- [X] T015 [P] [US4] Style external resource links (`.dossier-link-item`) with hover arrow animation and security attributes in `src/styles/article.css`
- [X] T016 [P] [US4] Style bidirectional related entries and backlinks micro-cards (`.dossier-graph-item`) with type badges and hover cards in `src/styles/article.css`

**Checkpoint**: In-panel navigation, link targets, and tactile hover feedback are fully operational.

---

## Phase 7: User Story 5 - 无障碍导航、焦点管理与静态可访问性 (Priority: P3)

**Goal**: 确保键盘 `Tab` 焦点流转顺序自然，所有可聚焦元素配备双层高对比度焦点环，触控热区保底 $\ge 44\text{px} \times 44\text{px}$，在无 JS 环境下依靠原生 `<details>` 实现 100% 静态可达。

**Independent Test**: 使用键盘 `Tab` 键遍历详情页，验证焦点高亮明显；在浏览器禁用 JavaScript，验证移动端折叠卡片仍可通过原生 `<summary>` 正常展开阅读。

### Implementation for User Story 5

- [X] T017 [US5] Add high-contrast `:focus-visible` dual-ring styles for summary toggle, tag chips, external links, and graph items in `src/styles/article.css`
- [X] T018 [P] [US5] Audit minimum 44px touch targets and `prefers-reduced-motion: reduce` transition disablement in `src/styles/responsive.css`

**Checkpoint**: Full accessibility, WCAG compliance, and static-first progressive enhancement verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cross-device visual verification, performance check, build verification, and end-to-end scenario validation.

- [X] T019 [P] Audit zero-JS static HTML output and `<details>` native disclosure behavior in `src/pages/entries/[slug].astro`
- [X] T020 Run full automated test suite via `pnpm test` and ensure all tests pass
- [X] T021 Run production static build via `pnpm build` and verify 0 errors / 0 warnings
- [X] T022 Execute all 7 validation scenarios from `specs/004-entry-metadata-panel/quickstart.md` across desktop and mobile viewports

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**.
- **User Story 1 (Phase 3 - MVP)**: Depends on Phase 2. Core metadata panel component & data rendering.
- **User Story 2 (Phase 4)**: Depends on Phase 3. Decoupling prose body from `.article-content`.
- **User Story 3 (Phase 5)**: Depends on Phase 3 & Phase 4. Responsive grid and sticky/accordion behaviors.
- **User Story 4 (Phase 6)**: Depends on Phase 3. In-panel chip, link, and graph interactions.
- **User Story 5 (Phase 7)**: Depends on Phase 5 & Phase 6. Accessibility focus rings and touch targets.
- **Polish (Phase 8)**: Depends on all user stories being complete.

```text
Phase 1 (Setup: Types/Tokens) ──► Phase 2 (Foundational CSS Grid) ──► Phase 3 (US1: Metadata Panel MVP)
                                                                           │
                                                                           ├──────────────────────────┐
                                                                           ▼                          ▼
                                                                Phase 4 (US2: Centered Prose)  Phase 6 (US4: In-Panel UX)
                                                                           │                          │
                                                                           ▼                          │
                                                                Phase 5 (US3: Responsive Sticky)       │
                                                                           │                          │
                                                                           └─────────────┬────────────┘
                                                                                         ▼
                                                                            Phase 7 (US5: Accessibility)
                                                                                         ▼
                                                                            Phase 8 (Polish & Verification)
```

---

## Parallel Opportunities

- **Phase 1**: T001 and T002 can run in parallel.
- **Phase 2**: T004 can run in parallel with T003.
- **Phase 3 (US1)**: T006 (tags/links) and T007 (graph) can run in parallel after T005 is created.
- **Phase 6 (US4)**: T015 (external links) and T016 (graph items) can run in parallel.
- **Phase 7 (US5)**: T018 (touch/reduced-motion) can run in parallel with T017 (focus rings).
- **Phase 8**: T019 can run in parallel with T020.

---

## Parallel Example: User Story 1 (Metadata Panel)

```bash
# Launch sub-section implementations in parallel:
Task: "Implement tag matrix section and external links section in src/components/article/EntryMetadataPanel.astro"
Task: "Implement bidirectional related entries and backlinks graph section in src/components/article/EntryMetadataPanel.astro"
```

---

## Implementation Strategy

### MVP First (User Story 1 & User Story 2)

1. Complete Phase 1: Setup (`EntryMetadataPanel.astro` scaffolding, tokens)
2. Complete Phase 2: Foundational (`article-workbench-grid` CSS)
3. Complete Phase 3: User Story 1 (Build and mount `EntryMetadataPanel`)
4. Complete Phase 4: User Story 2 (Clean `.article-content` to pure prose)
5. **STOP and VALIDATE**: Verify that the entry page displays centered pure prose with the decoupled left metadata panel.

### Incremental Delivery

1. **Increment 1 (MVP)**: Standalone metadata panel mounted on desktop + pure centered prose.
2. **Increment 2**: Responsive sticky scrolling (desktop) and collapsible accordion (mobile).
3. **Increment 3**: In-panel tactile interactions (tag chips, external link hover, graph micro-cards).
4. **Increment 4**: High-contrast accessibility focus rings, touch target audit, and zero-JS validation.
5. **Increment 5**: Full test suite pass (`pnpm test`) and production build pass (`pnpm build`).
