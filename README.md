# My Agent Kit

个人私有 Agent 插件市场与能力集成库，专为 Oh My Pi (omp) 适配。

---

## 插件安装与接入指南

本仓库原生支持 **OMP 插件市场（Marketplace）** 与 **本地软链开发（Link）** 两种安装模式：

### 方式 A：OMP 市场源安装（推荐，跨设备与远程使用）

直接将本仓库作为 OMP 插件源添加，按需安装单个插件：

```bash
# 1. 添加本仓库作为私有插件市场
omp marketplace add kearril/my-agent-kit

# 2. 安装插件
omp plugin install caveman@my-agent-kit
omp plugin install ponytail@my-agent-kit

# 3. 以后更新插件
omp plugin upgrade caveman@my-agent-kit
omp plugin upgrade ponytail@my-agent-kit
```

### 方式 B：本地开发软链（本地实时调试）

本地代码改动实时在 OMP 中生效（无需提交或重装）：

```bash
# 挂载本地插件（适用于本地目录为 my-agent-kit）
omp plugin link "D:/MyProjects/my-agent-kit/plugins/caveman"
omp plugin link "D:/MyProjects/my-agent-kit/plugins/ponytail"

# 如需解除软链
omp plugin uninstall @my-agent-kit/caveman
omp plugin uninstall @my-agent-kit/ponytail
```

---

## 仓库结构

```text
.
├── .omp-plugin/
│   └── marketplace.json    # OMP 插件市场清单定义
├── skills/                 # 零散原子技能
│   ├── codebase-design/    # Deep Modules 与 Seam 架构设计
│   ├── grilling/           # 编码前深度质疑与探究
│   └── tdd/                # 测试驱动开发与 Red-Green 规范
├── plugins/                # 成套提纯插件（原生 OMP 支持）
│   ├── caveman/            # 极简通信与工程规范套件（削减 65% 输出 Token）
│   ├── ponytail/           # 防过度工程化架构规范（梯子法则、YAGNI）
│   └── upstream/           # 上游 Subtree 镜像（只读隔离）
│       ├── caveman/
│       └── ponytail/
├── 文档/                    # 实践笔记与参考手稿
└── assets/                 # 静态媒体资产
```

---

## 上游同步与自动化

仓库配置了自动化每日巡检 GitHub Actions（`.github/workflows/sync-upstream.yml`），自动通过 `git subtree pull --squash` 跟踪并吸收上游镜像的最新改动。
