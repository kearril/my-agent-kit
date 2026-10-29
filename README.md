# My Agent Kit

个人面向 **Oh My Pi (omp)** 的 Agent 插件市场与能力套件库。

采用「**通用元能力常驻 + 垂直领域插件按需挂载**」架构，面向日常讨论、科研调研、办公协同与严谨软件工程。

## 安装与使用 (Install & Usage)

```bash
# 添加市场源
omp marketplace add kearril/my-agent-kit

# 推荐全局常驻安装通用底座
omp plugin install general@my-agent-kit

# 进入代码工程项目按需安装
omp plugin install coding@my-agent-kit

# 学术科研与文献管理项目按需安装
omp plugin install academic@my-agent-kit

# 更新插件
omp plugin marketplace update my-agent-kit
omp plugin upgrade
```

## 已收录插件 (Plugins)

| 插件 | 版本 | 核心定位 | 命令入口 | 适用场景 |
| :--- | :--- | :--- | :--- | :--- |
| **`general`** | `v1.0.1` | 思维质询、白话澄清、交接、一手调研与会话复盘 | `/general:*` | 全局常驻（日常聊天、科研、调研、办公协作） |
| **`coding`** | `v1.0.1` | 需求规格化、任务拆解、TDD、架构治理与双轴代码审查 | `/coding:*` | 软件研发工程项目（按需挂载） |
| **`academic`** | `v1.0.0` | 本地 Zotero 联动、文献检索、PDF 研读、笔记提取与引文导出 | `/academic:*` | 学术文献研读与论文写作（按需挂载） |

---

## 目录索引

- `plugins/general/`：常驻通用元能力插件（9 个技能，7 个斜杠命令）
- `plugins/coding/`：专业软件工程研发插件（18 个技能，12 个斜杠命令）
- `plugins/academic/`：学术科研与文献管理插件（1 个技能，1 个斜杠命令）

## 致谢 (Acknowledgments)

- **[mattpocock/skills](https://github.com/mattpocock/skills)** by [@mattpocock](https://github.com/mattpocock)
- **[Oh My Pi (omp)](https://github.com/canisminor1990/oh-my-pi)**

## License

[MIT License](./LICENSE)
