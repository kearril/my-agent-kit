# Plugins 架构与收纳维护白皮书

成套插件与外部集成项目的原生适配开发区，专为 **Oh My Pi (omp)** 扩展生态设计。

---

## 一、 包含插件清单与上游精确对齐基线

所有插件均从对应开源上游的特定不可变 Commit 抽离提纯，本地初始版本统一由 `1.0.0` 起步递增：

| 本地插件 | 本地版本 | 上游仓库 URL | 上游精确基线 (Commit / 日期) | 核心提纯与裁剪裁决备忘 |
|---|---|---|---|---|
| **`caveman`** | `v1.0.3` | `https://github.com/JuliusBrussee/caveman.git` | `15581d1` *(2026-09-07)* | 剥离 Go 本地代理与二进制；审查排错与重构规程裁归 Matt；保留 4 技能 + 压缩引擎 + `/caveman:commit`。 |
| **`ponytail`** | `v1.0.2` | `https://github.com/DietrichGebert/ponytail.git` | `356918e` *(2026-09-07)* | 剥离测试假数据与 IDE 配置；过度设计审查与全库巡检裁归 Matt；保留 2 技能 + 梯子引擎 + `/ponytail:debt`。 |
| **`matt`** | `v1.0.1` | `https://github.com/mattpocock/skills.git` | `3cca18b` *(2026-09-04, 对应官方 release 1.2.3)* | 扁平化收纳 25 个生产级技能；排除未成熟/实验性项；提供 14 个 OMP 原生 `/matt:<command>` 中文命令。 |
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
- 插件内部命令文件名保持简练（如 `commit.md`, `debt.md`, `grill-with-docs.md`），杜绝双重前缀截断：
  - `plugins/caveman/commands/commit.md` $\to$ `/caveman:commit`
  - `plugins/ponytail/commands/debt.md` $\to$ `/ponytail:debt`
  - `plugins/matt/commands/grill-with-docs.md` $\to$ `/matt:grill-with-docs`
### 4. 技能扁平化要求（Flat Hierarchy）
- OMP 技能加载器仅扫描一级子目录（`plugins/<plugin>/skills/<skill-name>/SKILL.md`）。
- 若上游存在嵌套子分类（如 `skills/engineering/tdd/`），收纳时**必须拍平提取**为 `skills/tdd/`。

### 5. 极简零运行时哲学（YAGNI）
- 遵循 Ponytail 梯子法则：除非涉及会话级状态机、状态栏指示灯或输入拦截（如 `caveman`, `ponytail`），否则**绝不创建冗余的 `extensions/index.ts`**。
- 纯 Prompt/Markdown 工作流套件保持零 TS 运行时，消除多余编译开销。

---

## 三、 新增外部插件标准 SOP（五步闭环法）

当需要将新的外部开源 Agent 项目引入本仓库时，必须严格执行以下流程：

### 第一步：配置本地上游镜像
在 `scripts/sync-upstream.sh` 和 `scripts/sync-upstream.ps1` 的仓库列表中追加新源，运行脚本进行浅克隆：
```bash
./scripts/sync-upstream.sh  # 或 ./scripts/sync-upstream.ps1
```

### 第二步：搭建标准目录与平铺提纯
在 `plugins/<plugin-name>/` 下创建标准目录结构：
```text
plugins/<plugin-name>/
├── skills/                  # 平铺拷贝上游认证技能（保持纯英文，含私有参考文档）
├── commands/                # 针对模型不可见的技能编写中文斜杠命令映射
├── package.json             # 声明包名、版本号与 keywords
└── README.md                # 记录项目定位、组件清单与维护铁律
```

### 第三步：编写面向人类的 Slash Commands
针对上游配置了 `disable-model-invocation: true` 或需要人类主动发起的技能，在 `commands/` 下编写简练的 `<action>.md` 命令文件（OMP 会自动拼装为 `/<plugin>:<action>`）：
```markdown
---
description: 中文功能概述与参数提示
---
Read skill://<skill-name> and execute workflow: $ARGUMENTS
```

### 第四步：注册市场源
在根目录 `.omp-plugin/marketplace.json` 的 `plugins` 列表中追加该插件声明：
```json
{
  "name": "<plugin-name>",
  "description": "插件中文说明",
  "source": "./plugins/<plugin-name>",
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
