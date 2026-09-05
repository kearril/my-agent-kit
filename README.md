# Paracosm Notes

个人极简技术笔记与手稿收纳库。收纳个人 Prompt、Skill、项目记录、网站收藏与实践 Note。

> **归档说明**：  
> 原 Astro 数字花园网站项目已撤销。全部网站源码、组件、样式与构建配置历史已完整封存在 Git 归档分支 `archive/website-final` 与 Tag `v1.0-website-sunset`。

## 目录结构

```text
.
├── notes/       # 深度实践笔记与速查手册（Oh My Pi 使用手册等）
├── projects/    # 关注与维护的项目（oh-my-pi, spec-kit, powertoys, skills-cli）
├── prompts/     # 提示词与决策工作流（strategy-plan-confidence-loop）
├── skills/      # Agent 技能与工具链（matt-pocock-skills, superpowers）
├── websites/    # 实用工具与基础设施网站（cloudflare, website-vpsknow）
└── assets/      # 笔记关联媒体与图片资源
```

## 笔记格式规范

所有笔记均为原生 Markdown 文本，头部保留极简 YAML Frontmatter（与 Obsidian / Logseq 等本地工具原生兼容）：

```yaml
---
title: 笔记标题
date: 2026-08-24
summary: 一句话摘要说明
tags:
  - 标签A
  - 标签B
links:
  - label: 相关链接名称
    url: https://example.com
related:
  - 关联文档名
---
```

## 历史代码检索

如需查阅或回滚原网站前端工程：

```bash
git checkout archive/website-final
# 或
git checkout v1.0-website-sunset
```
