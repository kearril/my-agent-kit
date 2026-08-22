# Paracosm Garden

一个从零搭建的个人数字花园：收纳 Prompt、Skill、MCP、网站收藏、项目与实践记录，并通过标签、卡片和关联内容进行探索。

## 技术栈

- Astro 7：页面与静态构建
- TypeScript：开发语言
- 原生模块化 CSS：设计 token、基础规则与页面样式
- Markdown / MDX：内容编写
- Astro Content Collections：内容组织与校验
- React Islands：只为局部交互提供浏览器端状态
- pnpm：依赖管理

## 本地开发

```bash
pnpm install
pnpm dev
pnpm test
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

## 规范公开地址与部署

- 规范公开地址：`https://kearril.com`（`www.kearril.com` 永久重定向至根域名）
- 部署平台：Cloudflare Pages（连接 GitHub 公开仓库，生产分支 `main`，构建命令 `pnpm build`，输出目录 `dist`）
- 统一条目路由：`/entries/<slug>/`，所有公开条目均拥有独立的规范页面与双向关联/反向链接
- 发现与订阅：自动生成规范 `/feed.xml`、`sitemap-index.xml`（及 `sitemap-0.xml`）与 `/robots.txt`
- 公开边界：GitHub 公开仓库是公开源码与内容的唯一事实来源；未公开或草稿内容不进入公开远程分支

## 当前状态

全站静态核心、内容集合校验（带不可变 slug、三日期模型与可空 tags）、统一规范条目路由 `/entries/<slug>/`、主动关联与反向链接计算、首页各区块（Hero、About、精选、近期更新、Notes、静态回退与局部 React Explore Island）、规范 RSS 订阅源及 XML 站点地图均已完成并通过静态构建与行为测试验证。

## 维护与更新流程

1. 在 `src/content/entries/` 编写或维护 Markdown / MDX 条目，严格遵守 `docs/CONTENT.md` 的字段规范与不可变 slug 规则。
2. 运行 `pnpm test && pnpm build` 确认纯逻辑测试与静态构建全部通过。
3. 常规内容提交直接推送 `main` 分支触发 Cloudflare Pages 自动部署；涉及页面布局、样式、路由、配置或重大功能的改动，先通过分支与 Cloudflare Preview 预览验证后再合并至 `main`。
