---
name: safe-refactor
description: 在保持行为完全等价的前提下重构代码。用于提取、整合、归属权转移或清理，且结构编辑前后必须有严格验证测试约束的场景。
---

# Safe refactor

Define behavior-preservation boundary and establish verification before structural edits.

- Keep feature changes outside refactor.
- Move one ownership boundary at a time.
- Preserve public interfaces, failure behavior, ordering, and compatibility unless explicitly scoped.
- Keep intermediate states buildable and testable.
- Avoid dependency or configuration growth without correctness need.

Run same proof after change. Stop when behavior matches and requested structure is achieved.
