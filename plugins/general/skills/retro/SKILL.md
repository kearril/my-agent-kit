---
name: retro
description: Conduct a retrospective on the current conversation or work session to extract learnings and improve future workflows.
disable-model-invocation: true
---

The user has asked for a **retrospective**. You are conducting a structured reflection on the current conversation, task, or session to improve future interactions, consolidate insights, and eliminate friction.

## Steps

1. If `writing-for-agents` is available, consult it for communication and prompt structure guidelines.

2. Review the transcript of the current session (or the specified topic/session). Identify what went smoothly, where friction or misunderstandings occurred, and what took longer than expected.

3. Analyze the session across these four core dimensions:

- **Communication & Alignment**:
  - Where did instructions fail to land or cause confusion?
  - Did the agent make unverified assumptions or act prematurely?
  - What clarifying questions should have been asked earlier?
- **Knowledge & Insights Consolidation**:
  - Were new domain concepts, definitions, decisions, or user preferences established during this session?
  - Should any key facts, terminology, or takeaways be promoted into project documentation, notes, or long-term memory?
- **Instruction & Prompt Improvement**:
  - Can steering files (e.g., `AGENTS.md`, system prompt, project instructions) be updated with positive, checkable rules to prevent this friction next time?
  - Are there rules or instructions that are redundant, ambiguous, or no longer relevant (sediment)?
- **Tooling & Efficiency**:
  - Were there inefficient tool calls, repetitive manual steps, or missing context that slowed the process down?

4. Present the retrospective findings clearly:
   - **Highlights**: Key successes and settled outcomes.
   - **Friction Points**: Root causes of any missteps or delays.
   - **Concrete Actions**: Specific updates to instructions, docs, or habits, ranked by impact.
