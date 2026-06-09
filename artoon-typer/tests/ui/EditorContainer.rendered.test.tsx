import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { EditorContainer } from '../../src/ui/components/EditorContainer';

const useEditorMock = vi.fn();

vi.mock('../../src/ui/hooks/useEditor', () => ({
  useEditor: (...args: unknown[]) => useEditorMock(...args),
}));

vi.mock('../../src/ui/components/StaticToolbar', () => ({
  StaticToolbar: ({ onAction }: { onAction: (action: 'undo' | 'redo') => void }) => (
    <div role="toolbar" aria-label="editor toolbar">
      <button type="button" onClick={() => onAction('undo')}>undo</button>
      <button type="button" onClick={() => onAction('redo')}>redo</button>
    </div>
  ),
}));

vi.mock('../../src/ui/components/AddMenu', () => ({ AddMenu: () => null }));
vi.mock('../../src/ui/components/BubbleMenu', () => ({ BubbleMenu: () => null }));
vi.mock('../../src/ui/components/ContextMenu', () => ({ ContextMenu: () => null }));
vi.mock('../../src/ui/components/LinkDialog', () => ({ LinkDialog: () => null }));
vi.mock('../../src/ui/components/StatusBar', () => ({ StatusBar: () => null }));
vi.mock('../../src/ui/components/BlockWrapper', () => ({
  BlockWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('../../src/ui/components/BlockRenderer', () => ({ BlockRenderer: () => null }));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  DragOverlay: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  KeyboardSensor: function KeyboardSensor() {},
  PointerSensor: function PointerSensor() {},
  closestCenter: vi.fn(),
  defaultDropAnimationSideEffects: vi.fn(() => vi.fn()),
  useSensor: vi.fn(() => ({})),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  arrayMove: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  verticalListSortingStrategy: vi.fn(),
}));

vi.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: vi.fn(),
  restrictToWindowEdges: vi.fn(),
}));

function createEditor() {
  const noop = vi.fn();

  return {
    blocks: [],
    focusedBlockId: null,
    selection: null,
    slashMenu: { isOpen: false, position: { top: 0, left: 0 } },
    blockMenu: { isOpen: false, position: { top: 0, left: 0 }, block: null },
    linkDialog: { isOpen: false, text: '' },
    hasTextSelection: false,
    activeMarks: [],
    selectionPosition: { top: 0, left: 0 },
    editorRef: { current: null },
    addBlock: noop,
    removeBlock: noop,
    updateBlock: noop,
    moveBlock: noop,
    focusBlock: noop,
    toggleBlockDirection: noop,
    openSlashMenu: noop,
    closeSlashMenu: vi.fn(),
    insertBlock: noop,
    openBlockMenu: noop,
    closeBlockMenu: vi.fn(),
    handleBlockAction: noop,
    toggleMark: vi.fn(),
    openLinkDialog: vi.fn(),
    closeLinkDialog: vi.fn(),
    insertLink: noop,
    createFirstBlock: noop,
    undo: vi.fn(),
    redo: vi.fn(),
    convertBlock: noop,
    insertRawBlock: noop,
  };
}

describe('EditorContainer rendered keyboard and toolbar behavior', () => {
  beforeEach(() => {
    useEditorMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ['b', 'bold'],
    ['i', 'italic'],
    ['u', 'underline'],
  ] as const)('maps Ctrl+%s to the %s mark and prevents browser behavior', (key, mark) => {
    const editor = createEditor();
    useEditorMock.mockReturnValue(editor);
    render(<EditorContainer />);

    const event = new KeyboardEvent('keydown', { key, ctrlKey: true, cancelable: true });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(editor.toggleMark).toHaveBeenCalledWith(mark);
  });

  it('opens the link dialog for Ctrl+K only when text is selected', () => {
    const editor = createEditor();
    useEditorMock.mockReturnValue(editor);
    vi.spyOn(window, 'getSelection')
      .mockReturnValueOnce({ isCollapsed: true } as Selection)
      .mockReturnValueOnce({ isCollapsed: false } as Selection);
    render(<EditorContainer />);

    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true });

    expect(editor.openLinkDialog).toHaveBeenCalledTimes(1);
  });

  it('closes all editor overlays on Escape', () => {
    const editor = createEditor();
    useEditorMock.mockReturnValue(editor);
    render(<EditorContainer />);

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(editor.closeSlashMenu).toHaveBeenCalledTimes(1);
    expect(editor.closeBlockMenu).toHaveBeenCalledTimes(1);
    expect(editor.closeLinkDialog).toHaveBeenCalledTimes(1);
  });

  it('routes rendered toolbar undo and redo actions through the editor', () => {
    const editor = createEditor();
    useEditorMock.mockReturnValue(editor);
    render(<EditorContainer />);

    fireEvent.click(screen.getByRole('button', { name: 'undo' }));
    fireEvent.click(screen.getByRole('button', { name: 'redo' }));

    expect(editor.undo).toHaveBeenCalledTimes(1);
    expect(editor.redo).toHaveBeenCalledTimes(1);
  });

  it('renders the configured writing direction and readonly state', () => {
    useEditorMock.mockReturnValue(createEditor());
    const { container } = render(<EditorContainer defaultDirection="ltr" readOnly />);

    expect(container.firstElementChild?.getAttribute('dir')).toBe('ltr');
    expect(container.firstElementChild?.getAttribute('data-readonly')).toBe('true');
  });
});
