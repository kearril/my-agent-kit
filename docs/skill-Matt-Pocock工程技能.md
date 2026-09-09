---
links:
  - label: GitHub 仓库
    url: https://github.com/mattpocock/skills
  - label: 官方注册表
    url: https://skills.sh/mattpocock/skills
---

# Matt Pocock's Skills：面向严谨工程实践的 Agent 技能集


> 本条目基于官方仓库 `mattpocock/skills` **v1.2.3** 版本进行梳理与收录。

## 一、 框架定位与设计概述

Matt Pocock's Skills 是由 TypeScript 工程师 Matt Pocock（Total TypeScript）开源的模块化 Agent 技能套件。

与全流程强管控的重型框架不同，它将传统软件工程中沉淀的经典实践（如测试驱动开发、领域驱动设计、深度模块封装与代码坏味道排查）拆解为 25 个独立、可按需选配且易于调整的 `SKILL.md` 技能定义。

整个体系在 Oh My Pi (omp) 生态中提纯封装为原生插件 `matt`，并在触发机制上分为两层：

- **用户显式指令（User-invoked · 14 项）**：在 OMP 中映射为具备顶级命名空间的斜杠命令（如 `/matt:grill-with-docs`、`/matt:implement`），由开发者在会话中主动输入以编排任务；
- **模型自主调用（Model-invoked · 11 项）**：无斜杠前缀的底层原子规范（如 `tdd`、`diagnosing-bugs`、`code-review`），收纳在 `skills/` 中，由 Agent 根据实际编码场景自主决策调用。

## 二、 核心问题与治理目标

该技能集主要针对 Agent 在日常编码中容易出现的四类失控状态提供治理方案：

- **需求理解走样**：通过多轮反向提问（Grilling）在动工前摸清交互细节与异常边界，避免因理解模糊导致推倒重来。
- **术语混乱与上下文消耗**：通过在项目中维护统一的领域词典（`CONTEXT.md`），用精准术语替代冗长的背景解释，降低沟通摩擦与 Token 消耗。
- **生成代码难以稳定运行**：依托 TDD（红灯-绿灯-重构）与结构化排错规程，为模型提供即时验证反馈。
- **架构退化成混乱泥球**：推行深度模块设计（简单接口封装复杂逻辑），并定期静态扫描代码库，寻找可以下沉封装的模块候选，抑制快速编码带来的软件熵增。

## 三、 安装配置与初始化

### 1. 安装方式

#### 方式 A：Oh My Pi 原生插件市场安装（推荐）
在本仓库提供的 OMP 插件市场体系下，可通过一条命令一键安装成套插件：

```bash
# 1. 添加插件市场源（若未添加）
omp marketplace add kearril/my-agent-kit

# 2. 安装 matt 插件套件（包含 14 个斜杠命令与 25 个底层技能）
omp plugin install matt@my-agent-kit

# 3. 后续升级
omp plugin upgrade matt@my-agent-kit
```

#### 方式 B：Skills CLI 通用安装（跨宿主环境）
若需将技能以标准 `SKILL.md` 形式安装到当前项目或全局环境（适用于 Claude Code、Cursor 等宿主）：

```bash
npx skills add mattpocock/skills -a universal
```

### 2. 项目级初始化配置

安装完成后，在目标项目内执行一次工程初始化指令：

```text
/matt:setup-matt-pocock-skills
```

该指令会以交互方式引导确认三项基础设施配置：
1. **工单系统类型**：选择 GitHub Issues、Linear 或本地 Markdown 文件；
2. **任务分拣标签**：配置 Issues 分拣与状态流转的标签命名字典；
3. **领域文档目录**：确认 `CONTEXT.md` 统一领域词典与 `docs/adr/` 架构决策记录的存储路径。

## 四、 14 个 `/matt:*` 终端交互命令详解

在 OMP 聊天终端中输入 `/matt:` 并按 **Tab** 键，可快速激活并补全全部 14 个工程命令：

| 阶段分类 | 斜杠命令 | 核心功能与定位 | 实战使用建议 |
| :--- | :--- | :--- | :--- |
| **技能导航** | `/matt:ask-matt` | 技能路由器与流程导航 | 迷茫时使用，Agent 会根据当前开发场景推荐最适技能与步骤 |
| **需求拷问** | `/matt:grill-with-docs` | 动工前反向提问澄清 | 动手前必用！针对需求进行多轮反问，沉淀 `CONTEXT.md` 与 ADR |
| **思绪整理** | `/matt:grill-me` | 纯逻辑方案反向推演 | 不落盘代码或文件，专用于前期头脑风暴与逻辑查漏补缺 |
| **规范固化** | `/matt:to-spec` | 共识一键整理为需求规范 | 将口头讨论提纯为正式、不可篡改的 Markdown 需求规范 (Spec) |
| **工单拆分** | `/matt:to-tickets` | Spec 切解为原子工单卡 | 拆为带 Blocking 依赖拓扑的垂直切片工单，为实现提供明确边界 |
| **大型探路** | `/matt:wayfinder` | 超大工程决策依赖拓扑 | 面向重型工程，绘制决策树与技术依赖拓扑，按拓扑序推进 |
| **工单分拣** | `/matt:triage` | 工单状态机分拣流转 | 按照既定规则在工单系统中快速分拣、归类与更新 Issue / PR |
| **编码实施** | `/matt:implement` | 读取工单驱动 TDD 实现 | 核心交付入口！读取工单按部就班写代码，自动串联底层 `tdd` 循环 |
| **架构巡检** | `/matt:improve-codebase-architecture` | 静态扫描深模块与坏味道 | 评估代码库的模块深度（Deep Modules），输出可视化 HTML 诊断报告 |
| **工程初始化**| `/matt:setup-matt-pocock-skills` | 一次性环境初始化配置 | 配置工单后端、标签字典与 `CONTEXT.md` 路径 |
| **会话交接** | `/matt:handoff` | 核心决策生成交接文档 | 会话过长或准备换分支时使用，提取上下文摘要供新会话读取 |
| **概念教学** | `/matt:teach` | 交互式概念沙盒演练 | 以当前代码库为沙盒，通过提问与小步实验分步讲解复杂技术概念 |
| **异步反馈** | `/matt:to-questionnaire` | 决策分歧转问卷收集 | 将难以抉择的技术分歧转换为 Markdown 问卷，发给团队收集反馈 |
| **紧急纠偏** | `/matt:wait-what` | 降维直白解释复杂决策 | 当 Agent 输出过于晦涩或跑偏时，强制其用直白大白话重新解释 |

## 五、 端到端推荐交付流水线（三剑客实战联合）

结合本仓库收录的 `matt`、`ponytail` 与 `caveman` 三大插件，可以构筑一套闭环严谨、杜绝过度设计且上下文高度纯净的软件交付工作流：

```text
① /matt:grill-with-docs ──► 动工前反向拷问，沉淀 CONTEXT.md（统一词典）与 ADR
       │
② /matt:to-spec          ──► 对话共识一键整理为正式需求规范 (Spec)
       │
③ /matt:to-tickets       ──► 切解为带 Blocking 依赖关系的原子工单卡
       │
       ▼  【核心实践：建议此时执行 /clear 或新开会话】
④ /matt:implement        ──► 读取工单驱动实现（底层自动走 tdd 红绿测试循环）
   + 开启 /ponytail full  ──► 梯子法则守门：禁推测性抽象、标库与原生优先
       │
⑤ 底层自动 code-review    ──► 提交前双轴并行审查（规范基线 + 工单需求还原度）
       │
⑥ /caveman:commit        ──► 50 字符意图优先 Conventional Commits 极简落库
       │
⑦ /ponytail:debt         ──► 发布前全局排查，盘点刻意简化留下的技术债
```

### 流水线实战细节与心法

1. **动工前反向拷问（`/matt:grill-with-docs`）**：
   - AI 编码最大的风险不是语法错误，而是“自以为理解了需求”。Grill 技能强制模型反向提出 3~5 个异常分支、边界场景与交互死角问题；
   - 拷问产出的专有名词自动沉淀入 `CONTEXT.md`，消除长会话沟通歧义。
2. **规范固化与工单切解（`/matt:to-spec` $\to$ `/matt:to-tickets`）**：
   - 拒绝大段笼统需求直接开写，必须先落地为不可篡改的 Spec，再切解为一个个 15 分钟内可完成的原子工单。
3. **上下文物理截断（Context Decoupling）**：
   - **为什么在此刻建议 `/clear`？** 前期讨论需求、设计架构产生了大量对话上下文，若带着这些庞大历史直接进入编码，极易引发注意力漂移、Token 暴增甚至模型幻觉；
   - 清空会话后，只需让 Agent 读取刚生成的 `spec.md` 与工单卡，以绝对纯净的上下文执行编码。
4. **防御性编码与极简守门（`/matt:implement` + `/ponytail full`）**：
   - `implement` 驱动底层的 `tdd` 技能，严格遵守“先写失败测试（红灯） $\to$ 编写最小代码通过测试（绿灯） $\to$ 消除坏味道（重构）”；
   - 同时开启 `ponytail full`，防止模型在实现过程中过度发挥（如盲目引入重量级三方库、为单一功能编写工厂模式或多余接口）。
5. **双轴并行审查（`code-review`）**：
   - 实现完成后，自动派生两个并行的审查子 Agent：一个对照代码坏味道清单审查规范，另一个对照工单验收准则审查还原度。
6. **极简提交与债务盘点（`/caveman:commit` + `/ponytail:debt`）**：
   - 采用 Caveman 压缩提交信息，只记录业务意图（Why over what），拒绝无意义的代码变动复述；
   - 运行 `/ponytail:debt`，把代码中为了敏捷交付标记的 `# ponytail:` 简化点整理入台账，确保技术债可追踪。

## 六、 底层 25 项技能资产全景索引

官方仓库共包含 25 项核心技能，按功能领域划分如下：

### 1. 工程开发类（Engineering · 18 项）

- **需求澄清、领域建模与架构治理**：
  - `/matt:grill-with-docs`（用户指令）：动手前多轮反向提问澄清需求，同步更新领域词典（`CONTEXT.md`）与架构决策记录（ADR）。
  - `domain-modeling`（模型自调）：在对话中主动提炼业务专属术语，用统一语言消除上下文歧义。
  - `codebase-design`（模型自调）：遵循深度模块设计原则，通过小接口封装复杂逻辑并保证可测试性。
  - `/matt:improve-codebase-architecture`（用户指令）：静态扫描代码库的模块深度，生成可视化 HTML 诊断报告以供重构。
- **任务规划与工单流转**：
  - `/matt:to-spec`（用户指令）：将对话共识整理成结构化需求规范并同步到工单系统。
  - `/matt:to-tickets`（用户指令）：把规范或讨论切解为一组带有前置依赖的原子任务卡。
  - `/matt:wayfinder`（用户指令）：面向超大型工程，在工单系统中建立决策依赖地图并按拓扑顺序推进。
  - `/matt:triage`（用户指令）：按照状态机规则在工单系统中流转和分拣 Issue。
  - `/matt:ask-matt`（用户指令）：技能路由器，根据开发者当前遇到的场景推荐最适技能与流程。
- **编码实现、质量守门与协作**：
  - `/matt:implement`（用户指令）：依据任务卡驱动代码实现，串联底层 TDD 并闭环代码审查。
  - `tdd`（模型自调）：测试驱动开发，按红灯测试 $\to$ 绿灯通过 $\to$ 重构优化的节奏编写代码。
  - `diagnosing-bugs`（模型自调）：针对疑难 Bug 的六步诊断循环，涵盖复现测试、假设验证、埋点插桩与脱敏保护。
  - `code-review`（模型自调）：双轴并行代码审查，分别检查代码规范（坏味道基线）与需求还原度。
  - `resolving-merge-conflicts`（模型自调）：逐块分析 Git 冲突，追溯两侧分支提交意图并化解冲突。
  - `wizard`（模型自调）：生成交互式 Shell 引导脚本，协助人类完成云资源配置、密钥填写或数据迁移。
- **原型探索与技术调研**：
  - `prototype`（模型自调）：快速构建单文件 HTML 原型或在同路由下构建多套可选 UI 方案。
  - `research`（模型自调）：让后台子 Agent 针对可信一手资料开展调研并输出引证书目 Markdown 备忘录。
  - `/matt:setup-matt-pocock-skills`（用户指令）：项目级一次性初始化配置工具。

### 2. 流程与效能类（Productivity · 7 项）

- `/matt:grill-me`（用户指令）：纯逻辑与方案层面的反向提问，不涉及代码，专用于理清思路。
- `grilling`（模型自调）：底层的通用追问引擎，驱动多个技能的提问逻辑。
- `/matt:handoff`（用户指令）：将当前会话的核心决策与进展浓缩为交接文档，便于在新会话中恢复上下文。
- `/matt:wait-what`（用户指令）：在 Agent 输出过于抽象时，命令其结合项目词汇表用直白语言重新解释。
- `/matt:to-questionnaire`（用户指令）：将技术分歧转换为 Markdown 调查问卷，方便异步发给相关人员收集反馈。
- `/matt:teach`（用户指令）：以当前目录为互动练习沙盒，跨会话分步讲解复杂技术概念。
- `writing-for-agents`（模型自调）：规范为 Agent 编写文档（如技能定义与系统守则）的格式与标准。
