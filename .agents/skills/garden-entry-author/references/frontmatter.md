# Frontmatter 字段规范与元数据纪律

## 一、 通用必填字段清单

所有条目必须在 Frontmatter 中完整声明以下基础字段：

```yaml
---
slug: kebab-case-unique-identity # 必填：全站唯一、不可变、纯小写 ASCII kebab-case
title: "[Agent 技能] 示例标题" # 必填：必须带有对应的方括号前缀
type: skill # 必填：六大类型之一（skill/project/mcp/prompt/website/note）
summary: 简短说明 # 必填：一句话概括核心定位与能力，无 AI 套话
tags: # 必填：字符串数组，作为 Explore 精确筛选条件
  - AI
  - 开发
source: external # 必填：self / adapted / external
links: # 必填：对象数组（label + url），可为空数组 []
  - label: GitHub 仓库
    url: https://github.com/...
related: # 必填：关联条目的 slug 数组，不可填写不存在的 slug
  - skills-cli
createdAt: 2026-08-27 # 必填：首次记录日期（YYYY-MM-DD）
publishedAt: 2026-08-27 # 必填：公开条目必填，首次正式发布日期
updatedAt: 2026-08-27 # 必填：实质内容更新日期
draft: false # 必填：是否为草稿，正式收录一律为 false
---
```

---

## 二、 标题前缀统一规范

为保持 Explore 列表与各类卡片的视觉统一性，`title` 必须遵守以下前缀规则：

| 类型 (`type`) | 标题前缀格式                    | 示例                                                              |
| :------------ | :------------------------------ | :---------------------------------------------------------------- |
| `skill`       | `[Agent 技能] <名称>：<副标题>` | `[Agent 技能] Superpowers：面向编码 Agent 的系统级软件工程方法论` |
| `project`     | `[项目类型] <名称>：<副标题>`   | `[项目类型] Skills CLI：跨 Agent 宿主环境的通用技能包管理器`      |
| `mcp`         | `[MCP 服务] <名称>：<副标题>`   | `[MCP 服务] Context7：面向开发者的实时库文档检索服务`             |
| `prompt`      | `[AI提示词] <名称>：<副标题>`   | `[AI提示词] 战略-计划-信心循环：复杂任务的系统化推演模板`         |
| `website`     | `[网站精选] <名称>：<副标题>`   | `[网站精选] Cloudflare：现代边缘云与网络安全基础设施`             |
| `note`        | _无方括号前缀_                  | `构建一个可长期运营的数字花园`                                    |

---

## 三、 标签纪律（Tags Discipline）

1. **标签是精确筛选工具**，不参与模糊搜索，不用于替代目录树。
2. **优先复用现有词库**，尽量使用 2 到 4 个字的短中文词（如 `AI`、`开发`、`agent`、`架构`、`TDD`、`调试`、`DDD`）。
3. **禁止为单一条目随意发明孤立标签**，一个新标签原则上至少应能服务于两个及以上条目。
4. **来源（Source）与类型（Type）已有独立字段**，严禁在 `tags` 中重复添加 `external`、`skill` 等类型标签。
