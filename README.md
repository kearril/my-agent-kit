# My Agent Kit

个人面向 **Oh My Pi (omp)** 的 Agent 插件市场与能力集成库。

## 安装与更新 (Install & Update)

```bash
# 添加市场源
omp marketplace add kearril/my-agent-kit

# 安装插件
omp plugin install matt@my-agent-kit
omp plugin install hyperframes@my-agent-kit

# 更新插件（上游每日自动同步，见 plugins/README.md「自动更新」）
omp plugin marketplace update my-agent-kit
omp plugin upgrade

# 或让 omp 启动时自动升级
omp config set marketplace.autoUpdate auto
```

## 已收录插件 (Plugins)

| 插件 | 版本 | 核心定位 | 命令入口 |
| :--- | :--- | :--- | :--- |
| **`matt`** | `v1.3.1` | 需求澄清、TDD 与双轴代码审查 | `/matt:*` |
| **`hyperframes`** | `v0.8.163` | HTML 编写合成、渲染视频 | `/hyperframes:hyperframes` |

---

## 目录索引

- `plugins/`：成套 OMP 插件源码（命令与技能）
- `skills/`：单体原子技能独立存放区
- `docs/`：个人实践笔记与体系调研手稿

## 致谢 (Acknowledgments)

- **[mattpocock/skills](https://github.com/mattpocock/skills)** by [@mattpocock](https://github.com/mattpocock)
- **[heygen-com/hyperframes](https://github.com/heygen-com/hyperframes)** by [HeyGen](https://github.com/heygen-com)
- **[Oh My Pi (omp)](https://github.com/canisminor1990/oh-my-pi)**

## License

[MIT License](./LICENSE)
