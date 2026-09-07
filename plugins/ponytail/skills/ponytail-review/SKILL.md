---
name: ponytail-review
description: >
  专注于过度设计的代码审查。找出应删除的内容：重复发明的标准库、不需要的依赖项、推测性抽象、死灵活性。每条发现一行：位置、裁剪内容、替换方案。
  当用户提到 "review for over-engineering"、"what can we delete"、"is this over-engineered"、"simplify review" 或调用 /ponytail-review 时使用。
  （审查边界：作为专注正确性审查的补充，本审查只针对复杂度与冗余；代码正确性、运行时错误和异常漏洞交由 /caveman-review）。
---

Review diffs for unnecessary complexity. One line per finding: location, what
to cut, what replaces it. The diff's best outcome is getting shorter.

## Format

`L<line>: <tag> <what>. <replacement>.`, or `<file>:L<line>: ...` for
multi-file diffs.

Tags:

- `delete:` dead code, unused flexibility, speculative feature. Replacement: nothing.
- `stdlib:` hand-rolled thing the standard library ships. Name the function.
- `native:` dependency or code doing what the platform already does. Name the feature.
- `yagni:` abstraction with one implementation, config nobody sets, layer with one caller.
- `shrink:` same logic, fewer lines. Show the shorter form.

## Examples

❌ "This EmailValidator class might be more complex than necessary, have you
considered whether all these validation rules are needed at this stage?"

✅ `L12-38: stdlib: 27-line validator class. "@" in email, 1 line, real validation is the confirmation mail.`

✅ `L4: native: moment.js imported for one format call. Intl.DateTimeFormat, 0 deps.`

✅ `repo.py:L88: yagni: AbstractRepository with one implementation. Inline it until a second one exists.`

✅ `L52-71: delete: retry wrapper around an idempotent local call. Nothing replaces it.`

✅ `L30-44: shrink: manual loop builds dict. dict(zip(keys, values)), 1 line.`

## Scoring

End with the only metric that matters: `net: -<N> lines possible.`

If there is nothing to cut, say `Lean already. Ship.` and stop.

## Boundaries

Scope: over-engineering and complexity only. Correctness bugs, security holes,
runtime errors, and performance flaws are explicitly out of scope — route them to `/caveman-review`,
not this one. A single smoke test or `assert`-based self-check is the ponytail minimum, not bloat,
never flag it for deletion. Does not apply the fixes, only lists them.
"stop ponytail-review" or "normal mode": revert to verbose review style.
