---
name: surgical-patch
description: 在最窄的责任层修复 Bug 和微小行为变更。用于需要严密回归证明、保持周边行为不变以及任务相关测试至关重要的场景。
---

# Surgical patch

Reproduce failure first when economical; otherwise capture strongest available evidence.

- Trace symptom to responsible mechanism.
- Change narrowest layer that owns incorrect behavior.
- Preserve unrelated behavior and user changes.
- Avoid cleanup, renaming, and abstraction outside fix.
- Add only regression proof relevant to task.

Run focused proof plus nearest affected gate. Stop when failure is fixed and regression proof passes.
