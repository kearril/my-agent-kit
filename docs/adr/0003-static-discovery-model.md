# ADR-0003: 静态发现与关联模型

- 状态：Accepted
- 日期：2026-08-23

## Context

内容需要可搜索、筛选和互相发现，但首发不需要运行时搜索服务或预设关系分类。

## Decision

构建期生成仅含公开元数据的 Explore 索引；关键词只检索标题与摘要，类型和标签作精确筛选。`related` 保持单向引用，页面构建时推导 backlinks。首发生成 RSS 与 sitemap。

## Consequences

不传输正文或草稿到 Island，不引入搜索 SaaS。关系类型和全文搜索仅在真实内容证明需要时增加。
