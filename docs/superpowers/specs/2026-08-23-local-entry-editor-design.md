# 本地条目编辑台设计

- 状态：规格与 UI 设计已获批准，待实施计划
- 日期：2026-08-23

## 目标

在 `pnpm dev` 的 localhost 环境中提供浏览器编辑台，可浏览、创建和保存本地 Markdown/MDX 条目。保存直接写入 `src/content/entries/` 的源文件，使 Content Collections 和 Git 工作流继续作为唯一事实来源。

公开静态站点不包含编辑页面、编辑器前端代码或任何文件写入端点。

## 非目标

- 不添加 SSR、数据库、CMS、远程同步或公开管理后台。
- 不允许局域网、远程设备或生产环境访问编辑器。
- 不支持删除条目、批量编辑、slug 重命名、已有条目的 type 迁移或文件路径迁移。
- 不实现富文本编辑器、所见即所得编辑或未保存 MDX 预览。
- 不在首版解决 Markdown 中本地相对图片的未保存预览。
- 不因编辑能力预先改变公开页面、Explore、筛选或排序。
- 不考虑手机或平板端布局、抽屉导航或响应式视图切换；编辑台仅服务桌面开发窗口。


## 运行边界

新增本地编辑 Astro Integration。它通过 `astro:server:setup` 仅在开发服务器上注册 Vite middleware：

- 编辑台 URL：`/__garden-editor/`。
- API 命名空间：`/__garden-editor/api/`。
- middleware 只接受 loopback socket 地址（`127.0.0.1` 或 `::1`）；不依赖请求头或前端隐藏实现访问控制。
- 编辑台 HTML 壳和 React 模块由 middleware/Vite 开发模块提供；不在 `src/pages/` 中声明路由。
- `astro build` 不触发该 hook，因此 `dist` 不得产生编辑 URL、写入 API 或编辑器 bundle。

浏览器 File System Access API 不用于正式写入路径。浏览器仅通过同源 localhost API 提交表单；服务端统一处理文件访问、校验和内容刷新。

## 模块边界

| 模块 | 职责 |
| --- | --- |
| `src/integrations/local-editor.ts` | 开发专用 middleware、loopback 检查、API 路由和 `refreshContent()` 调用。 |
| `src/dev/editor.tsx`、`src/dev/editor.css` | 未被生产入口引用的 React 编辑台：列表、表单、脏状态、预览和保存反馈。 |
| `src/lib/entry-data.ts` | 共享字段、类型定义注册表与跨字段校验；供 Content Collection 和编辑 API 使用。 |
| `src/dev/server/entry-store.ts` | 使用 Collection `filePath` 读取源文件、解析与规范化 Frontmatter、revision 冲突检查和写回。 |
| `tests/` | 编辑 schema、序列化、冲突、预览边界和开发/生产隔离契约。 |

新增直接开发依赖仅限：

- `yaml`：解析并稳定序列化 YAML Frontmatter。
- `marked`：生成 GFM Markdown 未保存预览。

不引入富文本编辑器、组件库或全站 React 状态层。

## 内容与类型模型

### 共享字段

所有类型继续采用现有最小字段：`slug`、`title`、`summary`、`tags`、`source`、`links`、`related`、`createdAt`、`publishedAt`、`updatedAt`、`featuredOrder` 与 `draft`。

### 类型注册表

以单一类型注册表替代分散的 type 条件分支。每项定义：

- 不可变 type id、显示名称和新建条目目录；
- 类型专属的严格 schema；
- 专属字段默认值；
- 编辑器字段描述：字段名、控件、标签、必填性、选项与校验提示。

Content Collection 联合 schema、编辑 API 校验和新建类型选择器从该注册表派生。当前注册 `prompt`、`skill`、`mcp`、`website`、`project`、`note`；`note` 的 `category` 是当前唯一专属字段。

未来新类型以新增一个注册定义的方式扩展。其专属 metadata 以**严格的扁平顶层 Frontmatter 字段**保存，例如 `book` 可声明 `author`、`isbn`。禁止自由 `metadata` JSON 或未知字段透传。新增类型还必须更新 `docs/CONTENT.md` 并加入代表性测试 fixture；只有它实际需要公开筛选、排序或固定展示时，才另外改 Explore 或公开组件。

### type 与文件位置

- 新建时选择 type；目标路径固定为 `src/content/entries/<type>/<slug>.md`。
- 已有条目的 type、源文件路径和扩展名在编辑台中只读。
- 本功能不会迁移已有条目的 type 或文件。slug、公开 URL、创建日期、首次公开日期和关联引用均不会因浏览器编辑改变。

## 编辑台行为

### 条目范围与导航

编辑台列出全部本地源条目，包括公开条目、`draft: true` 条目和 `*.local.md(x)` 视觉测试条目。列表支持按 title、slug、type 与 draft 状态筛选；正文只在进入详情时读取。

新建和编辑使用同一张表单：共享字段与当前 type 的专属字段组合。重复字段（tags、links、related）使用可访问的增删控件；`related` 从全量本地条目中多选，tags 优先提示已有词但允许新增值。

### 不变量与默认值

- 新建 slug 手动输入并即时检查 lowercase ASCII kebab-case、全站唯一性和目标文件冲突。
- 已有条目的 slug、`createdAt` 与已存在的 `publishedAt` 只读。
- 新建默认 `draft: true`；`createdAt`、`updatedAt` 为创建当天，无 `publishedAt`。
- 从 draft 改为公开时必须填写 `publishedAt`；首次公开日期一旦存在即锁定。
- 每次成功保存既有条目时，服务端自动将 `updatedAt` 更新为当天。
- 表单有明确的保存按钮；修改后标记为脏，离开前提示。预览和校验失败绝不写文件。

### 桌面工作台布局

编辑台为桌面专用三栏工作台，上方使用独立本地工具栏，不复用公开站点 Header 或 Footer：

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ LOCAL ENTRY EDITOR · localhost · 条目计数                              + NEW ENTRY       │
├───────────────────┬─────────────────────────────────┬───────────────────────────────────┤
│ FIND ENTRIES      │ 当前 type / slug                 │ PREVIEW                           │
│ 搜索、状态与类型筛选 │ 结构化 metadata 与 Markdown 正文   │ 未保存内容预览                      │
│ 可滚动条目列表       │ SAVE · PREVIEW · EXPAND EDITOR │ EXPAND PREVIEW                    │
└───────────────────┴─────────────────────────────────┴───────────────────────────────────┘
```

- 顶部工具栏左侧显示 `LOCAL ENTRY EDITOR` 与 localhost/dev 状态，中部显示条目总数或当前筛选结果，右侧只有 `+ NEW ENTRY`。保存和预览属于条目上下文，留在编辑列。
- 左侧条目导航列固定约 `300–320px`，始终保留。顺序为搜索、`ALL / DRAFT / LOCAL` 状态筛选、type 筛选和可滚动条目列表。行显示 type badge、标题、slug 与 `DRAFT`/`LOCAL` 文本状态；选中态和 `UNSAVED` 状态不得只靠颜色。
- 正常模式下编辑列约占主区 60%，最小宽度约 `560px`；预览列约占 40%，最小宽度约 `420px`。未选条目时编辑列显示选择或新建引导，预览列显示空状态。
- `EXPAND EDITOR` 收起预览列，使编辑列占据导航列之外的全部主区；`EXPAND PREVIEW` 反之。导航列始终保留；恢复双栏不丢失表单输入或预览结果。布局状态以可访问的切换按钮与 `aria-pressed` 暴露。

### 结构化字段输入

metadata 不与正文混在同一个原始文件文本编辑器中。每个 metadata 使用独立、带标签和字段级错误的结构化控件；唯一编辑 Markdown 的区域是正文 textarea。保存时服务端从这些控件值生成规范化 YAML Frontmatter。

编辑列按以下顺序组织，不以嵌套卡片分隔：

1. **BASIC INFO**：`title` 单行输入与 `summary` 多行输入。
2. **IDENTITY & PUBLISHING**：新建时可编辑 `type`、`slug`；既有条目只读显示。这里还包括 `draft`、日期与可空 `featuredOrder`，并显示各字段的不变量。
3. **ORGANIZE**：tags 的多值输入，以及显示标题和 slug 的可搜索 `related` 多选控件。
4. **SOURCE & LINKS**：`source` 三项单选；links 使用可增删行，每行固定 `label` 与 `url`，具有行级校验。
5. **TYPE DETAILS**：只在当前 type 注册专属字段时出现，由类型注册表的字段描述生成。
6. **MARKDOWN BODY**：等宽 textarea，占编辑列主要高度；附近显示字符/行数、未保存状态和保存/预览反馈。

预览列初始显示说明状态；点击 `PREVIEW` 后显示未保存快照，并在列头标示其来源与最后生成时间。`.mdx` 条目显示不可预览的原因和保存后真实条目页链接。


## API、校验与写回

编辑 API 至少分为条目列表、条目详情、只读预览、创建和保存既有条目五类操作。详情响应提供 metadata、原始正文、`filePath` 和 revision；列表仅提供列表显示需要的信息。

保存顺序：

1. 校验 loopback 来源、请求大小和 JSON 形状。
2. 用请求携带的 revision 比对当前文件；不一致时返回 `409 Conflict`，保留浏览器输入，禁止静默覆盖。
3. 执行共享字段和 type 专属字段的严格 schema 校验。
4. 检查 slug、目标路径和 `featuredOrder` 的唯一性，以及所有 `related` 引用存在。
5. 仅在校验通过时写入：Frontmatter 按稳定字段顺序规范化为 YAML，正文按原文附在分隔线之后。
6. 写入成功后调用 `refreshContent()`，返回新 revision 和真实条目 URL。

规范化 YAML 是有意行为：Frontmatter 的手工缩进、排序与注释不保证保留；正文不格式化。

## 未保存 Markdown 预览

`.md` 编辑表单提供显式“预览”切换。点击后把当前未保存的 metadata 与正文发送至只读预览 API；预览先通过与保存相同的 schema 校验，但不执行文件写入。

API 使用 `marked` 渲染 GFM Markdown，并重写 raw HTML token 为转义文本。预览在无脚本 sandbox iframe 中显示 title、summary、metadata 与正文，隔离预览文档，避免其获得编辑台同源权限。

- 绝对 URL 图片可以显示。
- 本地相对图片显示为“不支持未保存预览”的提示；保存后在真实条目页检查。
- `.mdx` 条目可编辑和保存，但预览按钮禁用，并提示保存后使用真实条目页验证。
- 校验错误显示在字段旁并保留当前输入。

## 无障碍与视觉

编辑台仅服务桌面开发窗口，使用既有 React 集成和设计 token，遵守俏皮野兽派规范：直角、4px 纯黑边框、实色硬边阴影、无渐变与无模糊阴影。所有输入、重复控件、预览切换与保存操作有可访问名称、可见焦点与至少 44px 触控目标。预览 iframe 有明确标题；脏状态与成功/失败状态不只依赖颜色表达。

## 验收与验证

### 单元与集成契约

- 共享和 type 专属字段 schema、draft/published 日期不变量。
- slug、路径、`featuredOrder` 冲突和失效关联引用。
- Frontmatter 规范化 round-trip 与正文保留。
- revision 冲突返回 `409`，不覆盖源文件。
- Markdown raw HTML 转义；`.mdx` 与本地相对图片未保存预览禁用。
- 新注册 type 自动出现在新建表单并验证其专属字段。

### 行为验证

在本地开发服务器中：新建六种当前类型，编辑所有可变字段，预览未保存 Markdown，触发字段错误和 revision 冲突，保存后经真实条目 URL 确认内容刷新。检查 draft、公开和 `*.local` 条目均被编辑台列出但公开站点仍遵循现有过滤规则。以浏览器在桌面窗口检查三栏、左侧导航持久可见、编辑/预览放大切换、结构化字段错误与键盘焦点。

### 生产隔离验证

执行 `pnpm test && pnpm build`，并确认 `dist` 不包含 `__garden-editor` 路由或编辑台 JavaScript。公开首页、条目、feed、robots 和 sitemap 继续按现有静态流程构建。
