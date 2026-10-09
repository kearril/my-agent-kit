# Matt Plugin for Oh My Pi (omp)

纯净提取自 [mattpocock/skills](https://github.com/mattpocock/skills)（Matt Pocock，Total TypeScript 创始人）的面向严谨工程实践的 Agent 技能集，专为 Oh My Pi (omp) 扩展体系深度适配。

---

## 项目说明

### 1. 核心定位
本套件的核心目标是**终结 AI 凭感觉写代码（Stop vibe coding, do real engineering）**。
通过引入传统软件工程中沉淀的经典实践（测试驱动开发 TDD、领域驱动设计 DDD、深度模块封装 Deep Modules、代码坏味道巡检与双轴审查），引导 Agent 遵循严密工程纪律。

### 2. 架构适配决策
- **单层扁平化收纳**：上游按 `engineering/` 与 `productivity/` 嵌套分类，本项目将 26 个生产级技能平铺收录至 `skills/<name>/`；仅裁剪异步问卷 `to-questionnaire`，保留外部反馈分拣 `triage` 与完整核心交付流程。
- **保留私有资产完整性**：完整保留各技能私有的辅助规范文档（如 `tdd/tests.md`、`domain-modeling/ADR-FORMAT.md`、`teach/*.md` 等）与辅助脚本模板。
- **双层调用映射**：
  - **11 个模型自调技能 (`skills/`)**：常驻 Agent 描述池，编码或分析时自主按需加载。
  - **16 个用户显式命令 (`commands/`)**：15 个仅用户发起的技能提供对应入口，模型可按需调用的 `pr` 也提供手动入口；支持终端 `/` 快速补全并传递 CLI 参数。
- **极简零运行时**：全套能力均由高质量 Prompt、规范模板与工作流驱动，不设冗余 TS 扩展。

### 3. 版本与上游基准对齐
- **本地插件版本**：`v2.0.2`（吸收上游工程补丁与可用性修复，保持 26 个技能、16 个命令）。
- **上游精确基线**：基于官方 Commit `b0618bc` *(2026-10-08, 官方 package.json 维持 1.3.1，含 main 分支最新补丁提交)*。
- **本地裁剪与适配**：仅排除 `to-questionnaire` 及其配套资产，`ask-matt` 仅保留该问卷入口的排除；`triage` 及其配套初始化资产、16 个中文命令及 26 个底层技能完全保留。

### 4. 工具调用映射与运行时适配说明
上游技能正文保持原始英文，部分技能中包含 `call the Skill tool` 描述。在 Oh My Pi (omp) 环境中，无独立的 `Skill` 工具实体，该语义直接对应为**读取 `skill://<name>` 资源并遵循其指导**。本地命令包装器（如 `/matt:implement`）已明确该映射规则，无需修改上游技能英文正文或引入额外运行时插件。

`wizard` 保留上游英文 `SKILL.md` 与 `template.sh`，仅生成 Bash 向导。Windows 需要可用的 Bash 环境；本插件不提供 PowerShell 对照模板、平台路由或 Windows 原生支持，也不将 `chmod` 视为 Windows 密钥保护保证。

## 包含内容

### 1. 核心五步主交付流水线（Idea → Ship）

1. **需求拷问与术语沉淀 (`/matt:grill-with-docs`)**：动工前多轮反向提问，实时更新 `GLOSSARY.md`（统一领域语言）与架构决策记录（ADR）。
2. **规范固化 (`/matt:to-spec`)**：将讨论共识一键整理为正式需求规范（已审批的需求基准，包含测试缝隙设计）。
3. **工单切解 (`/matt:to-tickets`)**：切成垂直切片工单（Tracer Bullets），显式标注 Blocking 依赖图。
4. **测试驱动编码 (`/matt:implement` → `tdd`)**：在预先约定的测试边界上尽可能使用 TDD；一次实现一个红绿切片，重构职责交由后续代码审查阶段。
5. **双轴代码审查 (`code-review`)**：提交前双 Agent 并行审查代码规范与需求还原度。

### 2. 完整技能资产清单 (`skills/` · 共 26 项)

- **工程开发类（20 项）**：
  - `ask-matt`：技能路由器与流程导航。
  - `code-review`：双轴并行代码审查（规范基线 + 需求还原）。
  - `codebase-design`：深度模块架构设计词典。
  - `diagnosing-bugs`：六步根因排查法（必先构建可复现反馈闭环，支持测试、脚本、trace 或回放等多种手段）。
  - `domain-modeling`：领域建模与统一语言维护（`GLOSSARY.md` / ADR）。
  - `grill-with-docs`：带文档沉淀的多轮需求反向拷问。
  - `implement`：工单驱动实现引擎。
  - `implement-spec`：规范与工单依赖图驱动全自动并行实现，并归集至独立集成分支（integration branch）统一审查。
  - `improve-codebase-architecture`：代码库复杂度与深度模块静态扫描。
  - `pr`：高可读性 Pull Request 正文结构化生成。
  - `prototype`：单文件探索性原型与多方案对比。
  - `research`：后台子 Agent 针对一手资料深入调研。
  - `retro`：基于事实的编码会话复盘与开发环境改进。
  - `setup-matt-pocock-skills`：项目一次性工程环境配置。
  - `tdd`：测试驱动开发，单切片红绿循环（红灯测试 → 最小绿灯，重构后置至 review 阶段）。
  - `to-spec`：对话转需求规范（经审批的需求基准，确定测试缝隙）。
  - `to-tickets`：规范转原子任务卡。
  - `triage`：验证与分拣外部 Issue／PR，补齐信息并形成 Agent 可执行简报。
  - `wayfinder`：超大超复杂工程决策拓扑探路。
  - `wizard`：生成人类参与的 Bash 交互向导；Windows 需可用 Bash 环境，不承诺原生支持。
- **效能与辅助类（6 项）**：
  - `grill-me`：纯思维反向提问（不落盘文件）。
  - `grilling`：底层通用反向提问引擎。
  - `handoff`：跨会话/跨 Harness 上下文交接文档生成。
  - `teach`：当前工作区沙盒化互动教学。
  - `wait-what`：紧急纠偏（用极简白话结合项目词典重新解释）。
  - `writing-for-agents`：为 AI 编写技能与规则的工程规范。

### 3. OMP Slash Commands (`commands/` · 16 个，终端原生 `/matt:<command>` 命名空间)

- `/matt:ask-matt`：技能路由器与流程导航（根据现状推荐最适技能路线）。
- `/matt:grill-with-docs`：动工前反向提问澄清，实时更新 `GLOSSARY.md` 统一词典与 ADR。
- `/matt:to-spec`：将讨论共识整理固化为正式 Spec 需求规范（经审批需求基准与测试缝隙）。
- `/matt:to-tickets`：将 Spec 切割为垂直切片工单卡，显式标注 Blocking 依赖图。
- `/matt:implement`：读取工单驱动实现，内嵌单切片 TDD 红绿循环并在收工时驱动双轴审查。
- `/matt:implement-spec`：根据 Spec 与工单图全自动并行调度子 Agent 实现并汇总至独立集成分支。
- `/matt:pr`：生成高质量结构化 PR 正文（极简视图、验证证据、风险判定）。
- `/matt:retro`：复盘编码会话中的工程卡点，生成环境或自动化检查改进方案。
- `/matt:improve-codebase-architecture`：静态扫描模块深度（Deep Modules），输出 HTML 诊断报告。
- `/matt:setup-matt-pocock-skills`：一次性初始化工程配置（工单系统类型、分拣标签字典等）。
- `/matt:triage`：在工单系统中验证、分拣外部反馈并形成可执行简报。
- `/matt:wayfinder`：超大复杂工程探路：建立决策拓扑图并逐个决策推进。
- `/matt:grill-me`：纯思路反向提问（不落盘文件，适用于无代码仓库思考）。
- `/matt:handoff`：将会话核心决策浓缩为交接文档，便于跨会话恢复上下文。
- `/matt:teach`：以当前工作区为交互演练沙盒，跨会话分步讲解复杂概念。
- `/matt:wait-what`：紧急纠偏：结合项目 GLOSSARY.md 词典与极简白话重新解释。

### 4. 辅助资产与规范文档说明
各技能内部维护了高内聚的私有辅助资产：
- `tdd/tests.md`、`tdd/mocking.md`：测试编写准则、反模式与 Mock 隔离约束。
- `domain-modeling/ADR-FORMAT.md`：轻量级架构决策记录标准格式。
- `setup-matt-pocock-skills/` 辅助配置：`issue-tracker-github.md`、`issue-tracker-gitlab.md`、`issue-tracker-local.md`、`triage-labels.md` 与 `domain.md`，用于初始化工单系统、状态标签与领域文档约定。
- `teach/*.md`：交互式教学步骤与沙盒演练模板。
- `wizard/template.sh`：保留原版上游 Bash 向导模板。
- `diagnosing-bugs/scripts/`：辅助复现与诊断脚本。

---

## v2.0.2 版本更新记录（上游基线：2026-10-08）

基于上游提交 `b0618bc`（官方包版本维持 1.3.1），同步了 12 个现有技能与 15 个技能资产文件的优化：
1. **路由、实现与提交流程完善**：
   - `ask-matt`：描述技能或建议跳过步骤前，先读取对应技能正文。
   - `implement`：支持通过 issue/ticket 引用直接定位工单；规范工具调用表述。
   - `code-review`：明确代码规范约束基线，优化审查子 Agent 派生行为。
   - `to-tickets`：改进子 issue（sub-issues）与依赖关系切解支持。
2. **诊断与测试证明强化**：
   - `diagnosing-bugs`：人为修改代码或夹具制造失败时，先与原始副本比较，证明修改确实落地，再信任失败结果。
   - `tdd`：深化测试缝隙（seam）设计权衡与决策确认。
3. **探路与工单系统修复**：
   - `wayfinder`：修复标签引用、调研任务处理以及 PR 生成链路。
   - `setup-matt-pocock-skills`：修复 GitHub/GitLab 工单追踪器初始化及外部 PR 列表处理。
4. **向导、交接与教学体验优化**：
   - `wizard`：吸收上游 Bash 模板的输入编辑、EOF、`.env` 特殊字符、链接写入与权限保留修复，以及浏览器打开失败提示；不新增 Windows 原生适配。
   - `handoff`：明确临时目录选择，Windows 使用 `%TEMP%`。
   - `teach`：明确工作区根目录定位，优化测验答案位置与教学互动体验。
   - `grilling`：问题措辞统一为回答“是”即接受推荐答案。
---

## 维护铁律

1. **上游隔离原则**：本地上游镜像存放于 `.upstream/matt/`（`.gitignore` 忽略），只读不可改。
2. **上游吸收流程**：运行 `scripts/sync-upstream.*` 自动更新镜像；新发布版本仅比对并提取官方认证技能至 `plugins/matt/skills/`，不引入 `deprecated/`、`in-progress/` 或未审查的实验性技能。不得重新收纳已裁剪的 `to-questionnaire`；同步 `ask-matt` 时必须保留问卷入口裁剪。`triage` 及关联初始化资产保持原始英文副本。
3. **语言分离原则**：技能 Frontmatter 与正文保持上游英文；命令 Frontmatter 的 `description` 使用中文，面向终端用户提供补全提示。
