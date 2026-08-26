/**
 * Synthesizes the full article reading binder preview document for the local dev editor.
 *
 * Faithfully mirrors the design tokens and layout of `src/styles/article.css` and `src/styles/tokens.css`.
 */

import { ENTRY_TYPE_DEFINITIONS, type EntryType } from '../../lib/entry-data';

export interface PreviewData {
  slug: string;
  title: string;
  summary: string;
  type: EntryType;
  draft: boolean;
  source: string;
  tags: string[];
  links: Array<{ label: string; url: string }>;
  related: string[];
  createdAt: string;
  publishedAt?: string;
  updatedAt: string;
  featuredOrder?: string | number;
  typeFields?: Record<string, unknown>;
  bodyHtml: string;
}

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function buildFullArticlePreview(data: PreviewData): string {
  const safeTitle = escapeHtml(data.title || '未命名条目');
  const safeSummary = escapeHtml(data.summary || '');
  const safeSlug = escapeHtml(data.slug || 'untitled');
  const typeDef = ENTRY_TYPE_DEFINITIONS[data.type];
  const typeLabel = typeDef?.label || data.type;

  const category =
    data.type === 'note' && data.typeFields?.category
      ? String(data.typeFields.category)
      : '';

  const cleanLinks = (data.links || []).filter(
    (l) => l.label && l.label.trim() && l.url && l.url.trim(),
  );

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${safeTitle} - 预览</title>
  <style>
    :root {
      --black: #18181b;
      --white: #ffffff;
      --paper: #fbf9f4;
      --paper-dark: #efece4;
      --paper-cinnamon: #f09a8f;
      --paper-butter: #fce4a6;
      --paper-cotton: #faf8f5;
      --paper-sage: #b7d5c4;
      --board-kraft: #e6e0d4;
      --red: #e63946;
      --teal: #2a9d8f;
      --yellow: #e9c46a;
      --mint: #95e1d3;
      --coral: #e76f51;
      --blue: #457b9d;
      --dark: #27272a;
      --muted: #52525b;
      --font-mono: JetBrains Mono, Fira Code, Cascadia Code, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, PingFang SC, Hiragino Sans GB, Microsoft YaHei, monospace;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      background-color: var(--paper);
      background-image:
        linear-gradient(to right, rgba(24, 24, 27, 0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(24, 24, 27, 0.05) 1px, transparent 1px);
      background-size: 24px 24px;
      color: var(--black);
      font-family: var(--font-mono);
      padding: 24px 16px;
      line-height: 1.7;
    }

    .article-binder {
      max-width: 860px;
      margin: 0 auto;
      background: var(--paper-cotton);
      border: 3.5px solid var(--black);
      box-shadow: 6px 6px 0 var(--black);
      padding: 32px 28px;
    }

    .article-top-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 10px;
      padding-bottom: 16px;
      border-bottom: 3px dashed var(--black);
      margin-bottom: 20px;
    }

    .badges-group {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }

    .type-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      font-size: 0.8rem;
      font-weight: 900;
      text-transform: uppercase;
      border: 2px solid var(--black);
      background: var(--paper-butter);
      box-shadow: 2px 2px 0 var(--black);
    }

    .type-badge--prompt { background: var(--paper-cinnamon); }
    .type-badge--skill { background: var(--paper-butter); }
    .type-badge--mcp { background: var(--paper-sage); }
    .type-badge--website { background: var(--mint); }
    .type-badge--project { background: var(--coral); }
    .type-badge--note { background: var(--yellow); }

    .category-badge {
      display: inline-flex;
      align-items: center;
      padding: 3px 8px;
      font-size: 0.8rem;
      font-weight: 800;
      border: 2px solid var(--black);
      background: var(--teal);
      color: var(--white);
      box-shadow: 2px 2px 0 var(--black);
    }

    .status-stamp {
      display: inline-flex;
      align-items: center;
      padding: 2px 6px;
      font-size: 0.75rem;
      font-weight: 900;
      text-transform: uppercase;
      border: 2px solid var(--red);
      color: var(--red);
      transform: rotate(-1.5deg);
    }

    .specimen-id {
      font-size: 0.8rem;
      font-weight: 800;
      color: var(--muted);
    }

    .article-title {
      font-size: 1.75rem;
      font-weight: 900;
      line-height: 1.25;
      margin-bottom: 16px;
      color: var(--black);
    }

    .summary-box {
      background: var(--paper-dark);
      border-left: 5px solid var(--teal);
      border-top: 2px solid var(--black);
      border-right: 2px solid var(--black);
      border-bottom: 2px solid var(--black);
      padding: 12px 16px;
      margin-bottom: 20px;
      font-size: 0.95rem;
      color: var(--dark);
    }

    .metadata-deck {
      display: flex;
      flex-wrap: wrap;
      gap: 16px 24px;
      padding: 12px 16px;
      background: var(--paper);
      border: 2px solid var(--black);
      margin-bottom: 24px;
      font-size: 0.82rem;
    }

    .meta-item {
      display: flex;
      gap: 6px;
    }

    .meta-label {
      font-weight: 900;
      color: var(--muted);
    }

    .meta-value {
      font-weight: 800;
    }

    .tags-group {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      align-items: center;
    }

    .tag-chip {
      display: inline-block;
      padding: 1px 6px;
      font-size: 0.78rem;
      font-weight: 800;
      background: var(--white);
      border: 1.5px solid var(--black);
      box-shadow: 1.5px 1.5px 0 var(--black);
    }

    /* Markdown Prose */
    .prose {
      font-size: 0.95rem;
      line-height: 1.8;
      color: var(--black);
    }

    .prose h1, .prose h2, .prose h3, .prose h4 {
      font-weight: 900;
      text-transform: uppercase;
      margin-top: 1.6em;
      margin-bottom: 0.6em;
      line-height: 1.3;
    }

    .prose h1 { font-size: 1.5rem; border-bottom: 3px solid var(--black); padding-bottom: 6px; }
    .prose h2 { font-size: 1.3rem; border-bottom: 2.5px solid var(--black); padding-bottom: 4px; }
    .prose h3 { font-size: 1.1rem; }

    .prose p { margin-bottom: 1.2em; }

    .prose a {
      color: var(--black);
      font-weight: 800;
      text-decoration: underline;
      text-underline-offset: 3px;
    }

    .prose a:hover {
      background: var(--yellow);
    }

    .prose ul, .prose ol {
      margin-left: 24px;
      margin-bottom: 1.2em;
    }

    .prose li {
      margin-bottom: 0.35em;
    }

    .prose blockquote {
      border-left: 5px solid var(--black);
      background: var(--paper-dark);
      padding: 10px 16px;
      margin: 1.5em 0;
      font-style: normal;
    }

    .prose pre {
      background-color: #f0eae1;
      color: var(--black);
      padding: 16px 20px;
      border: 2.5px solid var(--black);
      box-shadow: 4px 4px 0 var(--black);
      margin: 1.5em 0;
      font-size: 0.9rem;
      font-weight: 700;
      line-height: 1.7;
      white-space: pre-wrap;
      word-break: break-word;
      overflow-wrap: break-word;
    }

    .prose code:not(pre code) {
      background: #e4dfd5;
      color: var(--black);
      padding: 2px 6px;
      font-size: 0.9em;
      font-weight: 800;
      border: 1.5px solid var(--black);
    }

    .prose pre code {
      background: transparent;
      padding: 0;
      border: none;
      color: var(--dark);
      white-space: pre-wrap;
      word-break: break-word;
    }

    .prose table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5em 0;
      border: 3px solid var(--black);
    }

    .prose th, .prose td {
      border: 2px solid var(--black);
      padding: 8px 12px;
      text-align: left;
    }

    .prose th {
      background: var(--yellow);
      font-weight: 900;
    }

    .prose hr {
      border: none;
      border-top: 3px dashed var(--black);
      margin: 2em 0;
    }

    .prose img {
      max-width: 100%;
      height: auto;
      border: 3px solid var(--black);
      box-shadow: 4px 4px 0 var(--black);
    }

    /* Links and Connections Section */
    .article-footer-deck {
      margin-top: 32px;
      padding-top: 20px;
      border-top: 3px solid var(--black);
    }

    .footer-section-title {
      font-size: 0.95rem;
      font-weight: 900;
      text-transform: uppercase;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .links-list {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }

    .links-list li a {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      background: var(--white);
      border: 2px solid var(--black);
      box-shadow: 2px 2px 0 var(--black);
      font-size: 0.85rem;
      font-weight: 800;
      color: var(--black);
      text-decoration: none;
    }

    .links-list li a:hover {
      background: var(--yellow);
    }

    .related-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .related-chip {
      padding: 3px 8px;
      font-size: 0.8rem;
      font-weight: 800;
      background: var(--board-kraft);
      border: 1.5px solid var(--black);
    }

    .empty-body-hint {
      color: var(--muted);
      font-style: italic;
      padding: 24px 0;
    }
  </style>
</head>
<body>
  <article class="article-binder">
    <header class="article-top-bar">
      <div class="badges-group">
        <span class="type-badge type-badge--${data.type}">[${typeLabel}]</span>
        ${category ? `<span class="category-badge">${escapeHtml(category)}</span>` : ''}
        <span class="status-stamp">${data.draft ? '草稿 DRAFT' : '已发布 PUBLISHED'}</span>
        ${data.featuredOrder ? `<span class="type-badge" style="background: var(--coral);">精选 #${data.featuredOrder}</span>` : ''}
      </div>
      <div class="specimen-id">${safeSlug}</div>
    </header>

    <h1 class="article-title">${safeTitle}</h1>

    ${safeSummary ? `<div class="summary-box">${safeSummary}</div>` : ''}

    <div class="metadata-deck">
      <div class="meta-item">
        <span class="meta-label">更新于:</span>
        <span class="meta-value">${escapeHtml(data.updatedAt || '今天')}</span>
      </div>
      ${data.publishedAt ? `
      <div class="meta-item">
        <span class="meta-label">首次发布:</span>
        <span class="meta-value">${escapeHtml(data.publishedAt)}</span>
      </div>` : ''}
      ${data.tags && data.tags.length > 0 ? `
      <div class="meta-item" style="flex: 1 1 100%;">
        <span class="meta-label">标签:</span>
        <div class="tags-group">
          ${data.tags.map((t) => `<span class="tag-chip">#${escapeHtml(t)}</span>`).join('')}
        </div>
      </div>` : ''}
    </div>

    <div class="prose">
      ${data.bodyHtml || '<p class="empty-body-hint">正文为空。请在编辑器中开始输入 Markdown 内容…</p>'}
    </div>

    ${(cleanLinks.length > 0 || (data.related && data.related.length > 0)) ? `
    <footer class="article-footer-deck">
      ${cleanLinks.length > 0 ? `
      <div>
        <div class="footer-section-title">🔗 外部资产与链接</div>
        <ul class="links-list">
          ${cleanLinks.map((l) => `<li><a href="${escapeHtml(l.url)}" target="_blank">↗ ${escapeHtml(l.label)}</a></li>`).join('')}
        </ul>
      </div>` : ''}
      ${data.related && data.related.length > 0 ? `
      <div>
        <div class="footer-section-title">📌 关联条目</div>
        <div class="related-chips">
          ${data.related.map((r) => `<span class="related-chip">◈ ${escapeHtml(r)}</span>`).join('')}
        </div>
      </div>` : ''}
    </footer>` : ''}
  </article>
</body>
</html>`;
}
