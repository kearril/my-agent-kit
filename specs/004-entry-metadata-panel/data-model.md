# Data Model & Layout Contracts: Entry Detail Metadata Card Panel (条目详情页独立元数据卡片面板)

**Branch**: `004-entry-metadata-panel`  
**Date**: 2026-08-29  
**Status**: Completed  

---

## 1. 核心实体模型 (Core Entities)

### 1.1 SpecimenReadingPayload (居中正文卷宗载荷)

专供居中正文卷宗（`article-content`）消费的数据模型，保持正文领域的纯粹性，不掺杂任何非内容属性：

```typescript
export interface SpecimenReadingPayload {
  /** 规范标本编号 (不可变 slug，如 "strategy-plan-confidence-loop") */
  id: string;
  /** 条目标题 */
  title: string;
  /** 标本摘要提要 (前置导读) */
  summary?: string;
  /** 规范访问路径 (如 "/entries/strategy-plan-confidence-loop/") */
  canonicalPath: string;
  /** 编译渲染后的 Markdown 正文组件 */
  Content: any;
}
```

### 1.2 SpecimenMetadataDossier (独立元数据档案载荷)

专供独立的单张一体化元数据档案大卡（`EntryMetadataPanel.astro`）消费的数据模型：

```typescript
import type { CollectionEntry } from 'astro:content';

export type EntryType = 'prompt' | 'skill' | 'mcp' | 'website' | 'project' | 'note';

export interface ResourceLink {
  /** 链接显示文本 (如 "GitHub 仓库", "官方在线文档") */
  label: string;
  /** 外部目标 URL */
  url: string;
}

export interface SpecimenMetadataDossier {
  /** 标本编号 */
  id: string;
  /** 资产大类 */
  type: EntryType;
  /** 专属分类 (如 Note 卷别 "AI Engineering", "Product Design") */
  category?: string;
  /** 首次收录日期 (ISO 格式与 Date 实例) */
  publishedAt?: Date;
  /** 最近修订日期 (ISO 格式与 Date 实例) */
  updatedAt: Date;
  /** 标签主题矩阵 */
  tags: string[];
  /** 外部资源直达链接列表 */
  links?: ResourceLink[];
  /** 双向关联条目集合 (Related) */
  related: CollectionEntry<'entries'>[];
  /** 反向引用条目集合 (Backlinks) */
  backlinks: CollectionEntry<'entries'>[];
}
```

---

## 2. 视口与布局状态机 (Viewport & Layout State Flow)

页面基于 CSS 媒体查询与原生 HTML5 语义实现无缝的状态自适应，零运行时状态机开销：

```text
                           ┌─────────────────────────────────────┐
                           │      INITIAL STATIC SSG LOAD        │
                           │   服务端完全静态生成 HTML5 标记      │
                           └──────────────────┬──────────────────┘
                                              │
                       CSS 媒体查询判定视口宽度
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      │                                               │
           视口宽度 ≥ 1200px                                视口宽度 < 1200px
                      │                                               │
                      ▼                                               ▼
     ┌─────────────────────────────────┐             ┌─────────────────────────────────┐
     │   DESKTOP WIDESCREEN (宽屏态)    │             │    MOBILE COMPACT (小屏态)      │
     │  - 启用 3 栏居中对齐 CSS Grid   │             │  - 单栏流式自适应垂直排列       │
     │  - 正文卷宗严格对齐屏幕中轴线   │             │  - 正文卷宗占满阅读安全区 (100%) │
     │  - 元数据大卡停靠于左外边缘     │             │  - 正文上方呈现紧凑折叠档案卡   │
     │  - position: sticky 顶部粘性    │             │  - 强制使用 <details> 原生折叠  │
     │  - 内部具备独立滚动 (≤ 100vh)   │             │  - 默认收起/展示基础标牌        │
     └─────────────────────────────────┘             └────────────────┬────────────────┘
                                                                      │
                                                           用户点击 <summary> 触发展开
                                                                      │
                                                                      ▼
                                                     ┌─────────────────────────────────┐
                                                     │    ACCORDION EXPANDED (展开态)  │
                                                     │  - 原生展开标签矩阵与外链资源   │
                                                     │  - 原生展开双向关联与反向引用   │
                                                     │  - 再次点击平滑折叠收起         │
                                                     └─────────────────────────────────┘
```

---

## 3. 校验规则与系统不变量 (Validation & Invariants)

1. **正文纯粹性不变量 (Prose Purity Invariant)**：
   - 居中正文容器 `.article-content` 内部**严禁出现任何非正文元数据**（包括但不限于：时间戳、分类徽章、标签列表、外部链接、关联条目、反向引用）。
   - `.article-content` 内仅且只包含：大标题 `h1.article-main-title`、摘要框 `.article-summary-box`、Markdown 正文容器 `.prose` 以及正文内代码块复制控件。
2. **中轴居中不变量 (Center-Axis Alignment Invariant)**：
   - 居中正文卷宗的水平中轴线必须与浏览器视口的水平中轴线严格重合，误差为 $0\text{px}$。
   - 左侧元数据档案大卡与右侧对称空白留白区域等宽，保证在桌面端屏幕变宽时正文绝对不发生偏心偏移。
3. **渐进增强与零 JS 不变量 (Zero-JS Progressive Enhancement Invariant)**：
   - 移动端折叠档案卡必须由原生 HTML5 `<details>` 与 `<summary>` 驱动，在客户端禁用 JavaScript 时，展开/收起能力与所有链接可达性保持 100% 正常。
4. **空数据优雅降级不变量 (Empty State Graceful Degradation)**：
   - 当 `links` 为空或长度为 0 时，元数据大卡内不渲染外部链接区块；
   - 当 `related` 为空时，不渲染双向关联区块；
   - 当 `backlinks` 为空时，不渲染反向引用区块；
   - 当条目仅有基础信息时，元数据大卡紧凑呈现基础标牌与标签，不留白、不破损。
5. **触控与无障碍几何约束 (Touch & Accessibility Invariants)**：
   - 所有的外链超链接、关联卡片项、标签徽章与 `<summary>` 折叠按钮，其有效触控热区必须 $\ge 44\text{px} \times 44\text{px}$；
   - 在 `:focus-visible` 时，必须呈现双层纯黑与青色高对比度焦点环。
