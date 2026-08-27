---
slug: skills-cli
title: "[开源项目] Skills CLI：AI 编程智能体的技能包管理器"
type: project
summary: Vercel Labs 开源的 Agent Skills 包管理工具，支持一键搜索、安装、软链接同步与即时试用，并内置让 Agent 自主发现技能的 find-skills 元技能，适配 70+ 种 AI 编程工具与 IDE。
tags:
  - AI
  - 开发
  - agent
  - 工具
  - 包管理
source: external
links:
  - label: GitHub 仓库
    url: https://github.com/vercel-labs/skills
  - label: 官方注册表
    url: https://skills.sh
related:
  - matt-pocock-skills
  - superpowers
createdAt: 2026-08-27
publishedAt: 2026-08-27
updatedAt: 2026-08-27
draft: false
---

## 项目简介

在各类 AI 编程工具（如 Claude Code、Cursor、Cline、Codex、Devin 等）中，`SKILL.md` 已经成为给 Agent 扩充领域知识和工作流的标准方式。但实际使用时往往会遇到一个痛点：每个工具的技能存放路径都各不相同，想把一个好用的 Skill 同步给多个 Agent 或者多个项目，往往只能到处手动复制粘贴文件，后续更新和维护也很繁琐。

Skills CLI（由 Vercel Labs 开源，命令行直接使用 `npx skills`）充当了 AI 编程生态里的“包管理器”角色。它把各种来源的 `SKILL.md` 统一编排，支持一行命令完成搜索、跨 Agent 安装、版本更新与即时试用，目前已经适配了 70 多种 AI 编程工具与 IDE 环境。

## 使用讲解

### 1. 安装与作用域机制

安装技能时支持两种作用域：

- **项目级（默认）**：直接把技能写入当前仓库的 `./<agent>/skills/`，可以随 Git 提交，方便团队成员共享相同的开发规则。
- **全局级（`-g`）**：安装到用户主目录 `~/<agent>/skills/`，在本地所有项目中对该 Agent 生效。

在多 Agent 场景下，工具默认采用**符号链接（Symlink）**管理：将技能源码统一存放在缓存目录，再分别软链接到各个 Agent 的配置目录中。这样既节省磁盘空间，也能做到源文件一处更新、所有 Agent 同步生效。如果目标环境不支持软链接，也可以加上 `--copy` 强制独立拷贝。

### 2. 跨工具通用规范与 .agents 目录处理

早期各个 AI 工具通常在项目根目录下各自创建专属隐藏目录（如 `.claude/`、`.cursor/`、`.continue/`），导致多工具并存时配置碎片化严重。

为此，生态中开始推行中立的通用标准路径——`.agents/`（项目级）与 `~/.agents/`（全局级）。Skills CLI 对该目录提供了深度集成与自动处理：

- **中立路径归一化**：当安装目标为支持通用规范的 Agent（或指定 `universal` 目标）时，CLI 会直接将技能组织到项目根目录的 `.agents/skills/` 下，无需为每个工具重复建立专属目录。
- **软链接跨工具桥接**：如果项目中同时使用多种工具（例如部分工具只认专有目录 `.claude/skills/`，而另一些工具支持通用目录 `.agents/skills/`），CLI 会统一缓存技能源码，并分别建立软链接指向各工具能识别的路径，保证项目内始终只有一份真实来源。
- **团队协作单一事实来源**：把包含 `SKILL.md` 的 `.agents/skills/` 提交到 Git 仓库后，即可作为整个项目的通用 AI 协作规范，团队成员无论使用哪款支持该规范的 Agent，都能直接共享同一套技能。

### 3. 灵活的来源解析

Skills CLI 支持多种安装源格式，无需手动下载文件：

- **GitHub 简写**：`npx skills add vercel-labs/agent-skills`
- **子目录直达**：直接指定某个仓库内的单项技能路径（如 `https://github.com/.../tree/main/skills/frontend-design`）
- **私有仓库**：自动复用本机的 Git 凭据或 GitHub CLI 登录态，无感下载私有代码库中的 Skill
- **本地目录与压缩包**：支持直接从本地文件夹路径或 `.zip` / `.tar.gz` 下载直链安装

### 4. 免安装即时试用

如果只是临时需要某个技能、不想污染全局或项目配置，可以使用 `skills use` 命令。它会把技能下载到临时目录并直接生成完整的 Prompt 文本：

```bash
# 将技能 Prompt 文本通过管道传入 Agent
npx skills use <source>@<skill-name> | <agent-cli>

# 或直接指定目标 Agent 拉起交互式会话
npx skills use <source> --skill <skill-name> --agent <agent-name>
```

## 内置特性与生态配套

### 1. 内置元技能 `find-skills`

项目自带了一个特殊的元技能 `find-skills`。将它安装给 Agent 后，只要你在对话中表达出“如何做某事”、“有没有用来做 X 的技能”这类需求，Agent 就能主动调用命令行去搜索 `skills.sh` 注册表，寻找匹配的外部 Skill，并协助你一键安装，实现 Agent 自身能力的动态扩充。

### 2. 官方注册表 `skills.sh`

官方配套维护了 [skills.sh](https://skills.sh) 网站，作为开源技能的索引中心。你可以在网页上按热度浏览、搜索社区贡献的技能包，并直接复制一键安装命令。

### 3. 本地技能脚手架

自己编写新技能时，直接运行 `npx skills init my-skill`，它会在本地生成包含标准 Frontmatter（`name` 与 `description`）的 `SKILL.md` 模板文件，规范自定义技能的编写格式。

## 常用 CLI 命令

### 技能安装与试用

```bash
# 交互式选择技能并安装到指定 Agent（-a 支持同时传入多个目标）
npx skills add <source> -a <agent-1> -a <agent-2>

# 全局安装指定技能，跳过确认提示
npx skills add <source> --skill <skill-name> -g -y

# 单次即时使用某个技能，不写入本地配置
npx skills use <source> --skill <skill-name> --agent <agent-name>
```

> 注：命令中的 `<agent-name>` 代表目标工具的标识（如 `claude-code`、`cursor`、`codex`、`cline` 等）；对于遵循通用规范的 Agent 工具（如支持读取 `.agents/skills/` 的环境），技能文件会被直接组织到对应路径下。

### 检索与查看

```bash
# 交互式或按关键词搜索生态中的技能
npx skills find <keyword>

# 查看全局已安装的技能列表
npx skills list -g

# 查看指定 Agent 当前安装的技能
npx skills ls -a <agent-name>
```

### 更新与卸载

```bash
# 一键检查并更新已安装的技能
npx skills update -y

# 卸载全局安装的某个技能
npx skills remove <skill-name> -g
```

### 本地开发

```bash
# 在当前目录生成标准 SKILL.md 模板
npx skills init
```
