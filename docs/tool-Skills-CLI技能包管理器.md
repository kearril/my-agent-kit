---
links:
  - label: GitHub 仓库
    url: https://github.com/vercel-labs/skills
  - label: 官方注册表
    url: https://skills.sh
---

# Skills CLI：跨 Agent 宿主环境的通用技能包管理器


> 本条目基于官方仓库 `vercel-labs/skills` **v1.5.23** 进行梳理与收录。

## 一、 项目定位与设计概述

在当前 AI 辅助编程生态中，各类工具（如 Claude Code、Cursor、Cline、Codex、Devin 等）普遍采用 `SKILL.md` 规范作为扩展 Agent 领域知识与工作流的标准载体。然而，各宿主环境在配置存储路径上存在明显分歧，例如 `.claude/skills/`、`.cursor/skills/` 与 `.continue/skills/` 等专有目录各自独立。

在多工具并存或多项目协作场景下，技能的分发与共享长期依赖人工复制粘贴文件。这种方式容易引发多份副本配置脱节、无法进行上游版本追踪以及更新维护成本高昂等问题。

Skills CLI 是 Vercel Labs 发布的开源命令行工具（在终端中直接通过 `npx skills` 执行）。该项目将散落各处的 `SKILL.md` 抽象为可统一检索、跨宿主分发与版本化管理的标准技能包，扮演 Agent 生态中的包管理器角色。同时，项目推行中立的 `.agents/skills/` 规范，为团队协作提供单一事实来源（Single Source of Truth）。

## 二、 命令交互与工作流实践

### 1. 运行方式与依赖前提
Skills CLI 基于 Node.js 环境构建，无需在本地全局安装二进制包，通过 `npx skills` 即可按需调用。

### 2. 技能安装与多源解析（`add`）
安装指令支持交互式界面选择与命令行参数直接指定：

```bash
# 交互式选择技能并安装到指定 Agent 宿主
npx skills add vercel-labs/agent-skills -a claude-code -a cursor

# 静默全局安装指定技能
npx skills add vercel-labs/agent-skills --skill frontend-design -g -y

# 全量安装仓库内的全部技能到所有检测到的 Agent
npx skills add vercel-labs/agent-skills --all
```

CLI 支持多种来源解析方式：
- **GitHub 简写**：`owner/repo` 格式（如 `vercel-labs/agent-skills`）；
- **仓库子路径直达**：直接指定包含单项技能的完整 URL（如 `https://github.com/.../tree/main/skills/frontend-design`）；
- **私有仓库凭据复用**：无缝对接本机的 Git 凭据助手、GitHub CLI 登录态或 SSH 密钥，无需在指令中暴露 Token；
- **本地与压缩包直链**：支持指定本地目录路径，或直接传入 `.zip`、`.tar.gz` 格式的归档下载直链。

### 3. 免安装即时试用（`use`）
对于仅需临时调用的技能，`use` 指令会将文件拉取到临时缓存区，并直接向标准输出打印生成的 Prompt 文本，避免污染本地项目配置：

```bash
# 生成 Prompt 文本并通过管道传入 Agent CLI
npx skills use vercel-labs/agent-skills@web-design-guidelines | claude

# 或直接拉起目标 Agent 进行单次交互会话
npx skills use vercel-labs/agent-skills --skill web-design-guidelines --agent claude-code
```

### 4. 资产维护与生命周期指令
- **依赖查看（`list` / `ls`）**：
  ```bash
  npx skills list          # 查看当前项目安装的技能
  npx skills ls -g         # 查看全局安装的技能
  npx skills ls -a cursor  # 按指定宿主过滤
  npx skills ls --json     # 机器可读的 JSON 输出
  ```
- **生态检索（`find`）**：
  ```bash
  npx skills find                 # 交互式模糊检索
  npx skills find typescript      # 关键词检索
  npx skills find react --owner vercel # 限制特定组织或作者
  ```
- **版本更新（`update`）**：
  ```bash
  npx skills update               # 交互式更新
  npx skills update frontend-design # 精准更新指定技能
  npx skills update -g -y         # 非交互式更新全局技能
  ```
- **依赖卸载（`remove` / `rm`）**：
  ```bash
  npx skills remove web-design-guidelines # 精准卸载
  npx skills remove -g --all              # 清理全部全局技能
  ```
- **本地脚手架（`init`）**：
  ```bash
  npx skills init          # 在当前目录生成标准 SKILL.md
  npx skills init my-skill # 创建新技能目录及模版
  ```

## 三、 核心架构与功能特性

### 1. 双层作用域设计
- **项目级作用域（默认）**：技能安装在项目根目录下的 `.agents/skills/` 或各工具专属子目录中，通常纳入 Git 版本控制，确保团队成员在克隆仓库后享有完全一致的 Agent 规则。
- **全局作用域（`-g`）**：技能安装至用户主目录（如 `~/.agents/skills/` 或 `~/.claude/skills/`），在本地所有工作区中对对应 Agent 生效。

### 2. 符号链接与集中缓存分发
安装技能时，CLI 默认将技能源码存放在本地集中缓存区，再通过文件系统**符号链接（Symlink）**挂载到各个 Agent 的工作目录。这种设计保证了源文件一处更新、所有关联宿主即时同步生效，并节省磁盘空间。针对 Windows 环境中未开启开发者模式或不支持软链接的容器环境，可通过 `--copy` 参数降级为独立文件复制。

### 3. 版本锁定与清单管理（Lockfile）
项目在根目录自动生成并维护 `skills-lock.json`，记录已安装技能的仓库源、子路径与确切版本哈希（`computedHash`）。通过 `npx skills experimental_install` 指令，可直接根据 Lockfile 一键还原全量技能依赖，适用于 CI/CD 自动化构建与新开发环境初始化。

### 4. 通用目录归一化与跨工具桥接
当安装目标涉及支持通用规范的环境时，CLI 统一将技能组织在 `.agents/skills/` 下。若项目中同时存在仅支持私有路径的传统工具，CLI 会自动建立从专有路径指向通用路径的软链接桥梁，消除项目根目录下的配置冗余。

## 四、 生态集成与专属特性

### 1. 官方技能注册表 `skills.sh`
官方维护了 [skills.sh](https://skills.sh) 平台作为开源技能索引中心。开发者可在网页端浏览社区高频技能、查看使用说明并复制一键安装命令。

### 2. 动态能力发现元技能 `find-skills`
Skills CLI 内置了 `find-skills` 元技能。在安装给 Agent 后，当用户在对话中表达探索性需求（如“有没有做 UI 设计审查的技能”、“如何优化 Astro 性能”）时，Agent 能够自主调用 `skills find` 检索 `skills.sh` 注册表，向用户推荐匹配的技能包并协助完成安装。

### 3. 70+ 款 AI 编程宿主兼容矩阵
Skills CLI 目前已深度适配主流及新兴 Agent 宿主环境，涵盖：
- **主流 CLI 与独立 Agent**：Claude Code、OpenCode、OpenHands、Cline、Roo Code、Codex、Devin、Kiro CLI、Hermes Agent、Pi 等；
- **现代 AI IDE 与编辑器扩展**：Cursor、Windsurf、GitHub Copilot、Trae、Zed、Continue、CodeBuddy、Qoder 等。
