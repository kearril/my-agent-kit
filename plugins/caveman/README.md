# Caveman Plugin for Oh My Pi (omp)

纯净提取自 [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) 的 **Small Rock** 核心提示词与工程规范，专为 Oh My Pi (omp) 适配。

## 包含内容

### 1. 核心提示词 (`skills/`)
- `caveman/`：核心压缩说话模式（支持 lite / full / ultra / wenyan 等强度）。
- `caveman-commit/`：极简意图 Conventional Commits 规范。
- `caveman-review/`：单行精准代码评审规范。

### 2. 六大工程工作流规范 (`skills/`)
- `investigate-first`：先查明证据链与根因，未明确前严禁修改业务代码。
- `lean-build`：防过度工程化，按最小闭环实现，禁止预设虚构抽象。
- `surgical-patch`：外科手术级微创修复，限制在最窄责任层，避免无关改动。
- `safe-refactor`：安全等价重构，前后必须具备严密验证支撑。
- `migration`：数据/协议迁移需保证回滚能力与平滑兼容。
- `verify-and-stop`：验证达标即停，严禁画蛇添足。

### 3. OMP 斜杠命令 (`commands/`)
- `caveman.toml` (`/caveman [lite|full|ultra|wenyan|off]`)
- `caveman-commit.toml` (`/caveman-commit`)
- `caveman-review.toml` (`/caveman-review`)

### 4. OMP 原生扩展 (`extensions/index.ts`)
- 注册 `/caveman` 动态切换会话压缩模式。
- 状态栏模式展示与状态指示灯。
- 自然语言命令识别（`stop caveman` / `normal mode` 自动退回关闭状态）。
- 运行时在 `before_agent_start` 动态注入精简 Prompt。
