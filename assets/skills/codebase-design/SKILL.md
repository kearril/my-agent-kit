---
name: codebase-design
description: 设计 deep modules 的通用词汇与原则。当用户想要设计或改进 module 的 interface、寻找 deepening（加深）机会、决定 seam 的位置、提升代码的可测试性或对 AI 的可导航性，或者当其他 skill 需要 deep-module 词汇时使用。
---

# Codebase Design

设计 **deep modules**：将丰富的 behaviour（行为）隐藏在小巧的 interface 之后，置于干净的 seam 处，并能通过该 interface 进行测试。在任何设计或重构代码的场景下，都应使用这套语言和原则。其目标是为 callers 提供 leverage，为 maintainers 提供 locality，并为所有人带来良好的 testability。

## Glossary

严格使用这些术语：切勿替换为 "component"、"service"、"API" 或 "boundary"。保持语言一致性是核心所在。

**Module**：任何具备 interface 和 implementation 的实体。刻意与粒度无关（scale-agnostic）：可以是一个 function、class、package，或是跨越分层的 slice。_Avoid_："unit"、"component"、"service"。

**Interface**：caller 为正确使用该 module 所必须了解的一切：包括 type signature，以及 invariants、ordering constraints、error modes、必要的 configuration 和 performance characteristics。_Avoid_："API"、"signature"（过于狭隘，仅指类型层面的暴露面）。

**Implementation**：module 内部的代码实现主体。与 **Adapter** 有所区别：一个实体可以是一个小型的 adapter 但拥有庞大的 implementation（例如 Postgres repo），也可以是一个大型的 adapter 但拥有极小的 implementation（例如 in-memory fake）。当讨论焦点在 seam 时，使用 "adapter"；其他情况下使用 "implementation"。

**Depth**：interface 处的 leverage。即 caller（或 test）每学习一个单位的 interface 所能调用的 behaviour 总量。当小巧的 interface 背后承载着大量的 behaviour 时，该 module 即为 **deep**；当 interface 的复杂度几乎与其 implementation 相当时，则为 **shallow**。

**Seam** _(Michael Feathers)_：无需在某处修改代码即可改变该处 behaviour 的位置；即 module 的 interface 所处的*位置（location）*。将 seam 放置在何处本身就是一项独立的架构决策，与置于其后的内容截然不同。_Avoid_："boundary"（该词已被 DDD 的 bounded context 赋予过多含义）。

**Adapter**：在 seam 处满足某个 interface 的具体实现。描述的是*角色（role）*（填充哪个位置），而非实体内容（内部具体是什么）。

**Leverage**：callers 从 depth 中获得的收益。每学习一个单位的 interface，就能获得更多的 capability。一份 implementation 即可在 N 个 call sites 和 M 个 tests 中产生回报。

**Locality**：maintainers 从 depth 中获得的收益。变更、bugs、知识和 verification 都集中在单一位置，而不是分散在各个 callers 中。一次修复，到处生效（Fix once, fixed everywhere）。

## Deep vs shallow

**Deep module** = 小型 interface + 丰富的 implementation：

```
┌─────────────────────┐
│   Small Interface   │  ← 少量的 methods，简单的 params
├─────────────────────┤
│                     │
│  Deep Implementation│  ← 隐藏复杂的 logic
│                     │
└─────────────────────┘
```

**Shallow module** = 庞大的 interface + 稀薄的 implementation（应避免）：

```
┌─────────────────────────────────┐
│       Large Interface           │  ← 众多的 methods，复杂的 params
├─────────────────────────────────┤
│  Thin Implementation            │  ← 仅做简单透传（pass through）
└─────────────────────────────────┘
```

当设计 interface 时，自问以下问题：

- 我能否减少 methods 的数量？
- 我能否简化 parameters？
- 我能否在内部隐藏更多的复杂度？

## Principles

- **Depth 是 interface 的属性，而非 implementation 的属性。** deep module 内部可以由微小、可 mock、可替换的部件组成；它们只是不属于 interface 的一部分。一个 module 可以拥有**内部 seams**（对其 implementation 私有，供自身 tests 使用），以及在其 interface 处的**外部 seam**。
- **删除测试（The deletion test）。** 设想删除该 module。如果复杂度随之消失，说明它只是个 pass-through。如果复杂度重新分散出现在 N 个 callers 中，说明它真正发挥了价值。
- **Interface 即测试暴露面（test surface）。** Callers 和 tests 穿过同一个 seam。如果你想越过（test past）interface 进行测试，该 module 的设计形态很可能是不合理的。
- **一个 adapter 意味着假想的 seam；两个 adapters 才意味着真实的 seam。** 除非确实有不同的实现跨越其存在，否则不要引入 seam。

## Designing for testability

优秀的 interfaces 让测试变得自然而然：

1. **接收 dependencies，不要自行创建。**

   ```typescript
   // Testable
   function processOrder(order, paymentGateway) {}

   // Hard to test
   function processOrder(order) {
     const gateway = new StripeGateway();
   }
   ```

2. **返回 results，不要产生 side effects。**

   ```typescript
   // Testable
   function calculateDiscount(cart): Discount {}

   // Hard to test
   function applyDiscount(cart): void {
     cart.total -= discount;
   }
   ```

3. **紧凑的 surface area。** 更少的 methods = 需要更少的 tests。更少的 params = 更简单的 test setup。

## Relationships

- 一个 **Module** 恰好拥有一个 **Interface**（向 callers 和 tests 暴露的表面）。
- **Depth** 是 **Module** 的属性，对照其 **Interface** 进行衡量。
- **Seam** 是 **Module** 的 **Interface** 所在的位置。
- **Adapter** 位于 **Seam** 处并满足其 **Interface**。
- **Depth** 为 callers 带来 **Leverage**，为 maintainers 带来 **Locality**。

## Rejected framings

- **将 Depth 定义为 implementation 代码行数与 interface 代码行数的比例**（Ousterhout 原书观点）：这种做法会鼓励故意虚增 implementation 的代码量。我们转而采用 depth-as-leverage（基于杠杆率的深度）。
- **将 "Interface" 狭隘理解为 TypeScript 的 `interface` 关键字或 class 的 public methods**：范围过窄；这里的 interface 涵盖了 caller 所必须了解的每一项事实。
- **使用 "Boundary"**：该词与 DDD 的 bounded context 语义冲突。请一律称作 **seam** 或 **interface**。

## Going deeper

- **根据 dependencies 加深模块群**，参见 [DEEPENING.md](DEEPENING.md)：dependency 分类、seam 规范，以及 replace-don't-layer 测试策略。
- **探索备选 interfaces**，参见 [DESIGN-IT-TWICE.md](DESIGN-IT-TWICE.md)：并行启动多个 sub-agents 从几种截然不同的方向设计 interface，然后从 depth、locality 和 seam placement 的维度进行对比。
