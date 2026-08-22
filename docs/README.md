# 项目文档导航

文档分为“入口与代理规则”和“主题文档”两层。每条规则只在一个地方维护，其他文件通过链接引用，避免 AI 和人类开发者读到互相矛盾的副本。

## 先读什么

| 任务 | 必读文档 |
| --- | --- |
| 了解项目、技术栈、计划公开地址与命令 | `README.md` |
| 修改页面、组件、依赖、测试或代码 | `AGENTS.md`、`docs/DEVELOPMENT.md` |
| 修改条目、不可变 slug、字段、标签或内容集合 | `docs/CONTENT.md` |
| 修改颜色、布局、组件状态或动效 | `docs/DESIGN.md` |
| 准备 Cloudflare Pages 首发、`kearril.com` 域名或上线检查 | `docs/DEPLOYMENT.md` |
| 查阅或更新已确认的架构方向 | `docs/adr/` 中对应 ADR |

## 权威来源矩阵

| 内容 | 权威位置 | 不应该放在哪里 |
| --- | --- | --- |
| 项目简介、计划公开地址与快速开始 | `README.md` | 不放进 AI 长规则 |
| 编码代理全局边界与任务纪律 | `AGENTS.md` | 不拆出重复的 AI 工作流文档 |
| 代码实现与质量门槛 | `docs/DEVELOPMENT.md` | 不重复写进每个页面说明 |
| 内容类型、不可变 slug、字段与标签规则 | `docs/CONTENT.md` 与 schema | 不以卡片组件中的临时对象为准 |
| 视觉和交互语言 | `docs/DESIGN.md` | 不以第三方组件库默认样式为准 |
| 已确认且长期有效的架构决定 | `docs/adr/` | 不保留一次性实施过程或页面微调历史 |
| Cloudflare Pages 首发准备与上线操作手册 | `docs/DEPLOYMENT.md` | 不只留在平台控制台或聊天记录里 |
## 更新规则

- 新增一个长期规则前，先寻找是否已有对应权威来源。
- 改变技术栈、内容模型、信息架构、设计语言或部署方式时，只在仍能解释未来取舍时新增或更新对应 ADR。
- 改变字段或 schema 时，同时更新 `docs/CONTENT.md`、schema 和相关示例。
- 改变构建、测试或运行命令时，同时更新 `README.md`、`AGENTS.md` 和 `docs/DEVELOPMENT.md` 中实际受影响的部分。
- 一次性任务说明、实施计划和交接材料不进入长期文档。
- 删除已经失效的规则，不保留历史噪音。

## 当前结构

```text
README.md
AGENTS.md
docs/
├── README.md
├── CONTENT.md
├── DEVELOPMENT.md
├── DEPLOYMENT.md
├── DESIGN.md
└── adr/
    └── 0001-*.md
```

ADR 只记录仍约束未来实现的决定；每份保持简短的背景、决定和后果。
