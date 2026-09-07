# Deepening

如何在已知 dependencies 的前提下，安全地对一组 shallow modules 进行深化（deepen）。默认使用 [SKILL.md](SKILL.md) 中的词汇：**module**、**interface**、**seam**、**adapter**。

## Dependency categories

在评估加深候选对象时，对其 dependencies 进行分类。类别决定了加深后的 module 如何跨越其 seam 进行测试。

### 1. In-process

纯计算、内存状态、无 I/O。始终可以直接加深：合并这些 modules 并直接通过新的 interface 进行测试。无需 adapter。

### 2. Local-substitutable

拥有本地测试替代物（如用于 Postgres 的 PGLite、in-memory filesystem）的 dependencies。只要存在替代物即可加深。加深后的 module 在运行测试套件时使用该替代物进行测试。此时 seam 是内部的；module 的外部 interface 上无需暴露 port。

### 3. Remote but owned (Ports & Adapters)

跨网络边界但由自身掌控的 services（microservices、内部 APIs）。在 seam 处定义一个 **port**（interface）。由 deep module 掌控核心逻辑；transport 层作为 **adapter** 注入。Tests 使用 in-memory adapter；production 环境使用 HTTP/gRPC/queue adapter。

建议表述模板：*"在 seam 处定义一个 port，为 production 实现一个 HTTP adapter，为 testing 实现一个 in-memory adapter，这样即使逻辑部署在网络对端，也能收拢在一个 deep module 中。"*

### 4. True external (Mock)

无法掌控的第三方 services（Stripe、Twilio 等）。加深后的 module 将外部 dependency 作为注入的 port 接收；tests 提供 mock adapter。

## Seam discipline

- **一个 adapter 意味着假想的 seam；两个 adapters 才意味着真实的 seam。** 除非至少有两个 adapters 的合理需求（通常是 production + test），否则不要引入 port。只有单一 adapter 的 seam 纯粹是多余的间接层（indirection）。
- **Internal seams 与 external seams。** deep module 既可以有内部 seams（对其 implementation 私有，供其自身 tests 使用），也可以有位于其 interface 处的外部 seam。不要仅仅因为 tests 会用到内部 seams，就将它们暴露在 interface 上。

## Testing strategy: replace, don't layer

- 一旦在加深后的 module interface 处建立了 tests，原来针对 shallow modules 的旧 unit tests 就变成了累赘；直接删除它们。
- 在加深后的 module interface 处编写新的 tests。**Interface 即测试暴露面（test surface）**。
- Tests 应通过 interface 断言可观察的结果，而不是断言内部状态。
- Tests 应当经得起内部重构，因为它们描述的是 behaviour，而不是 implementation。如果 implementation 发生变更时 test 也不得不跟着改，说明它越过了 interface 在做测试（testing past the interface）。
