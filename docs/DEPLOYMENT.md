# Cloudflare Pages 部署与发布手册

本文档记录已确认的部署方案、首发过程与后续发布步骤。私有 GitHub 仓库、Cloudflare Pages 项目、`kearril.com` 自定义域、HTTPS 与 `www` 永久重定向均已生效，线上站点为 `https://kearril.com`。
## 1. 架构与部署模型

```text
GitHub private repository (paracosm-garden)
                  │ push / merge to main
                  ▼
   Cloudflare Pages Git Integration
   (Node 22.12.0 + pnpm build -> dist)
                  │ automatic edge distribution
                  ▼
         https://kearril.com
         (www.kearril.com 永久重定向)
```

- **托管平台**：Cloudflare Pages 静态托管（`output: 'static'`，产物目录 `dist`）。
- **规范域名**：`https://kearril.com`。
- **发布机制**：由 Cloudflare Pages 的原生 GitHub Git 集成驱动，每次向 `main` 推送自动触发生产构建。
- **预览机制**：非 `main` 分支或 PR 自动生成独立 Cloudflare Preview 预览部署。
- **安全与边界**：不使用 GitHub Actions 部署密钥、不使用 `CNAME` 文件、不手工上传 `dist/` 目录；GitHub 私有仓库是源码与开发资料的唯一事实来源，只有 Cloudflare Pages 发布的静态产物对外公开。

## 2. 首次部署前提

首次部署前，同时满足以下条件后才执行第 4 节。

- 首批正式公开内容已替换本地演示条目。
- 已用真实内容检查首页、条目页、Explore、RSS 与 sitemap。
- 已确认所有将进入公开静态产物的内容、图片、链接与构建产物不含不愿长期公开的信息。
- 已确认首发文案、精选条目、许可证策略和公开边界。

首次部署前，只运行本地 `pnpm test && pnpm build`；不连接 Pages，也不改动 `kearril.com` 的 DNS。

## 3. 准备工作

- **源码与构建环境**：Node.js `>= 22.12.0`、pnpm `>= 9`、Astro `>= 7`。
- **域名管理**：`kearril.com` 的 DNS 解析由 Cloudflare 管理。
- **本地质量确认**：提交前确保本地通过测试与静态构建：
  ```bash
  pnpm test && pnpm build
  ```

## 4. 正式上线步骤

### 第一步：创建并推送 GitHub 私有仓库

1. 在 GitHub 上创建名为 `paracosm-garden` 的私有仓库（Private Repository）。
2. 将本地默认主分支设为 `main`。
3. 添加远程仓库地址并推送源码：
   ```bash
   git remote add origin git@github.com:<username>/paracosm-garden.git
   git branch -M main
   git push -u origin main
   ```

### 第二步：在 Cloudflare Pages 创建项目

1. 登录 Cloudflare Dashboard，进入 **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**。
2. 选择授权的 GitHub 账号并选择 `paracosm-garden` 仓库。
3. 配置构建设置：
   - **Project Name**：`paracosm-garden`
   - **Production branch**：`main`
   - **Framework preset**：`Astro`（或 `None`）
   - **Build command**：`pnpm build`
   - **Build output directory**：`dist`
   - **Environment variables**：添加环境变量 `NODE_VERSION`，值设为 `22.12.0`。
4. 点击 **Save and Deploy**，等待首次生产构建完成。

### 第三步：配置自定义域名与重定向

1. 进入 Pages 项目设置中的 **Custom domains** 选项卡。
2. 点击 **Set up a custom domain**，输入根域名 `kearril.com`。
3. 允许 Cloudflare 自动创建/更新对应的 DNS 记录（CNAME/Apex 记录指向 Pages）。
4. 再次点击 **Set up a custom domain**，添加 `www.kearril.com`。
5. 在 Cloudflare 的 **Bulk Redirects** 中，配置 `www.kearril.com` 永久重定向（301）至 `https://kearril.com`，并保留路径与查询参数，确保全站唯一规范入口。

### 第四步：等待域名解析与 HTTPS 证书签发

1. 等待 Cloudflare 完成域名所有权验证与 SSL/TLS 证书签发（状态变为 Active / Success）。
2. **严禁使用通配符 DNS（Wildcard DNS `*.kearril.com`）** 指向此静态站点，避免未分配子域名被错误解析或污染缓存。

### 第五步：线上验收与冒烟检查清单（Post-Deployment Checklist）

在生产域名生效后，按序验证以下 8 项关键契约：

- [ ] **Git 自动化集成**：向 `main` 推送提交能够自动触发生产构建；分支推送能够生成 Preview URL。
- [ ] **生产构建成功**：Cloudflare 构建日志中无错误，`dist` 静态产物正常输出。
- [ ] **根域名访问**：访问 `https://kearril.com` 正常加载首页（包含 Hero、About、精选、更新、Notes 与 Explore 区块）。
- [ ] **www 重定向**：访问 `http://www.kearril.com` 与 `https://www.kearril.com` 均自动 301/308 重定向到 `https://kearril.com`。
- [ ] **规范条目路由**：任意条目页面访问路径形如 `https://kearril.com/entries/<slug>/`，主动关联与反向链接正常渲染。
- [ ] **RSS 订阅源**：访问 `https://kearril.com/feed.xml` 返回合法的 XML 格式且包含公开条目。
- [ ] **Robots 规则**：访问 `https://kearril.com/robots.txt` 规则正确并指向 `https://kearril.com/sitemap-index.xml`。
- [ ] **Sitemap 站点地图**：访问 `https://kearril.com/sitemap-index.xml`（及 `sitemap-0.xml`）正确收录所有公开条目路由，且无草稿泄露。

## 5. 日常维护与发布流

| 变更类型 | 推荐流程 | 质量验证门槛 |
| --- | --- | --- |
| **常规条目编写与内容修订** | 在 `src/content/entries/<type>/` 修改，确认 slug 与 frontmatter 合法后直接 push `main` | 本地 `pnpm test && pnpm build` |
| **页面布局、样式、组件或路由调整** | 创建 feature 分支，提 PR | 本地测试 + Cloudflare Preview 移动端/桌面端检查无误后合并 |
| **依赖升级或全局架构配置** | 分支开发，更新 lockfile | `pnpm install`、`pnpm test && pnpm build`、Preview 冒烟检查 |

## 6. 故障排查与恢复

- **构建失败**：在 Cloudflare Pages 控制台查看 Build Log，常见原因为 Node 版本未达标、Markdown Frontmatter 缺少必填字段（如 `slug`、`publishedAt`）或 `related` 引用了不存在的 slug。本地先运行 `pnpm test && pnpm build` 复现并修复。
- **域名未生效**：检查 Cloudflare DNS 记录是否为 Proxied 状态，确认 SSL/TLS 加密模式为 Full 或 Strict。
- **草稿防泄露**：确保 `draft: true` 的条目没有设置 `publishedAt`；未确认公开的信息不得写入公开条目的正文或 Frontmatter、`public/` 资产，或任何会进入 feed / sitemap 的生成数据。
