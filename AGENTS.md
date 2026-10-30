# AGENTS.md — 仓库操作手册与 Agent 行为守则

本仓库是以 **Oh My Pi (omp)** 为主、同时兼容 **Claude Code** 的 Agent Skills 开源插件市场与能力集成库。

本手册为进入本仓库工作的所有 AI Agent 确立了长效、通用的架构约束与操作准则。

---

## 1. 仓库目录结构契约

本仓库划分为明确且互不交叉的职责边界区域：

- **`plugins/<name>/`**：为 OMP 扩展机制打包的成套插件区。
  - `skills/<skill-name>/`：技能定义目录，包含 `SKILL.md` 及可选的配套参考文档。
  - `commands/<cmd-name>.md`：暴露给人类在 OMP 交互终端中调用的斜杠命令定义（中文描述）。
  - `package.json`：包元数据与插件扩展清单声明。
  - `.claude-plugin/plugin.json`：Claude Code 插件清单，仅用于屏蔽 `commands/`（见准则 7）。
  - `README.md`：组件清单、定位说明与维护规范。
- **`.upstream/<name>/`**：本地浅克隆的上游官方参考镜像（只读，已被 `.gitignore` 忽略）。
- **`.omp-plugin/marketplace.json`**：OMP 插件市场索引清单（OMP 优先读取）。
- **`.claude-plugin/marketplace.json`**：Claude Code 插件市场索引清单，`plugins` 列表须与 OMP 清单保持一致。

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

### 准则 7：双平台入口（OMP 命令 + Claude Code 技能）
- **`skills/` 双平台共用**：`SKILL.md` 中禁止使用平台专有写法（如 `skill://`）。
- **`commands/` 仅供 OMP**：命令正文可使用 `skill://`；Claude Code 侧不加载命令，直接以技能作为斜杠入口（如 `/general:grill-me`）。
- **屏蔽机制**：各插件 `.claude-plugin/plugin.json` 必须保持 `"commands": []`。Claude Code 声明 `commands` 即替换默认 `commands/` 扫描，空数组即不加载任何命令；OMP 同样读取该文件，但空数组会回退到默认 `commands/*.md`。不得改为非空、字符串或对象映射，否则会改变 OMP 的命令加载。
- **版本号**：`plugin.json` 中不写 `version`（两个平台都会以它覆盖市场清单中的版本）。发版时同步修改 `package.json` 与两份 `marketplace.json`。
- **回归检查**：以上依赖两个平台对空 `commands` 的实测行为（OMP v18.14.0 / Claude Code 2026-10）。升级任一平台后，确认 OMP 中 `/general:grill-me` 仍为中文命令、Claude Code 中仍只出现技能。
