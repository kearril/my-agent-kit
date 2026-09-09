# My Agent Kit


个人私有 Agent 插件市场与能力集成库，专为 Oh My Pi (omp) 深度适配。
---

## 插件套件安装（Plugins）

插件为成套工具箱，原生支持 **OMP 插件市场（Marketplace）** 与 **本地软链开发（Link）**：

### 方式 A：OMP 市场源安装（推荐，跨设备与远程）

直接添加本仓库为市场源，按需安装成套插件：

```bash
# 1. 添加本仓库作为私有插件市场
omp marketplace add kearril/my-agent-kit

# 2. 按需安装插件套件
omp plugin install caveman@my-agent-kit
omp plugin install ponytail@my-agent-kit
omp plugin install mattpocock-skills@my-agent-kit

# 3. 以后更新插件
omp plugin upgrade caveman@my-agent-kit
omp plugin upgrade ponytail@my-agent-kit
omp plugin upgrade mattpocock-skills@my-agent-kit
```

### 方式 B：本地开发软链（本地实时调试）

本地代码改动实时在 OMP 中生效（无需提交或重装）：

```bash
# 方式 1：在当前仓库根目录下执行（推荐，相对路径，跨环境通用）
omp plugin link ./plugins/caveman
omp plugin link ./plugins/ponytail
omp plugin link ./plugins/mattpocock-skills

# 方式 2：使用绝对路径（在外部任何目录均可执行）
omp plugin link "D:/MyProjects/my-agent-kit/plugins/caveman"
omp plugin link "D:/MyProjects/my-agent-kit/plugins/ponytail"
omp plugin link "D:/MyProjects/my-agent-kit/plugins/mattpocock-skills"

# 解除软链
omp plugin uninstall @my-agent-kit/caveman
omp plugin uninstall @my-agent-kit/ponytail
omp plugin uninstall @my-agent-kit/mattpocock-skills
```

---

## 独立原子技能安装（Skills）

收录在 `skills/` 下的原子技能支持通过标准 Agent Skills 工具 **按需单独安装**，精准掌控每个项目所需的技能：

### 1. 项目级安装（推荐，仅在当前工作项目生效）
进入你的目标项目根目录执行（默认仅安装至当前工作区，不污染全局）：

```bash
# 按需单独安装指定技能
npx skills add kearril/my-agent-kit --skill <skill-name>
```

### 2. 全局安装（所有项目通用）
如果希望某个技能全机所有项目都能调用，追加 `-g` 标志：

```bash
npx skills add kearril/my-agent-kit --skill <skill-name> -g
```

---

## 命令速查表 (Commands Cheatsheet)

| 斜杠命令 / 快捷调用 | 所属组件 | 功能与定位 |
| :--- | :--- | :--- |
| `/caveman [mode]` | `caveman` | 会话级输出压缩开关与强度切换（`lite` / `full` / `ultra` / `wenyan` / `off`） |
| `/caveman-commit` | `caveman` | 50 字符极简 Conventional Commits 提交信息生成（意图优先，无客套废话） |
| `stop caveman` | `caveman` | 自然语言直接关闭 Caveman 压缩模式 |
| `/ponytail [mode]` | `ponytail` | 防过度工程化梯子法则开关（`lite` / `full` / `ultra` / `off`） |
| `/ponytail-debt` | `ponytail` | 扫描代码中的 `ponytail:` 注释并生成技术债台账 |
| `stop ponytail` | `ponytail` | 自然语言直接关闭 Ponytail 极简模式 |
| `/ask-matt` | `mattpocock-skills` | 技能路由器与流程导航（根据现状推荐最适技能路线） |
| `/grill-with-docs` | `mattpocock-skills` | 动工前反向提问澄清，实时更新 `CONTEXT.md` 统一词典与 ADR |
| `/to-spec` | `mattpocock-skills` | 将讨论共识一键整理固化为正式不可篡改的 Spec 需求规范 |
| `/to-tickets` | `mattpocock-skills` | 将 Spec 切割为垂直切片工单卡，显式标注 Blocking 依赖图 |
| `/implement` | `mattpocock-skills` | 读取工单驱动实现，内嵌 TDD 红绿循环并在收工时驱动双轴审查 |
| `/improve-codebase-architecture` | `mattpocock-skills` | 静态扫描模块深度（Deep Modules），输出 HTML 诊断报告 |
| `/setup-matt-pocock-skills` | `mattpocock-skills` | 一次性初始化工程配置（工单系统类型、分拣标签字典等） |
| `/triage` | `mattpocock-skills` | 按照状态机规则在工单系统中流转和分拣 Issue / PR |
| `/wayfinder` | `mattpocock-skills` | 超大复杂工程探路：建立决策拓扑图并逐个决策推进 |
| `/grill-me` | `mattpocock-skills` | 纯思路反向提问（不落盘文件，适用于无代码仓库思考） |
| `/handoff` | `mattpocock-skills` | 将会话核心决策浓缩为交接文档，便于跨会话恢复上下文 |
| `/teach` | `mattpocock-skills` | 以当前工作区为交互演练沙盒，跨会话分步讲解复杂概念 |
| `/to-questionnaire` | `mattpocock-skills` | 将技术决策盲区转化为 Markdown 调查问卷异步收集反馈 |
| `/wait-what` | `mattpocock-skills` | 紧急纠偏：结合项目 CONTEXT.md 词典与极简白话重新解释 |
---

## 收纳插件矩阵 (Plugins Matrix)

当前仓库已收纳并原生提纯以下核心插件套件：

### 1. Caveman (`caveman`)
- **介绍**：
  专注于**交互输出压缩与极简提交交付**。提取自 `JuliusBrussee/caveman` 的 Small Rock 核心。通过在 OMP 运行生命周期（`before_agent_start`）前置注入压缩约束，砍掉代码周围的寒暄套话、流程自白和虚词，在保持 100% 代码与报错技术精度的同时削减约 65% 的输出 Token。
- **协同定位**：
  与 Matt Pocock 套件深度配合，由 Matt 主导工程规范，Caveman 在底层专职治理啰嗦与负责最后一步 Git Commit 收尾。
- **相关命令**：
  - `/caveman [lite|full|ultra|wenyan|off|status]`：动态切换会话输出压缩强度（支持无参数切换启闭）。
  - `/caveman-commit`：生成意图优先、≤50 字符的极简 Conventional Commits 提交信息。
  - 自然语言命令：输入 `stop caveman` 或 `normal mode` 自动退回正常模式。

---

### 2. Ponytail (`ponytail`)
- **介绍**：
  专注于**极简架构底线与技术债治理**。提取自 `DietrichGebert/ponytail`。核心贯彻“梯子法则”（The Ladder: YAGNI → 复用已有 → 标库优先 → 原生平台能力优先 → 现存依赖优先 → 单行解决），强行约束模型不盲目引包、不写未要求的预设抽象、不堆样板代码。
- **协同定位**：
  与 Matt Pocock 套件深度配合，作为底层思维守门员防代码膨胀，并通过技术债台账防止极简演变为烂尾。
- **相关命令**：
  - `/ponytail [lite|full|ultra|off|status]`：动态控制极简编码梯子法则的执行严格度。
  - `/ponytail-debt`：扫描代码库中的 `ponytail:` 注释并生成技术债台账。
  - 自然语言命令：输入 `stop ponytail` 或 `normal mode` 自动退回正常模式。
---

### 3. Matt Pocock's Skills (`mattpocock-skills`)
- **介绍**：
  专注于**严谨工程规范与反向思维纪律**。提取自 `mattpocock/skills`（Total TypeScript 创始人）。针对凭感觉写代码（Vibe Coding）的顽疾，提供完整的 25 个生产级技能与 14 个快捷交互命令，涵盖反向需求拷问（Grilling）、领域统一词典维护（`CONTEXT.md` / ADR）、测试驱动开发（TDD）、双轴并行代码审查与架构深度巡检。
- **核心主交付流**：
  `/grill-with-docs`（反向澄清） $\to$ `/to-spec`（规范固化） $\to$ `/to-tickets`（切解工单） $\to$ `/implement`（TDD 实现） $\to$ `code-review`（双轴审查）。
- **相关命令**：
  包含 `/ask-matt`、`/grill-with-docs`、`/to-spec`、`/to-tickets`、`/implement`、`/improve-codebase-architecture`、`/setup-matt-pocock-skills`、`/triage`、`/wayfinder`、`/grill-me`、`/handoff`、`/teach`、`/to-questionnaire`、`/wait-what` 共 14 个 Slash Commands。

## 独立原子技能库 (Skills Catalog)

收录于 `skills/` 下的独立技能，支持单点按需引用：
（当前暂无独立收录的原子技能）

---

## 仓库结构

```text
.
├── .omp-plugin/
│   └── marketplace.json    # OMP 插件市场清单定义（caveman, ponytail）
├── skills/                 # 独立原子技能收纳区（支持单点安装）
│   └── README.md           # 技能清单与单点安装说明
├── plugins/                # 成套提纯插件（原生 OMP 支持）
│   ├── caveman/            # 极简通信与工程规范套件（削减 65% 输出 Token）
│   ├── ponytail/           # 防过度工程化架构规范（梯子法则、YAGNI）
│   ├── mattpocock-skills/  # 严谨工程实践套件（TDD、DDD、双轴审查、架构巡检）
│   └── README.md           # 插件清单与接入 SOP
├── scripts/                # 本地维护与校验脚本
│   ├── check.ps1           # PowerShell 扩展类型与语法校验
│   ├── check.sh            # Bash 扩展类型与语法校验
│   ├── sync-upstream.ps1   # PowerShell 上游镜像同步
│   └── sync-upstream.sh    # Bash 上游镜像同步
├── docs/                   # 实践笔记与参考手稿
└── assets/                 # 静态媒体资产
```

---
## 上游镜像与本地同步

上游参考源码存放于本地 `.upstream/` 目录（已加入 `.gitignore`，不提交远端仓库，保持远端纯净）。

如需拉取或更新最新上游源码，可运行本地同步脚本：

```bash
# PowerShell
./scripts/sync-upstream.ps1

# Bash
./scripts/sync-upstream.sh
```
