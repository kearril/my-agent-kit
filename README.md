# My Agent Kit

[![CI](https://github.com/kearril/my-agent-kit/actions/workflows/ci.yml/badge.svg)](https://github.com/kearril/my-agent-kit/actions/workflows/ci.yml)

个人收集整理的面向 **Oh My Pi (omp)** 的 Agent 插件市场与工程能力套件。

---

## 插件市场与安装 (Plugins Marketplace)

添加本仓库为市场源，按需安装成套插件：

```bash
# 1. 添加插件市场源
omp marketplace add kearril/my-agent-kit

# 2. 按需安装插件套件
omp plugin install caveman@my-agent-kit
omp plugin install ponytail@my-agent-kit
omp plugin install matt@my-agent-kit

# 3. 以后更新插件
omp plugin upgrade caveman@my-agent-kit
omp plugin upgrade ponytail@my-agent-kit
omp plugin upgrade matt@my-agent-kit
```

---

## 收录插件清单 (Plugins Catalog)

本仓库持续收录与提纯面向高质量工程实践的 Agent 插件：

1. **[`matt`](./plugins/matt/)（工程纪律与全流程交付）**：
   - 全流程驱动从需求澄清到规范工单再到实现落地。
   - 内置 14 个 `/matt:*` 交互指令与 25 项原版权威技能（TDD 红绿循环、六步排错、双轴代码审查、深模块架构词典）。
   - 📖 详细指南：[Matt Pocock 命令速查与全景资产手册](./docs/skill-Matt-Pocock工程技能.md)。
2. **[`ponytail`](./plugins/ponytail/)（极简架构底线与防膨胀守门）**：
   - 贯彻“梯子法则”：YAGNI → 标库优先 → 原生优先 → 单行解决。
   - 动态拦截未经审视的三方依赖与推测性抽象，提供 `/ponytail:debt` 技术债台账。
   - 📖 详细指南：[Ponytail 插件规范与说明](./plugins/ponytail/README.md)。
3. **[`caveman`](./plugins/caveman/)（输出压缩与极简交付收尾）**：
   - 砍掉 65% 无效寒暄与套话自白，保持 100% 技术精度，大幅降低 Token 消耗。
   - 专职接管最后一步 50 字符极简提交（`/caveman:commit`）、验证即停止损规程与生产级数据安全迁移保障。
   - 📖 详细指南：[Caveman 插件规范与说明](./plugins/caveman/README.md)。

> 💡 **实战推荐**：关于三大插件如何组合为端到端严谨闭环的开发流水线，详见 [三剑客实战工程交付深度指南](./docs/skill-Matt-Pocock工程技能.md#五-端到端推荐交付流水线三剑客实战联合)。

---

## 目录结构

```text
.
├── AGENTS.md               # Agent 行为准则与仓库宪法
├── README.md               # 用户安装与全局命令速查手册
├── .omp-plugin/
│   └── marketplace.json    # OMP 插件市场清单定义
├── plugins/                # 成套提纯插件（原生 OMP 支持）
│   ├── caveman/            # 会话输出压缩与极简提交交付套件
│   ├── ponytail/           # 防过度工程化与技术债治理套件
│   ├── matt/               # 严谨工程实践与全流程交付套件
│   └── README.md           # 插件架构设计与 5 步接入 SOP
├── skills/                 # 独立单体原子技能收纳区
│   └── README.md           # 原子技能说明与独立安装指南
├── scripts/                # 自动化维护与校验脚本
│   ├── check.sh / .ps1     # 双平台语法、类型与市场合法性校验
│   └── sync-upstream.sh / .ps1 # 上游只读镜像一键同步
└── docs/                   # 实践笔记与研究手稿
```

---

## 📚 文档导航 (Documentation)

- **[Plugins 架构与维护白皮书](./plugins/README.md)**：成套插件收纳规范、上游精确 Commit 基线表与 5 步接入 SOP。
- **[Skills 原子技能区](./skills/README.md)**：单一职责原子技能收纳边界与安装指南。
- **[实践笔记与研究手稿](./docs/)**：外部 Agent 生态、OMP 原生机制与规范驱动开发调研笔记。

---

## 🙏 致谢与上游项目 (Acknowledgments)

- **[mattpocock/skills](https://github.com/mattpocock/skills)** by [@mattpocock](https://github.com/mattpocock)
- **[DietrichGebert/ponytail](https://github.com/DietrichGebert/ponytail)** by [@DietrichGebert](https://github.com/DietrichGebert)
- **[JuliusBrussee/caveman](https://github.com/JuliusBrussee/caveman)** by [@JuliusBrussee](https://github.com/JuliusBrussee)
- **[Oh My Pi (omp)](https://github.com/canisminor1990/oh-my-pi)**

---

## 📄 开源许可 (License)

本项目采用 [MIT License](./LICENSE) 协议开源。
