# Ponytail Plugin for Oh My Pi (omp)

纯净提取自 [DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail) 的防过度工程化与资深极简架构规范，专为 Oh My Pi (omp) 原生适配。

---

## 项目说明

### 1. 核心定位
Ponytail 解决的核心痛点是 **AI Agent 过度工程化、滥用设计模式、堆砌单实现接口与防御性样板**。
它化身见多识广的极简老架构师，贯彻“梯子法则”（The Ladder）：
1. **必要性质疑**：任务真的需要存在吗？(YAGNI)
2. **代码库已有？**：已有相关 helper/util/type 直接复用。
3. **标准库已有？**：优先使用语言标准库 (stdlib)。
4. **原生平台能力涵盖？**：优先使用平台/环境原生基础能力 (native)。
5. **现存依赖可解？**：绝不随意新增无谓第三方依赖。
6. **能一行搞定？**：一行搞定。
7. **最后底线**：仅输出能满足测试通过的最小代码。

### 2. 纯净提纯与协同瘦身
- **剔除营销与噪音**：移除了原版硬编码测试基准假数据的 `ponytail-gain` 以及包含旧版升级说明的 `ponytail-help`。
- **剔除多余胶水层**：剔除了 10 余种第三方 IDE 配置目录（如 `.cursor/`、`.windsurf/`、`.claude-plugin/` 等）。
- **与 Matt Pocock 套件对齐瘦身**：
  - 局部代码审查（过度设计与 Fowler 坏味道）统一归入 Matt 的 `code-review`（Standards 轴），剔除 `ponytail-review`。
  - 全仓库架构巡检统一归入 Matt 的 `/improve-codebase-architecture`（深度模块扫描与可视化报告），剔除 `ponytail-audit`。
- **三大套件生态协同**：
  - **Ponytail**：底层专注**极简编码梯子法则硬拦截**与**技术债台账治理**。
  - **Caveman**：底层专注**会话输出压缩**与**极简 Git Commit 交付**。
  - **Matt Pocock's Skills**：顶层主导**全流程工程流、TDD、DDD 与双轴审查**。

---

## 包含内容

### 1. 核心技能 (`skills/`)
- `ponytail`：核心人设与梯子法则（支持 `lite`、`full`、`ultra` 三档强度），在底层拦截盲目引包与过度抽象。
- `ponytail-debt`：扫描代码库中的 `ponytail:` 注释，生成已跟踪的技术债台账，防止简化变烂尾。

### 2. OMP 斜杠命令 (`commands/`)
- `debt.md` (`/ponytail:debt`)：一键收集全库 `ponytail:` 注释至结构化台账。
### 3. OMP 原生扩展 (`extensions/index.ts`)
- 注册 `/ponytail [lite|full|ultra|off|status]` 本地命令。
- 终端状态栏显示模式指示灯（`🐴 ponytail: ⚡ FULL`）。
- 监听 `input` 事件，输入 `stop ponytail` 或 `normal mode` 自动退回关闭状态。
- 在 `before_agent_start` 动态注入梯子法则提示词约束，并利用会话分支记录实现状态跨轮次持久化。

---

## 维护规则

为确保插件长期稳定且便于吸收上游更新，必须遵循以下维护铁律：

1. **隔离修改原则**：
   - 上游镜像位于 `.upstream/ponytail/`（本地目录，不入远端库），**严格只读，禁止手动修改**。
   - 本地定制、审查边界划分与适配代码必须在 `plugins/ponytail/` 目录下进行。
2. **上游吸收流**：
   - 本地通过 `scripts/sync-upstream.*` 脚本同步上游最新提交至 `.upstream/ponytail/`。
   - 上游有规则强化或新反模式归纳时，由维护者手动比对并吸收至 `plugins/ponytail/skills/`。
3. **专注极简与债务守则**：
   - Ponytail 专职守住“极简底线”（能不写就不写、标库与原生优先），通过 `ponytail-debt` 对刻意延后的实现进行跟踪，不越界替代顶层工程流程。
   - 梯子法则与技巧规则正文（`SKILL.md`）保持纯英文，确保与上游源码一致。
   - 用户可见元数据（Frontmatter `description` 与 `commands/*.md` 描述）保持精准中文化。
