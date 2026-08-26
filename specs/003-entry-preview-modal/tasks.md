---

description: "Task list for Entry Card Quick-View Modal implementation"
---

# Tasks: Entry Card Quick-View Modal (条目卡片速览大弹窗)

**Input**: Design documents from `/specs/003-entry-preview-modal/`  
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`  
**Organization**: Tasks are grouped by user story to enable independent implementation, testing, and MVP delivery.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (`[US1]`, `[US2]`, `[US3]`, `[US4]`, `[US5]`)
- Every task includes exact file paths

---

## Phase 1: Setup (Shared Infrastructure & Types)

**Purpose**: Establish design tokens, layer variables, and core TypeScript interfaces.

- [X] T001 Configure modal z-index layers and backdrop CSS tokens in `src/styles/tokens.css`
- [X] T002 [P] Export `QuickViewEntry` and custom event detail types in `src/lib/explore-index.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core CSS layouts and responsive foundations that MUST be complete before user story component integration.

**⚠️ CRITICAL**: Foundational styling must be in place before wiring interactive components.

- [X] T003 Define Playful Neo-Brutalist modal container, backdrop, and header/body/footer layouts in `src/styles/home.css`
- [X] T004 [P] Define dual-action card layout and direct button (`.specimen-direct-btn`) base styles in `src/styles/home.css`
- [X] T005 [P] Define modal viewport constraints ($\le 85\text{vh}$), 44px touch targets, and `prefers-reduced-motion` guards in `src/styles/responsive.css`

**Checkpoint**: Base styles and types ready — User Story 1 (MVP) can now begin.

---

## Phase 3: User Story 1 - 点击条目卡片快速唤起大弹窗速览 (Priority: P1) 🎯 MVP

**Goal**: 访客在 Explore 探索检索区域点击任意条目卡片主体时，原地弹出直角纸卡质感的速览大弹窗，完整展示条目标题、分类徽章、完整摘要、标签矩阵与更新时间，且保持当前搜索/筛选状态不中断。

**Independent Test**: 在 Explore 区域搜索或筛选条目，点击卡片主体，验证原地弹出大弹窗并完整呈现条目数据，背景浏览位置与筛选条件 100% 保持不变。

### Tests for User Story 1

- [X] T006 [P] [US1] Add unit tests for explore index modal entry mapping and search filtering in `tests/lib/explore-index.test.ts`

### Implementation for User Story 1

- [X] T007 [US1] Create standalone `QuickViewModal.tsx` React component with pinned header, scrollable body summary, tag list, and pinned footer in `src/components/islands/QuickViewModal.tsx`
- [X] T008 [US1] Update `src/components/islands/ExploreIsland.tsx` to integrate `QuickViewModal` state (`activeModalEntry`) and bind card body click triggers

**Checkpoint**: User Story 1 is fully functional as an MVP increment — cards in Explore open the quick-view modal on click.

---

## Phase 4: User Story 2 - 卡片保留直接进入详情页的独立入口 (Priority: P1)

**Goal**: 每张条目卡片底栏右下角提供独立的“进入详情 ↗”实体按钮，点击直接导航至 `/entries/<slug>/`，并阻止冒泡触发弹窗，支持鼠标右键/中键在新标签页中打开。

**Independent Test**: 鼠标点击卡片底栏右下角“进入详情 ↗”按钮或使用键盘聚焦触发，验证浏览器直接导航进入规范详情页 `/entries/<slug>/`；右键点击验证可在新标签页打开。

### Implementation for User Story 2

- [X] T009 [US2] Refactor Explore card DOM in `src/components/islands/ExploreIsland.tsx` to decouple card body click from `.specimen-direct-btn` with `stopPropagation`
- [X] T010 [US2] Style `.specimen-direct-btn` with tactile borders, hover background change (`var(--yellow)`), active press, and `focus-visible` dual ring in `src/styles/home.css`

**Checkpoint**: User Story 1 AND User Story 2 both work seamlessly together — cards offer both instant preview and direct detail entry.

---

## Phase 5: User Story 3 - 弹窗内完整速览、快捷操作与流转能力 (Priority: P2)

**Goal**: 速览大弹窗内部提供“查看完整详情页”主操作按钮以支持深度阅读流转，并支持点击弹窗内标签芯片联动外部筛选。

**Independent Test**: 在弹窗内点击底部“查看完整详情页”按钮验证直接跳转至对应条目长文；点击弹窗内标签验证弹窗关闭并将探索列表联动筛选为该标签。

### Implementation for User Story 3

- [X] T011 [US3] Add primary navigation button (`.quickview-primary-action-btn`) pointing to `entry.canonicalUrl` in `src/components/islands/QuickViewModal.tsx`
- [X] T012 [US3] Wire `onTagClick` callback in `QuickViewModal.tsx` and connect it to `setSelectedTag` in `src/components/islands/ExploreIsland.tsx`

**Checkpoint**: In-modal transitions and tag-filter interactions are fully operational.

---

## Phase 6: User Story 4 - 完备的无障碍、焦点管理与便捷退出机制 (Priority: P2)

**Goal**: 实现 WAI-ARIA 对话框语义、键盘焦点陷阱（Focus Trap）、`Esc` 键退出、遮罩点击退出、关闭按钮退出、Body Scroll Lock 背景滚动锁定以及焦点精准恢复至原卡片。

**Independent Test**: 打开弹窗后按 `Tab` 验证焦点在弹窗内循环；测试按 `Esc` 键、点击遮罩、点击关闭按钮均能退出；验证退出后焦点精准恢复到原卡片；验证背景页面在弹窗打开期间无法滚动。

### Implementation for User Story 4

- [X] T013 [US4] Implement Body Scroll Lock lifecycle (`document.body.style.overflow = 'hidden'` on open, restored on close) in `src/components/islands/QuickViewModal.tsx`
- [X] T014 [US4] Implement Focus Trap, `Esc` key listener, and focus restoration to `triggerElement` in `src/components/islands/QuickViewModal.tsx`
- [X] T015 [US4] Add WAI-ARIA attributes (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`, `aria-describedby`) and backdrop click listener in `src/components/islands/QuickViewModal.tsx`

**Checkpoint**: Accessible modal lifecycle meets WAI-ARIA and Constitution standards with zero focus leaks.

---

## Phase 7: User Story 5 - 无脚本环境下的渐进增强与静态回退 (Priority: P3)

**Goal**: FeaturedSection 静态卡片支持双触点交互与全局弹窗事件派发，并在无 JS 环境下与 ExploreFallback 一同保持标准超链接可达性。

**Independent Test**: 禁用 JS 刷新页面，验证点击卡片直接跳转；开启 JS 时点击 Featured 卡片主体唤起弹窗，点击右下角按钮直接跳转。

### Implementation for User Story 5
- [X] T016 [US5] Refactor `src/components/home/FeaturedSection.astro` to add `.specimen-direct-btn` and custom event dispatcher (`garden:open-entry-preview`)
- [X] T017 [US5] Register global `garden:open-entry-preview` CustomEvent listener in `src/components/islands/ExploreIsland.tsx` to handle cross-section modal triggers
- [X] T018 [US5] Verify and ensure semantic fallback links in `src/components/home/ExploreFallback.astro` for no-JS environments

**Checkpoint**: Cross-section card triggers work seamlessly and progressive enhancement fallback is complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Cross-device visual verification, touch target audit, performance check, and build verification.

- [X] T019 [P] Audit $\ge 44\text{px}$ touch targets on all interactive buttons and chips in `src/styles/responsive.css`
- [X] T020 [P] Audit `prefers-reduced-motion: reduce` media query rules for modal transitions in `src/styles/responsive.css`
- [X] T021 Run full automated test suite via `pnpm test` and ensure all tests pass
- [X] T022 Run production static build via `pnpm build` and verify 0 errors / 0 warnings
- [X] T023 Execute all 7 validation scenarios from `specs/003-entry-preview-modal/quickstart.md` across desktop and mobile viewports
---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately.
- **Foundational (Phase 2)**: Depends on Phase 1 completion — **BLOCKS all user stories**.
- **User Story 1 (Phase 3 - MVP)**: Depends on Phase 2. Core modal component & Explore integration.
- **User Story 2 (Phase 4)**: Depends on Phase 2 & Phase 3. Card dual-touchpoint refactoring.
- **User Story 3 (Phase 5)**: Depends on Phase 3. In-modal actions and tag navigation.
- **User Story 4 (Phase 6)**: Depends on Phase 3. Focus trap, scroll lock, and keyboard listeners.
- **User Story 5 (Phase 7)**: Depends on Phase 3 & Phase 4. Cross-section event bridge for FeaturedSection.
- **Polish (Phase 8)**: Depends on all user stories being complete.

```text
Phase 1 (Setup) ──► Phase 2 (Foundational CSS) ──► Phase 3 (US1: Core Modal MVP)
                                                         │
               ┌─────────────────────────────────────────┼────────────────────────────────────────┐
               ▼                                         ▼                                        ▼
    Phase 4 (US2: Card Button)                Phase 5 (US3: In-Modal Actions)         Phase 6 (US4: Accessibility)
               │                                         │                                        │
               └─────────────────────────────────────────┼────────────────────────────────────────┘
                                                         ▼
                                              Phase 7 (US5: Cross-Section Bridge)
                                                         ▼
                                              Phase 8 (Polish & Verification)
```

---

## Parallel Opportunities

- **Phase 1**: T002 can run in parallel with T001.
- **Phase 2**: T004 and T005 can run in parallel with T003.
- **Phase 3+**: Once Phase 3 (US1) is implemented, US2 (T009-T010), US3 (T011-T012), and US4 (T013-T015) can proceed with minimal coupling.
- **Phase 8**: T019 and T020 can run in parallel.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (`tokens.css`, types)
2. Complete Phase 2: Foundational (`home.css`, `responsive.css`)
3. Complete Phase 3: User Story 1 (`QuickViewModal.tsx`, `ExploreIsland.tsx`)
4. **STOP and VALIDATE**: Verify that clicking cards in Explore opens the quick-view modal.

### Incremental Delivery

1. **Increment 1 (MVP)**: Explore card click opens Quick-View Modal.
2. **Increment 2**: Card bottom-right "进入详情 ↗" button allows direct navigation without popup.
3. **Increment 3**: In-modal primary action button and tag filtering.
4. **Increment 4**: WAI-ARIA compliance, focus trap, Esc key, and body scroll lock.
5. **Increment 5**: FeaturedSection cross-section event bridge & no-JS static fallback.
6. **Increment 6**: Full test suite, production build, and quickstart verification.
