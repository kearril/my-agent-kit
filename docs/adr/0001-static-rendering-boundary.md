# ADR-0001: 静态渲染边界

- 状态：Accepted
- 日期：2026-08-23

## Context

数字花园以 Markdown 内容和低维护发布为主；公开站点的 Explore 需要浏览器端筛选状态，而本地内容维护需要可直接写回源文件的浏览器编辑台。

## Decision

Astro 在构建期生成公开页面、Feed、sitemap 与 robots；React 在公开站点仅实现 Explore Island，且必须保留无 JavaScript 的条目链接回退。本地条目编辑台仅由 `pnpm dev` 中的 Astro Integration 提供，通过 loopback-only middleware 写入 Content Collections 源文件；它不定义公开页面路由，也不进入生产 bundle。

## Consequences

不引入 SSR、数据库、CMS 或公开运行时 API。公开动态能力必须保持为局部 Island 或独立服务，不能接管整站；本地编辑能力必须继续隔离在开发服务器与 localhost 边界内。
