# Paracosm Garden

一个从零搭建的个人数字花园：收纳 Prompt、Skill、MCP、网站收藏、项目与实践记录，并通过标签、卡片和关联内容进行探索。

## 技术栈

- Astro 7：页面与静态构建
- TypeScript：开发语言
- Tailwind CSS 4：样式系统
- Markdown / MDX：内容编写
- Astro Content Collections：内容组织与校验
- React Islands：只为局部交互提供浏览器端状态
- pnpm：依赖管理

## 本地开发

```bash
pnpm install
pnpm dev
pnpm build
pnpm preview
```

## 项目文档

- [文档导航](./docs/README.md)
- [AI 辅助开发工作流](./docs/AI-WORKFLOW.md)
- [开发文档纪律](./docs/DEVELOPMENT.md)
- [设计规范](./docs/DESIGN.md)
- [部署方案](./docs/DEPLOYMENT.md)
- [内容模型](./docs/CONTENT.md)
- [决策记录](./docs/DECISIONS.md)

## 当前状态

基础工程已初始化，Astro、React、MDX 和 Tailwind 已接入。当前首页是用于验证构建链路的占位页面，内容集合、卡片详情弹窗、筛选和“加载更多”将在内容模型确认后实现。
