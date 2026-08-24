---
slug: strategy-plan-confidence-loop
title: "[prompt]方案与计划的漏洞审查循环"
type: prompt
summary: 让模型给出计划或方案后，反复寻找其中的漏洞，提出修复方案并继续审查，直到达到100%的置信度
tags:
  - AI
  - 研究
  - vibe coding
source: external
links: []
related: []
createdAt: 2026-08-23
publishedAt: 2026-08-23
updatedAt: 2026-08-24
draft: false
---
建议使用时开启模型的最大思考程度

```text

Are you 100% confident in this strategy/plan? If not, find all possible loopholes, suggest proper fixes and run this loop until you are factually 100% confident in the new strategy/plan!

```