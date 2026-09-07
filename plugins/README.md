# Plugins

成套插件与外部引入项目收纳区。

## 目录分层（方案 A - 隔离改造）

- `upstream/<project>/`：Subtree 镜像区，**只读**，保持上游纯净，随时拉取更新。
- `<project>/`：本地改造与吸收区。从 `upstream/<project>/` 提取核心能力，去重裁剪后在此适配。

## 常用命令

### 1. 引入新上游（使用 --squash 避免提交树爆炸）
```bash
git subtree add --prefix=plugins/upstream/<project-name> <git-url> <branch> --squash
```

### 2. 拉取上游最新改动
```bash
git subtree pull --prefix=plugins/upstream/<project-name> <git-url> <branch> --squash
```
