<!--
Sync Impact Report
- Version change: 1.0.0 → 1.0.1
- Modified principles:
  - `Design, Accessibility, and Public Experience`: Clarified reading binder comfort, soft-wrapping engineering paper code blocks with anti-overlap zones, tactile physical button feedback, and Lucide SVG iconography standards.
- Added sections: None
- Removed sections: None
- Follow-up TODOs: None
-->

# Paracosm Garden Constitution

## Core Principles

### I. Static-First Astro and Island Boundaries

公开页面、静态内容和服务端生成 MUST 优先由 Astro 负责。React MUST
仅用于需要浏览器状态、事件监听或浏览器 API 的局部 Island；不得把公开站点
改造成客户端 React 应用。

本地条目编辑台 MUST 只在开发服务器生命周期中运行。`src/dev/`、编辑台
middleware 和写入 API MUST NOT 被公开页面、生产布局或静态构建产物导入。

**Rationale**: 保持静态输出、首屏可访问性和部署边界，同时避免浏览器端状态
扩散到不需要它的页面。详细边界见 `docs/DEVELOPMENT.md`。

### II. Content Collections as the Source of Truth

条目数据 MUST 以 Astro Content Collections 为唯一事实来源。公开条目 MUST
存放在 `src/content/entries/<type>/` 的 Markdown 或 MDX 文件中；页面、组件、
查询模块和编辑台不得维护同一条目的第二份持久数据。

涉及条目字段、类型、关联、草稿状态或公开边界的改动 MUST 同步检查
`src/content.config.ts` 与 `docs/CONTENT.md`。构建期校验失败的内容不得绕过
schema 或通过组件内的特殊分支发布。

**Rationale**: 单一内容来源能够保证首页、条目页、Explore、RSS、sitemap
和编辑台使用相同数据。详细字段和目录规则见 `docs/CONTENT.md`。

### III. Stable Public Content Identity

每个公开条目的 `slug` MUST 是全站唯一、小写 ASCII kebab-case 且不可变的
公开身份。规范访问路径 MUST 使用 `/entries/<slug>/`；文件名和内部目录
调整不得改变已经公开的 slug。

`related` 引用 MUST 指向现存条目的 slug。草稿条目 MUST NOT 设置
`publishedAt`；公开条目 MUST 设置 `publishedAt`。破坏已有公开 URL 或关联
语义的改动 MUST 明确记录迁移方案并经过审查。

**Rationale**: 稳定身份是反向链接、RSS、sitemap、外部引用和搜索发现的基础。

### IV. Intentional Simplicity and Clear Boundaries

代码 MUST 按现有目录职责放置：页面负责组装和传递数据，`src/lib/` 负责
内容查询、排序、关联图谱、反向链接和索引计算，组件负责渲染，样式目录
不得承载内容或业务逻辑。

新增依赖前 MUST 证明现有 Astro、原生 CSS、浏览器 API 或项目已有能力无法
满足需求。一次性文字、一次性视觉细节和没有明确复用价值的代码 MUST NOT
被抽象成通用组件。复杂度增加时，方案 MUST 说明必要性以及被拒绝的更简单
替代方案。

**Rationale**: 清晰边界降低静态构建、内容演进和 AI 修改之间的耦合，避免
为了假设中的未来需求提前建立抽象。

### V. Verifiable Quality and Traceable Delivery

涉及多个文件、新页面、新交互、路由、查询逻辑、关联图谱、索引、schema
或部署边界的功能 MUST 先形成可审查的 feature specification、implementation
plan 和 task list，再进入实现阶段。一次性内容编辑和低风险文字修正可以直接
遵守对应内容文档完成。

需求 MUST 包含可测试的用户场景、边界条件和成功标准；方案 MUST 映射到真实
目录和文件；任务 MUST 包含明确路径、依赖关系和可验证的完成条件。实现后
MUST 对照 spec、plan 和 tasks 进行收敛检查，不得只以“代码看起来完成”为准。

**Rationale**: 让需求、技术决策、实现任务和代码保持可追溯，降低遗漏验收
条件和让规范落后于实现的风险。

## Design, Accessibility, and Public Experience

公开 UI MUST 遵守 `docs/DESIGN.md` 的俏皮野兽派设计规范。交付实现 MUST
使用直角结构、纯黑粗边框（2.5px ~ 4px）和硬边实色阴影（4px ~ 8px）；不得使用
圆角、渐变、模糊阴影、玻璃态、过度旋转或默认的柔和灰色主题。旋转角度 MUST NOT
超过 3 度。

长文阅读页 MUST 采用温润纸品底色、65~75 字符黄金行宽与 1.8 舒适行高；代码与
提示词展示块 MUST 采用浅色工程纸底色（`#f0eae1`）与深墨色文字，使用智能软折行
消除横向滚动条，并预留安全操作栏杜绝一键复制控件与正文重叠遮挡。装饰与功能图标
MUST 使用统一线宽的 SVG 线性图标，禁止使用原生 Emoji 作为页面装饰符号。

每个交互元素 MUST 有可访问名称、清晰的 `focus-visible` 状态和不小于 44px
的触控目标。弹窗 MUST 管理焦点、支持 Esc 关闭并恢复背景滚动；搜索、筛选、
加载、空状态和错误状态 MUST 有明确文本，不得只依赖颜色表达状态。

动效 MUST 不引发布局跳动、不抢夺键盘焦点，并在
`prefers-reduced-motion: reduce` 下减弱或关闭。公开交互 MUST 在移动端可用；
需要浏览器状态的区域 MUST 保留合理的无 JavaScript 静态回退。

## Documentation, Content, and Change Control

详细规则 MUST 只维护在其对应的权威文档中，不得在 Constitution、组件注释
或 feature 文档中复制完整的规则表。职责如下：

- `AGENTS.md`：代理安全、范围、工具和仓库级工作纪律。
- `docs/DEVELOPMENT.md`：开发、依赖、验证、Git 和目录职责。
- `docs/CONTENT.md`：内容类型、字段、slug、关联和公开规则。
- `docs/DESIGN.md`：视觉 token、组件模式、交互和无障碍清单。
- `docs/DEPLOYMENT.md`：Cloudflare Pages、域名和首发准备。
- `docs/adr/`：仍会约束未来实现的架构决定。
- `specs/<feature>/`：单个功能的需求、方案、任务和验证记录。

当详细规则发生变化时，修改对应权威文档；当长期治理原则发生变化时，
使用 `/speckit.constitution` 同步修改 Constitution。字段、schema、公开路由
或架构边界变化 MUST 同时更新受影响的源码和文档。一次性实施过程、临时
交接材料和已失效方案 MUST NOT 进入长期权威文档。

## Governance

对于代理安全、仓库范围和工具纪律，`AGENTS.md` 是上位约束；本 Constitution
负责功能意图、架构边界、质量门禁和长期工程治理。对应 `docs/` 文件是具体
规则的详细来源；三者不得互相产生未记录的冲突。

每次 Constitution 修订 MUST：

1. 通过 `/speckit.constitution` 或等价的明确治理变更完成；
2. 在文件顶部更新 Sync Impact Report；
3. 按语义化版本规则更新版本号；
4. 说明新增、修改、移除的原则及其影响；
5. 若原则影响 schema、代码、测试、内容或部署，创建后续 feature 或文档
   变更，不在 Constitution 命令中顺手修改无关文件；
6. 在合并前重新检查相关的 spec、plan、tasks、测试和构建结果。

版本规则如下：

- MAJOR：移除、重定义或放宽已有的强制性原则，导致现有实现可能不再合规；
- MINOR：新增原则、治理章节或实质扩大现有约束；
- PATCH：澄清措辞、修正错误或不改变治理含义的细节调整。

实施方案 MUST 通过 Constitution Check。违反 MUST 原则时，方案 MUST 先
调整；若确实需要例外，plan.md 的 Complexity Tracking MUST记录违反的原则、
业务或技术理由，以及为什么更简单的方案不可行。例外不得通过删除检查、
特殊输入分支或沉默忽略来实现。

质量门禁按改动风险执行：

- 内容查询、关联图谱、索引或 schema 变化：`pnpm test && pnpm build`；
- 普通页面、组件或内容变化：至少 `pnpm build`；
- 交互、视觉、全局样式、路由重组或平台配置变化：除命令验证外，必须检查
  桌面端、移动端、键盘焦点、Esc、空状态、无 JavaScript 回退和 reduced-motion。

`main` MUST 保持可构建、可部署。不得提交密钥、个人隐私、未确认公开的内容、
`node_modules`、`dist` 或本地环境文件。公开部署前 MUST 完成内容、公开边界、
首发文案和部署清单审查。

**Version**: 1.0.1 | **Ratified**: 2026-08-25 | **Last Amended**: 2026-08-26
