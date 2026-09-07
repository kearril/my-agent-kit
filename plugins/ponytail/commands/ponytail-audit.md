---
description: 审计全仓库的过度设计及可删除内容（扫描全库未使用的抽象、依赖与复杂度，输出按削减行数排序的清单）
---
Audit the entire repository for over-engineering only, not correctness. Scan the whole tree, not a diff. One line per finding, ranked biggest cut first: <tag> <what to cut>. <replacement>. [path]. Tags: delete (dead code/speculative feature), stdlib (reinvented standard library), native (dependency doing what the platform does), yagni (abstraction with one implementation), shrink (same logic, fewer lines). End with the net lines and dependencies removable. If nothing to cut: 'Lean already. Ship.'
