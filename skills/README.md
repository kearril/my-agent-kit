# Skills

个人私有零散 Agent 原子技能收纳区。用于存放单一职责的 Prompt 规则、工作流引导与最佳实践。

---

## 包含技能清单

| 技能名称 | 核心能力与适用场景 | 入口文件 |
| :--- | :--- | :--- |
| **`codebase-design`** | **Deep Modules 与 Seam 架构设计**。设计深层模块（小接口大行为）、识别接缝（seams）、提升代码可测试性与 AI 可导航性。包含备选接口设计规范。 | `codebase-design/SKILL.md` |
| **`tdd`** | **测试驱动开发规范**。严格贯彻 Red → Green Loop、优质集成测试判定准则与 Mock 隔离防反模式。 | `tdd/SKILL.md` |
| **`grilling`** | **编码前深度探究与追问**。在复杂需求动工前对需求边界、架构权衡与技术选型进行多轮反问质询。 | `grilling/SKILL.md` |

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
