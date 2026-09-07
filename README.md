# My Agent Kit

个人私有 Agent 工具箱与能力集成库。收纳、改造外部优秀 Agent/Tool 项目，并提供统一的 Skill 与 Plugin 集合。

## 目录结构

```text
.
├── skills/             # 零散原子技能（Prompt、单文件 Tool、规则等）
├── plugins/            # 成套插件与外部集成项目
│   ├── upstream/       # 上游 Subtree 镜像区（只读不改，方便吸收更新）
│   └── <project>/      # 本地改造区（裁剪与二次开发）
├── 文档/                # 原有实践笔记、手稿与参考资料（保留现状）
│   ├── notes/
│   ├── projects/
│   ├── prompts/
│   ├── skills/
│   └── websites/
└── assets/             # 关联静态媒体资源
```

## 上游集成规则（Git Subtree）

外部项目引入遵循**隔离改造**原则：

```bash
# 1. 引入新项目镜像
git subtree add --prefix=plugins/upstream/<name> <repo-url> <branch> --squash

# 2. 同步上游更新
git subtree pull --prefix=plugins/upstream/<name> <repo-url> <branch> --squash
```

本地定制与吸收代码一律在 `plugins/<name>/` 下开发，避免与上游产生合并冲突。
