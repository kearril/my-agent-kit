# Plugins

成套插件与外部集成项目收纳区。原生支持 Oh My Pi (omp) 扩展体系。

---

## 包含插件清单

- **`caveman/`**：会话输出压缩与极简提交交付套件（削减 65% 输出 Token，50 字符意图提交）。
- **`ponytail/`**：防过度工程化与技术债治理套件（梯子法则硬约束、YAGNI 守门、债务台账）。
- **`mattpocock-skills/`**：面向严谨工程实践的主导套件（全流程工程流、TDD、DDD、双轴代码审查与架构治理）。

---

## 目录分层架构（本地隔离方案）

- `.upstream/<project>/`：本地只读参考镜像（`.gitignore` 忽略，不推送到远端），通过 `scripts/sync-upstream.*` 维护最新代码。
- `plugins/<project>/`：本地提纯与二次开发区。只提取上游核心资产，编写 OMP 原生适配层。
---

## 新增外部插件三步走标准 SOP

当需要引入新的外部 Agent/Tool 项目时，遵循以下闭环流程：

### 第一步：配置本地上游镜像
在 `scripts/sync-upstream.ps1` 和 `scripts/sync-upstream.sh` 中追加该项目的 Git 仓库 URL，运行脚本在本地 `.upstream/<project-name>` 进行浅克隆：
```bash
./scripts/sync-upstream.ps1  # 或 ./scripts/sync-upstream.sh
```

### 第二步：本地提纯与原生适配
1. 在 `plugins/<project-name>/` 下搭建标准 OMP 插件目录结构：
   - `skills/`：挑选核心提示词与规则。
   - `commands/`：编写 `*.md` 格式的斜杠命令。
   - `extensions/index.ts`（可选）：编写状态栏与生命周期扩展。
   - `package.json`：配置 `"omp"` 与 `"pi"` 扩展清单声明。
   - `README.md`：记录项目定位、组件清单与维护铁律。

### 第三步：注册市场与纳入每日自动同步
在 `.omp-plugin/marketplace.json` 的 `plugins` 列表中追加该插件的相对路径声明。
