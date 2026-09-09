---
links:
  - label: GitHub 仓库
    url: https://github.com/obra/superpowers
---

# Superpowers：面向编码 Agent 的系统级软件工程方法论


> 本条目基于官方仓库 `obra/superpowers` **v6.3.0** 版本进行梳理与收录。

## 一、 框架定位与设计概述

Superpowers 是由 Jesse Vincent（Prime Radiant）开源的编码 Agent 软件工程方法论套件。

它将传统软件工程中的严谨实践（测试驱动开发、系统化根因排错、工作区隔离、代码审查与任务拆解）沉淀为一组可组合的 Agent 技能（Skills）。通过在不同开发阶段触发对应的技能规程，引导编码 Agent 在面对复杂工程任务时遵循标准化的软件工程纪律，减少因自由发挥带来的代码质量与流程失控。

## 二、 核心问题与治理目标

在缺乏严格流程约束的情况下，编码 Agent 在处理中大型工程任务时容易陷入以下困境：

- **需求未明盲目动工**：未充分澄清意图便直接编写业务代码，导致方向偏差与推倒重来。
- **凭直觉做表层修复**：遇到报错习惯在下游打补丁或增加防御性逻辑，掩盖了真实的数据源头缺陷。
- **长会话压缩后失忆**：会话轮次过多触发上下文压缩（Compaction）后，容易遗忘当前开发阶段，甚至重复派工已经完成的任务。
- **缺乏测试支撑与污染工作区**：未编写自动化测试便直接修改主分支代码，引入隐性回归风险并污染工作区。

Superpowers 通过将“根因调查先于代码修改”、“测试红灯先于业务实现”以及“基于本地账本持久化进度”等原则固化为强制执行规则，从流程层面规避上述工程隐患。

## 三、 安装配置与工程工作流

### 1. 安装配置

推荐使用 `skills-cli` 将全部 14 个核心技能以通用模式安装到当前项目或全局环境：

```bash
# 通用模式安装到当前项目（.agents/skills/）
npx skills add obra/superpowers -a universal

# 或者全局安装到用户级技能目录
npx skills add obra/superpowers -g -a universal
```

主流客户端环境（如 Claude Code、Cursor、Pi、Antigravity、Codex、Devin 等）亦支持通过各自的原生插件体系进行安装与引导配置。

### 2. 标准交付流水线（七阶段工程闭环）

在实际执行功能开发或系统重构时，Superpowers 引导 Agent 按照 7 个先后承接的阶段推进：

1. **意图澄清与方案设计（`brainstorming`）**  
   在动工前激活，通过结构化提问挖出需求细节与边界条件，将设计方案按小段分块展示，经确认后再保存设计文档。
2. **工作区物理隔离（`using-git-worktrees`）**  
   设计方案确认后，自动在独立的 Git Worktree 中切出新分支并校验基线测试，确保一切改动与主工作区彻底隔离。
3. **拆解原子执行计划（`writing-plans`）**  
   将设计方案切解为 2 到 5 分钟颗粒度的原子任务，明确每个任务涉及的文件路径、完整代码改动与终端验证命令。
4. **子 Agent 驱动执行（`subagent-driven-development`）**  
   主控制器负责流程编排，为每个任务派发独立的 Implementer 子 Agent。各任务状态与裁决决策实时记录在本地进度账本（`.superpowers/sdd/<plan>/progress.md`）中，即便主会话发生上下文压缩，读取账本与 Git 记录即可恢复进度。
5. **测试驱动编码实现（`test-driven-development`）**  
   严格执行红绿重构循环：先写失败测试，确认失败后编写最小通过代码，再运行验证通过。测试写好前生成的业务代码直接废弃。
6. **双维度代码审查（`requesting-code-review` / `receiving-code-review`）**  
   单任务完成后分派审查者分别检查需求还原度与代码质量；全部任务完成后再对整条分支发起综合代码审查。
7. **分支收尾与交付（`finishing-a-development-branch`）**  
   运行全量测试套件确认无回归问题，提供合并、提交审查申请、保留分支或废弃分支的选项，并在确认后清理 Worktree。

## 四、 核心技能资产索引

Superpowers 仓库内共维护 14 个核心技能，按职责划分为三大类：

### 1. 测试与排错（Testing & Debugging）

- `test-driven-development`：红绿重构开发循环与测试反模式参考规范。
- `systematic-debugging`：包含根因调查、模式比对、单变量验证与复现测试的四阶段排错规程。
- `verification-before-completion`：在宣布修复或任务完成前必须逐项核对的客观验证清单。

### 2. 协作与流程编排（Collaboration & Execution）

- `brainstorming`：通过结构化提问澄清真实需求，分块呈现设计方案。
- `using-git-worktrees`：自动化创建、初始化与验证独立的 Git Worktree 工作区。
- `writing-plans`：将需求设计拆解为短颗粒度、可独立验证的原子任务计划。
- `executing-plans`：以批量执行与人工检查点相结合的方式运行实施计划。
- `subagent-driven-development`：基于独立子 Agent 与本地进度账本的高自动化执行流水线。
- `dispatching-parallel-agents`：针对无相互依赖的离散任务并发分派子 Agent。
- `requesting-code-review`：在提交改动前核对计划自检清单，按严重程度汇报问题。
- `receiving-code-review`：结构化接收并响应外部代码审查意见。
- `finishing-a-development-branch`：分支交付决策流，覆盖回归测试验证与工作区清理。

### 3. 元技能与系统引导（Meta）

- `writing-skills`：用于为 Agent 编写新技能的最佳实践指南与行为评测规范。
- `using-superpowers`：向 Agent 介绍整套技能体系与触发规则的引导技能。
