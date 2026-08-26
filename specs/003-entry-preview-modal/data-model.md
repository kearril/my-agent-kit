# Data Model & State Transitions: Entry Card Quick-View Modal (条目卡片速览大弹窗)

**Feature**: `003-entry-preview-modal`  
**Date**: 2026-08-26  
**Status**: Completed  

---

## 1. 核心实体模型 (Core Entities)

### 1.1 QuickViewEntry (速览条目实体)

速览大弹窗与标本卡片消费的核心数据模型，复用并扩展自现有的 `ExploreEntry` 结构：

```typescript
export type ExploreEntryType = 'prompt' | 'skill' | 'mcp' | 'website' | 'project';

export interface QuickViewEntry {
  /** 唯一不可变标识符 (如 "astro-theme-scrapbook") */
  slug: string;
  /** 资产类型 */
  type: ExploreEntryType;
  /** 条目标题 */
  title: string;
  /** 完整摘要 / 简短说明正文 */
  summary: string;
  /** 分类标签列表 */
  tags: string[];
  /** 首发公开日期 (YYYY-MM-DD) */
  publishedAt: string;
  /** 最近更新日期 (YYYY-MM-DD) */
  updatedAt: string;
  /** 规范详情页路径 (如 "/entries/astro-theme-scrapbook/") */
  canonicalUrl: string;
}
```

### 1.2 ModalSessionState (弹窗会话与焦点状态)

模态弹窗在客户端运行时的生命周期状态：

```typescript
export interface ModalSessionState {
  /** 弹窗是否处于激活/打开状态 */
  isOpen: boolean;
  /** 当前被唤起速览的条目数据，为 null 时表示弹窗关闭 */
  activeEntry: QuickViewEntry | null;
  /** 唤起该弹窗的原始卡片/按钮 DOM 节点，用于关闭后恢复焦点 */
  triggerElement: HTMLElement | null;
  /** 背景页面滚动锁定标记 */
  isScrollLocked: boolean;
}
```

### 1.3 CardActionTarget (卡片双触点交互目标)

条目卡片内部的交互触点定义：

```typescript
export type CardActionType = 'open-preview' | 'direct-navigate';

export interface CardActionTarget {
  /** 操作类型：速览弹窗 vs 直接跳转 */
  action: CardActionType;
  /** 条目数据 */
  entry: QuickViewEntry;
  /** 目标 URL (仅在 direct-navigate 或回退时使用) */
  targetUrl: string;
}
```

---

## 2. 状态机与生命周期流转 (State Transition Diagram)

速览大弹窗遵循严格的模态生命周期，确保视觉过渡平滑、焦点流转可追溯且背景滚动安全：

```text
               ┌───────────────────────────────┐
               │         CLOSED (关闭态)        │
               │  - 背景页面正常滚动            │
               │  - 焦点位于常规页面元素        │
               │  - activeEntry = null         │
               └───────────────┬───────────────┘
                               │
            用户点击卡片主体 或 键盘回车触发
            (Captures triggerElement)
                               │
                               ▼
               ┌───────────────────────────────┐
               │        OPENING (唤起中)       │
               │  - 锁定背景滚动 (overflow:hidden)│
               │  - 装载 activeEntry 数据       │
               │  - 渲染遮罩与弹窗容器          │
               └───────────────┬───────────────┘
                               │
                     DOM 挂载与动画就绪
                               │
                               ▼
               ┌───────────────────────────────┐
               │         ACTIVE (激活态)        │
               │  - 焦点陷阱 (Focus Trap) 生效  │
               │  - 首个焦点移至关闭按钮         │
               │  - Tab / Shift+Tab 内部循环   │
               │  - 内容区支持内部纵向滚动 (≤85vh)│
               └───────────────┬───────────────┘
                               │
            触发退出: 按 Esc / 点击遮罩 / 点击关闭按钮
                               │
                               ▼
               ┌───────────────────────────────┐
               │        CLOSING (退出中)       │
               │  - 卸载焦点陷阱与按键监听器    │
               │  - 恢复背景滚动 (overflow:'') │
               └───────────────┬───────────────┘
                               │
                           清理完成
                               │
                               ▼
               ┌───────────────────────────────┐
               │    FOCUS RESTORED (就绪态)     │
               │  - 焦点精准还原至 triggerElement│
               │  - 回到 CLOSED 状态           │
               └───────────────────────────────┘
```

---

## 3. 校验规则与系统不变量 (Validation & Invariants)

1. **不可变规范 URL (Canonical URL Invariant)**：
   - 每一个 `QuickViewEntry` 的 `canonicalUrl` 必须严格等于 `/entries/${slug}/`。
   - 弹窗底部的“前往条目详情页”按钮与卡片底栏右下角的“进入详情 ↗”按钮，其 `href` 必须 100% 指向此不可变地址。
2. **滚动锁定单例保证 (Scroll Lock Singleton)**：
   - 弹窗进入 `ACTIVE` 状态时，必须且仅执行一次 `document.body.style.overflow = 'hidden'`。
   - 弹窗完全退出时，必须无条件清理 `document.body.style.overflow = ''`，防止页面发生滚动死锁。
3. **焦点保护与无障碍边界 (Focus Boundaries)**：
   - 弹窗激活期间，`document.activeElement` 必须始终位于弹窗容器内。
   - 弹窗关闭后，若 `triggerElement` 仍在 DOM 中，必须在 16ms 内执行 `triggerElement.focus()`。
4. **触控与视口几何约束 (Touch & Viewport Constraints)**：
   - 弹窗容器最大高度 $\le 85\text{vh}$，最大宽度 $\le 720\text{px}$，在小屏（$\le 480\text{px}$）下宽度占 $92\text{vw}$。
   - 关闭按钮与底部直达按钮的触控热区尺寸必须 $\ge 44\text{px} \times 44\text{px}$。
