# Plugins

成套插件与外部集成项目收纳区。原生支持 Oh My Pi (omp) 扩展体系。

---

## 包含插件清单

- **`caveman/`**：极简通信与工程规范套件（削减 65% 输出 Token，零废话）。
- **`ponytail/`**：防过度工程化架构规范（贯彻梯子法则、YAGNI、单行优先）。
- **`upstream/`**：只读 Subtree 镜像区（保持上游纯净，支持每日自动化拉取同步）。

---

## 目录分层架构（方案 A - 隔离改造）

- `upstream/<project>/`：Subtree 镜像区，**严格只读**，保持上游完整代码与最新 commit，随时 pull。
- `<project>/`：本地提纯与二次开发区。只提取上游核心资产，剔除无效依赖和多余工具链，编写 OMP 原生适配层。

---

## 新增外部插件三步走标准 SOP

当需要引入第 3 个外部 Agent/Tool 项目时，遵循以下闭环流程：

### 第一步：引入上游镜像（使用 --squash 避免主库历史膨胀）
```bash
git subtree add --prefix=plugins/upstream/<project-name> <git-url> <branch> --squash
```

### 第二步：本地提纯与原生适配
1. 在 `plugins/<project-name>/` 下搭建标准 OMP 插件目录结构：
   - `skills/`：挑选核心提示词与规则。
   - `commands/`：编写 `*.md` 格式的斜杠命令。
   - `extensions/index.ts`（可选）：编写状态栏与生命周期扩展。
   - `package.json`：配置 `"omp"` 与 `"pi"` 扩展清单声明。
   - `README.md`：记录项目定位、组件清单与维护铁律。

### 第三步：注册市场与纳入每日自动同步
1. 在 `.omp-plugin/marketplace.json` 的 `plugins` 列表中追加该插件的相对路径声明。
2. 在 `.github/workflows/sync-upstream.yml` 中追加该项目的 `sync_subtree` 调用，纳入每日自动同步流水线。
