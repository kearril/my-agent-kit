# ADR-0004: Cloudflare Pages 首发策略

- 状态：Accepted
- 日期：2026-08-23

## Context

项目拥有 `kearril.com`，但当前仍在真实内容准备与首发校验阶段。

## Decision

正式上线时使用 Cloudflare Pages 从 GitHub 私有仓库静态构建，规范域名为 `https://kearril.com`，`www` 重定向到根域名。源码、内容与开发资料保留在私有仓库中，只有静态站点对外公开。当前不创建私有仓库、Pages 项目或 DNS 绑定。

## Consequences

本地构建不产生公开副作用。首批真实内容、公开边界和首发文案确认后，才执行部署手册。
