# Paracosm Garden (Manuscripts)

个人知识库与手稿收纳库。收纳个人 Prompt、Skill、项目记录、网站收藏、Note 与思维模型。

> **项目状态变更说明**：  
> 原 Astro 静态网站项目已撤销并封存。全部网站源码、组件、样式、构建配置及测试历史已归档至 Git 分支 `archive/website-final` 与 Tag `v1.0-website-sunset`。当前主分支仅保留核心手稿资产与元数据参考规范。

## 目录结构

```text
manuscripts/
├── note/        # 深度笔记与速查手册（如 Oh My Pi 手册）
├── project/     # 关注或维护的项目记录（oh-my-pi, spec-kit, powertoys 等）
├── prompt/      # 提示词与决策工作流（如 strategy-plan-confidence-loop）
├── skill/       # Agent Skill 与工具链
├── website/     # 实用网站与资源收藏
├── assets/      # 手稿关联媒体与图片资产（如个人印章）
└── guides/      # 条目 Frontmatter 规范与写作参考手册
```

## 手稿格式

所有手稿采用标准 Markdown 格式，头部保留结构化 YAML Frontmatter（包含 `title`、`tags`、`category`、`summary`、`related` 等属性），与 Obsidian、Logseq 或其它 Markdown 知识管理工具完全兼容。

## 归档历史检索

如需查阅原网站前端工程代码：

```bash
git checkout archive/website-final
# 或
git checkout v1.0-website-sunset
```
