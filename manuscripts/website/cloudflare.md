---
slug: cloudflare
title: "[网站收藏] Cloudflare：全球边缘网络与全栈云基础设施"
type: website
summary: 集 Anycast 权威 DNS、边缘 CDN 与 DDoS 流量清洗于一体的网络平台，并提供 Pages、Workers、R2 等全栈边缘计算与免公网出站费存储套件。
tags:
  - 基础设施
  - 边缘计算
  - 网络
  - 安全
  - 开发
source: external
links:
  - label: 官方网站
    url: https://www.cloudflare.com/
  - label: 开发者文档
    url: https://developers.cloudflare.com/
  - label: 控制台登录
    url: https://dash.cloudflare.com/
related: []
createdAt: 2026-08-27
publishedAt: 2026-08-27
updatedAt: 2026-08-28
draft: false
---

> 本条目基于 Cloudflare 官方产品文档与核心平台能力，于 **2026 年 8 月** 调研收录。

Cloudflare 是一套全球分布式边缘网络平台，整合了权威 DNS 解析、内容分发网络（CDN）、DDoS 安全防护以及无服务器边缘计算与存储服务。在网络链路中，它作为反向代理网关运行在客户端与源站服务器之间，通过地理就近的边缘节点处理请求分发、缓存响应与安全清洗。

### 域名解析与网络加速

- **权威 DNS 托管**：基于全球 Anycast 架构响应查询，解析记录修改后在全球节点秒级生效。原生支持根域名 CNAME 扁平化（CNAME Flattening）与一键开启 DNSSEC 防篡改。
- **边缘 CDN 缓存**：自动在边缘节点就近缓存 HTML、CSS、JavaScript 及多媒体文件，降低源站服务器负载并加快资源加载速度。支持通过 Cache Rules 按 URL 规则、请求标头或查询参数自定义缓存与回源策略。
- **全自动 SSL/TLS 证书**：为接入域名自动免费签发 Universal SSL 证书，并负责全自动续期与轮换，支持配置端到端加密连接。

### 网络安全与访问防护

- **DDoS 流量清洗**：在边缘集群自动吸收 SYN Flood、UDP 放大攻击与 HTTP 洪峰攻击，免费方案包含非计量基础防护。
- **Web 应用防火墙（WAF）**：内置规则拦截常见 SQL 注入、跨站脚本攻击（XSS）与恶意爬虫，支持自定义过滤表达式。
- **Turnstile 无感人机验证**：用于替代传统阻断式验证码的轻量表单防护组件，大多数情况下由浏览器静默完成遥测验证，不打断用户交互。

### 静态与全栈站点托管（Pages）

- **Git 仓库集成**：直接连接 GitHub 或 GitLab 仓库，分支代码推送后自动执行云端构建并发布至全球边缘网络。
- **资源与功能配额**：免费套餐提供无限制的请求流量与访问带宽，支持针对分支生成独立的预览环境。
- **全栈接口扩展**：支持在项目 `functions/` 目录中编写服务端接口，以统一的工程流交付前端静态页面与后端边缘 API。

### 无服务器边缘计算（Workers）

- **V8 Isolates 运行时**：代码运行在轻量隔离区（Isolates）而非传统容器中，冷启动缩减至毫秒级，内存开销极低。
- **Web 标准 API 兼容**：运行时深度对齐 `Fetch`、`Request`、`Response`、`WebCrypto` 与 `TransformStream` 等标准规范。
- **典型应用**：常用于轻量 API 编写、动态鉴权拦截、反向代理网关、HTTP 标头改写以及 A/B 测试流量调度。

### 边缘存储与数据库

- **R2 对象存储**：与 Amazon S3 API 兼容的对象存储服务，核心特性为**免收公网出站流量费用（Zero Egress Fees）**，适用于图床、软件安装包与大型静态资产托管。
- **D1 关系型数据库**：基于 SQLite 的无服务器分布式数据库，允许在 Worker 中直接执行标准 SQL 查询与事务处理。
- **Workers KV**：面向高频读取场景的全球分布式键值存储，用于保存配置字典、路由映射或会话凭据。
- **Hyperdrive**：专为加速外部传统数据库（PostgreSQL/MySQL）设计的连接池与查询缓存中间件，降低边缘函数跨地域连接中心数据库的通信延迟。

### 内网穿透与远程发布（Cloudflare Tunnel）

- **零端口暴露**：在本地开发机、NAS 或服务器上运行 `cloudflared` 守护进程，主动向 Cloudflare 建立加密出站隧道。无需公网固定 IP，也无需配置路由器端口映射即可将内网服务发布至公网。
- **访问权限控制**：可结合 Zero Trust 为暴露的内网 Web 页面、SSH 终端或远程桌面接入统一的身份验证层。
