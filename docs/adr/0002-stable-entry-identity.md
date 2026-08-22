# ADR-0002: 稳定条目身份与公开路由

- 状态：Accepted
- 日期：2026-08-23

## Context

文件名、标题和内容类型都会随整理变化，不能承担公开链接或关联关系的身份职责。

## Decision

每个条目使用创建后不可变的英文 kebab-case `slug` 作为 Collection ID、关联引用和公开身份；所有公开条目统一位于 `/entries/<slug>/`。条目记录 `createdAt`、`publishedAt` 与 `updatedAt`。

## Consequences

重命名文件、标题或类型不改变 URL。公开条目必须有 `publishedAt`；草稿不进入公开构建输入。
