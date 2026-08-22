# 长期运营数字花园架构设计

- 日期：2026-08-23
- 状态：已实施并通过验证（Tasks 1–5 全部落地并建立 Vitest 行为测试保护）
- 决策范围：内容身份、公开路由、静态发布、资源存储、探索交互、搜索发现与验证

## 目标

将 Paracosm Garden 建设为可长期运营的个人数字花园。它必须保持内容可迁移、公开地址稳定、发布成本低、静态优先，并在不引入数据库、登录、CMS 或运行时 API 的前提下支持持续增加公开内容。

## 非目标

首发不实现以下能力：

- 浏览器内容后台、登录、多作者协作或数据库。
- 私密内容托管；未确定公开的材料不进入任何公开远程分支。
- 运行时全文搜索、搜索 SaaS、评论、广告、行为追踪或第三方分析。
- 大文件媒体库、Cloudflare R2、Cloudflare Images、Worker 或 Astro SSR。
- 基于类型的关系词表、手工双向关联、通配符 DNS 或多云灾备。

## 核心原则

1. GitHub 公开仓库是公开源码、内容、少量原创图片、schema 和文档的唯一事实来源。
2. `kearril.com` 是唯一规范公开地址；Cloudflare Pages 是可替换的静态发布目标。
3. 条目身份、展示标题、物理文件名和内容类型必须相互独立。
4. Astro 构建静态核心；React 仅用于需要浏览器状态的局部 Explore Island。
5. 未确定公开的内容不推送。`draft` 控制构建可见性，不承担私密性。
6. 只在真实需求出现后引入新依赖、运行时服务或额外基础设施。

## 域名、托管与发布

```text
GitHub public repository
        │ push / merge to main
        ▼
Cloudflare Pages static build
        ▼
https://kearril.com
```

- 规范地址为 `https://kearril.com`。
- `www.kearril.com` 必须永久跳转到 `kearril.com`，避免重复收录。
- 不创建 `garden.kearril.com` 或其他子域名。普通网站区域使用路径，例如 `/entries/`。
- Cloudflare Pages 连接 GitHub 仓库，生产分支为 `main`，构建命令为 `pnpm build`，输出目录为 `dist`。
- `astro.config.mjs` 必须设置 `site: 'https://kearril.com'` 并显式采用 `output: 'static'`。
- 首发不安装 Cloudflare adapter，不配置 Worker、R2、数据库或运行时 API。
- Cloudflare Preview Deployment 用于分支和 PR 的真实构建预览。它不是私密空间。
- 不手工上传 `dist/`，不在仓库中保存 Cloudflare API Token 或其他部署密钥。

### 发布流程

采用混合流程：

| 改动 | 流程 |
| --- | --- |
| 已准备公开的常规条目、文字修订、链接或摘要调整 | 本地 `pnpm build` 后直接推送 `main`。 |
| 页面、CSS、组件、路由、schema、部署、域名或资源结构 | 分支 → PR → Cloudflare Preview 检查 → 合并 `main`。 |
| 未确定是否公开的内容 | 仅存本地或私有存储，不推送。 |

`main` 始终代表可公开、可构建的生产版本。构建失败时不发布新版本，线上保留最后一次成功构建。

## 内容身份、路由与时间

### 稳定身份

每个条目必须有必填的、全站唯一且创建后不可变的可读英文 slug。使用 slug 覆盖 Astro glob loader 从文件名生成的 collection ID。

```md
---
slug: building-a-long-lived-garden
title: 构建一个可长期运营的数字花园
type: note
---
```

slug 规则：

- 仅使用小写 ASCII 字母、数字和单连字符组成的 kebab-case。
- 不从标题、文件名、类型或日期自动推导。
- 创建后不修改；标题、文件名、分类与类型可以变化。
- slug 同时是 Astro collection ID、`related` 引用键、RSS 项目 ID 和公开 URL 的路径段。

文件名只服务于仓库整理，不是公开身份。

### 统一条目路由

所有公开条目的规范页面为：

```text
https://kearril.com/entries/<immutable-slug>/
```

- `note` 使用长文阅读布局。
- 其他类型使用条目详情布局，展示类型、摘要、正文、来源、链接、标签、日期和关联内容。
- 首页精选、更新、Notes 和 Explore 的所有卡片都链接至此规范地址。
- Explore 的未来快速预览弹窗只能增强浏览，不能作为内容唯一入口。
- 当前的 `/notes/<slug>/` 方案在实施时统一迁移。站点尚未公开且没有正式内容，因此不保留旧路由兼容层。

### 日期模型

| 字段 | 含义 | 公共用途 |
| --- | --- | --- |
| `createdAt` | 首次创建或记录内容的日期 | 保留内容形成历史，默认不展示。 |
| `publishedAt` | 首次正式公开日期 | 必填于公开条目；用于新发布排序、RSS 与元信息。 |
| `updatedAt` | 最近一次实质内容更新日期 | 用于近期更新与更新订阅。 |

- `draft: true` 条目允许只有 `createdAt`，不得设置 `publishedAt`。
- 公开条目必须有 `publishedAt`，且首次填写后不修改。
- 修正错别字或纯格式调整不更新 `updatedAt`；修改正文结论、链接、说明、附件或重要关联时更新。

## 内容模型与关联

保留六种内容类型：`prompt`、`skill`、`mcp`、`website`、`project`、`note`。

- `type` 表示条目的内容形态，不进入 URL。
- `note` 保留单一主分类 `category`；其他类型不携带该字段。
- `tags` 保留为可为空数组，仅承担 Explore 精确筛选；不参与关键词搜索。标签来自真实内容，不维护预设词表或空分类。
- 通过统一规范避免同义标签重复；来源、类型和日期不重复作为标签。
- 不增加自由 `metadata`/`extra`，不提前引入类型专属字段。

### 关联与反向链接

条目仍以简单单向引用表达主动关联：

```yaml
related:
  - astro-content-collections
  - cloudflare-pages-deployment
```

构建层必须从全部公开条目计算反向链接：

- 页面分别显示主动“关联条目”与被其他条目引用的“被提及于”。
- 不手工重复写入反向链接。
- 首版不定义 `uses`、`inspired-by`、`part-of` 等关系类型。只有真实内容反复证明需要时，再将引用升级为带 `kind` 的对象。

## 资源策略

本项目以文字、少量截图与外部链接为主。

| 资源 | 存放位置 | 规则 |
| --- | --- | --- |
| Markdown/MDX、源码、schema、文档 | GitHub 仓库 | 版本化、公开、可迁移。 |
| 少量原创截图和图表 | `src/content/assets/<entry-slug>/` | 与所属内容同一提交；优先 WebP/AVIF。 |
| favicon 与固定站点资源 | `public/` | 仅用于无需 Astro 处理的稳定站点资产。 |
| 外部论文、网站、软件、视频 | 条目的 `links` 字段 | 默认链接，不复制无授权资产。 |
| 私密草稿、原始高分辨率材料 | 本地私有目录或独立私有备份 | 不进入公开 Git 或公开 Pages。 |

- 内容图片目录使用稳定 slug，而非标题或文件名。
- 原始高分辨率图片留在本地备份，不要求提交到公开仓库。
- 不创建 `media.kearril.com`、R2 bucket 或 Cloudflare Images。只有出现大 PDF、音视频、压缩包或大量原始图片时，才评估 R2。
- 若未来启用 R2，公开资源使用 `media.kearril.com` 与不可变版本化路径；R2 不是原始文件的唯一备份。

## 静态渲染与 Explore

```text
Content Collections + src/lib/entries
          │ build-time query
          ▼
Astro static pages and artifacts
├── homepage
├── /entries/<slug>/
├── sitemap.xml
├── feed.xml
└── Explore static fallback
          │ enhancement only
          ▼
React Explore Island
```

- Astro 负责页面、内容渲染、SEO 元信息、静态路由、RSS 和 sitemap。
- `src/lib/` 集中内容查询、排序、公开过滤、slug、关联与反向链接规则；组件不重复这些规则。
- React 仅负责 Explore 的浏览器状态：搜索、类型筛选、标签筛选与加载更多。
- Explore 从构建期生成的轻量公开索引获取数据；不传输全部 MDX 正文、草稿或私密信息。
- 即使 JavaScript 不加载，公开条目页与基础 Explore 链接也必须可访问。
- 未来若出现真正的动态需求，新增局部 Island、预生成索引或独立 Worker；不得把整个站点迁成客户端 React 应用。

### Explore 索引与交互

每条公开索引记录仅包含：

```text
slug, type, title, summary, tags, publishedAt, updatedAt, canonicalUrl
```

- 关键词搜索只匹配 `title` 和 `summary`。
- 类型和标签为精确筛选条件；所有条件取交集。
- 标签列表由公开条目构建时自动汇总；未使用的标签不显示。
- `note` 与其他公开类型都进入全局 Explore Index。
- 加载更多只扩展浏览器中已匹配的静态结果，不访问运行时服务器。
- 空状态必须区分“暂无公开内容”和“当前筛选无结果”，并支持清空筛选。
- 正文全文搜索不在首版实现。内容规模和真实查询需求证明必要后，再引入构建期静态全文索引；不以数据库或搜索 SaaS 起步。

## 公开发现

所有正式公开条目允许搜索引擎收录。

- 配置 canonical URL、允许抓取的 robots 规则和静态 `sitemap.xml`。
- sitemap 只列出公开页面和 `/entries/<slug>/` 路由；draft 不得出现。
- 首发提供 `/feed.xml`，收录所有公开类型的摘要、规范 URL、首次公开与实质更新时间。
- RSS 以规范 URL 作为稳定项目身份，只输出摘要与链接，不渲染完整 MDX 正文。
- 不接入第三方分析、广告、行为追踪、评论系统或 Cookie 依赖。是否引入分析服务是独立的未来决策。
- `robots.txt` 不承担保密职责；私密内容必须不进入公开仓库与构建输入。

## 样式体系

继续使用原生模块化 CSS：

```text
src/styles/
├── tokens.css
├── base.css
├── layout.css
├── home.css
├── article.css
└── responsive.css
```

- CSS custom properties 是唯一 token 来源。
- Astro 与 React Island 复用同一组语义 class 和 token。
- 不重新引入 Tailwind、CSS-in-JS 或第三方 UI 组件库。
- 现有俏皮野兽派视觉规范继续生效，直到另有经过确认的视觉重构。

## 验证与恢复

| 改动 | 证据 |
| --- | --- |
| 纯逻辑函数（路径生成、关联图谱、反向链接与索引生成） | `pnpm test`（Vitest 单元测试覆盖 `tests/lib/`）。 |
| 内容、schema、slug、关联、静态路由、RSS、sitemap | `pnpm build`（Astro 静态构建）。 |
| 页面、CSS、响应式、条目页 | Cloudflare Preview 的桌面与移动端检查。 |
| Explore Island | Preview 验证搜索、筛选、加载更多、空状态、键盘焦点及无 JavaScript 基础链接。 |
| 首发域名与发布 | 检查 `kearril.com`、`www` 跳转、HTTPS、条目页、RSS 与 sitemap。 |

- `pnpm test && pnpm build` 是当前的自动化质量门槛；覆盖纯逻辑契约、Collection schema、引用校验、静态页面和发布产物。
- 公开仓库不应是唯一备份；内容与少量图片需要保留本地工作副本及一份独立可恢复备份。

## 实施迁移边界

本设计尚未改变实现。后续实施必须集中完成以下迁移：

1. 更新内容 schema、示例内容、查询层与文档，建立稳定 slug、三日期和可空 tags。
2. 用 `/entries/[slug].astro` 取代类型耦合的 Note 路由，并让首页链接统一指向规范条目页。
3. 实现公开条目、关联和反向链接的构建时查询 API。
4. 将 Explore 占位区替换为静态回退内容与局部 React Island。
5. 添加 sitemap、RSS、canonical metadata 和正式站点配置。
6. 将发布方式从 GitHub Pages 改为 Cloudflare Pages，绑定 `kearril.com` 和 `www` 跳转。
7. 以 Cloudflare Preview、`pnpm build` 和首发 smoke check 验证。

任何未被本设计明确确认的运行时服务、数据存储、身份系统、内容后台、媒体服务、视觉重构或字段扩展，都必须在实施前另行设计和确认。
