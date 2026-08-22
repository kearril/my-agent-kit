# 内容模型

Paracosm Garden 采用“扁平条目 + 标签筛选”的方式。条目不被固定塞进 AI、收藏或项目等顶层分区；类型和标签分别承担不同职责。

## 初始条目类型

- `prompt`：可复用的提示词
- `skill`：Skill 或个人实践总结的 Skill
- `mcp`：MCP 服务、工具或相关实践
- `website`：网站、文档、文章或外部软件服务等收藏；外部 App 使用 `app` 标签标记
- `project`：具有明确目标和持续边界的完整工作、实验或作品；自制 App 属于此类型，Skill、MCP 等产物可通过关联归入其中
- `note`：独立的随笔、心得、观察和经验总结

条目保持扁平：`type` 描述条目本身的内容形态，`tags` 描述它涉及什么。`project` 不是 Skill、MCP、App 的笼统替代类型；它用于记录一个完整工作单元，并通过 `related` 与其中的产物建立关联。

## 通用字段

所有类型共享以下基础字段；Note 的唯一专属字段见下一节：

- `slug`：必填、全站唯一、不可变的小写 ASCII kebab-case 公开身份与路由标识
- `title`：标题
- `type`：上述六种类型之一（`prompt`、`skill`、`mcp`、`website`、`project`、`note`）
- `summary`：卡片和弹窗中使用的简短说明
- `tags`：可选字符串数组，仅作为 Explore 精确筛选条件；不参与关键词搜索
- `source`：`self`、`adapted` 或 `external`
- `links`：带名称的外部资产地址列表，可为空数组
- `related`：单向不可变目标条目 slug 引用列表；反向链接由站点构建期自动计算
- `createdAt`：条目首次记录日期，保留内容演进历史，默认不展示
- `publishedAt`：公开条目必填，首次正式公开日期，一旦填写不可变更
- `updatedAt`：实质内容更新日期，用于近期更新与 RSS 更新排序
- `featuredOrder`：可选的精选位置，只能是 `1` 至 `6`
- `draft`：是否暂不公开，默认 `false`
`featuredOrder` 同时决定是否进入首页精选区和展示位置：`1` 至 `6` 对应六张等尺寸精选卡；不填写则不进入精选区。公开条目中同一个数字只能使用一次。

`slug` 是全站唯一的稳定公开身份与路径标识，一旦确定不可更改。公开 URL 统一为 `/entries/<slug>/`。文件名仅用于仓库内部整理，不代表公开身份。

`draft` 控制条目是否公开显示；草稿条目禁止设置 `publishedAt`，公开条目必须设置 `publishedAt`。

## Note 的主分类

`note` 是唯一带有专属字段的类型：每篇文章必须填写一个 `category`，例如 `AI`、`科研`、`实践` 或 `随笔`。它表示文章最主要的归属，用于分类识别与未来筛选。

每篇 Note 只能有一个 `category`；`tags` 仍可填写多个，用来描述更细的主题、方法或上下文。分类词汇先随真实文章自然形成，不预设空分类，也不把分类目录化为文件夹。

## 正文

每个条目都必须有正文，但正文不作为 Frontmatter 中的 `content` 或 `body` 字段。它直接写在 Markdown / MDX 的 Frontmatter 之后。

```md
---
slug: building-a-long-lived-garden
title: 构建一个可长期运营的数字花园
type: note
summary: 简短说明
tags: [知识管理]
source: self
links: []
related: []
createdAt: 2026-08-21
publishedAt: 2026-08-21
updatedAt: 2026-08-21
category: 实践
featuredOrder: 1
draft: false
---

这里是完整正文，可写背景、实践过程、心得、引用、代码或图片。
```

`summary` 服务于快速理解和卡片展示；正文服务于完整表达。除 Note 的主分类外，不同类型的内容结构先通过正文自然区分，暂不新增类型专属字段。

## 公开 URL 与内容集合

内容集合定义在 `src/content.config.ts`，集合名为 `entries`。每个条目使用一个 Markdown 或 MDX 文件，统一放在 `src/content/entries/`，不按 type 分文件夹。

所有公开条目的唯一规范访问路径为：

```text
/entries/<slug>/
```

`slug` 在 Frontmatter 中显式声明，并作为 Astro 内容集合的主键 ID。`related` 中填写的也是目标条目的 `slug`。Astro 会校验 `related` 引用的有效性：引用不存在的 slug 时，构建将失败。站点在构建期自动计算反向链接（backlinks）。

## 标签纪律

标签是精确筛选工具，不是新的目录树，也不参与关键词模糊搜索。优先复用已有词汇，并尽量使用短而稳定的中文词。

可以逐步形成这些维度：

- 主题：`AI`、`开发`、`设计`、`效率`
- 用途：`工具`、`自动化`、`写作`、`研究`

初期不为每个新想法创建标签。一个标签至少应能用于两个条目，或者确实代表用户经常需要的一种筛选方式。

来源由 `source` 字段表达，不再通过标签重复记录。

## 外部资产引用

网站负责解释和组织资产，不复制资产本体。链接字段必须：

- 使用完整 URL
- 有明确的显示名称
- 使用数组保存，允许一个条目拥有多个地址

每一项初始只需要 `label` 和 `url`：

```yaml
links:
  - label: 官方仓库
    url: https://github.com/example/project
  - label: 在线演示
    url: https://example.com
```

例如：`官方仓库`、`安装文档`、`在线演示`、`我的版本`、`参考文章`。初期不加入 `kind`、链接检查日期等附加字段。

## 扩展策略

第一版不创建 `platforms`、`version`、`pricing`、`transport`、`projectStage` 等类型专属字段，也不创建自由的 `extra` 或 `metadata` 对象。

未来只有当某种信息在同类条目中反复出现，并且需要筛选、排序或固定展示时，才把它从正文升级为对应 `type` 的专属字段。Note 的 `category` 是这一规则的首个例外：它已经承担固定展示与筛选职责。实现时以 `type` 为分流点扩展 schema；卡片、筛选和关联逻辑始终只依赖基础字段。项目归属在第一版通过 `related` 表达，只有在项目成员关系需要独立筛选或展示时，才新增专门字段。
