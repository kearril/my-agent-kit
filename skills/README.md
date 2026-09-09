# Skills

个人私有零散 Agent 原子技能收纳区。用于存放单一职责的 Prompt 规则、工作流引导与最佳实践。

---

## 包含技能清单
（当前暂无收录的原子技能）

---

## 单个技能安装指南 (`npx skills`)

本目录下的原子技能原生兼容标准 Agent Skills 规范，支持通过 `npx skills` 按需精准安装单个技能：

### 1. 项目级安装（推荐，仅在当前工作项目生效）
在你的目标项目根目录下打开终端执行（默认安装至当前项目）：

```bash
# 按需安装单个技能
npx skills add kearril/my-agent-kit --skill <skill-name>
```

### 2. 全局安装（所有项目通用）
如果希望该技能在当前机器的所有项目里都能被 OMP 调用，追加 `-g` 标志：

```bash
npx skills add kearril/my-agent-kit --skill <skill-name> -g
```

---

## 规范与添加模板

所有新增技能必须遵循 OMP 规范（单层目录结构，严禁嵌套，且必须包含 YAML Frontmatter 元数据）：

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
