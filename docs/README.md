# 项目文档导航

文档分为“入口与代理规则”和“主题文档”两层。每条规则只在一个地方维护，其他文件通过链接引用，避免 AI 和人类开发者读到互相矛盾的副本。

## 先读什么

| 任务 | 必读文档 |
| --- | --- |
| 了解项目、安装和命令 | `README.md` |
| 让 AI 开始一个非平凡任务 | `AGENTS.md`、`docs/AI-WORKFLOW.md` |
| 修改页面、组件、依赖或代码 | `AGENTS.md`、`docs/DEVELOPMENT.md` |
| 修改条目、字段、标签或内容集合 | `docs/CONTENT.md` |
| 修改颜色、布局、组件状态或动效 | `docs/DESIGN.md` |
| 修改部署、域名或构建发布 | `docs/DEPLOYMENT.md` |
| 重新讨论已确认的方向 | `docs/DECISIONS.md` |

## 权威来源矩阵

| 内容 | 权威位置 | 不应该放在哪里 |
| --- | --- | --- |
| 项目简介和快速开始 | `README.md` | 不放进 AI 长规则 |
| 编码代理的全局行为 | `AGENTS.md` | 不在 `CLAUDE.md` 或 Copilot 文件中复制 |
| AI 协作流程和验收模板 | `docs/AI-WORKFLOW.md` | 不塞进每个组件文件 |
| 代码实现纪律 | `docs/DEVELOPMENT.md` | 不重复写进每个页面说明 |
| 内容类型和字段 | `docs/CONTENT.md` 与最终 schema | 不以卡片组件中的临时对象为准 |
| 视觉和交互语言 | `docs/DESIGN.md` | 不以第三方组件库默认样式为准 |
| 长期决策和取舍 | `docs/DECISIONS.md` | 不只留在聊天记录里 |
| 部署和上线清单 | `docs/DEPLOYMENT.md` | 不只写在 workflow 注释里 |

## 更新规则

- 新增一个长期规则前，先寻找是否已有对应权威来源。
- 改变技术栈、内容模型、信息架构、设计语言或部署方式时，更新 `docs/DECISIONS.md`。
- 改变字段或 schema 时，同时更新 `docs/CONTENT.md`、schema 和相关示例。
- 改变构建、测试或运行命令时，同时更新 `README.md`、`AGENTS.md` 和 `docs/DEVELOPMENT.md` 中实际受影响的部分。
- 规则如果只对某个目录适用，等该目录出现稳定边界后再添加路径专属 instruction，不提前制造层级。
- 一次性的任务说明放在任务或 issue 中，不写进全局规则；可复用的任务提示词未来放在 `.github/prompts/`，不放进 `AGENTS.md`。
- 删除已经失效的规则，不保留“历史上曾经这样做”的噪音；重要取舍留在决策记录。

## 当前结构

```text
README.md
AGENTS.md
.github/
└── copilot-instructions.md
docs/
├── README.md
├── AI-WORKFLOW.md
├── CONTENT.md
├── DECISIONS.md
├── DEPLOYMENT.md
├── DESIGN.md
└── DEVELOPMENT.md
```

当前项目规模还小，决策记录先集中在一个文件中。只有当决策数量明显增长、需要独立检索或多人并行维护时，再拆成 `docs/decisions/` 下的单独记录。
