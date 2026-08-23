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
- [开发文档纪律](./docs/DEVELOPMENT.md)
- [设计规范](./docs/DESIGN.md)
- [部署方案](./docs/DEPLOYMENT.md)
- [内容模型](./docs/CONTENT.md)
- [架构决策记录](./docs/adr/)

## 计划中的公开地址与部署

- 规范公开地址计划为 `https://kearril.com`；`www.kearril.com` 将在正式上线时永久重定向至根域名。
- 计划使用 Cloudflare Pages 连接 GitHub 公开仓库发布静态产物；当前尚未创建公开远程仓库、Pages 项目或 DNS 绑定。
- 统一条目路由为 `/entries/<slug>/`；构建会生成 `/feed.xml`、`sitemap-index.xml` 和 `/robots.txt`，但它们目前只用于本地验证。
- 公开仓库只容纳确认公开的源码与内容；未公开内容不推送。

## 当前状态

静态核心、内容集合校验、统一条目路由、关联与反向链接、Explore Island、RSS 和站点地图均已完成并通过本地验证。项目仍处于**内容准备与首发校验阶段**：没有正式公开内容，也没有线上部署。

## 当前维护流程

1. 在 `src/content/entries/<type>/` 录入首批确认公开的 Markdown / MDX 条目，遵守 `docs/CONTENT.md` 的字段、目录和不可变 slug 规则。
2. 用真实标题、摘要、标签、链接、关联关系和少量截图检查首页、条目页、Explore、RSS 与 sitemap 的信息密度和可读性。
3. 运行 `pnpm test && pnpm build`。
4. 只有首批内容、公开边界与首发文案均确认后，才按 `docs/DEPLOYMENT.md` 创建公开仓库、Cloudflare Pages 项目和域名绑定。
