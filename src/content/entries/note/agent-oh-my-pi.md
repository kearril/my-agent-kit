---
slug: agent-oh-my-pi
title: Oh My Pi (omp) 个人使用手册
type: note
summary: 个人日常主力终端编程 Agent 的使用手册与速查指南。
tags:
  - AI
  - agent
  - harness
category: AI
source: self
links:
  - label: GitHub 仓库
    url: https://github.com/can1357/oh-my-pi
  - label: 官方文档
    url: https://github.com/can1357/oh-my-pi/tree/main/docs
related:
  - oh-my-pi
createdAt: 2026-08-24
publishedAt: 2026-08-24
updatedAt: 2026-08-27
draft: false
---


---

## 一、 全量斜杠指令速查

在终端中输入 `/` 即可唤起指令菜单。：

### 1. 执行模式与自主推进

- **`/plan [prompt]`（规划模式 · 重点）**：
  在动工前强制 Agent 先行调研并输出技术方案，拉起内置的评审面板（可用 `/plan-review` 随时重开）。适合多文件协同或重大架构重构，从流程上遏制模型盲目改写代码。
- **`/goal [set|show|pause|resume|drop|budget]`（持久自主目标 · 重点）**：
  为 Agent 设定一个长周期的明确目标并分配独立 Token 预算。Agent 会自主拆解、排错并持续推进任务，直到达成目标或预算耗尽。
- **`/loop [count|duration] [prompt]`（循环迭代模式 · 重点）**：
  在模型每次交出控制权（Yield）后，自动重新提交 Prompt 推进下一轮。非常适合自动化跑测试套件、持续修复边界 Bug 或进行渐进式压测。
- **`/vibe [prompt]`**：进入只读极速模式，禁用一切写盘工具，适合安全查阅、答疑与推演；
- **`/security [plan|scan|show|validate|export]`**：内置安全扫描套件，支持漏洞排查与导出标准 SARIF 报告。

### 2. 上下文调优与时间线管理

- **`/compact [focus]`（手动会话压缩 · 重点）**：
  长会话的核心控水线工具。将冗长的历史交互提炼为结构化摘要。最实用的用法是传入 `focus` 参数（如 `/compact 聚焦在数据层重构的结论`），指示压缩器重点保留关键模块的决策上下文。
- **`/shake [elide|images|thinking]`（上下文极速降噪 · 重点）**：
  日常最常用的“轻量减重”神技。无需进行全量模型摘要，直接以极快速度剔除历史中的包袱：
  - `elide`（默认）：剔除工具执行返回的大段文本；
  - `thinking`：剔除历史已过期的思维链过程；
  - `images`：剔除会话中携带的截图。
- **`/branch` 与 `/tree`（时光机分支与多方案推演 · 重点）**：
  支持从历史任一消息节点开辟新分支。当面临方案 A 与方案 B 抉择时，可随时分叉推演，利用 `/tree` 在不同时间线间无损切换对比，不污染主干上下文。
- **`/fresh`**：仅重置与服务商的流式连接状态，完整保留本地对话历史；
- **`/handoff [instructions]`**：将当前会话成果生成交接文档并原地开启新会话；
- **`/clear` / `/drop`**：`/clear` 就地清空对话上下文；`/drop` 彻底销毁当前会话并重新建档。

### 3. 任务跟踪与多智能体协同

- **`/todo [edit|export|import|done|append]`（任务看板管理 · 重点）**：
  交互式任务看板。除了在终端查看进度，还支持将任务清单一键导出为 Markdown 文件，或使用 `/todo edit` 唤起外部编辑器进行双向同步修改。
- **`/agents`（子 Agent 调度中心 · 重点）**：
  实时监控与分配专职子角色（如 scout 调研、reviewer 审查、designer 设计）的独立模型、Prewalk 与 Advisor 状态。
- **`/jobs`**：查看后台异步任务与并发子 Agent 的执行状态；
- **`/pause`**：一键冻结所有正在执行的 Agent 任务。

### 4. 外部扩展与工具链集成

- **`/mcp [add|list|remove|test|reload]`（MCP 服务管理 · 重点）**：
  外部 MCP 服务管理中枢。支持 `stdio`、`http` 与 `sse` 协议，可在会话中直接添加服务、进行连通性测试（`/mcp test <name>`）或热重载（`/mcp reload`）。
- **`/git [revision]`**：呼出终端分屏 Diff 审查、暂存与提交信息生成界面；
- **`/ssh [add|list|remove]`**：管理远程 SSH 主机连接与操作工作区；
- **`/tools`**：查看当前对模型暴露的全部活跃工具与 `xd://` 虚拟设备；
- **`/memory [view|clear|stats]`**：查看与维护 Agent 的自主记忆库与 Mental Model。

### 5. 模型调度、状态与全局设置

- **`/model` & `/switch`**：查看或临时/永久切换当前主模型（支持通过 `alt+p` 快捷呼出）；
- **`/fast [on|off]`**：切换对应 Provider 的优先快速通道（如 OpenAI service_tier / Anthropic fast）；
- **`/extended-context [on|off]`**：开启或关闭超长上下文支持；
- **`/usage [show|reset]`**：查看 Token 消耗统计与使用 Codex 重置额度；
- **`/context`**：查看当前上下文窗口的占用水位与各部分分布比例；
- **`/settings` & `/setup`**：打开全局交互式设置面板或服务商 API 鉴权配置；
- **`/login` & `/logout`**：OAuth 服务商账户登录与登出；
- **`/hotkeys`**：打印当前终端的所有快捷键映射一览；
- **`/exit` / `/quit`**：退出当前应用程序。

---

## 二、 三大魔法词（Magic Keywords）

在输入普通提示词时，包含以下特定独立英文单词可直接触发行为干预与终端渐变高亮：

- **`ultrathink`**（全光谱彩虹渐变）：在后台注入多步推演通知，引导模型开启深度逻辑论证与死角排查；
- **`orchestrate`**（青紫流动渐变）：切换至多 Agent 协同编排模式，驱动主 Agent 调度子任务在隔离 Worktree 中并行推进；
- **`workflowz`**（琥珀绿渐变）：引导模型基于任务 Schema 构建严格确定性的多子 Agent 工作流。

---

