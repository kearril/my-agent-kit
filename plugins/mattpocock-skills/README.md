# Matt Pocock's Skills Plugin for Oh My Pi (omp)

纯净提取自 [mattpocock/skills](https://github.com/mattpocock/skills)（Matt Pocock，Total TypeScript 创始人）的面向严谨工程实践的 Agent 技能集，专为 Oh My Pi (omp) 扩展体系深度适配。

---

## 项目说明

### 1. 核心定位
本套件的核心目标是**终结 AI 凭感觉写代码（Stop vibe coding, do real engineering）**。
通过引入传统软件工程中沉淀的经典实践（测试驱动开发 TDD、领域驱动设计 DDD、深度模块封装 Deep Modules、代码坏味道巡检与双轴审查），引导 Agent 遵循严密工程纪律。

### 2. 架构适配决策
- **单层扁平化收纳**：上游按 `engineering/` 与 `productivity/` 嵌套分类，由于 OMP 技能机制要求单层目录规范，本项目将官方 25 个生产级技能完全平铺收录至 `skills/<name>/`。
- **保留私有资产完整性**：完整保留各技能私有的辅助规范文档（如 `tdd/tests.md`、`domain-modeling/ADR-FORMAT.md`、`teach/*.md` 等）与辅助脚本模板。
- **双层调用映射**：
  - **11 个模型自调技能 (`skills/`)**：常驻 Agent 描述池，编码或分析时自主按需加载。
  - **14 个用户显式命令 (`commands/`)**：为上游标记 `disable-model-invocation: true` 的技能建立 OMP 原生 Slash Command 映射，支持终端 `/` 快速补全并传递 CLI 参数。
- **极简零运行时**：全套能力均由高质量 Prompt、规范模板与工作流驱动，不设冗余 TS 扩展（遵循 Ponytail YAGNI 梯子法则）。

### 3. 版本与上游基准对齐
- **本地插件版本**：`v1.0.0`（遵循本仓库新插件统一从 `1.0.0` 起步规范）。
- **上游精确基线**：基于官方 Commit `3cca18b` *(2026-09-04, 对应官方 release 1.2.3)*。
---

## 包含内容

### 1. 核心五步主交付流水线（Idea → Ship）

1. **需求拷问与术语沉淀 (`/matt-grill-with-docs`)**：动工前多轮反向提问，实时更新 `CONTEXT.md`（统一领域语言）与架构决策记录（ADR）。
2. **规范固化 (`/matt-to-spec`)**：将讨论共识一键整理为正式需求规范，拒绝口头模糊。
3. **工单切解 (`/matt-to-tickets`)**：切成垂直切片工单（Tracer Bullets），显式标注 Blocking 依赖图。
4. **测试驱动编码 (`/matt-implement` → `tdd`)**：逐个工单独立实现，强制走红灯测试 → 最小绿灯 → 重构循环。
5. **双轴代码审查 (`code-review`)**：提交前双 Agent 并行审查代码规范与需求还原度。

### 2. 完整技能资产清单 (`skills/` · 共 25 项)

- **工程开发类（18 项）**：
  - `ask-matt`：技能路由器与流程导航。
  - `code-review`：双轴并行代码审查（规范基线 + 需求还原）。
  - `codebase-design`：深度模块架构设计词典。
  - `diagnosing-bugs`：六步根因排查法（必先编写复现红灯测试）。
  - `domain-modeling`：领域建模与统一语言维护（`CONTEXT.md` / ADR）。
  - `grill-with-docs`：带文档沉淀的多轮需求反向拷问。
  - `implement`：工单驱动实现引擎。
  - `improve-codebase-architecture`：代码库复杂度与深度模块静态扫描。
  - `prototype`：单文件探索性原型与多方案对比。
  - `research`：后台子 Agent 针对一手资料深入调研。
  - `resolving-merge-conflicts`：按分支提交意图逐块化解冲突。
  - `setup-matt-pocock-skills`：项目一次性工程环境配置。
  - `tdd`：测试驱动开发红绿循环。
  - `to-spec`：对话转需求规范。
  - `to-tickets`：规范转原子任务卡。
  - `triage`：Issue / PR 状态机分拣。
  - `wayfinder`：超大超复杂工程决策拓扑探路。
  - `wizard`：交互式 Shell 向导（辅助人类完成云凭证与密钥配置）。
- **效能与辅助类（7 项）**：
  - `grill-me`：纯思维反向提问（不落盘文件）。
  - `grilling`：底层通用反向提问引擎。
  - `handoff`：跨会话/跨 Harness 上下文交接文档生成。
  - `teach`：当前工作区沙盒化互动教学。
  - `to-questionnaire`：技术决策盲区分歧转调查问卷。
  - `wait-what`：紧急纠偏（用极简白话结合项目词典重新解释）。
  - `writing-for-agents`：为 AI 编写技能与规则的工程规范。

### 3. OMP Slash Commands (`commands/` · 14 个，统一 `matt-` 顶级命名空间)

- `/matt-ask-matt`：技能路由器与流程导航（根据现状推荐最适技能路线）。
- `/matt-grill-with-docs`：动工前反向提问澄清，实时更新 `CONTEXT.md` 统一词典与 ADR。
- `/matt-to-spec`：将讨论共识一键整理固化为正式不可篡改的 Spec 需求规范。
- `/matt-to-tickets`：将 Spec 切割为垂直切片工单卡，显式标注 Blocking 依赖图。
- `/matt-implement`：读取工单驱动实现，内嵌 TDD 红绿循环并在收工时驱动双轴审查。
- `/matt-improve-codebase-architecture`：静态扫描模块深度（Deep Modules），输出 HTML 诊断报告。
- `/matt-setup-matt-pocock-skills`：一次性初始化工程配置（工单系统类型、分拣标签字典等）。
- `/matt-triage`：按照状态机规则在工单系统中流转和分拣 Issue / PR。
- `/matt-wayfinder`：超大复杂工程探路：建立决策拓扑图并逐个决策推进。
- `/matt-grill-me`：纯思路反向提问（不落盘文件，适用于无代码仓库思考）。
- `/matt-handoff`：将会话核心决策浓缩为交接文档，便于跨会话恢复上下文。
- `/matt-teach`：以当前工作区为交互演练沙盒，跨会话分步讲解复杂概念。
- `/matt-to-questionnaire`：将技术决策盲区转化为 Markdown 调查问卷异步收集反馈。
- `/matt-wait-what`：紧急纠偏：结合项目 CONTEXT.md 词典与极简白话重新解释。
---

## 维护铁律

1. **上游隔离原则**：本地上游镜像存放于 `.upstream/mattpocock-skills/`（`.gitignore` 忽略），只读不可改。
2. **上游吸收流程**：运行 `scripts/sync-upstream.*` 自动更新镜像；新发布版本仅比对并提取官方认证技能至 `plugins/mattpocock-skills/skills/`，不引入 `deprecated/`、`in-progress/` 或未审查的实验性技能。
3. **语言分离原则**：技能正文与专业工程描述保持原版英文，确保模型理解最精确；用户交互前端（Frontmatter 描述与 Slash Command 描述）保持中文。
