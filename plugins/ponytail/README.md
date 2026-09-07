# Ponytail Plugin for Oh My Pi (omp)

纯净提取自 [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) 的防过度工程化与资深极简架构规范，专为 Oh My Pi (omp) 适配。

## 包含内容

### 1. 核心技能 (`skills/`)
- `ponytail`：核心人设与梯子法则（The Ladder: YAGNI → 复用已有 → 标库优先 → 原生能力优先 → 依赖优先 → 单行极简）。
- `ponytail-review`：Diff 过度设计专项审查（标记 `delete`、`stdlib`、`native`、`yagni`、`shrink`）。
- `ponytail-audit`：全库过度工程化扫荡审计。
- `ponytail-debt`：代码库内 `ponytail:` 注释技术债扫描与台账。

### 2. OMP 斜杠命令 (`commands/`)
- `ponytail-review.md` (`/ponytail-review`)
- `ponytail-audit.md` (`/ponytail-audit`)
- `ponytail-debt.md` (`/ponytail-debt`)

### 3. OMP 原生扩展 (`extensions/index.ts`)
- 注册 `/ponytail [lite|full|ultra|off]` 动态控制强度。
- 终端状态栏原生指示灯（`🐴 ponytail: ⚡ FULL`）。
- 自然语言命令识别（`stop ponytail` / `normal mode` 自动退回关闭状态）。
- 运行时在 `before_agent_start` 动态注入精简 Prompt，并通过会话记录持久化状态。
