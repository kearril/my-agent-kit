---
description: Review changes for over-engineering and bloat (correctness bugs go to /caveman-review)
---
Review the current code changes for over-engineering and unnecessary complexity only. Correctness bugs, runtime errors, and security holes belong to /caveman-review. One line per finding: L<line>: <tag> <what to cut>. <replacement>. Tags: delete (dead code/speculative feature), stdlib (reinvented standard library), native (dependency doing what the platform does), yagni (abstraction with one implementation), shrink (same logic, fewer lines). End with the net lines removable. If nothing to cut: 'Lean already. Ship.'
