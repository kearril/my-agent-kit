---
slug: superpowers
title: "[Agent 技能] Superpowers：面向编码 Agent 的系统级软件工程方法论"
type: skill
summary: Jesse Vincent 开源的 Agent 软件工程方法论套件，涵盖四阶段根因排错、严格 TDD 红绿循环、Git Worktree 物理隔离与基于进度账本的 SDD 子 Agent 协同流水线。
tags:
  - AI
  - 开发
  - agent
  - 架构
  - TDD
  - 调试
source: external
links:
  - label: GitHub 仓库
    url: https://github.com/obra/superpowers
related:
  - skills-cli
  - matt-pocock-skills
createdAt: 2026-08-27
publishedAt: 2026-08-27
updatedAt: 2026-08-27
draft: false
---

> 本条目基于官方仓库 `obra/superpowers` **v6.3.0** 版本进行梳理与收录。

## 一、 框架定位与三项铁律

大部分编码 Agent 在面对复杂工程任务时，容易陷入几种典型的失控状态：拿到模糊需求就急于改代码、遇到报错凭直觉打补丁、长时间多轮对话发生上下文压缩后遗忘进度，或者把未经充分测试的代码直接提交进主分支。

Superpowers 是一套专门面向编码 Agent 的软件工程方法论套件。它没有停留在“给模型提供建议性提示词”的层面，而是将传统软件工程中的严苛实践沉淀为一套可被 Agent 强制执行的行动守则。整个框架确立了三项不可逾越的执行铁律：

1. **根因调查先于代码修改**（No Fixes Without Root Cause Investigation First）：在没有通过证据完全查清故障根源前，严禁提出任何修复方案或修改业务代码；
2. **测试红灯先于业务实现**（Red-Green-Refactor）：严格遵循测试驱动开发，必须先编写能够稳定复现失败的测试用例，再编写最小实现代码；所有在测试用例写好前凭空生成的业务代码必须全部删除；
3. **主动裁决代替原地挂起**（Rulings, not stalls）：在自主执行计划期间，遇到非破坏性分歧或文档模糊点时，主控制器必须主动根据常理做出裁决并将决策记入账本，不因细枝末节频繁打断开发者。

## 二、 生态安装与运行时配置

Superpowers 支持两种安装与分发途径：

### 1. 通用标准模式安装（推荐）

通过 `skills-cli` 将全部 14 个核心技能以通用模式安装到当前项目或全局环境：

```bash
# 安装到当前项目 (.agents/skills/)
npx skills add obra/superpowers -a universal

# 或者全局安装到用户级技能目录
npx skills add obra/superpowers -g -a universal
```

### 2. 平台原生插件安装

针对具备插件扩展体系的特定客户端，也可使用官方市场命令安装：

- **Claude Code**：
  ```bash
  /plugin install superpowers@claude-plugins-official
  ```
- **Pi**：
  ```bash
  pi install git:github.com/obra/superpowers
  ```
- **Antigravity**：
  ```bash
  agy plugin install https://github.com/obra/superpowers
  ```
- **Cursor**：在 Agent 对话框中输入 `/add-plugin superpowers`。

原生插件安装会在会话启动（Session-Start）与上下文压缩后（Post-Compaction）自动向模型底层注入引导指令，使 Agent 从交互伊始便主动遵守工程守则。

## 三、 七阶段端到端工程交付流水线

在实际交付一个功能或进行系统重构时，Superpowers 引导 Agent 按照 7 个先后承接的阶段推进：

1. **意图澄清与方案脑暴**（`brainstorming`）：
   - 在动工写代码前激活。Agent 会通过苏格拉底式提问反复探究开发者的真实意图，挖出边界情况，并将设计方案按短小段落分块展示；
   - 只有在开发者逐段确认并签署设计方案后，Agent 才会保存设计文档，绝不提前动写代码。
2. **工作区物理隔离**（`using-git-worktrees`）：
   - 设计方案签署后，Agent 自动在独立的 Git Worktree 中切出专属分支，运行项目初始化配置并校验基线测试；
   - 确保一切开发工作与主分支在文件系统层面彻底隔离，避免未经验证的改动污染现有工作区。
3. **拆解原子执行计划**（`writing-plans`）：
   - 将已批准的设计方案切解为一系列微任务，每个任务的执行时长控制在 2 到 5 分钟；
   - 计划中精确列出涉及的文件绝对路径、完整的代码改动与明确的终端验证命令。
4. **子 Agent 驱动执行**（`subagent-driven-development`）：
   - 主控制器读取执行计划，为每个独立任务分派一个无状态的 Implementer 子 Agent，单任务单交付（也可以通过 `executing-plans` 走批量断点式执行）。
5. **测试驱动编码实现**（`test-driven-development`）：
   - 在编码阶段，Agent 严格执行“编写失败测试 $\to$ 运行确认失败 $\to$ 编写最小通过代码 $\to$ 运行确认通过 $\to$ 重构优化”的循环，确保改动具备自动化测试支撑。
6. **双轴代码审查**（`requesting-code-review` / `receiving-code-review`）：
   - 每个任务完成后，主控制器会分派独立的 Reviewer 分别从“需求还原度”（是否符合计划）与“代码质量”（有无坏味道或多余改动）两个维度进行审查；
   - 所有任务完成后，再分派高能力模型对整个分支的改动发起综合代码审查。
7. **分支收尾与交付**（`finishing-a-development-branch`）：
   - 运行全量测试套件确认无回归问题，为开发者提供合并到主分支、创建代码审查申请、保留分支或废弃分支的选项，并在确认后清理 Worktree 工作区。

## 四、 SDD（子 Agent 驱动开发）与账本容灾协议

在多步骤复杂开发中，大模型最容易因为会话过长而触发上下文压缩（Compaction），进而丢失先前任务的记忆，甚至重新分派已经写好的任务。Superpowers 通过一套专门的 SDD 协议解决了这一问题：

- **控制器与工人的上下文物理隔离**：
  - 主会话扮演控制器角色，只负责编排与裁决，不直接写业务代码，也不直接把几万字符的历史聊天记录塞给工人；
  - 控制器通过脚本从计划中提取单一任务说明生成 `task-N-brief.md`，派发全新的子 Agent 执行；子 Agent 完成后将结果写回 `task-N-report.md`，只向控制器返回核心状态摘要与提交记录，彻底切断上下文污染。
- **抗会话压缩的进度账本（SDD Ledger）**：
  - 每个计划在项目内拥有独立的 Git 忽略目录（`.superpowers/sdd/<plan>/`），核心状态持久化在 `progress.md` 账本中；
  - 账本实时记录已完成任务的序号、对应的 Git 提交哈希以及控制器的所有裁决记录（格式如 `Ruling: <决策内容> — <理由> — <若错误的代价>`）；
  - 即使主会话在多轮运行后发生上下文压缩而失忆，控制器重新读取账本与 `git log` 即可瞬间校准当前进度，绝不重复派工。
- **阶梯式修复回路与架构熔断**：
  - 子 Agent 提交的代码如果未能通过审查，系统会启动最多 5 轮修复回路；
  - 第 1 到 3 轮会唤醒原子 Agent 继续修改；若进入第 4 到 5 轮，控制器会自动换用推理能力更高的模型接手；
  - 如果在排错过程中连续尝试 3 次修复依然失败，系统会触发强制熔断，停止盲目打补丁，要求开发者与 Agent 共同停下来质疑底层架构是否合理。

## 五、 四阶段系统化排错规程（Systematic Debugging）

当遇到测试失败、构建报错或线上故障时，`systematic-debugging` 技能强制要求按四个阶段逐步排查：

1. **阶段一：根因调查与边界打桩**：
   - 完整阅读报错信息与堆栈跟踪，提取行号与错误码；
   - 在多层系统（例如接口层、业务层、数据库层）的边界处主动注入临时诊断日志，打桩记录数据流动，确认数据在哪个具体层级开始失真；
   - 沿着调用栈自底向上反向追溯异常数据的源头，杜绝在下游做防御性打补丁。
2. **阶段二：模式分析与参照比对**：
   - 在当前代码库中寻找同类功能且运行正常的参考实现；
   - 逐行对比正常代码与故障代码的差异，找出环境、配置或依赖上的隐藏假定。
3. **阶段三：单一变量假设与最小化验证**：
   - 每次只提出一个清晰的故障成因假设，并用最小改动去检验该假设；
   - 严禁一次性修改多处可疑点，防止引入干扰变量。
4. **阶段四：编写复现测试并修复根因**：
   - 在动手修改前，先编写一个能够稳定触发该故障的最小复现测试用例；
   - 针对找到的根因编写单点修复代码，运行确认测试通过，并使用 `verification-before-completion` 验证整个系统无隐性回退。

## 六、 全量技能资产速查索引

Superpowers 仓库内共维护了 14 个核心技能，覆盖软件开发的全周期：

### 1. 测试与排错（Testing & Debugging）

- `test-driven-development`：红绿重构开发循环与测试反模式参考。
- `systematic-debugging`：包含四阶段排错、调用栈反向追溯与多层纵深防御的系统化排错规程。
- `verification-before-completion`：在宣布任务完成前必须执行的客观验证清单。

### 2. 协作与流程编排（Collaboration & Execution）

- `brainstorming`：通过苏格拉底式反向提问澄清需求，分块呈现设计方案。
- `using-git-worktrees`：自动化创建、初始化与校验物理隔离的 Git Worktree 独立工作区。
- `writing-plans`：将需求设计切解为 2 到 5 分钟颗粒度的原子任务卡。
- `executing-plans`：以批量执行与人工检查点相结合的方式运行实施计划。
- `subagent-driven-development`：基于独立子 Agent 与进度账本的单会话高自动化执行流水线。
- `dispatching-parallel-agents`：针对无相互依赖的离散任务并发分派多个子 Agent。
- `requesting-code-review`：在提交改动前核对计划自检清单，区分严重级别报告问题。
- `receiving-code-review`：结构化吸收与响应外部代码审查意见。
- `finishing-a-development-branch`：分支交付决策流，涵盖回归测试验证与工作区清理。

### 3. 元技能与系统引导（Meta）

- `writing-skills`：用于为 Agent 编写新技能的最佳实践指南与行为评测规范。
- `using-superpowers`：向 Agent 介绍整套技能体系与触发规则的引导技能。
