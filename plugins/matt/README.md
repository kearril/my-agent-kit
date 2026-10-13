# Matt Plugin for Oh My Pi (omp)

逐字收录 [mattpocock/skills](https://github.com/mattpocock/skills)（Matt Pocock，Total TypeScript 创始人）正式发布的 Agent 技能，面向 Oh My Pi (omp) 做原生适配。

---

## 项目说明

### 1. 核心定位
**终结 AI 凭感觉写代码（Stop vibe coding, do real engineering）**：以需求拷问、规范与工单切解、TDD、深度模块设计与双轴代码审查等经典工程实践约束 Agent。技能全集与用法以上游 README 及 `/matt:ask-matt` 为准。

### 2. 收纳与适配决策
- **跟随上游，不做裁剪**：按上游 `.claude-plugin/plugin.json` 的 `skills` 清单收录，即上游在 Claude Code 中发布的同一技能集；`deprecated/`、`in-progress/`、`misc/` 不在清单内，因而不收。
- **单层扁平化**：上游按 `engineering/`、`productivity/` 分类嵌套，收纳时拍平为 `skills/<name>/`，技能私有文档与脚本随目录完整保留。
- **本地只维护 OMP 适配层**：`commands/*.md`（中文斜杠命令）、`package.json`、本文件。`skills/` 由 `scripts/absorb.mjs` 生成，不得手改。
- **命令映射**：每个 `disable-model-invocation: true` 的技能必须有同名 `commands/<name>.md`（`scripts/check.*` 强制校验），另为模型可调用的 `pr` 提供手动入口。
- **`Skill` 工具语义映射**：上游正文中的 `call the Skill tool` 在 OMP 中对应“读取 `skill://<name>` 并遵循其指导”；命令包装器已写明此规则，无需改动上游英文正文。
- **`wizard` 仅生成 Bash 向导**：Windows 需可用的 Bash 环境；本插件不提供 PowerShell 对照模板或 Windows 原生适配。
- **极简零运行时**：不设 TS 扩展。

### 3. 版本与上游基线
只跟随上游正式 Release（`v*` 标签），不收录 main 上未发版的提交；插件版本即上游 Release 版本，见 [`plugins/README.md`](../README.md) 版本表，由每日自动同步维护。本地命令改动随上游下一个 Release 发布。

## OMP Slash Commands（`/matt:<command>`）

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
- `/matt:to-questionnaire`：将自己无法独立回答的决策整理为问卷，交由掌握信息的他人异步填写。
- `/matt:wait-what`：紧急纠偏：结合项目 GLOSSARY.md 词典与极简白话重新解释。

---

## 维护铁律

1. **上游隔离原则**：`.upstream/matt/` 为 `scripts/sync-upstream.*` 管理的只读浅克隆（`.gitignore` 忽略）。
2. **自动吸收**：`.github/workflows/upstream-sync.yml` 每日运行 `scripts/absorb.mjs`，上游有新 Release 时整体替换 `skills/` 并自动合并；本地手动执行 `bash scripts/sync-upstream.sh && node scripts/absorb.mjs matt` 效果相同。
3. **新增用户技能需补命令**：上游新增 `disable-model-invocation: true` 技能时 `check` 失败、PR 不会合并，在 PR 分支补 `commands/<name>.md`（中文 `description`）即可。
4. **语言分离原则**：技能 Frontmatter 与正文保持上游英文；命令 Frontmatter 的 `description` 使用中文。
