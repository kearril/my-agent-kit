# Skills — 独立原子技能区

个人私有单一职责 Agent 原子技能（Atomic Skills）收纳区，兼容标准 Agent Skills 规范。

---

## 架构边界说明

- **成套工程套件**（如 Matt Pocock 全套工程流、Caveman 输出压缩、Ponytail 极简架构）属于完整插件生态，请前往 **[`plugins/`](../plugins/)** 目录按套件安装。
- **本目录定位**：仅收录**单一职责、无需成套插件打包的独立原子技能**（例如特定的算法优化规则、小工具调用指引等）。

---

## 包含技能清单

*(当前全库资产均已在 `plugins/` 中成套打包收录，本目录暂无孤立原子技能)*

---

## 单个原子技能安装指南 (`npx skills`)

本目录下的原子技能原生兼容标准 Agent Skills 规范，支持按需单点精准安装：

### 1. 项目级安装（推荐，仅在当前工作项目生效）
在你的目标项目根目录下执行（仅安装至当前工作区，不污染全局）：

```bash
# 按需安装单个原子技能
npx skills add kearril/my-agent-kit --skill <skill-name>
```

### 2. 全局安装（所有项目通用）
如果希望某个原子技能在全机所有项目中通用，追加 `-g` 标志：

```bash
npx skills add kearril/my-agent-kit --skill <skill-name> -g
```

---

## 新增原子技能规范

所有新增技能必须遵循单层目录规范，且必须包含标准 YAML Frontmatter：

```text
skills/
└── <your-skill-name>/
    └── SKILL.md
```

### 标准 `SKILL.md` 模板

```markdown
---
name: your-skill-name
description: 精准描述该技能的核心作用、适用边界及触发词（当用户提到 "xxx" 或处理某类任务时使用）。
---

# Skill Title

一句话概括核心原则。

## When to use
- 场景 1
- 场景 2

## Rules / Instructions
1. 核心铁律 A
2. 核心铁律 B
```
