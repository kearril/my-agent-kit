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

# 3. 以后更新插件
omp plugin upgrade caveman@my-agent-kit
omp plugin upgrade ponytail@my-agent-kit
```

### 方式 B：本地开发软链（本地实时调试）

本地代码改动实时在 OMP 中生效（无需提交或重装）：

```bash
# 方式 1：在当前仓库根目录下执行（推荐，相对路径，跨环境通用）
omp plugin link ./plugins/caveman
omp plugin link ./plugins/ponytail

# 方式 2：使用绝对路径（在外部任何目录均可执行）
omp plugin link "D:/MyProjects/my-agent-kit/plugins/caveman"
omp plugin link "D:/MyProjects/my-agent-kit/plugins/ponytail"

# 解除软链
omp plugin uninstall @my-agent-kit/caveman
omp plugin uninstall @my-agent-kit/ponytail
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
| `/caveman-review` | `caveman` | 单行代码审查评注（专查代码正确性、运行时 Bug 与未捕获异常） |
| `stop caveman` | `caveman` | 自然语言直接关闭 Caveman 压缩模式 |
| `/ponytail [mode]` | `ponytail` | 防过度工程化梯子法则开关（`lite` / `full` / `ultra` / `off`） |
| `/ponytail-review` | `ponytail` | 单行过度设计专项审查（标记死代码、自造轮子、多余抽象，统计净削减行数） |
| `/ponytail-audit` | `ponytail` | 全仓库过度工程化与复杂度扫荡审计 |
| `/ponytail-debt` | `ponytail` | 扫描代码中的 `ponytail:` 注释并生成技术债台账 |
| `stop ponytail` | `ponytail` | 自然语言直接关闭 Ponytail 极简模式 |

---

## 收纳插件矩阵 (Plugins Matrix)

当前仓库已收纳并原生提纯以下核心插件套件：

### 1. Caveman (`caveman`)
- **介绍**：
  专注于**交互输出压缩与工程方法论**。提取自 `JuliusBrussee/caveman` 的 Small Rock 核心。通过在 OMP 运行生命周期（`before_agent_start`）前置注入压缩约束，砍掉代码周围的寒暄套话、流程自白和虚词，在保持 100% 代码与报错技术精度的同时削减约 65% 的输出 Token。
- **相关命令**：
  - `/caveman [lite|full|ultra|wenyan|off|status]`：动态切换会话输出压缩强度（支持无参数切换启闭）。
  - `/caveman-commit`：生成意图优先、≤50 字符的极简 Conventional Commits 提交信息。
  - `/caveman-review`：单行正确性审查（专查代码正确性、运行时 Bug、未捕获异常与风险）。
  - 自然语言命令：输入 `stop caveman` 或 `normal mode` 自动退回正常模式。

---

### 2. Ponytail (`ponytail`)
- **介绍**：
  专注于**防过度工程化与资深极简架构**。提取自 `DietrichGebert/ponytail`。核心贯彻“梯子法则”（The Ladder: YAGNI → 复用已有 → 标库优先 → 原生平台能力优先 → 现存依赖优先 → 单行解决），强行约束模型不写未要求的预设抽象、不造轮子、不堆样板代码，实现代码优先与最小闭环交付。
- **相关命令**：
  - `/ponytail [lite|full|ultra|off|status]`：动态控制极简编码梯子法则的执行严格度。
  - `/ponytail-review`：过度设计专项审查（标记 `delete` 死代码、`stdlib` 轮子、`native` 原生替代、`yagni` 多余抽象，输出净削减行数）。
  - `/ponytail-audit`：全仓库过度工程化扫描与裁剪审计。
  - `/ponytail-debt`：扫描代码库中的 `ponytail:` 注释并生成技术债台账。
  - 自然语言命令：输入 `stop ponytail` 或 `normal mode` 自动退回正常模式。

---

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
│   └── README.md           # 插件清单与 3 步走接入 SOP
├── scripts/                # 本地维护与同步脚本
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
