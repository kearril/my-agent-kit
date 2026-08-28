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

## 公开地址与部署

- 规范公开地址为 `https://kearril.com`；`www.kearril.com` 永久重定向至根域名。
- Cloudflare Pages 连接 GitHub 私有仓库发布静态产物；`kearril.com`、HTTPS 与 `www` 重定向均已生效。
- 统一条目路由为 `/entries/<slug>/`；构建生成的 `/feed.xml`、`sitemap-index.xml` 和 `/robots.txt` 是线上发现入口。
- 私有仓库存放源码、内容与开发资料；只有经 Cloudflare Pages 发布的静态产物对外公开。

## 当前状态

静态核心、内容集合校验、统一条目路由、关联与反向链接、Explore Island、本地条目编辑台、RSS 和站点地图均已完成。首发版本已部署至 `https://kearril.com`，后续按既定发布流程持续维护。

## 当前维护流程

1. 在 `src/content/entries/<type>/` 录入首批确认公开的 Markdown / MDX 条目，遵守 `docs/CONTENT.md` 的字段、目录和不可变 slug 规则；本地开发时也可通过 `pnpm dev` 输出的编辑台地址在浏览器中创建或编辑条目。
2. 用真实标题、摘要、标签、链接、关联关系和少量截图检查首页、条目页、Explore、RSS 与 sitemap 的信息密度和可读性。
3. 运行 `pnpm test && pnpm build`。
4. 内容更新在本地完成验证后推送 `main`；页面、组件、路由或全局配置变更先通过分支 Preview 验收，再合并发布。
