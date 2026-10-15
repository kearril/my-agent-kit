# Plugins 架构与收纳维护白皮书

成套插件与外部集成项目的原生适配开发区，专为 **Oh My Pi (omp)** 扩展生态设计。

---

## 一、 包含插件清单与上游精确对齐基线

所有插件逐字收录上游正式发布的技能，本地只做 OMP 适配（中文命令、`package.json`、市场条目）。版本与基线两列由 `scripts/absorb.mjs` 自动维护，勿手改：

| 本地插件 | 本地版本（= 上游 Release） | 上游仓库 URL | 上游基线 | 收纳规则 |
|---|---|---|---|---|
| **`matt`** | `v1.3.1` | `https://github.com/mattpocock/skills.git` | Release `v1.3.1` | 按上游 `.claude-plugin/plugin.json` 的 `skills` 清单拍平收录，不裁剪；`deprecated/`、`in-progress/`、`misc/` 不在清单内即不收。 |
| **`hyperframes`** | `v0.8.159` | `https://github.com/heygen-com/hyperframes` | Release `v0.8.159` | 收录 Release 插件包 `hyperframes-agent-plugin.zip` 的全部技能目录及 `plugin.json`、`LICENSE`（启动器依赖 `plugin.json` 版本号固定 CLI）；上游仓库过大，镜像下载并校验 Release 包而非克隆。 |

### 自动更新

`.github/workflows/upstream-sync.yml` 每日 01:00 UTC（亦可在 Actions 页手动触发）执行，仅用内置 `GITHUB_TOKEN`，无需额外 Secret：

1. `scripts/sync-upstream.sh` 将 `.upstream/` 镜像更新到各上游**最新 Release**（不跟踪未发版的 main 提交）；
2. `scripts/absorb.mjs` 按上表规则整体替换 `plugins/<name>/skills/` 等上游资产，插件版本直接采用上游 Release 版本，并同步 `marketplace.json` 与两张版本表；
3. 推送 `auto/upstream-sync` 分支并开 PR，在同一任务内运行 `scripts/check.sh`，通过即 squash 合并（`GITHUB_TOKEN` 开的 PR 不会触发 CI，也唤不醒 auto-merge，故由任务自行校验并合并）。

sync PR 未合并期间，后续定时运行会跳过，避免覆盖分支上的手动修复。

唯一需人工介入的情形：上游新增 `disable-model-invocation: true` 的技能。此时 `check` 报 `user-only skill "<name>" has no commands/<name>.md`，工作流在 PR 上 @ 仓库所有者并标记失败。本地处理：

```bash
gh pr checkout auto/upstream-sync
omp "按 AGENTS.md 为 check 报错的 user-only 技能补中文命令文件，运行 check 后提交并推送"
gh pr merge auto/upstream-sync --squash --delete-branch   # 推送触发的 CI 通过后执行
```

本地手动吸收同理：`bash scripts/sync-upstream.sh && node scripts/absorb.mjs`，再运行 `check` 并提交（`absorb.mjs` 已用 `git add -f` 暂存，规避上游技能自带 `.gitignore` 屏蔽其夹具文件）。

---

## 二、 核心架构设计与工程规范

### 1. 目录分层与本地隔离
- **`.upstream/<name>/`（只读参考镜像）**：
  - 本地 Git 浅克隆仓库，**已加入 `.gitignore`，严禁直接修改或推送到远端**。
  - 通过 `scripts/sync-upstream.*` 自动化批量拉取上游最新发布代码。
- **`plugins/<name>/`（本地提纯与适配区）**：
  - 本地化维护的实际插件目录，只收录上游核心资产，提供 OMP 原生适配。

### 2. 双层语言分离架构（The Dual-Language Principle）
- **`skills/`（面向 AI 模型）$\to$ 100% 原始英文**：
  - 技能文件（`SKILL.md` 正文及 Frontmatter）必须保持与上游 **100% 完全一致的原始英文**。
  - **收益**：模型原生英文触发词匹配精度最高；上游更新时可直接单向覆盖，**零 Merge Conflict、零翻译维护负担**。
- **`commands/`（面向人类开发者）$\to$ 精准中文描述**：
  - `commands/*.md` 是本地专属编写的 OMP 斜杠命令，上游无此目录。
  - Frontmatter `description` 必须提供精炼中文，方便人类在终端敲 `/` 时进行语义辨析与参数输入。

### 3. OMP 原生命令命名空间机制（Namespacing）
- OMP 在解析插件命令时，底层会**自动为 `commands/*.md` 添加 `/<plugin>:<command>` 命名空间**。
- 插件内部命令文件名保持简练（如 `grill-with-docs.md`），杜绝双重前缀截断：
  - `plugins/matt/commands/grill-with-docs.md` $\to$ `/matt:grill-with-docs`
### 4. 技能扁平化要求（Flat Hierarchy）
- OMP 技能加载器仅扫描一级子目录（`plugins/<plugin>/skills/<skill-name>/SKILL.md`）。
- 若上游存在嵌套子分类（如 `skills/engineering/tdd/`），收纳时**必须拍平提取**为 `skills/tdd/`。

### 5. 极简零运行时哲学（YAGNI）
- 除非涉及会话级状态机、状态栏指示灯或输入拦截，否则**绝不创建冗余的 `extensions/index.ts`**。
- 纯 Prompt/Markdown 工作流套件保持零 TS 运行时，消除多余编译开销。

---

## 三、 新增外部插件标准 SOP（五步闭环法）

当需要将新的外部开源 Agent 项目引入本仓库时，必须严格执行以下流程：

### 第一步：配置本地上游镜像
在 `scripts/sync-upstream.sh` 和 `scripts/sync-upstream.ps1` 的仓库列表中追加新源（上游必须发布 SemVer 标签的 GitHub Release，镜像与插件版本均以最新 Release 为准），运行脚本拉取：
```bash
./scripts/sync-upstream.sh  # 或 ./scripts/sync-upstream.ps1
```

### 第二步：配置收纳规则并搭建目录
在 `scripts/absorb.mjs` 的 `RULES` 中声明该插件收录哪些上游技能目录与根文件、基线如何描述，并在 `plugins/<plugin-name>/` 下手写本地适配文件：
```text
plugins/<plugin-name>/
├── skills/                  # 由 absorb.mjs 生成，勿手改（保持纯英文，含私有参考文档）
├── commands/                # 针对模型不可见的技能编写中文斜杠命令映射
├── package.json             # 声明包名、版本号与 keywords
└── README.md                # 记录项目定位、适配决策与运行依赖
```
在两张版本表中各加一行（`| **\`<plugin-name>\`** | ...`），完成第四步注册后运行 `node scripts/absorb.mjs <plugin-name>` 生成 `skills/`。

### 第三步：编写面向人类的 Slash Commands
针对上游配置了 `disable-model-invocation: true` 或需要人类主动发起的技能，在 `commands/` 下编写简练的 `<action>.md` 命令文件（OMP 会自动拼装为 `/<plugin>:<action>`）：
```markdown
---
description: 中文功能概述与参数提示
---
Read skill://<skill-name> and execute workflow: $ARGUMENTS
```

### 第四步：注册市场源
在根目录 `.omp-plugin/marketplace.json` 的 `plugins` 列表中追加该插件声明。`version` 必须与 `package.json` 一致（`check` 校验），`omp plugin upgrade` 与 `marketplace.autoUpdate` 据此识别新版本：
```json
{
  "name": "<plugin-name>",
  "description": "插件中文说明",
  "source": "./plugins/<plugin-name>",
  "version": "1.0.0",
  "category": "productivity | engineering | architecture"
}
```

### 第五步：双平台质量校验
提交前必须确保通过双平台校验脚本，严禁破坏性变更：
```bash
# Bash 校验
bash scripts/check.sh

# PowerShell 校验
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/check.ps1
```
