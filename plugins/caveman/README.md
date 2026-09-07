# Caveman Plugin for Oh My Pi (omp)

纯净提取自 [JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman) 的 **Small Rock** 提示词规则套件，专为 Oh My Pi (omp) 适配。

## 包含内容

### 1. 核心提示词与工程规范 (`skills/`)
- `caveman/`：核心压缩说话模式（lite / full / ultra / wenyan 等）。
- `caveman-commit/`：极简意图提交信息规范。
- `caveman-review/`：单行精准代码评审规范。
- `caveman-compress/`：记忆文件与规则压缩。
- `caveman-stats/`：Token 节省估算与会话统计。
- `cavecrew/`：三子代理规范（investigator, builder, reviewer）。
- 6 大工程工作流规范：
  - `investigate-first`：先查原因后动手
  - `lean-build`：防过度工程化
  - `surgical-patch`：最小手术级改动
  - `safe-refactor`：安全等价重构
  - `migration`：可回滚平滑迁移
  - `verify-and-stop`：验证达标即停

### 2. OMP 斜杠命令 (`commands/`)
- `caveman.toml` (`/caveman`)
- `caveman-commit.toml` (`/caveman-commit`)
- `caveman-review.toml` (`/caveman-review`)
- `caveman-stats.toml` (`/caveman-stats`)

### 3. OMP 原生扩展 (`extensions/index.ts`)
- 注册 `/caveman` 动态切换模式。
- 状态栏模式展示与指示灯。
- 自然语言开关识别（`stop caveman` / `normal mode`）。
- 运行时动态注入 System Prompt。
