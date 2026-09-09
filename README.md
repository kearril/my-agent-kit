# My Agent Kit

个人面向 **Oh My Pi (omp)** 的 Agent 插件市场与能力集成库。

## 安装与更新 (Install & Update)

```bash
# 添加市场源
omp marketplace add kearril/my-agent-kit

# 安装插件
omp plugin install matt@my-agent-kit
omp plugin install ponytail@my-agent-kit
omp plugin install caveman@my-agent-kit

# 更新插件
omp plugin upgrade matt@my-agent-kit
omp plugin upgrade ponytail@my-agent-kit
omp plugin upgrade caveman@my-agent-kit
```

## 已收录插件 (Plugins)

| 插件 | 版本 | 核心定位 | 命令入口 |
| :--- | :--- | :--- | :--- |
| **`matt`** | `v1.0.1` | 全流程严谨工程交付（反向拷问、Spec/Ticket、TDD、代码审查） | `/matt:*` (14 项) |
| **`ponytail`** | `v1.0.2` | 防过度工程化架构守门（梯子法则、YAGNI、技术债台账） | `/ponytail`, `/ponytail:debt` |
| **`caveman`** | `v1.0.3` | 会话输出极简压缩（削减 65% Token 输出，50 字符极简提交） | `/caveman`, `/caveman:commit` |

---

## 目录索引

- `plugins/`：成套 OMP 插件源码（含 TS 扩展、命令与技能）
- `skills/`：单体原子技能独立存放区
- `docs/`：个人实践笔记与体系调研手稿

## License

[MIT License](./LICENSE)
