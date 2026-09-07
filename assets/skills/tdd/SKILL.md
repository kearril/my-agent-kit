---
name: tdd
description: 测试驱动开发（Test-driven development）。当用户希望以测试先行（test-first）的方式构建功能或修复 bug、提到 "red-green-refactor"，或需要编写 integration tests 时使用。
---

# Test-Driven Development

TDD 即 red → green loop。本 skill 是一份参考指南，旨在让该 loop 产出真正值得保留的 tests：什么是优秀的 test、tests 应该写在哪里、常见的 anti-patterns，以及 loop 的核心规则。每一节都适用于每一个 cycle：在进入 loop 之前和进行过程中务必查阅，而不是事后才看。

在探索 codebase 时，请阅读项目文档说明（如果存在），以使 test 命名和 interface 词汇与项目的 domain language 保持一致，并遵循你所涉及领域的 ADRs。

## What a good test is

Tests 应该通过 public interfaces 验证 behaviour，而不是验证 implementation 细节。代码可以彻底重写；tests 则不应随之变动。一个好的 test 读起来就像一份 specification（规格说明）："user can checkout with valid cart" 清楚地告诉你系统具备什么 capability，并且它能跨越 refactors 保持稳定，因为它不关心内部结构。

示例参见 [tests.md](tests.md)，mocking 指南参见 [mocking.md](mocking.md)。

## Seams: where tests go

**seam** 是你进行测试所在的 public 边界：即你用来观察 behaviour 而无需探入内部细节的 interface。Tests 应当存在于 seams 处，绝不要针对 internals 编写。

**仅在预先达成一致的 seams 处编写测试。** 在编写任何 test 之前，先写下被测的 seams 并与用户确认。绝不在未经确认的 seam 处编写 test。你不可能测试所有东西，因此预先确定 seams 才能确保测试精力投入在 critical paths 和复杂 logic 上，而不是铺在每一个 edge case 上。

提问："What's the public interface, and which seams should we test?"（public interface 是什么，我们应该测试哪些 seams？）

当该 interface 自身的形态尚存疑问时（module 的 depth 应当如何、seam 应该放在何处、interface 应该暴露什么），调用 Skill 工具并传入 "codebase-design" 获取相关词汇。它是 module、interface、depth、seam、adapter、leverage 和 locality 等术语的通用来源，是一份供查阅的 reference，而非需要执行的 session。

## Anti-patterns

- **Implementation-coupled（实现耦合）**：mock 内部协作者、测试 private methods，或通过 side channel 进行验证（例如直接查询 database 而非使用 interface）。其典型特征是：当你进行 refactor 但 behaviour 未变时，test 却挂了。
- **Tautological（同义反复 / 恒真测试）**：assertion 按照业务代码的计算方式重新算了一遍期望值（例如 `expect(add(a, b)).toBe(a + b)`、以相同方式手动推导出的 snapshot、断言一个常量等于其自身），因此这种测试在构造上必然通过，永远无法与业务代码产生分歧。Expected values 必须来自独立的可信源（independent source of truth）：已知的正确字面量（known-good literal）、人工推演的示例（worked example）、或 spec。
- **Horizontal slicing（水平切片）**：先写完所有的 tests，再写所有的 implementation。大批量的 tests 验证的往往是*凭空想象的* behaviour：你测试的是事物的*形式（shape）*而非面向用户的真实 behaviour，tests 会对真正的变化钝化，并且你在理解 implementation 之前就过早固化了测试结构。取而代之，应采用 **vertical slices（垂直切片）**：一个 test → 一个 implementation → 重复循环，每个 test 都是一枚 **tracer bullet（曳光弹）**，根据上一轮 cycle 带来的认知反馈进行迭代。

## Rules of the loop

- **先 Red 后 Green（Red before green）。** 永远先编写失败的 test，然后编写刚好能使其通过的最简代码。切勿预设未来的 tests 或添加猜测性的功能。
- **每次只攻一个 slice（One slice at a time）。** 每个 cycle 仅针对一个 seam、一个 test、一个 minimal implementation。
- **Refactoring 不属于该 loop。** 它归属于 review 阶段，而不是 red → green 的实现 cycle。
