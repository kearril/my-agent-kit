---
name: 拷问
description: 用来彻底明确意图和需求
disable-model-invocation: true
---

持续追问用户，直到双方达成 shared understanding。将其建模为一个 **design tree**：每个决策都会分支衍生出依附于它的后续决策。细枝末节的边界情况不要追问用户，默认使用合理的处理方式，除非你认为该问题重要，会影响到后续决策。

按 **rounds** 推进整棵 tree。**frontier** 是所有 prerequisites 已经明确的决策节点：即你**当下**无需猜测尚未得知的答案就能直接提出的问题。在单个 round 中提问整个 frontier 的所有问题：为每个问题编号并给出你的 recommended answer。然后等待用户的回答，再进入下一个 round。

每一轮（round）的格式如下，每次最多提出5个问题：

```
❓ **Q1** - **<问题标题>**: <问题正文，可以由多个段落组成，包括多项选择>

➡️ <你的建议答案>

---

❓ **Q2** - **<问题标题>**: <问题正文，可以由多个段落组成，包括多项选择>

➡️ <你的建议答案>
```

用户在每个 round 的回答都会重塑整棵 tree：已确定的决策会将 frontier 向外推进，并 unblock 依赖这些决策的问题。重新计算 frontier 并发起下一个 round。如果某个问题的答案依赖本轮中仍未决的问题，它应归属于**后续**的 round，而非当前轮。

探寻事实（_facts_）是你的职责，绝非用户的责任。当某个 frontier 问题需要来自环境（filesystem、tools 等）的事实依据时，派发 sub-agent 去查询；凡是你能自己查到的信息，切勿向用户提问。不要为此 block：正在进行的探索属于未决的 prerequisite，因此只有其 downstream 的问题才需要等待 sub-agent 汇报；当前 frontier 上的其余问题应立即提问。而决策（_decisions_）归属于用户：将每个决策提交给用户并等待其答复。

当 frontier 为空时，整个 session 即告完成：design tree 的每一个分支都已探访，没有任何暗自默认的假设。在用户确认双方已达成 shared understanding 之前，切勿据此付诸行动。
