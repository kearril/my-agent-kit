import { useEffect, useMemo, useRef, useState } from 'react';
import { Marked } from 'marked';
import type { QuickViewEntry } from '../../lib/explore-index';

interface Props {
  entry: QuickViewEntry | null;
  onClose: () => void;
  onTagClick?: (tag: string) => void;
  triggerElement?: HTMLElement | null;
}

const markedInstance = new Marked({
  gfm: true,
  breaks: true,
});

export default function QuickViewModal({
  entry,
  onClose,
  onTagClick,
  triggerElement,
}: Props) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const closeBtnRef = useRef<HTMLButtonElement | null>(null);
  const proseRef = useRef<HTMLDivElement | null>(null);

  // Render markdown HTML
  const renderedHtml = useMemo(() => {
    if (!entry || !entry.body) return '';
    try {
      const parsed = markedInstance.parse(entry.body);
      return typeof parsed === 'string' ? parsed : '';
    } catch {
      return `<p>${entry.summary}</p>`;
    }
  }, [entry]);

  // 1. Body Scroll Lock Lifecycle
  useEffect(() => {
    if (!entry) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [entry]);

  // 2. Focus Trap, Keyboard Listeners & Focus Restoration
  useEffect(() => {
    if (!entry) return;

    const timer = setTimeout(() => {
      closeBtnRef.current?.focus();
    }, 16);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && cardRef.current) {
        const focusableElements = cardRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
      if (triggerElement && document.contains(triggerElement)) {
        triggerElement.focus();
      }
    };
  }, [entry, onClose, triggerElement]);

  // 3. Attach One-Click Copy Buttons to code blocks in prose
  useEffect(() => {
    if (!entry || !proseRef.current) return;

    const preElements = proseRef.current.querySelectorAll('pre');
    preElements.forEach((pre) => {
      if (pre.querySelector('.dossier-code-copy-btn')) return;

      pre.style.position = 'relative';
      const copyBtn = document.createElement('button');
      copyBtn.className = 'dossier-code-copy-btn';
      copyBtn.type = 'button';
      copyBtn.setAttribute('aria-label', '复制代码或提示词内容');
      copyBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <rect x="9" y="9" width="13" height="13" rx="0"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
        <span>复制</span>
      `;

      copyBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        const codeEl = pre.querySelector('code');
        const textToCopy = (codeEl ? codeEl.innerText : pre.innerText).trim();
        try {
          await navigator.clipboard.writeText(textToCopy);
          copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <span>已复制!</span>
          `;
          copyBtn.classList.add('dossier-code-copy-btn--copied');
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                <rect x="9" y="9" width="13" height="13" rx="0"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
              <span>复制</span>
            `;
            copyBtn.classList.remove('dossier-code-copy-btn--copied');
          }, 2000);
        } catch {
          // Fallback ignore
        }
      });

      pre.appendChild(copyBtn);
    });
  }, [entry, renderedHtml]);

  if (!entry) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleTagChipClick = (tag: string) => {
    onClose();
    if (onTagClick) {
      onTagClick(tag);
    }
  };

  return (
    <div
      className="quickview-modal-backdrop"
      onClick={handleBackdropClick}
      aria-hidden="false"
    >
      <div
        ref={cardRef}
        className={`quickview-dossier-card quickview-dossier-card--${entry.type}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dossier-title"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Dossier Clamp Top Bar (工坊卷宗顶梁夹具) */}
        <div className="dossier-top-clamp">
          <div className="dossier-clamp-left">
            <span className="dossier-metal-rivet" aria-hidden="true" />
            <span className="dossier-serial-seal">
              DOSSIER // {entry.type.toUpperCase()}
            </span>
            <span className={`mini-badge mini-badge--${entry.type}`}>
              {entry.type.toUpperCase()}
            </span>
          </div>
          <button
            ref={closeBtnRef}
            type="button"
            className="dossier-close-btn"
            onClick={onClose}
            aria-label="关闭速览卷宗"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* 2. Scrollable Document Area (卷宗内容主体滚动区) */}
        <div className="dossier-body-scroll">
          {/* Header Identity */}
          <div className="dossier-header-section">
            <h2 id="dossier-title" className="dossier-title">
              {entry.title}
            </h2>
            <div className="dossier-meta-strip">
              <span className="dossier-meta-item">
                <span className="dossier-meta-label">UPDATED:</span>
                <strong>{entry.updatedAt}</strong>
              </span>
              <span className="dossier-meta-divider">/</span>
              <span className="dossier-meta-item">
                <span className="dossier-meta-label">SLUG:</span>
                <code>{entry.slug}</code>
              </span>
            </div>
          </div>

          {/* Specimen Digest (标本提要便签) */}
          {entry.summary && (
            <div className="dossier-digest-card">
              <div className="dossier-section-heading">
                <span className="dossier-heading-icon" aria-hidden="true">■</span>
                <span>[ SPECIMEN DIGEST // 核心提要 ]</span>
              </div>
              <p className="dossier-digest-text">{entry.summary}</p>
            </div>
          )}

          {/* External Links Deck (外部直达资源甲板) */}
          {entry.links && entry.links.length > 0 && (
            <div className="dossier-links-card">
              <div className="dossier-section-heading">
                <span className="dossier-heading-icon" aria-hidden="true">↗</span>
                <span>[ EXTERNAL ACCESS // 外部直达资源 ]</span>
              </div>
              <div className="dossier-links-list">
                {entry.links.map((link) => (
                  <a
                    key={link.url}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-external-link-btn"
                  >
                    <span>{link.label}</span>
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Full Markdown Body & Code Snippet Deck */}
          {renderedHtml && (
            <div className="dossier-prose-card">
              <div className="dossier-section-heading">
                <span className="dossier-heading-icon" aria-hidden="true">◆</span>
                <span>[ FULL ARTIFACT & INSTRUCTIONS // 完整正文与指令 ]</span>
              </div>
              <div
                ref={proseRef}
                className="dossier-prose-content"
                dangerouslySetInnerHTML={{ __html: renderedHtml }}
              />
            </div>
          )}
        </div>

        {/* 3. Dossier Pinned Bottom Deck (卷宗底部操作与流转甲板) */}
        <div className="dossier-footer-deck">
          {/* Tags Matrix */}
          <div className="dossier-footer-tags">
            {entry.tags && entry.tags.length > 0 && (
              <div className="dossier-tags-matrix" role="group" aria-label="相关标签筛选">
                {entry.tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className="dossier-tag-chip"
                    onClick={() => handleTagChipClick(tag)}
                    title={`关闭速览并筛选 ${tag}`}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                      style={{ display: 'inline', verticalAlign: '-1px', marginRight: '3px' }}
                    >
                      <path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" />
                      <circle cx="7.5" cy="7.5" r=".5" fill="currentColor" />
                    </svg>
                    <span>{tag}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Primary Navigation Action */}
          <div className="dossier-footer-actions">
            <a
              href={entry.canonicalUrl}
              className="dossier-full-page-btn"
              aria-label={`前往 ${entry.title} 完整长文档案册`}
            >
              <span>前往完整档案册</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="7" y1="17" x2="17" y2="7" />
                <polyline points="7 7 17 7 17 17" />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
