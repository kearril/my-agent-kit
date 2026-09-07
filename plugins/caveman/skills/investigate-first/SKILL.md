---
name: investigate-first
description: 在编辑代码前诊断不明确的故障。用于未知原因、偶发行为、性能回退，或需要基于证据链推导排序假设的调查；证据未确凿前严禁修改业务代码。
---

# Investigate first

Gather evidence before changing product code.

- Separate observed symptom from inferred cause.
- Trace inputs, state transitions, ownership boundaries, and failure output.
- Rank hypotheses by evidence and cheap falsification value.
- Do not edit until one credible mechanism explains evidence.
- Stop exploration when evidence is sufficient to name cause or exact blocker.

Report cause and proof. Make no fix unless task authorizes implementation.
