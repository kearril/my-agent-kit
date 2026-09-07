---
name: verify-and-stop
description: 在不扩大范围的前提下证明现有工作符合验收条件。用于纯验证任务、完成检查、重点门禁运行以及最后一公里交付证明。
---

# Verify and stop

Translate acceptance conditions into smallest sufficient proof set.

- Reuse still-current results with matching repository state.
- Run focused checks before wider gates.
- Distinguish pass, fail, unavailable, and blocked exactly.
- Do not edit product code unless verification request includes fixes.
- Do not add polish, cleanup, or unrelated tests after criteria pass.

Stop immediately when acceptance proof is complete. Report commands, results, and unresolved risk only.
