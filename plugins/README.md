# Plugins 架构与维护手册

成套插件的原生适配与自主演进开发区，专为 **Oh My Pi (omp)** 扩展生态设计。

---

## 一、 插件架构设计：分层场景解耦

本仓库采用**「通用元能力常驻 + 垂直领域插件按需挂载」**架构，针对不同场景隔离 Context，避免模型上下文污染与 Token 浪费：

| 插件 | 当前版本 | 核心定位 | 常用命令入口 |
| :--- | :--- | :--- | :--- |
| **`general`** | `v1.0.1` | **全局常驻通用元能力底座**：苏格拉底式质询、消除黑话大白话澄清、跨会话交接、课题深度调研、教学与会话复盘 | `/general:grill-me`<br>`/general:wait-what`<br>`/general:handoff`<br>`/general:research`<br>`/general:teach`<br>`/general:to-questionnaire`<br>`/general:retro` |
| **`coding`** | `v1.0.1` | **严肃软件工程专业套件**：Spec 规格化、Tickets 拆解、TDD 红绿循环、双轴代码审查、架构治理与 Bug 诊断闭环 | `/coding:guide`<br>`/coding:to-spec`<br>`/coding:to-tickets`<br>`/coding:implement`<br>`/coding:implement-spec`<br>`/coding:improve-codebase-architecture`<br>`/coding:retro`<br>`/coding:pr` |
| **`academic`** | `v1.0.0` | **学术科研与文献管理套件**：本地 Zotero 联动、文献检索、PDF 研读、高亮笔记提取、安全打标归类与引文导出 | `/academic:zotero` |

---

## 二、 核心架构规范

### 1. 为什么设立独立的 `general` 常驻？
* **隔离领域上下文，防止 Token 膨胀**：日常闲聊、写材料或阅读科研论文时，模型无需加载繁重的 TDD 规则与代码审查标准。
* **跨场景体验一致**：随时随地通过 `/general:grill-me` 接受方案盲点质询，通过 `/general:wait-what` 叫停并要求大白话重新阐述，通过 `/general:handoff` 冻结会话。

### 2. 双层语言分离架构（The Dual-Language Principle）
* **`skills/`（面向 AI 模型）**：
  * 正文及 Frontmatter 保持清晰精准的英文表述，确保主流大模型的原生触发与规则命中率。
* **`commands/`（面向人类开发者）**：
  * `commands/*.md` 是 OMP 终端斜杠命令的门面。Frontmatter 的 `description` 必须使用精炼中文，方便人类在敲 `/` 时进行语义辨析。

### 3. OMP 原生命名空间机制
* OMP 会自动为插件命令拼装命名空间（`/<plugin>:<command>`），如 `plugins/general/commands/grill-me.md` 对应 `/general:grill-me`。

### 4. 极简零运行时哲学（YAGNI）
* 纯 Markdown / Prompt 工作流套件，保持零 TS/JS 运行时依赖，消除一切多余的编译与自动化脚本负担。
