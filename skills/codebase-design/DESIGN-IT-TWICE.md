# Design It Twice

当用户希望为选定的加深候选模块探索备选 interfaces 时，采用这种并行的 sub-agent 模式。该模式基于 "Design It Twice"（Ousterhout 提出）：你的第一个想法通常不太可能是最好的。

使用 [SKILL.md](SKILL.md) 中的词汇：**module**、**interface**、**seam**、**adapter**、**leverage**。

## Process

### 1. Frame the problem space

在派发 sub-agents 之前，先为选定的候选对象编写一份面向用户的 problem space 说明：

- 任何新 interface 都需要满足的 constraints
- 它将依赖的 dependencies，以及它们属于哪种分类（参见 [DEEPENING.md](DEEPENING.md)）
- 一份粗略的示例代码草图以具体化 constraints，这不是最终方案，只是为了让 constraints 更加具体可见

将此展示给用户，然后立即进入 Step 2。在 sub-agents 并行工作期间，用户可以阅读并思考。

### 2. Spawn sub-agents

并行派发 3+ 个 sub-agents。每个 sub-agent 必须为加深后的 module 产出**截然不同**的 interface 设计。

为每个 sub-agent 提供独立的 technical brief（文件路径、coupling 细节、来自 [DEEPENING.md](DEEPENING.md) 的 dependency 分类、seam 背后隐藏的内容）。该 brief 独立于 Step 1 中面向用户的 problem-space 说明。为每个 agent 分配不同的设计约束：

- Agent 1: "极小化 interface：目标最多 1–3 个 entry points。最大化每个 entry point 的 leverage。"
- Agent 2: "最大化灵活性：支持多种 use cases 和扩展。"
- Agent 3: "针对最常见的 caller 进行优化：让默认用例（default case）的使用极其简单。"
- Agent 4（若适用）: "围绕 cross-seam dependencies 采用 ports & adapters 进行设计。"

在 brief 中同时包含 [SKILL.md](SKILL.md) 词汇与 CONTEXT.md 词汇，以便各个 sub-agent 的命名与架构语言以及项目的 domain language 保持一致。

每个 sub-agent 输出：

1. Interface（types、methods、params，外加 invariants、ordering、error modes）
2. 展示 callers 如何调用的 usage example
3. Implementation 在 seam 背后隐藏了什么
4. Dependency strategy 与 adapters（参见 [DEEPENING.md](DEEPENING.md)）
5. Trade-offs：何处 leverage 较高，何处较薄弱

### 3. Present and compare

按序呈现各个 designs 以便用户逐步理解，然后用正文进行综合对比。从 **depth**（interface 处的 leverage）、**locality**（变更集中的位置）以及 **seam placement** 进行对比。

对比之后，给出你自己的建议：你认为哪套 design 最强，以及理由。如果不同 designs 的要素可以很好地结合，提出一个混合方案（hybrid）。给出明确立场：用户需要的是有力的专业判断，而非单纯罗列菜单。
