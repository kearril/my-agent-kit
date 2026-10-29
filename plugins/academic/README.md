# Academic Plugin (学术科研套件)

面向学术研究、文献库管理与科研论文写作的专业套件。深度集成本地 **Zotero** 桌面端，实现文献秒级检索、PDF 研读、高亮笔记提取、自动打标归档与格式化引文导出。

---

## 一、 前置条件与隐私设计

* **前置条件**：确保本地已启动 **Zotero Desktop**（默认监听官方本地 API `http://127.0.0.1:23119/api/`）。
* **纯本地隐私保护**：所有操作均通过标准 Python 脚本直连本地端口，学术文献与阅读笔记不出本地，无需配置任何第三方云端 Token。
* **零额外运行依赖**：全套脚本基于 Python 3 标准库（`urllib`、`json`、`sqlite3` 等）编写，无需执行任何 `pip install`。

---

## 二、 核心命令与技能清单

| 命令入口 | 对应技能 | 核心定位与说明 |
| :--- | :--- | :--- |
| **`/academic:zotero`** | `zotero` | **Zotero 本地文献库全能管家**：支持文献检索、条目详情查看、PDF 关键页研读、划线高亮提取、安全打标归档与 BibTeX/APA 引文导出 |

---

## 三、 核心工作流与规范

1. **两阶段安全写入（Plan $\to$ Confirm $\to$ Apply）**：
   * 任何创建/修改标签、写入阅读笔记、绑定条目关系的操作，Agent 必须先向用户输出结构清晰的 Plan 提案；
   * 仅在获得用户明确许可后，方可携带 `--apply` 执行写入，杜绝误操作。
2. **桌面端一键直达深链接**：
   * 凡是汇报或讨论涉及的文献，Agent 均会主动提供可直接点击跳转至本地 Zotero 的深链接：
     * 条目直达：`zotero://select/library/items/<item_key>`
     * PDF 页码直达：`zotero://open-pdf/library/items/<attachment_key>?page=<page>`
3. **Token 紧凑优化**：
   * 默认以学术核心关键字段（Title, Authors, Year, Abstract, Key）精简返回，最大化节约大模型的上下文预算。
