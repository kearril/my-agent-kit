# Caveman Plugin for Oh My Pi (omp)

纯净提取自 [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) 的 **Small Rock** 核心提示词与工程规范，专为 Oh My Pi (omp) 适配。

## 包含内容

### 1. 核心提示词 (`skills/`)
- `caveman/`：核心压缩说话模式（支持 lite / full / ultra / wenyan 等强度）。
- `caveman-commit/`：极简意图 Conventional Commits 规范。
- `caveman-review/`：单行正确性与风险代码审查（复杂度交由 `/ponytail-review`）。

### 2. 五大工程工作流规范 (`skills/`)
- `investigate-first`：先查明证据链与根因，未明确前严禁修改业务代码。
- `surgical-patch`：外科手术级微创修复，限制在最窄责任层，避免无关改动。
- `safe-refactor`：安全等价重构，前后必须具备严密验证支撑。
- `migration`：数据/协议迁移需保证回滚能力与平滑兼容。
- `verify-and-stop`：验证达标即停，严禁画蛇添足。
*(注：原版 `lean-build` 已被更完整的 `ponytail` 插件上位替代，予以剔除)*

### 3. OMP 斜杠命令 (`commands/`)
- `caveman-commit.md` (`/caveman-commit`)
- `caveman-review.md` (`/caveman-review`)

### 4. OMP 原生扩展 (`extensions/index.ts`)
- 注册 `/caveman` 动态切换会话压缩模式。
- 终端状态栏模式展示与状态指示灯。
- 自然语言命令识别（`stop caveman` / `normal mode` 自动退回关闭状态）。
- 运行时在 `before_agent_start` 动态注入精简 Prompt。
