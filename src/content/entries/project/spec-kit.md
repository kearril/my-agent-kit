---
slug: spec-kit
title: "[开源项目] Spec Kit：面向 AI 编程的规范驱动开发工具包"
type: project
summary: GitHub 开源的规范驱动开发（SDD）工具，把需求文档与架构方案转化为可执行的结构化任务，引导 AI Agent 逐步生成和收敛代码。
tags:
  - AI
  - 开发
  - agent
  - 架构
  - 规范驱动
source: external
links:
  - label: GitHub 仓库
    url: https://github.com/github/spec-kit
  - label: 官方文档
    url: https://github.github.io/spec-kit/
related: []
createdAt: 2026-08-27
publishedAt: 2026-08-27
updatedAt: 2026-08-27
draft: false
---

## 项目简介

平时用 AI 辅助写代码时，最容易出现的问题是直接给模型一段笼统的需求，让它一步到位生成代码。在简单小脚本里这种方式很快，但项目一旦稍大，模型就容易开始随意发挥：自作主张新增依赖、打乱原有目录结构，或者写出看似能跑但遗漏大量边界情况的代码。

Spec Kit（命令行工具为 `specify-cli`）是 GitHub 开源的规范驱动开发（Spec-Driven Development）脚手架。它在写代码之前，给 AI Agent 注入一套标准化的工程流程：先把需求边界、架构规划与任务清单固化成结构化文件，再驱使 Agent 按照清单逐步编写与收敛代码。

## 使用讲解

> 该页面说明基于speckit 1.0.1 版本

### 1. 接入准备

通过包管理器安装 CLI 工具（需要安装UV）：

```bash
uv tool install specify-cli
```

在项目根目录下完成初始化。这一步会创建 `.specify/` 模板目录，并为你正在使用的 Agent（Claude可以替换为受支持的任意agent，或者不传参，在命令行界面手动选择） 注入对应的斜杠指令或 Skill：

```bash
specify init my-project --integration claude
```

### 2. 标准开发流程

开发一个完整功能时，在 Agent 对话窗口中按顺序走完这套闭环：

1. `/speckit.constitution`：**立项原则**。设定项目的全局编码规则与设计底线（例如强制使用的组件库、单元测试要求、样式规范）。一个项目通常只在开局设定一次（后续发生重大变更时可使用该命令更新）。
2. `/speckit.specify`：**提需求**。用自然语言清晰描述用户故事与验收目标。这里只聚焦在“要达成什么目标”，不要在这一步夹杂具体的实现代码或框架语法。
3. `/speckit.plan`：**做设计**。结合项目现状确定具体的技术选型、模块拆分与文件目录结构。
4. `/speckit.tasks`：**拆任务**。把方案自动拆分成一个个粒度在几分钟内即可完成的原子任务清单。
5. `/speckit.implement`：**写代码**。让 Agent 逐项读取任务清单并生成实现代码。
6. `/speckit.converge`：**对账收敛**。自动比对当前代码库与原始需求，把未完成的边界分支或遗漏的子任务找出来，循环补充直到全部达标。

### 3. 过程质量控制

- `/speckit.clarify`：在方案设计（Plan）前使用，让 AI 主动对模糊需求进行追问和死角排查。
- `/speckit.analyze`：在动工（Implement）前使用，静态检查需求、架构方案与任务列表三者之间是否存在冲突或覆盖盲区。
- `/speckit.checklist`：把自然语言需求转化为清晰的逐项验收核对清单。

## 常用 CLI 命令

### 项目初始化与查询

```bash
# 交互式初始化新项目
specify init <project-name>

# 在已有项目目录为指定 Agent 静默初始化
specify init --here --force --integration <agent>

# 列出当前支持的所有 Agent 集成
specify integration list
```

### 扩展与预设管理

```bash
# 搜索并安装扩展（例如官方提供的结构化修 Bug 工作流）
specify extension search
specify extension add bug

# 搜索并安装预设（例如企业级审计规范或特定语言预设）
specify preset search
specify preset add <preset-name>

# 安装打包好的角色套件（Bundle）
specify bundle search
specify bundle install <bundle-id>
```

### 工具版本维护

```bash
# 检查是否有新版本（只读操作，不会变更本地环境）
specify self check

# 就地更新到最新稳定版
specify self upgrade
```
