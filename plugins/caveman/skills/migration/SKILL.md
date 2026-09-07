---
name: migration
description: 实施可逆且兼容安全的平滑过渡。用于需要回滚能力与状态保留证明的 schema、数据、API、协议、配置或依赖迁移。
---

# Migration

Map current readers, writers, data shape, compatibility window, and ownership before editing.

- Define forward path and rollback path.
- Preserve existing data; make destructive steps explicit and separately authorized.
- Keep mixed-version operation safe where rollout can overlap.
- Sequence expand, migrate, verify, then contract when applicable.
- Make retries idempotent and partial failure observable.
- Verify old and new paths at required transition stages.

Stop after requested stage passes; do not perform later destructive contraction implicitly.
