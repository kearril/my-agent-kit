# Paracosm Garden：AI 开发指令

这份文件是仓库级编码代理规则的唯一权威入口。它只保留所有任务都需要知道的内容；具体主题规则放在 `docs/` 中，修改规则时不要在多个文件复制同一段文本。

## 项目地图

- 这是一个使用 Astro 构建的个人数字花园，内容包括 Prompt、Skill、MCP、网站收藏和项目。
- 页面以 Astro 静态输出为主，Markdown / MDX 与 Content Collections 是内容来源。
- React 只用于需要浏览器状态、事件或浏览器 API 的局部 Island。
- 当前首页仍是基础占位页，正式内容集合、卡片、筛选和弹窗尚未实现。

## 开始任务前

1. 先阅读 `README.md` 和本文件。
2. 只读取与任务相关的文档：
   - 任务涉及 AI 协作流程：`docs/AI-WORKFLOW.md`
   - 任务涉及代码、依赖或验证：`docs/DEVELOPMENT.md`
   - 任务涉及条目或 schema：`docs/CONTENT.md`
   - 任务涉及视觉或交互：`docs/DESIGN.md`
   - 任务涉及部署：`docs/DEPLOYMENT.md`
   - 任务涉及已确认方向：`docs/DECISIONS.md`
3. 非平凡任务先说明计划、范围、验收条件和需要确认的假设，再修改文件。
4. 修改前读取目标文件及其直接依赖，不凭文件名猜测实现。

## 常用命令

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

需要后台启动时可以使用 `astro dev --background`，并用 `astro dev stop`、`astro dev status` 和 `astro dev logs` 管理；普通开发优先使用 `pnpm dev`。

## 不可违反的规则

- 只改与当前目标直接相关的文件，不顺手重构无关代码。
- 使用 pnpm；新增依赖前先确认现有能力不能满足需求，并说明理由。
- Astro 负责页面和静态内容，React Island 只负责局部交互，不把整个网站改成客户端 React 应用。
- Content Collections 是条目数据的唯一事实来源，组件中不维护重复数据。
- 视觉实现必须遵守 `docs/DESIGN.md`：无圆角、纯黑粗边框、硬边阴影、无渐变、无模糊阴影、旋转不超过 3 度。
- 不提交密钥、个人隐私、`node_modules`、`dist` 或本地环境文件。
- 不执行可能丢失工作或覆盖历史的操作，除非用户明确确认目标和影响。
- 不把未运行的命令、未检查的链接或未验证的行为描述为已完成。

## 工作闭环

1. 理解：确认目标、范围、约束和完成条件。
2. 调查：读取相关代码和文档，记录事实、假设与冲突。
3. 计划：列出最小可行改动及每一步的验证方式。
4. 实现：保持改动小而集中，沿用已有模式。
5. 验证：按风险运行命令，并检查没有引入无关变化。
6. 汇报：说明改了什么、验证了什么、还存在哪些开放问题。

## 变更后的最低验证

- 文档或样式规则：`git diff --check`。
- 页面、组件、内容或 schema：`pnpm build`。
- 依赖或配置：`pnpm install` 后运行 `pnpm build`。
- 交互改动：在桌面和移动端检查键盘焦点、Esc、滚动、空状态和 reduced-motion。

## 权威文档

完整文档导航见 `docs/README.md`。如果规则之间冲突，优先级为：用户当前明确要求、`AGENTS.md` 的安全与范围规则、对应主题文档、一般实现偏好。发现重复或过时规则时，修正权威来源，不新增第三份副本。
