# AGENTS.md — 仓库操作手册与 Agent 行为守则

本仓库是专为 **Oh My Pi (omp)** 与 Agent Skills 生态深度适配的开源插件市场与能力集成库。

本手册为进入本仓库工作的所有 AI Agent 确立了长效、通用的架构约束与操作铁律。

---

## 1. 仓库目录结构契约

本仓库划分为明确且互不交叉的职责边界区域：

- **`plugins/<name>/`**：为 OMP 扩展机制打包的成套插件区。
  - `skills/<skill-name>/`：技能定义目录，包含 `SKILL.md` 及可选的配套参考文档或脚本。
  - `commands/<cmd-name>.md`：暴露给人类在 OMP 交互终端中调用的斜杠命令定义。
  - `extensions/index.ts` *(可选)*：TypeScript 运行时扩展（用于生命周期 Hook、状态栏指示灯、模式开关等）。
  - `package.json`：包元数据与插件扩展清单声明。
  - `README.md`：组件清单、定位说明与维护规范。
- **`skills/<name>/`**：单一职责的独立单体原子技能区（支持通过 `npx skills` 独立安装）。
- **`.upstream/<name>/`**：本地浅克隆的上游官方参考镜像（只读）。
- **`.omp-plugin/marketplace.json`**：官方插件市场索引清单，列出所有可安装插件。
- **`scripts/`**：自动化镜像同步脚本（`sync-upstream.*`）与双平台质量校验脚本（`check.*`）。

---

## 2. 不可违背的操作铁律

任何 Agent 在审查、修改或扩展本仓库时，**必须严格遵守以下 7 项铁律**：

### 铁律 1：上游绝对隔离（严格只读）
- `.upstream/` 目录存放由 `scripts/sync-upstream.*` 管理的本地参考镜像，已被 `.gitignore` 忽略。
- **严禁修改、格式化或提交 `.upstream/` 中的任何文件。**
- 所有资产提纯、本土化二次开发与适配修改，**必须**在 `plugins/<name>/` 或 `skills/<name>/` 中进行。

### 铁律 2：双层语言分离架构
- **`skills/`（面向 AI 模型）$\to$ 100% 保持上游原版英文**：
  - `SKILL.md` 文件（无论是 YAML Frontmatter 还是正文规则）**必须保持上游原汁原味英文**。
  - **严禁擅自汉化技能正文或描述**。
  - **原因**：保证主流大模型对原生英文触发词的语义命中率，并确保未来上游同步时零代码冲突（Zero Merge Conflict）。
- **`commands/`（面向人类开发者）$\to$ 本地化中文描述**：
  - 命令文件（`commands/*.md`）是人类在终端交互的门面。
  - Frontmatter 中的 `description` **必须**使用精炼、准确的中文，以便人类在终端敲 `/` 时获得直观的补全提示。

### 铁律 3：技能单层扁平化要求
- OMP 与标准 Agent Skills 的加载器仅扫描一级子目录：`<root>/skills/<skill-name>/SKILL.md`。
- 如果上游仓库存在多层嵌套分类（如 `skills/category/name/`），收纳时**必须拍平提取**至单层 `skills/<name>/`。

### 铁律 4：命令命名与跨平台安全（Windows 避坑）
- 命令文件 `commands/<name>.md` 直接对应 OMP 终端中的斜杠命令 `/<name>`。
- 为避免全局命令命名空间污染，插件内的命令**应当带有插件级前缀**（如 `<plugin>-<action>.md`）。
- **严禁在命令文件名中使用冒号 `:`**（如 `plugin:action.md` 是非法的，Windows NTFS/FAT 文件系统严禁文件名出现冒号）。必须统一使用中划线 `-`。

### 铁律 5：极简零运行时哲学（YAGNI）
- 遵循梯子法则：除非该插件切实需要会话级状态机、状态栏指示灯或输入拦截，否则**绝不创建多余的 `extensions/index.ts`**。
- 纯 Prompt、纯规范、纯 Markdown 工作流套件必须保持零运行时依赖，消除一切不必要的构建与维护负担。

### 铁律 6：双平台质量门禁
- 任何代码或文档改动，提交前**必须**运行校验脚本并通过：
  - Bash 环境：`bash scripts/check.sh`
  - PowerShell 环境：`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check.ps1`
- 校验脚本负责检查市场 JSON 合法性、必要文件存在性以及 TS 扩展编译兼容性。校验失败严禁提交。

### 铁律 7：提交规范
- 必须严格遵循 Conventional Commits 规范：`<type>(<scope>): <imperative summary>`。
- 标题必须 $\le 50$ 字符，祈使语气，类型后全小写，末尾不加句号。
- 强调修改原因（Why over what），拒绝废话。
