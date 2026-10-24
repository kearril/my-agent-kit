# Coding Plugin (代码工程套件)

面向严谨软件工程全生命周期的专业开发套件。涵盖需求规格化、任务拆解、TDD 红绿循环、架构治理与双轴代码审查。

## 核心流程与命令

| 命令入口 | 对应技能 | 核心说明 |
| :--- | :--- | :--- |
| `/coding:guide` | `guide` | **研发全流程领航**：按研发阶段（方案、实现、排错、审查）推荐最佳技能路径 |
| `/coding:grill-with-docs` | `grill-with-docs` | **带架构文档沉淀的深度质询**：在质询方案的同时沉淀 `GLOSSARY.md` 与 ADR |
| `/coding:to-spec` | `to-spec` | **对话转需求规格说明书**：将已讨论的共识无采访提炼为标准 Spec |
| `/coding:to-tickets` | `to-tickets` | **Spec 拆解为原子任务卡片**：构建带明确阻塞依赖（blocking links）的任务网 |
| `/coding:wayfinder` | `wayfinder` | **大型迷雾任务路径规划**：为跨多会话的大型项目建立决策地图，逐步点亮路径 |
| `/coding:implement` | `implement` | **单 Ticket/Spec 实现**：在预设切面强制驱动 TDD，完成后自动运行代码审查 |
| `/coding:implement-spec` | `implement-spec` | **全 Spec 并发实现**：多 Agent 沿任务依赖前沿并发推进，并在集成分支统一交付 |
| `/coding:improve-codebase-architecture` | `improve...` | **代码库架构扫描与治理**：扫描浅模块与架构熵增，产出 HTML 报告并引导重构 |
| `/coding:triage` | `triage` | **缺陷与需求分流状态机**：处理外部 Issue/PR 并推进至可交付状态 |
| `/coding:pr` | `pr` | **Pull Request 描述规范**：强制提供前后对比视觉佐证、单双向门决策与影响面 |
| `/coding:retro` | `code-retro` | **工程会话复盘**：分析编程踩坑，提出针对 Linter、CI、Git 守卫与编码规范的改进 |
| `/coding:setup-matt-pocock-skills` | `setup...` | **项目初始化向导**：配置项目的 Issue Tracker 与标签词汇表 |

## 内聚模型驱动技能（Model-invoked）

- **`tdd`**：严格红 $\to$ 绿 $\to$ 重构测试驱动循环
- **`code-review`**：编码规范（Standards）与需求忠实度（Spec）双轴独立并行审查
- **`diagnosing-bugs`**：硬核 Bug 诊断反馈闭环（红测 $\to$ 假说 $\to$ 插桩 $\to$ 修复回归）
- **`codebase-design`**：深度模块设计准则（小接口，大实现）
- **`domain-modeling`**：维护业务统一语言与架构决策记录
- **`prototype`**：制作抛弃型原型快速验证逻辑与 UI
