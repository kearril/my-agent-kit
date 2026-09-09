# Caveman Plugin for Oh My Pi (omp)

纯净提取自 [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) 的 **Small Rock** 核心提示词与工程规范，专为 Oh My Pi (omp) 原生适配。

---

## 项目说明

### 1. 核心定位
Caveman 解决的核心痛点是 **AI Agent 啰嗦、套话多、输出 Token 严重膨胀**。
本插件完整保留了原项目的“小石头”（Small Rock）理念，通过提示词约束与 OMP 生命周期拦截，在保证代码、路径、错误堆栈 100% 绝对精确的前提下，削减约 65% 的无效输出 Token。

### 2. 纯净提纯与协同瘦身
- **彻底抛弃「大石头」**：剔除所有 Go 本地代理、SQLite 记忆与二进制（如 proxy、shrink、rewriter、mem、browse 等），保持零编译、零外部守护进程。
- **剔除失效技能**：删除了强依赖外部 Claude API 的 `caveman-compress`、依赖特定日志结构的 `caveman-stats` 与未提供预设的 `cavecrew`。
- **与 Matt Pocock 套件对齐瘦身**：
  - 代码审查职责统一归入 Matt 的 `code-review`（双轴审查），剔除 `caveman-review`。
  - 故障排查统一归入 Matt 的 `diagnosing-bugs`（六步反馈循环），剔除 `investigate-first` 与 `surgical-patch`。
  - 重构规程统一归入 Matt 的 `tdd` 与 `codebase-design`（深模块），剔除 `safe-refactor`。
- **三大套件生态协同**：
  - **Caveman**：底层专注**会话输出压缩**与**极简 Git Commit 交付**。
  - **Ponytail**：底层专注**极简编码梯子法则**与**技术债治理**。
  - **Matt Pocock's Skills**：顶层主导**全流程工程流、TDD、DDD 与双轴审查**。
---

## 包含内容

### 1. 核心技能 (`skills/`)
- `caveman/`：核心压缩说话模式（支持 `lite`、`full`、`ultra`、`wenyan` 系列等）。
- `caveman-commit/`：极简意图 Conventional Commits 规范（≤50 字符，强调 Why 而非重复 Diff）。
- `migration/`：数据模型、Schema 与协议变更的可逆性保障与平滑过渡规程。
- `verify-and-stop/`：验证达标即刻停手，严禁画蛇添足与范围无限蔓延。

### 2. OMP 斜杠命令 (`commands/`)
- `caveman-commit.md` (`/caveman-commit`)：一键生成意图优先的 50 字符 Conventional Commits 消息。
### 3. OMP 原生扩展 (`extensions/index.ts`)
- 注册 `/caveman [lite|full|ultra|wenyan|off|status]` 本地命令。
- 终端状态栏显示模式指示灯（`⚡ FULL` 等）。
- 监听 `input` 事件，输入 `stop caveman` 或 `normal mode` 自动退回关闭状态。
- 在 `before_agent_start` 动态注入约 100 Token 的精简提示词约束，防长会话人设漂移。

---

## 维护规则

为确保插件长期稳定且便于吸收上游更新，必须遵循以下维护铁律：

1. **隔离修改原则**：
   - 上游镜像位于 `.upstream/caveman/`（本地目录，不入远端库），**严格只读，禁止手动修改**。
   - 所有本地定制、优化与适配必须在 `plugins/caveman/` 目录下进行。
2. **上游吸收流**：
   - 本地通过 `scripts/sync-upstream.*` 脚本同步上游最新提交至 `.upstream/caveman/`。
   - 当上游核心 Prompt（如新强度模式、压缩规则优化）有改进时，由维护者手动比对两目录，挑选优质改动合并至 `plugins/caveman/skills/`。
3. **防倒灌原则**：
   - 严禁在上游同步时将已剔除的 Go 代码、Python 脚本或第三方 IDE 配置反向引入 `plugins/caveman/`。
4. **语言分离原则**：
   - 规则主体（`SKILL.md` 正文）保持纯英文，以降低后续与上游 Diff 的心智负担。
   - 用户可见元数据（Frontmatter `description` 与 `commands/*.md` 描述）保持准确中文化。
