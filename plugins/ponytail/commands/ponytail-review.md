---
description: 审查改动中的过度设计及可删除内容（专审死代码、重复造轮子与过度抽象；代码正确性 Bug 归入 /caveman-review）
---
Review the current code changes for over-engineering and unnecessary complexity only. Correctness bugs, runtime errors, and security holes belong to /caveman-review. One-line per finding: L<line>: <tag> <what to cut>. <replacement>. Tags: delete (dead code/speculative feature), stdlib (reinvented standard library), native (dependency doing what the platform does), yagni (abstraction with one implementation), shrink (same logic, fewer lines). End with the net lines removable. If nothing to cut: 'Lean already. Ship.'
