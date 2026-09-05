---
slug: oh-my-pi
title: "[开源工具] Oh My Pi (omp)：终端 AI 编程 Agent"
type: project
summary: 这是我个人最喜爱的终端 AI 编程 Agent。由于项目处于高频演进中，本文重点梳理其跨平台安装方式、全局与项目级配置文件的完整定义规范以及专属的三大魔法词机制。
tags:
  - AI
  - agent
  - 开发
  - 工具
  - harness
  - rust
source: external
links:
  - label: 官方网站
    url: https://omp.sh
  - label: GitHub 仓库
    url: https://github.com/can1357/oh-my-pi
related:
  - agent-oh-my-pi
createdAt: 2026-08-27
publishedAt: 2026-08-27
updatedAt: 2026-08-27
draft: false
---

> 在日常 AI 辅助编程实践中，Oh My Pi（命令行缩写为 `omp`）是我个人最喜爱、实际编码体感最顺畅的终端 Agent。由于该项目正处于高频演进与持续迭代中，最新特性与架构演变请直接查阅官方仓库与文档；本文主要整理其安装途径、配置文件的定义规范以及专属的三大魔法词机制。

## 一、 安装与环境准备

### 1. Bun 全局安装（官方推荐）
如果本地已配置 Bun 环境，可直接全局安装：

```bash
bun install -g @oh-my-pi/pi-coding-agent
```

### 2. 跨平台一键安装脚本
- **macOS / Linux**：
  ```bash
  curl -fsSL https://omp.sh/install | sh
  ```
- **Windows（PowerShell）**：
  ```powershell
  irm https://omp.sh/install.ps1 | iex
  ```
- **Homebrew**：
  ```bash
  brew install can1357/tap/omp
  ```

### 3. Shell 动态补全配置
在终端配置文件（如 `~/.zshrc` 或 `~/.bashrc`）中追加补全指令：

```bash
# Zsh
eval "$(omp completions zsh)"

# Bash
eval "$(omp completions bash)"
```

安装完成后，在终端执行 `omp` 即可直接拉起交互式环境。

## 二、 配置文件体系与各文件作用详解

OMP 的配置分为**全局作用域**（`~/.omp/agent/`）与**项目级作用域**（`<cwd>/.omp/`），各配置文件独立承担明确的工程职责：

### 1. 基础主配置文件（`config.yml`）
- **文件路径**：`~/.omp/agent/config.yml`（全局）与 `./.omp/config.yml`（项目级，兼容 `.yaml` 与 `.json` 格式）；
- **核心作用**：控制 Agent 的全局运行与会话行为。包括模型角色映射（`modelRoles.default`、`modelRoles.smol`、`modelRoles.slow`）、工具审批策略（`tools.approvalMode`）、Bash 白名单与拦截重定向规则（`bash.patterns` 与 `bashInterceptor`）、思考预算（`thinkingBudgets`）、上下文压缩策略（`compaction`）以及界面主题；
- **合并规则**：对象采用深度合并（Deep Merge），下层未声明的键由上层补充覆盖；数组采用完整替换（Array Replacement），项目级声明的数组会直接覆盖全局数组；
- **CLI 管理**：可在终端通过 `omp config list` 查看合并后的生效配置，并通过 `omp config set <key> <value>` 与 `omp config get <key>` 进行管理。

### 2. 模型与 Provider 配置文件（`models.yml`）
- **文件路径**：`~/.omp/agent/models.yml`（全局，兼容 `models.yaml`）；
- **核心作用**：定义自定义大模型接口、本地推理服务或覆盖内置模型元数据。支持配置自定义 `baseUrl`、`apiKey`（支持以 `!` 开头的指令安全动态提取密钥）、API 协议格式（`openai-completions`、`anthropic-messages`、`google-generative-ai` 等）、上下文长度（`contextWindow`）、思考模式（`thinking`）以及针对 Ollama、LiteLLM、Proxy 的端点自动发现。

### 3. MCP 扩展配置文件（`mcp.json`）
- **文件路径**：`./.omp/mcp.json`（项目级）、`~/.omp/agent/mcp.json`（全局）或根目录 `mcp.json`；
- **核心作用**：配置并挂载外部 MCP（Model Context Protocol）服务器以扩展外部工具与数据源。支持三种传输协议：
  - `stdio`（子进程命令行拉起）；
  - `http`（Streamable HTTP 远程端点）；
  - `sse`（Server-Sent Events 远程端点）。
  支持 `${ENV_VAR}` 环境变量与 `!command` 密钥自动展开，以及全局 `disabledServers` 黑名单与 `enabledServers` 白名单控制。

### 4. 项目背景与持久置顶守则（`AGENTS.md` 与 `RULES.md`）
- **文件路径**：`~/.omp/agent/`（全局）与 `./.omp/`（项目级）；
- **核心作用**：
  - **`AGENTS.md`（项目背景）**：在会话启动时作为上下文加载，描述仓库架构与业务背景，支持通过 `@path` 语法递归导入其他 Markdown 文件；
  - **`RULES.md`（Sticky 强约束守则）**：作为始终生效的置顶规则（Sticky Rule），在长会话的多轮交互中持久固定在末尾提示词中，用于定义绝对不可逾越的安全红线与编码纪律。

### 5. 专项规约库目录（`rules/`）
- **目录路径**：`~/.omp/agent/rules/` 与 `./.omp/rules/`；
- **核心作用**：存放按模块拆分的具体规约 Markdown 文件，供 Agent 在特定场景下通过 `rule://<name>` 虚拟路径按需读取，或根据文件路径规则条件激活。

### 6. 自定义斜杠指令目录（`commands/`）
- **目录路径**：`~/.omp/agent/commands/` 与 `./.omp/commands/`；
- **核心作用**：存放以 `<command>.md` 命名的提示词流水线模板。用户在终端会话中输入 `/<command>` 即可快速调用参数化的结构化工作流（如代码评审、需求推演等）。

### 7. Agent 技能包目录（`skills/` 或 `.agents/skills/`）
- **目录路径**：`./.omp/skills/`、`~/.omp/agent/skills/` 或跨工具通用目录 `./.agents/skills/`；
- **核心作用**：存放符合标准化 Agent Skills 规范的技能目录（包含 `SKILL.md` 及配套参考文档），由 Agent 在运行时自主匹配与调用。

### 8. 子 Agent 角色预设目录（`agents/`）
- **目录路径**：`~/.omp/agent/agents/` 与 `./.omp/agents/`；
- **核心作用**：存放特定子 Agent 的角色定义文件，声明专职角色（如 `scout`、`reviewer`、`designer` 等）的独立 System Prompt、工具白名单与工作流边界。

## 三、 内置三大魔法词（Magic Keywords）

OMP 在终端输入解析器中内置了对特定独立英文单词的语法级感知（仅在正文散文中触发，自动忽略代码块、行内反引号与 HTML/XML 标签内容）：

### 1. `ultrathink`（缜密多步深度推理）
- **视觉呈现**：在终端输入框中呈现全光谱彩虹渐变高亮（Rainbow Gradient，红至紫循环流动）；
- **触发机制**：提交时在消息后方静默追加系统级 `ULTRATHINK_NOTICE` 通知，引导模型开启严格的多步逻辑推演、边界论证与死角排查。

### 2. `orchestrate`（多 Agent 协作编排模式）
- **视觉呈现**：在终端输入框中呈现青紫渐变高亮（Teal→Violet Gradient）；
- **触发机制**：触发系统级 `orchestrateNotice`，驱动主 Agent 切换至多智能体编排心智，主动调用 `task`、`hub` 等工具拆解子任务并协同多个子 Agent 并行推进。

### 3. `workflowz`（确定性任务流构建）
- **视觉呈现**：在终端输入框中呈现琥珀绿渐变高亮（Amber→Green Gradient）；
- **触发机制**：触发系统级 `workflowNotice`，引导模型基于活跃的任务 Schema 规划并输出结构化、确定性的多子 Agent 工作流流水线。
