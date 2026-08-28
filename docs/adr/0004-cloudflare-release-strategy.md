# ADR-0004: Cloudflare Pages 首发策略

- 状态：Accepted
- 日期：2026-08-23

## Context

项目拥有 `kearril.com`，首发站点已通过 Cloudflare Pages 上线。

## Decision

使用 Cloudflare Pages 从 GitHub 私有仓库静态构建，规范域名为 `https://kearril.com`，`www` 永久重定向到根域名。源码、内容与开发资料保留在私有仓库中，只有静态站点对外公开。私有仓库、Pages 项目、DNS 绑定与 HTTPS 均已完成配置。

## Consequences

本地构建不产生公开副作用；向 `main` 推送经验证的变更触发生产构建，分支变更在合并前通过 Cloudflare Preview 验收。
