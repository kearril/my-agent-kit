# 部署方案

## 当前决定

初始版本采用：

```text
GitHub 仓库 → GitHub Actions → pnpm build → GitHub Pages
```

网站先以纯静态站点运行，不引入服务器、数据库或后台管理系统。条目通过 Markdown / MDX 和 Content Collections 管理，更新内容后由 GitHub Actions 自动构建并发布。

## 选择理由

- 与 Astro 的静态输出天然匹配
- 初始成本低，维护面小
- 内容和代码都在 Git 中，适合个人数字花园的长期积累
- GitHub Actions 可以在推送后自动完成构建和发布
- 未来如果需要 API、登录、动态数据或更复杂的边缘能力，再迁移到 Cloudflare 或 Vercel

## 当前未启用的部分

仓库目前还没有绑定远程 GitHub 仓库，也没有最终确定仓库名、个人域名或 GitHub Pages 地址，因此暂不写入 `site`、`base` 和正式发布 workflow。这样可以避免先生成一个需要返工的地址配置。

确定远程仓库后，需要完成：

1. 在 `astro.config.mjs` 设置正式的 `site`。
2. 如果使用项目页地址，设置与仓库名一致的 `base`；如果使用用户页仓库或自定义域名，按实际地址调整。
3. 添加 GitHub Pages workflow。
4. 在 GitHub 仓库设置中启用 Pages，并将构建来源设为 GitHub Actions。
5. 推送一次后检查首页、资源路径、刷新和移动端展示。

## 本地发布前检查

```bash
pnpm install
pnpm build
pnpm preview
```

Astro 的构建产物位于 `dist/`，它是发布输出，不提交到仓库。正式部署前应确认所有内容链接、图片路径和自定义字体在静态路径下可用。

## 参考

- [Astro 部署总览](https://docs.astro.build/en/guides/deploy/)
- [Astro GitHub Pages 部署指南](https://docs.astro.build/en/guides/deploy/github/)
