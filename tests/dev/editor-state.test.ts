import { describe, expect, it } from 'vitest';
import {
  createWorkspaceState,
  reduceWorkspace,
  type EditorWorkspaceAction,
  type EditorWorkspaceState,
} from '../../src/dev/editor-state';

describe('Editor Workspace State', () => {
  describe('createWorkspaceState', () => {
    it('creates a default initial state with split pane, idle mode, and null selection', () => {
      const state = createWorkspaceState();

      expect(state).toEqual({
        pane: 'split',
        selectedSlug: null,
        mode: 'idle',
        dirty: false,
        preview: null,
      });
    });

    it('accepts partial initial state overrides', () => {
      const state = createWorkspaceState({
        pane: 'editor',
        selectedSlug: 'my-note',
        mode: 'edit',
        dirty: true,
        preview: { html: '<p>Hi</p>' },
      });

      expect(state).toEqual({
        pane: 'editor',
        selectedSlug: 'my-note',
        mode: 'edit',
        dirty: true,
        preview: { html: '<p>Hi</p>' },
      });
    });
  });

  describe('Focus mode and pane transitions (lossless focus changes)', () => {
    it('satisfies the brief acceptance contract for selection, expandEditor, expandPreview, and restoreSplit', () => {
      const selected = reduceWorkspace(createWorkspaceState(), {
        type: 'selectEntry',
        slug: 'existing-note',
      });
      expect(selected).toMatchObject({
        pane: 'split',
        selectedSlug: 'existing-note',
        mode: 'edit',
      });

      expect(
        reduceWorkspace(selected, { type: 'expandEditor' }),
      ).toMatchObject({
        pane: 'editor',
        selectedSlug: 'existing-note',
      });

      expect(
        reduceWorkspace(selected, { type: 'expandPreview' }),
      ).toMatchObject({
        pane: 'preview',
        selectedSlug: 'existing-note',
      });

      expect(
        reduceWorkspace({ ...selected, dirty: true }, { type: 'restoreSplit' }),
      ).toMatchObject({
        pane: 'split',
        dirty: true,
        selectedSlug: 'existing-note',
      });
    });

    it('preserves dirty draft state, selected slug, and preview when toggling between pane modes', () => {
      const state: EditorWorkspaceState = {
        pane: 'split',
        selectedSlug: 'active-slug',
        mode: 'edit',
        dirty: true,
        preview: { html: '<h1>Rendered</h1>' },
      };

      const expandedEditor = reduceWorkspace(state, { type: 'expandEditor' });
      expect(expandedEditor).toEqual({
        pane: 'editor',
        selectedSlug: 'active-slug',
        mode: 'edit',
        dirty: true,
        preview: { html: '<h1>Rendered</h1>' },
      });

      const expandedPreview = reduceWorkspace(expandedEditor, {
        type: 'expandPreview',
      });
      expect(expandedPreview).toEqual({
        pane: 'preview',
        selectedSlug: 'active-slug',
        mode: 'edit',
        dirty: true,
        preview: { html: '<h1>Rendered</h1>' },
      });

      const restored = reduceWorkspace(expandedPreview, {
        type: 'restoreSplit',
      });
      expect(restored).toEqual({
        pane: 'split',
        selectedSlug: 'active-slug',
        mode: 'edit',
        dirty: true,
        preview: { html: '<h1>Rendered</h1>' },
      });
    });
  });

  describe('selectEntry action', () => {
    it('sets selected slug, switches mode to edit, and keeps pane mode', () => {
      const initial = createWorkspaceState({ pane: 'editor' });
      const next = reduceWorkspace(initial, {
        type: 'selectEntry',
        slug: 'entry-a',
      });

      expect(next).toMatchObject({
        pane: 'editor',
        selectedSlug: 'entry-a',
        mode: 'edit',
        dirty: false,
        preview: null,
      });
    });

    it('clears stale preview and resets dirty state when selecting a different entry', () => {
      const state: EditorWorkspaceState = {
        pane: 'split',
        selectedSlug: 'entry-a',
        mode: 'edit',
        dirty: true,
        preview: { html: '<div>Old preview</div>' },
      };

      const next = reduceWorkspace(state, {
        type: 'selectEntry',
        slug: 'entry-b',
      });

      expect(next.selectedSlug).toBe('entry-b');
      expect(next.preview).toBeNull();
      expect(next.dirty).toBe(false);
    });

    it('retains current preview and dirty state if re-selecting the exact same slug', () => {
      const state: EditorWorkspaceState = {
        pane: 'split',
        selectedSlug: 'entry-a',
        mode: 'edit',
        dirty: true,
        preview: { html: '<div>Existing preview</div>' },
      };

      const next = reduceWorkspace(state, {
        type: 'selectEntry',
        slug: 'entry-a',
      });

      expect(next.selectedSlug).toBe('entry-a');
      expect(next.preview).toEqual({ html: '<div>Existing preview</div>' });
      expect(next.dirty).toBe(true);
    });
  });

  describe('startNewEntry action', () => {
    it('clears selectedSlug, switches mode to create, resets dirty, and clears preview', () => {
      const state: EditorWorkspaceState = {
        pane: 'editor',
        selectedSlug: 'existing-slug',
        mode: 'edit',
        dirty: true,
        preview: { html: '<div>Preview</div>' },
      };

      const next = reduceWorkspace(state, { type: 'startNewEntry' });

      expect(next).toEqual({
        pane: 'editor',
        selectedSlug: null,
        mode: 'create',
        dirty: false,
        preview: null,
      });
    });
  });

  describe('markDirty action', () => {
    it('marks workspace state as dirty', () => {
      const state = createWorkspaceState({ dirty: false });
      const next = reduceWorkspace(state, { type: 'markDirty' });

      expect(next.dirty).toBe(true);
    });

    it('allows setting explicit dirty boolean value', () => {
      const dirtyState = createWorkspaceState({ dirty: true });
      const cleaned = reduceWorkspace(dirtyState, {
        type: 'markDirty',
        dirty: false,
      });
      expect(cleaned.dirty).toBe(false);

      const redirtied = reduceWorkspace(cleaned, {
        type: 'markDirty',
        dirty: true,
      });
      expect(redirtied.dirty).toBe(true);
    });

    it('preserves all other state properties when changing dirty flag', () => {
      const state: EditorWorkspaceState = {
        pane: 'preview',
        selectedSlug: 'note-1',
        mode: 'edit',
        dirty: false,
        preview: { html: 'preview content' },
      };

      const next = reduceWorkspace(state, { type: 'markDirty' });

      expect(next).toEqual({
        pane: 'preview',
        selectedSlug: 'note-1',
        mode: 'edit',
        dirty: true,
        preview: { html: 'preview content' },
      });
    });
  });

  describe('markSaved action', () => {
    it('clears only dirty state while preserving current preview and pane', () => {
      const state: EditorWorkspaceState = {
        pane: 'preview',
        selectedSlug: 'note-1',
        mode: 'edit',
        dirty: true,
        preview: { html: '<h3>Fresh preview</h3>' },
      };

      const next = reduceWorkspace(state, { type: 'markSaved' });

      expect(next).toEqual({
        pane: 'preview',
        selectedSlug: 'note-1',
        mode: 'edit',
        dirty: false,
        preview: { html: '<h3>Fresh preview</h3>' },
      });
    });

    it('updates selectedSlug and mode to edit if a new slug is returned after saving a newly created entry', () => {
      const state: EditorWorkspaceState = {
        pane: 'split',
        selectedSlug: null,
        mode: 'create',
        dirty: true,
        preview: { html: '<h3>New note</h3>' },
      };

      const next = reduceWorkspace(state, {
        type: 'markSaved',
        slug: 'newly-created-note',
      });

      expect(next).toEqual({
        pane: 'split',
        selectedSlug: 'newly-created-note',
        mode: 'edit',
        dirty: false,
        preview: { html: '<h3>New note</h3>' },
      });
    });
  });

  describe('setPreview action', () => {
    it('updates preview payload with object data without affecting other state', () => {
      const state: EditorWorkspaceState = {
        pane: 'split',
        selectedSlug: 'slug-x',
        mode: 'edit',
        dirty: true,
        preview: null,
      };

      const previewData = {
        html: '<p>Rendered Markdown</p>',
        title: 'Slug X',
        summary: 'Summary',
      };

      const next = reduceWorkspace(state, {
        type: 'setPreview',
        preview: previewData,
      });

      expect(next).toEqual({
        pane: 'split',
        selectedSlug: 'slug-x',
        mode: 'edit',
        dirty: true,
        preview: previewData,
      });
    });

    it('supports html property in setPreview action', () => {
      const state = createWorkspaceState();
      const next = reduceWorkspace(state, {
        type: 'setPreview',
        html: '<p>HTML content</p>',
      });

      expect(next.preview).toEqual({ html: '<p>HTML content</p>' });
    });

    it('allows clearing preview explicitly by setting preview to null', () => {
      const state = createWorkspaceState({
        preview: { html: '<p>Existing</p>' },
      });

      const next = reduceWorkspace(state, {
        type: 'setPreview',
        preview: null,
      });

      expect(next.preview).toBeNull();
    });

    it('acts as a no-op and preserves existing preview if neither preview nor html is provided', () => {
      const state: EditorWorkspaceState = {
        pane: 'split',
        selectedSlug: 'slug-x',
        mode: 'edit',
        dirty: true,
        preview: { html: '<p>Preserved preview</p>' },
      };

      const next = reduceWorkspace(state, {
        type: 'setPreview',
      });

      expect(next).toBe(state);
      expect(next.preview).toEqual({ html: '<p>Preserved preview</p>' });
    });
  });

  describe('Immutability and safety', () => {
    it('does not mutate the original state object', () => {
      const state = Object.freeze(
        createWorkspaceState({
          selectedSlug: 'immutable-slug',
          dirty: true,
        }),
      );

      expect(() => {
        reduceWorkspace(state, { type: 'expandEditor' });
      }).not.toThrow();

      expect(() => {
        reduceWorkspace(state, { type: 'markSaved' });
      }).not.toThrow();

      expect(() => {
        reduceWorkspace(state, { type: 'selectEntry', slug: 'another-slug' });
      }).not.toThrow();
    });

    it('returns the same or unchanged state on unhandled action types at runtime', () => {
      const state = createWorkspaceState();
      const unknownAction = { type: 'unknownAction' } as unknown as EditorWorkspaceAction;

      const next = reduceWorkspace(state, unknownAction);
      expect(next).toEqual(state);
    });
  });
});
