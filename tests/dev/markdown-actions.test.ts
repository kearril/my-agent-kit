import { describe, expect, it } from 'vitest';
import {
  applyMarkdownFormat,
  computeContentStats,
  handleTabIndentation,
} from '../../src/dev/lib/markdown-actions';
import { extractGardenVocabulary } from '../../src/dev/hooks/useGardenVocabulary';
import type { EditorEntrySummary } from '../../src/dev/server/editor-api';

describe('Markdown Actions & Utilities', () => {
  describe('computeContentStats', () => {
    it('returns zeroes for empty content', () => {
      const stats = computeContentStats('');
      expect(stats).toEqual({
        wordCount: 0,
        charCount: 0,
        readingTimeMinutes: 0,
      });
    });

    it('calculates Chinese characters and English words correctly', () => {
      const text = '这是测试内容 Hello world Paracosm';
      const stats = computeContentStats(text);
      // 6 Chinese characters + 3 English words = 9 words
      expect(stats.wordCount).toBe(9);
      expect(stats.charCount).toBe(text.length);
      expect(stats.readingTimeMinutes).toBe(1);
    });
  });

  describe('applyMarkdownFormat on mock textarea', () => {
    function createMockTextarea(
      value: string,
      selectionStart = 0,
      selectionEnd = 0,
    ): HTMLTextAreaElement {
      return {
        value,
        selectionStart,
        selectionEnd,
        focus: () => {},
        setSelectionRange: function (start: number, end: number) {
          this.selectionStart = start;
          this.selectionEnd = end;
        },
      } as unknown as HTMLTextAreaElement;
    }

    it('wraps empty selection with bold placeholder', () => {
      const textarea = createMockTextarea('', 0, 0);
      const result = applyMarkdownFormat(textarea, 'bold');
      expect(result).toBe('**粗体文字**');
    });

    it('wraps selected text with bold syntax', () => {
      const textarea = createMockTextarea('Hello World', 0, 5);
      const result = applyMarkdownFormat(textarea, 'bold');
      expect(result).toBe('**Hello** World');
    });

    it('wraps selected text with italic syntax', () => {
      const textarea = createMockTextarea('Hello World', 6, 11);
      const result = applyMarkdownFormat(textarea, 'italic');
      expect(result).toBe('Hello *World*');
    });

    it('wraps selected text with inline code syntax', () => {
      const textarea = createMockTextarea('const x = 1;', 0, 12);
      const result = applyMarkdownFormat(textarea, 'code');
      expect(result).toBe('`const x = 1;`');
    });

    it('wraps selected text with link syntax', () => {
      const textarea = createMockTextarea('GitHub', 0, 6);
      const result = applyMarkdownFormat(textarea, 'link');
      expect(result).toBe('[GitHub](https://)');
    });

    it('prefixes selected lines with blockquote syntax', () => {
      const textarea = createMockTextarea('line 1\nline 2', 0, 13);
      const result = applyMarkdownFormat(textarea, 'quote');
      expect(result).toBe('> line 1\n> line 2');
    });

    it('prefixes selected lines with bullet list syntax', () => {
      const textarea = createMockTextarea('item 1\nitem 2', 0, 13);
      const result = applyMarkdownFormat(textarea, 'bullet-list');
      expect(result).toBe('- item 1\n- item 2');
    });

    it('prefixes selected lines with numbered list syntax', () => {
      const textarea = createMockTextarea('item A\nitem B', 0, 13);
      const result = applyMarkdownFormat(textarea, 'numbered-list');
      expect(result).toBe('1. item A\n2. item B');
    });
  });

  describe('handleTabIndentation', () => {
    function createMockTextarea(
      value: string,
      selectionStart = 0,
      selectionEnd = 0,
    ): HTMLTextAreaElement {
      return {
        value,
        selectionStart,
        selectionEnd,
        focus: () => {},
        setSelectionRange: function (start: number, end: number) {
          this.selectionStart = start;
          this.selectionEnd = end;
        },
      } as unknown as HTMLTextAreaElement;
    }

    it('inserts 2 spaces on single cursor Tab press', () => {
      const textarea = createMockTextarea('Hello', 0, 0);
      const result = handleTabIndentation(textarea, false);
      expect(result).toBe('  Hello');
    });

    it('removes 2 leading spaces on Shift+Tab press', () => {
      const textarea = createMockTextarea('  Hello', 2, 2);
      const result = handleTabIndentation(textarea, true);
      expect(result).toBe('Hello');
    });

    it('indents multi-line selection by 2 spaces on Tab press', () => {
      const textarea = createMockTextarea('line 1\nline 2', 0, 13);
      const result = handleTabIndentation(textarea, false);
      expect(result).toBe('  line 1\n  line 2');
    });

    it('unindents multi-line selection on Shift+Tab press', () => {
      const textarea = createMockTextarea('  line 1\n  line 2', 0, 17);
      const result = handleTabIndentation(textarea, true);
      expect(result).toBe('line 1\nline 2');
    });
  });

  describe('extractGardenVocabulary', () => {
    it('aggregates tags by count and extracts unique categories', () => {
      const sampleEntries: EditorEntrySummary[] = [
        {
          slug: 'note-1',
          title: 'Note 1',
          summary: 'Summary 1',
          type: 'note',
          category: '实践',
          draft: false,
          source: 'self',
          tags: ['AI', '开发'],
          links: [],
          related: [],
          createdAt: '2026-08-25',
          updatedAt: '2026-08-25',
        } as unknown as EditorEntrySummary,
        {
          slug: 'prompt-1',
          title: 'Prompt 1',
          summary: 'Summary 2',
          type: 'prompt',
          draft: false,
          source: 'self',
          tags: ['AI', '提示词'],
          links: [],
          related: [],
          createdAt: '2026-08-25',
          updatedAt: '2026-08-25',
        } as unknown as EditorEntrySummary,
        {
          slug: 'note-2',
          title: 'Note 2',
          summary: 'Summary 3',
          type: 'note',
          category: '架构',
          draft: false,
          source: 'self',
          tags: ['架构'],
          links: [],
          related: [],
          createdAt: '2026-08-25',
          updatedAt: '2026-08-25',
        } as unknown as EditorEntrySummary,
      ];

      const vocab = extractGardenVocabulary(sampleEntries);

      expect(vocab.allTags).toEqual([
        { tag: 'AI', count: 2 },
        { tag: '架构', count: 1 },
        { tag: '开发', count: 1 },
        { tag: '提示词', count: 1 },
      ]);
      expect(vocab.entrySlugMap.get('note-1')).toEqual({
        title: 'Note 1',
        type: 'note',
      });
    });
  });
});
