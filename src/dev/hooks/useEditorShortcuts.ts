import { useEffect } from 'react';
import {
  applyMarkdownFormat,
  handleTabIndentation,
} from '../lib/markdown-actions';

export interface UseEditorShortcutsOptions {
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onSave?: () => void;
  onContentChange?: (nextBody: string) => void;
}

/**
 * Handles authoring keyboard shortcuts:
 * - Ctrl/Cmd + S: Save entry draft
 * - Ctrl/Cmd + B: Bold
 * - Ctrl/Cmd + I: Italic
 * - Ctrl/Cmd + K: Link
 * - Ctrl/Cmd + E: Inline Code
 * - Tab / Shift + Tab: 2-space indentation without losing focus
 */
export function useEditorShortcuts({
  textareaRef,
  onSave,
  onContentChange,
}: UseEditorShortcutsOptions): void {
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl+S or Cmd+S for quick save
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave?.();
      }
    };

    const textarea = textareaRef.current;
    const handleTextareaKeyDown = (e: KeyboardEvent) => {
      const isMod = e.ctrlKey || e.metaKey;

      if (e.key === 'Tab') {
        e.preventDefault();
        if (textarea && onContentChange) {
          const nextVal = handleTabIndentation(textarea, e.shiftKey);
          onContentChange(nextVal);
        }
        return;
      }

      if (isMod && textarea && onContentChange) {
        const key = e.key.toLowerCase();
        if (key === 'b') {
          e.preventDefault();
          const nextVal = applyMarkdownFormat(textarea, 'bold');
          onContentChange(nextVal);
        } else if (key === 'i') {
          e.preventDefault();
          const nextVal = applyMarkdownFormat(textarea, 'italic');
          onContentChange(nextVal);
        } else if (key === 'k') {
          e.preventDefault();
          const nextVal = applyMarkdownFormat(textarea, 'link');
          onContentChange(nextVal);
        } else if (key === 'e') {
          e.preventDefault();
          const nextVal = applyMarkdownFormat(textarea, 'code');
          onContentChange(nextVal);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    if (textarea) {
      textarea.addEventListener('keydown', handleTextareaKeyDown);
    }

    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
      if (textarea) {
        textarea.removeEventListener('keydown', handleTextareaKeyDown);
      }
    };
  }, [textareaRef, onSave, onContentChange]);
}
