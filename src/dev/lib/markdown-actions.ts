/**
 * Pure helper utilities for Markdown text formatting, indentation, and statistics.
 *
 * Designed for lightweight, fast, zero-dependency textarea editing in the local dev editor.
 */

export type MarkdownActionType =
  | 'bold'
  | 'italic'
  | 'code'
  | 'link'
  | 'quote'
  | 'bullet-list'
  | 'numbered-list'
  | 'code-block';

export interface ContentStats {
  wordCount: number;
  charCount: number;
  readingTimeMinutes: number;
}

/**
 * Calculates character count, word count (Chinese characters + English words),
 * and estimated reading time.
 */
export function computeContentStats(text: string): ContentStats {
  const clean = text.trim();
  if (!clean) {
    return { wordCount: 0, charCount: 0, readingTimeMinutes: 0 };
  }

  const charCount = text.length;

  // Count Chinese characters
  const chineseChars = (clean.match(/[\u4e00-\u9fa5]/g) || []).length;
  // Remove Chinese characters and count remaining English words
  const nonChinese = clean.replace(/[\u4e00-\u9fa5]/g, ' ');
  const englishWords = (nonChinese.match(/\b[a-zA-Z0-9_-]+\b/g) || []).length;

  const wordCount = chineseChars + englishWords;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 350));

  return {
    wordCount,
    charCount,
    readingTimeMinutes,
  };
}
function scheduleCursorRestore(fn: () => void): void {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(fn);
  } else if (typeof queueMicrotask === 'function') {
    queueMicrotask(fn);
  } else {
    fn();
  }
}


/**
 * Applies a Markdown formatting action to an HTMLTextAreaElement, updating its value,
 * maintaining selection/cursor, and returning the updated full value.
 */
export function applyMarkdownFormat(
  textarea: HTMLTextAreaElement,
  action: MarkdownActionType,
): string {
  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.substring(start, end);

  let replacement = '';
  let newCursorStart = start;
  let newCursorEnd = end;

  switch (action) {
    case 'bold': {
      const defaultText = selectedText || '粗体文字';
      replacement = `**${defaultText}**`;
      newCursorStart = start + 2;
      newCursorEnd = start + 2 + defaultText.length;
      break;
    }
    case 'italic': {
      const defaultText = selectedText || '斜体文字';
      replacement = `*${defaultText}*`;
      newCursorStart = start + 1;
      newCursorEnd = start + 1 + defaultText.length;
      break;
    }
    case 'code': {
      const defaultText = selectedText || '代码';
      replacement = `\`${defaultText}\``;
      newCursorStart = start + 1;
      newCursorEnd = start + 1 + defaultText.length;
      break;
    }
    case 'link': {
      const defaultText = selectedText || '链接名称';
      replacement = `[${defaultText}](https://)`;
      newCursorStart = start + defaultText.length + 3;
      newCursorEnd = start + replacement.length - 1;
      break;
    }
    case 'quote': {
      if (selectedText.includes('\n')) {
        replacement = selectedText
          .split('\n')
          .map((line) => `> ${line}`)
          .join('\n');
      } else {
        const defaultText = selectedText || '引用文字';
        replacement = `> ${defaultText}`;
      }
      newCursorStart = start + 2;
      newCursorEnd = start + replacement.length;
      break;
    }
    case 'bullet-list': {
      if (selectedText.includes('\n')) {
        replacement = selectedText
          .split('\n')
          .map((line) => (line.startsWith('- ') ? line : `- ${line}`))
          .join('\n');
      } else {
        const defaultText = selectedText || '列表项';
        replacement = `- ${defaultText}`;
      }
      newCursorStart = start + 2;
      newCursorEnd = start + replacement.length;
      break;
    }
    case 'numbered-list': {
      if (selectedText.includes('\n')) {
        replacement = selectedText
          .split('\n')
          .map((line, idx) => `${idx + 1}. ${line.replace(/^\d+\.\s*/, '')}`)
          .join('\n');
      } else {
        const defaultText = selectedText || '列表项';
        replacement = `1. ${defaultText}`;
      }
      newCursorStart = start + 3;
      newCursorEnd = start + replacement.length;
      break;
    }
    case 'code-block': {
      const defaultText = selectedText || 'console.log("Hello Paracosm");';
      const beforeNewline = start > 0 && value[start - 1] !== '\n' ? '\n' : '';
      const afterNewline = end < value.length && value[end] !== '\n' ? '\n' : '';
      replacement = `${beforeNewline}\`\`\`ts\n${defaultText}\n\`\`\`${afterNewline}`;
      newCursorStart = start + beforeNewline.length + 6;
      newCursorEnd = newCursorStart + defaultText.length;
      break;
    }
  }

  const nextValue = value.substring(0, start) + replacement + value.substring(end);
  textarea.value = nextValue;

  // Restore cursor/selection asynchronously to let React or DOM state update
  scheduleCursorRestore(() => {
    textarea.focus?.();
    textarea.setSelectionRange?.(newCursorStart, newCursorEnd);
  });
  return nextValue;
}

/**
 * Handles Tab and Shift+Tab keydown events in the textarea to insert or remove 2-space indentation.
 */
export function handleTabIndentation(
  textarea: HTMLTextAreaElement,
  shiftKey: boolean,
): string {
  const value = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  if (start === end) {
    // Single cursor
    if (!shiftKey) {
      // Insert 2 spaces
      const nextValue = value.substring(0, start) + '  ' + value.substring(start);
      textarea.value = nextValue;
      scheduleCursorRestore(() => {
        textarea.focus?.();
        textarea.setSelectionRange?.(start + 2, start + 2);
      });
      return nextValue;
    } else {
      // Shift+Tab on single cursor: remove up to 2 spaces before cursor if any
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const leadingSpaces = value.substring(lineStart, start).match(/^ +/)?.[0] || '';
      if (leadingSpaces.length > 0) {
        const removeCount = Math.min(2, leadingSpaces.length);
        const nextValue =
          value.substring(0, lineStart) +
          value.substring(lineStart + removeCount);
        textarea.value = nextValue;
        scheduleCursorRestore(() => {
          textarea.focus?.();
          textarea.setSelectionRange?.(
            Math.max(lineStart, start - removeCount),
            Math.max(lineStart, start - removeCount),
          );
        });
        return nextValue;
      }
      return value;
    }
  } else {
    // Multi-line selection
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = value.indexOf('\n', end);
    const endBound = lineEnd === -1 ? value.length : lineEnd;
    const targetBlock = value.substring(lineStart, endBound);
    const lines = targetBlock.split('\n');

    let modifiedBlock = '';
    if (!shiftKey) {
      // Indent each line by 2 spaces
      modifiedBlock = lines.map((l) => '  ' + l).join('\n');
    } else {
      // Unindent each line by up to 2 spaces
      modifiedBlock = lines.map((l) => l.replace(/^ {1,2}/, '')).join('\n');
    }

    const nextValue =
      value.substring(0, lineStart) + modifiedBlock + value.substring(endBound);
    textarea.value = nextValue;
    scheduleCursorRestore(() => {
      textarea.focus?.();
      textarea.setSelectionRange?.(lineStart, lineStart + modifiedBlock.length);
    });
    return nextValue;
  }
}
