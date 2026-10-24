# AGENTS.md — 仓库操作手册与 Agent 行为守则

本仓库是专为 **Oh My Pi (omp)** 与 Agent Skills 生态深度适配的开源插件市场与能力集成库。

本手册为进入本仓库工作的所有 AI Agent 确立了长效、通用的架构约束与操作准则。

---

## 1. 仓库目录结构契约

本仓库划分为明确且互不交叉的职责边界区域：

- **`plugins/<name>/`**：为 OMP 扩展机制打包的成套插件区。
  - `skills/<skill-name>/`：技能定义目录，包含 `SKILL.md` 及可选的配套参考文档。
  - `commands/<cmd-name>.md`：暴露给人类在 OMP 交互终端中调用的斜杠命令定义（中文描述）。
  - `package.json`：包元数据与插件扩展清单声明。
  - `README.md`：组件清单、定位说明与维护规范。
- **`.upstream/<name>/`**：本地浅克隆的上游官方参考镜像（只读，已被 `.gitignore` 忽略）。
- **`.omp-plugin/marketplace.json`**：官方插件市场索引清单，列出所有可安装插件。

---

## 2. 核心架构与操作准则

### 准则 1：双层场景分离（常驻底座 + 领域挂载）
- 仓库划分为全局常驻的 **`general`**（通用元能力：质询、澄清、交接、一手调研、教学、复盘）与按需挂载的 **`coding`**（严肃软件工程：Spec、Tickets、TDD、Review、Bug 诊断）。
- 严禁将具有特定领域偏见（如 Git/TDD/Linter）的规则混入 `general`，确保非代码场景（科研、日常聊天、办公）下的轻量与低上下文噪音。

### 准则 2：双层语言分离
- **`skills/`（面向 AI 模型）**：保持专业、严谨的英文 Prompt 与流程规范，确保主流大模型的原生触发与规则执行精度。
- **`commands/`（面向人类开发者）**：Frontmatter 中的 `description` 必须使用精炼、准确的中文，以便人类在终端敲 `/` 时获得直观的补全提示。

### 准则 3：技能单层扁平化要求
- OMP 与标准 Agent Skills 的加载器仅扫描一级子目录：`<root>/skills/<skill-name>/SKILL.md`。
- 收纳技能时统一使用单层 `skills/<name>/`，杜绝多层嵌套。

### 准则 4：命令命名与跨平台安全
- 命令文件名严禁使用冒号 `:`，统一使用中划线 `-`（如 `grill-me.md`，由 OMP 自动拼装为 `/<plugin>:grill-me`）。
- 技能中如需对模型隐藏调用，在 Frontmatter 中声明 `disable-model-invocation: true`，并在 `commands/` 下配套中文命令。

### 准则 5：极简零运行时哲学（YAGNI）
- 纯 Prompt、纯规范、纯 Markdown 工作流套件，坚决消除多余的编译构建、TS 扩展与自动化校验脚本负担。
- 拒绝死重，保持资产的纯净与易维护。

### 准则 6：提交规范
- 严格遵循 Conventional Commits 规范：`<type>(<scope>): <imperative summary>`。
- 标题 $\le 50$ 字符，祈使语气，类型后全小写，末尾不加句号。
