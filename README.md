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

## 当前状态

首页与独立 Note 文章页的静态框架已建立，并可通过本地演示条目验证精选、近期更新与 Notes 展示。Content Collections 已支持扁平条目、精选排序和 Note 主分类；真实个人内容尚未入库。搜索、筛选、加载更多与条目弹窗等需要浏览器状态的功能，将在第一批真实内容准备后以 React Island 实现。

## 下一阶段

1. 在 `src/content/entries/` 录入第一批正式内容：建议先准备 6 个精选条目与 3 篇 Note；本地 `*.local.md` 演示条目已被 Git 忽略，不能替代正式内容。
2. 用真实内容校验标题长度、标签、Note 分类、卡片信息密度和关联条目是否足够；字段变化以 `docs/CONTENT.md` 与 `src/content.config.ts` 为准同步修改。
3. 内容模型稳定后，实现首页 Explore React Island：搜索、类型与标签筛选、加载更多和条目详情弹窗。
4. 确定远程仓库名、GitHub Pages 地址与许可证后，再按 `docs/DEPLOYMENT.md` 配置部署。
