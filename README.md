# My Agent Kit

[![CI](https://github.com/kearril/my-agent-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/kearril/my-agent-kit/actions/workflows/ci.yml)

个人私有 Agent 插件市场与工程能力套件，专为 **Oh My Pi (omp)** 深度适配。

---

## 插件套件安装（Plugins）

直接添加本仓库作为私有插件市场源，一键远程安装与更新成套插件：

```bash
# 1. 添加本仓库作为私有插件市场
omp marketplace add kearril/my-agent-kit

# 2. 按需安装插件套件
omp plugin install caveman@my-agent-kit
omp plugin install ponytail@my-agent-kit
omp plugin install mattpocock-skills@my-agent-kit

# 3. 以后更新插件
omp plugin upgrade caveman@my-agent-kit
omp plugin upgrade ponytail@my-agent-kit
omp plugin upgrade mattpocock-skills@my-agent-kit
```
---

## 三大插件黄金协同流 (The Golden Loop)

本仓库将三大插件组合为一套**无死角、零废话的工程闭环流水线**：

```text
① /matt-grill-with-docs ──► 动工前反向拷问，沉淀 CONTEXT.md（统一词典）与 ADR
       │
② /matt-to-spec          ──► 对话共识一键整理为正式需求规范 (Spec)
       │
③ /matt-to-tickets       ──► 切解为带 Blocking 依赖关系的原子工单卡
       │
       ▼  【建议此时 /clear 或开新会话，保持上下文纯净】
④ /matt-implement        ──► 读取工单驱动实现（底层自动走 tdd 红绿测试）
   + 开启 /ponytail full  ──► 强制梯子法则：不盲目引三方包、标库与原生优先、极简交付
       │
⑤ 底层自动 code-review    ──► 提交前双轴审查（规范基线 + 工单需求还原度）
       │
⑥ /caveman-commit        ──► 50 字符意图优先 Conventional Commits 极简落库
       │
⑦ /ponytail-debt         ──► 发布前排查一次，盘点刻意简化留下的技术债
```

---

## 全局命令速查表 (Commands Cheatsheet)

在 OMP 聊天终端中输入 `/` 即可触发自动补全。所有命令均带顶级前缀，规整分布：

| 斜杠命令 / 快捷调用 | 所属组件 | 功能与定位 |
| :--- | :--- | :--- |
| `/caveman [mode]` | `caveman` | 会话输出压缩开关（`lite` / `full` / `ultra` / `wenyan` / `off`） |
| `/caveman-commit` | `caveman` | 50 字符极简 Conventional Commits 提交信息生成（意图优先） |
| `stop caveman` | `caveman` | 自然语言快速关闭 Caveman 压缩模式 |
| `/ponytail [mode]` | `ponytail` | 极简架构梯子法则开关（`lite` / `full` / `ultra` / `off`） |
| `/ponytail-debt` | `ponytail` | 扫描代码库中的 `ponytail:` 注释并生成技术债台账 |
| `stop ponytail` | `ponytail` | 自然语言快速关闭 Ponytail 极简模式 |
| `/matt-ask-matt` | `mattpocock-skills` | 技能路由器与流程导航（根据现状推荐最适工程路线） |
| `/matt-grill-with-docs` | `mattpocock-skills` | 动工前反向提问澄清，实时更新 `CONTEXT.md` 统一词典与 ADR |
| `/matt-to-spec` | `mattpocock-skills` | 将讨论共识一键固化为正式不可篡改的 Spec 需求规范 |
| `/matt-to-tickets` | `mattpocock-skills` | 将 Spec 切解为垂直切片工单卡，显式标注 Blocking 依赖图 |
| `/matt-implement` | `mattpocock-skills` | 读取工单驱动实现，内嵌 TDD 红绿循环并在收工时驱动双轴审查 |
| `/matt-improve-codebase-architecture` | `mattpocock-skills` | 静态扫描模块深度（Deep Modules），输出 HTML 诊断报告 |
| `/matt-setup-matt-pocock-skills` | `mattpocock-skills` | 一次性初始化工程配置（工单系统类型、分拣标签字典等） |
| `/matt-triage` | `mattpocock-skills` | 按照状态机规则在工单系统中流转和分拣 Issue / PR |
| `/matt-wayfinder` | `mattpocock-skills` | 超大复杂工程探路：建立决策拓扑图并逐个决策推进 |
| `/matt-grill-me` | `mattpocock-skills` | 纯思路反向提问（不落盘文件，适用于无代码仓库思考） |
| `/matt-handoff` | `mattpocock-skills` | 将会话核心决策浓缩为交接文档，便于跨会话恢复上下文 |
| `/matt-teach` | `mattpocock-skills` | 以当前工作区为交互演练沙盒，跨会话分步讲解复杂概念 |
| `/matt-to-questionnaire` | `mattpocock-skills` | 将技术决策盲区转化为 Markdown 调查问卷异步收集反馈 |
| `/matt-wait-what` | `mattpocock-skills` | 紧急纠偏：结合项目 CONTEXT.md 词典与极简白话重新解释 |

---

## 插件矩阵定位 (Plugins Matrix)

三大插件正交协作，职能绝不踩踏：

1. **`mattpocock-skills`（顶层主导 · 工程纪律与交付主线）**：
   - 全流程驱动从需求澄清到规范工单再到实现落地。
   - 内置 25 项原汁原味权威技能（TDD 红绿循环、六步排错、双轴审查、深模块架构词典）。
2. **`ponytail`（底层守门 · 极简架构与防膨胀）**：
   - 贯彻“梯子法则”：YAGNI → 标库优先 → 原生优先 → 单行解决。
   - 动态拦截未经审视的三方依赖与推测性抽象，配合债务台账防止偷工减料演变为烂尾。
3. **`caveman`（底层交付 · 输出压缩与终点交付）**：
   - 砍掉 65% 无效寒暄与套话自白，保持 100% 技术精度，大幅降低 Token 消耗。
   - 专职接管最后一步 50 字符极简提交、验证即停止损规程、以及生产级数据安全迁移保障。

---

## 目录结构

```text
.
├── AGENTS.md               # Agent 行为准则与仓库宪法
├── README.md               # 用户安装与全局命令速查手册
├── .omp-plugin/
│   └── marketplace.json    # OMP 插件市场清单定义
├── plugins/                # 成套提纯插件（原生 OMP 支持）
│   ├── caveman/            # 会话输出压缩与极简提交交付套件
│   ├── ponytail/           # 防过度工程化与技术债治理套件
│   ├── mattpocock-skills/  # 严谨工程实践与全流程交付套件
│   └── README.md           # 插件架构设计与 3 步走接入 SOP
├── skills/                 # 独立单体原子技能收纳区
│   └── README.md           # 原子技能说明与独立安装指南
├── scripts/                # 自动化维护与校验脚本
│   ├── check.sh / .ps1     # 双平台语法、类型与市场合法性校验
│   └── sync-upstream.sh / .ps1 # 上游只读镜像一键同步
└── docs/                   # 实践笔记与研究手稿
```
