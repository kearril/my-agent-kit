# ADR-0001: 静态渲染边界

- 状态：Accepted
- 日期：2026-08-23

## Context

数字花园以 Markdown 内容和低维护发布为主，但 Explore 需要浏览器端筛选状态。

## Decision

Astro 在构建期生成页面、Feed、sitemap 与 robots；React 仅实现 Explore Island，且必须保留无 JavaScript 的条目链接回退。

## Consequences

不引入 SSR、数据库、CMS 或运行时 API。未来动态能力必须保持为局部 Island 或独立服务，不能接管整站。
