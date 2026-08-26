/**
 * Desktop workbench state model for the local entry editor.
 *
 * Provides deterministic, pure state transitions across navigation,
 * metadata/body form editing, preview freshness, sidebar folding, and focus modes.
 *
 * Contains no React effects, fetches, or DOM behavior.
 */

export type WorkspacePane = 'split' | 'editor' | 'preview';

export type WorkspaceMode = 'idle' | 'edit' | 'create';

export interface EditorWorkspaceState<TPreview = unknown> {
  pane: WorkspacePane;
  sidebarCollapsed: boolean;
  metadataCollapsed: boolean;
  selectedSlug: string | null;
  mode: WorkspaceMode;
  dirty: boolean;
  preview: TPreview | null;
}

export type EditorWorkspaceAction<TPreview = unknown> =
  | { type: 'selectEntry'; slug: string }
  | { type: 'startNewEntry' }
  | { type: 'markDirty'; dirty?: boolean }
  | { type: 'markSaved'; slug?: string }
  | { type: 'setPreview'; preview?: TPreview | null; html?: string }
  | { type: 'expandEditor' }
  | { type: 'expandPreview' }
  | { type: 'restoreSplit' }
  | { type: 'setPane'; pane: WorkspacePane }
  | { type: 'toggleSidebar'; collapsed?: boolean }
  | { type: 'toggleMetadata'; collapsed?: boolean };

/**
 * Creates an initial desktop editor workspace state with optional property overrides.
 */
export function createWorkspaceState<TPreview = unknown>(
  overrides?: Partial<EditorWorkspaceState<TPreview>>,
): EditorWorkspaceState<TPreview> {
  return {
    pane: 'split',
    sidebarCollapsed: false,
    metadataCollapsed: true,
    selectedSlug: null,
    mode: 'idle',
    dirty: false,
    preview: null,
    ...overrides,
  };
}

/**
 * Deterministic desktop workbench state reducer.
 *
 * Preserves selection, form draft (dirty state), and preview during focus/pane changes.
 * Discarding or switching entry selection clears stale preview.
 */
export function reduceWorkspace<TPreview = unknown>(
  state: EditorWorkspaceState<TPreview>,
  action: EditorWorkspaceAction<TPreview>,
): EditorWorkspaceState<TPreview> {
  switch (action.type) {
    case 'selectEntry': {
      if (state.selectedSlug === action.slug && state.mode === 'edit') {
        return state;
      }
      return {
        ...state,
        selectedSlug: action.slug,
        mode: 'edit',
        preview: null,
        dirty: false,
      };
    }

    case 'startNewEntry': {
      return {
        ...state,
        selectedSlug: null,
        mode: 'create',
        preview: null,
        dirty: false,
        metadataCollapsed: false, // Auto-expand metadata for brand new entries
      };
    }

    case 'markDirty': {
      const isDirty = action.dirty !== undefined ? Boolean(action.dirty) : true;
      if (state.dirty === isDirty) {
        return state;
      }
      return {
        ...state,
        dirty: isDirty,
      };
    }

    case 'markSaved': {
      const nextSlug = action.slug !== undefined ? action.slug : state.selectedSlug;
      return {
        ...state,
        selectedSlug: nextSlug,
        mode: nextSlug !== null ? 'edit' : state.mode,
        dirty: false,
      };
    }

    case 'setPreview': {
      if (!('preview' in action) && !('html' in action)) {
        return state;
      }
      let nextPreview: TPreview | null = null;
      if ('preview' in action && action.preview !== undefined) {
        nextPreview = action.preview;
      } else if ('html' in action && action.html !== undefined) {
        nextPreview = { html: action.html } as unknown as TPreview;
      }

      return {
        ...state,
        preview: nextPreview,
      };
    }

    case 'expandEditor': {
      if (state.pane === 'editor') {
        return state;
      }
      return {
        ...state,
        pane: 'editor',
      };
    }

    case 'expandPreview': {
      if (state.pane === 'preview') {
        return state;
      }
      return {
        ...state,
        pane: 'preview',
      };
    }

    case 'restoreSplit': {
      if (state.pane === 'split') {
        return state;
      }
      return {
        ...state,
        pane: 'split',
      };
    }

    case 'setPane': {
      if (state.pane === action.pane) {
        return state;
      }
      return {
        ...state,
        pane: action.pane,
      };
    }

    case 'toggleSidebar': {
      const nextCollapsed =
        action.collapsed !== undefined
          ? Boolean(action.collapsed)
          : !state.sidebarCollapsed;
      if (state.sidebarCollapsed === nextCollapsed) {
        return state;
      }
      return {
        ...state,
        sidebarCollapsed: nextCollapsed,
      };
    }

    case 'toggleMetadata': {
      const nextCollapsed =
        action.collapsed !== undefined
          ? Boolean(action.collapsed)
          : !state.metadataCollapsed;
      if (state.metadataCollapsed === nextCollapsed) {
        return state;
      }
      return {
        ...state,
        metadataCollapsed: nextCollapsed,
      };
    }

    default: {
      const _exhaustive: never = action;
      return state;
    }
  }
}
