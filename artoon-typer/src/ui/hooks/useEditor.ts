/**
 * useEditor Hook
 * 
 * Main hook for managing editor state and operations.
 * Provides a clean API for React components to interact with the editor.
 */

import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { EditorController, createEditorController } from '../../core/EditorControllerV2';
import { ARTOONImporter, createARTOONImporter } from '../../integration/ARTOONImporter';
import { ARTOONExporter, createARTOONExporter } from '../../integration/ARTOONExporter';
import { getDefaultRegistry } from '../../core/BlockRegistry';
import { MarkManager, createMarkManager } from '../../inline/MarkManager';
import { SelectionManager, createSelectionManager } from '../../core/SelectionManager';
import type { InlineContent as ASTInlineContent } from '@artoon/ast';
import type {
  Block,
  BlockType,
  Direction,
  SelectionState,
  Modifier,
  InlineContent,
  MarkType,
  TextBlock,
  ListBlock,
  TableBlock,
} from '../../types';
import { MARK_TO_MODIFIER, MODIFIER_TO_MARK } from '../../types';

/**
 * Editor hook options
 */
export interface UseEditorOptions {
  /** Initial ARTOON content */
  initialContent?: string;
  /** Initial blocks (alternative to initialContent) */
  initialBlocks?: Block[];
  /** Default text direction */
  defaultDirection?: Direction;
  /** Read-only mode */
  readOnly?: boolean;
  /** Callback when content changes */
  onChange?: (content: string) => void;
  /** Callback when blocks change */
  onBlocksChange?: (blocks: Block[]) => void;
}

/**
 * Slash menu state
 */
export interface SlashMenuState {
  isOpen: boolean;
  position: { top: number; left: number };
  filter: string;
  blockId: string | null;
}

/**
 * Block menu state
 */
export interface BlockMenuState {
  isOpen: boolean;
  position: { top: number; left: number };
  block: Block | null;
}

/**
 * Link dialog state
 */
export interface LinkDialogState {
  isOpen: boolean;
  url: string;
  text: string;
}

/**
 * Editor hook return type
 */
export interface UseEditorReturn {
  // State
  blocks: Block[];
  focusedBlockId: string | null;
  selection: SelectionState | null;
  canUndo: boolean;
  canRedo: boolean;
  hasTextSelection: boolean;
  activeMarks: MarkType[];
  selectionPosition: { top: number; left: number };

  // Menu states
  slashMenu: SlashMenuState;
  blockMenu: BlockMenuState;
  linkDialog: LinkDialogState;

  // Block operations
  addBlock: (type: BlockType, index?: number) => Block;
  removeBlock: (id: string) => void;
  updateBlock: (id: string, updates: Partial<Block>) => void;
  moveBlock: (id: string, newIndex: number) => void;
  duplicateBlock: (id: string) => Block | null;
  convertBlock: (id: string, newType: BlockType) => void;
  insertRawBlock: (block: Block, index?: number) => void;

  // Focus operations
  focusBlock: (id: string) => void;
  focusNextBlock: () => void;
  focusPreviousBlock: () => void;

  // History operations
  undo: () => void;
  redo: () => void;

  // Selection operations
  setSelection: (selection: SelectionState) => void;
  clearSelection: () => void;

  // Mark operations
  toggleMark: (mark: MarkType) => void;
  applyMark: (mark: MarkType) => void;
  removeMark: (mark: MarkType) => void;

  // Slash menu operations
  openSlashMenu: (position: { top: number; left: number }, blockId: string) => void;
  closeSlashMenu: () => void;
  setSlashMenuFilter: (filter: string) => void;
  insertBlock: (type: BlockType) => void;

  // Block menu operations
  openBlockMenu: (position: { top: number; left: number }, block: Block) => void;
  closeBlockMenu: () => void;
  handleBlockAction: (action: BlockAction) => void;

  // Link dialog operations
  openLinkDialog: () => void;
  closeLinkDialog: () => void;
  insertLink: (url: string, text: string) => void;

  // Drag operations
  startDrag: (blockId: string) => void;
  endDrag: () => void;
  handleDrop: (targetIndex: number) => void;

  // Direction operations
  toggleBlockDirection: (id: string) => void;

  // Content operations
  getContent: () => string;
  setContent: (content: string) => void;
  createFirstBlock: () => void;

  // Refs
  editorRef: React.RefObject<HTMLDivElement>;
}

/**
 * Block action type
 */
export type BlockAction =
  | { type: 'delete' }
  | { type: 'duplicate' }
  | { type: 'move-up' }
  | { type: 'move-down' }
  | { type: 'convert'; to: BlockType }
  | { type: 'copy' }
  | { type: 'cut' };

/**
 * useEditor hook
 */
export function useEditor(options: UseEditorOptions = {}): UseEditorReturn {
  const {
    initialContent = '',
    initialBlocks,
    defaultDirection = 'rtl',
    readOnly = false,
    onChange,
    onBlocksChange,
  } = options;

  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<EditorController | null>(null);
  const importerRef = useRef<ARTOONImporter | null>(null);
  const exporterRef = useRef<ARTOONExporter | null>(null);
  const draggedBlockIdRef = useRef<string | null>(null);

  // Initialize controller
  if (!controllerRef.current) {
    const hasInitialBlocks = !!initialBlocks && initialBlocks.length > 0;
    controllerRef.current = createEditorController({
      defaultDirection,
      initialBlocks: hasInitialBlocks ? initialBlocks : undefined,
      initialContent: hasInitialBlocks ? undefined : initialContent,
    });
    importerRef.current = createARTOONImporter({ defaultDirection });
    exporterRef.current = createARTOONExporter();
  }

  const controller = controllerRef.current;
  const importer = importerRef.current!;
  const exporter = exporterRef.current!;

  // State
  const [blocks, setBlocks] = useState<Block[]>(controller.getBlocks());
  const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
  const [selection, setSelectionState] = useState<SelectionState | null>(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [activeMarks, setActiveMarks] = useState<MarkType[]>([]);
  const [selectionPosition, setSelectionPosition] = useState({ top: 0, left: 0 });
  const [hasTextSelection, setHasTextSelection] = useState(false);

  // Menu states
  const [slashMenu, setSlashMenu] = useState<SlashMenuState>({
    isOpen: false,
    position: { top: 0, left: 0 },
    filter: '',
    blockId: null,
  });

  const [blockMenu, setBlockMenu] = useState<BlockMenuState>({
    isOpen: false,
    position: { top: 0, left: 0 },
    block: null,
  });

  const [linkDialog, setLinkDialog] = useState<LinkDialogState>({
    isOpen: false,
    url: '',
    text: '',
  });

  // Save selection before opening dialog (to prevent losing it when clicking on dialog inputs)
  const [savedSelection, setSavedSelection] = useState<SelectionState | null>(null);

  // Sync state with controller
  const syncState = useCallback(() => {
    const newBlocks = controller.getBlocks();
    setBlocks(newBlocks);
    setCanUndo(controller.canUndo());
    setCanRedo(controller.canRedo());

    if (onChange) {
      const content = exporter.export(newBlocks);
      onChange(content);
    }

    if (onBlocksChange) {
      onBlocksChange(newBlocks);
    }
  }, [controller, exporter, onChange, onBlocksChange]);

  // Initialize managers
  const markManager = useRef(createMarkManager()).current;
  const selectionManager = useRef(createSelectionManager()).current;

  // Update activeMarks on selection change + sync selection to EditorState
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = selectionManager.getSelection();
      if (!selection) return;

      // Sync DOM selection to EditorState via controller
      controller.setSelection(selection);

      if (selection.isCollapsed) {
        // No selection - keep current activeMarks for typing
        return;
      }

      const block = blocks.find(b => b.id === selection.blockId);
      if (!block) {
        setActiveMarks([]);
        return;
      }

      const textBlock = block as TextBlock;
      if (!textBlock.content || !Array.isArray(textBlock.content)) {
        setActiveMarks([]);
        return;
      }

      // Get active marks at selection start
      const marks = markManager.getActiveMarks(textBlock.content, selection.anchorOffset);
      setActiveMarks(marks);
      setHasTextSelection(true);
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [blocks, markManager, selectionManager, controller]);

  // Block operations
  const addBlock = useCallback((type: BlockType, index?: number): Block => {
    // Use BlockRegistry to create blocks - ensures all 28 block types work
    const registry = getDefaultRegistry();
    const block: Block = registry.create(type);

    // Override direction if needed
    if (options.defaultDirection && block.direction !== options.defaultDirection) {
      block.direction = options.defaultDirection;
    }

    controller.addBlock(block, index);
    syncState();
    return block;
  }, [controller, syncState, options.defaultDirection]);

  const insertRawBlock = useCallback((block: Block, index?: number) => {
    controller.addBlock(block, index);
    syncState();
  }, [controller, syncState]);

  const removeBlock = useCallback((id: string) => {
    if (readOnly) return;
    controller.removeBlock(id);
    syncState();
  }, [controller, readOnly, syncState]);

  const updateBlock = useCallback((id: string, updates: Partial<Block>) => {
    if (readOnly) return;

    controller.updateBlock(id, updates);

    // Force React re-render
    const newBlocks = controller.getBlocks().map(b => ({ ...b }));
    setBlocks(newBlocks);

    // CRITICAL: Call syncState to trigger onChange
    syncState();
  }, [controller, readOnly, syncState]);

  const moveBlock = useCallback((id: string, newIndex: number) => {
    if (readOnly) return;
    controller.moveBlock(id, newIndex);
    syncState();
  }, [controller, readOnly, syncState]);

  const duplicateBlock = useCallback((id: string): Block | null => {
    if (readOnly) return null;
    const block = controller.duplicateBlock(id);
    syncState();
    return block || null;
  }, [controller, readOnly, syncState]);

  const convertBlock = useCallback((id: string, newType: BlockType) => {
    if (readOnly) return;
    controller.convertBlock(id, newType);
    syncState();
  }, [controller, readOnly, syncState]);

  // Focus operations
  const focusBlock = useCallback((id: string) => {
    setFocusedBlockId(id);
    controller.focusBlock(id);
  }, [controller]);

  const focusNextBlock = useCallback(() => {
    const currentIndex = blocks.findIndex(b => b.id === focusedBlockId);
    if (currentIndex < blocks.length - 1) {
      focusBlock(blocks[currentIndex + 1].id);
    }
  }, [blocks, focusedBlockId, focusBlock]);

  const focusPreviousBlock = useCallback(() => {
    const currentIndex = blocks.findIndex(b => b.id === focusedBlockId);
    if (currentIndex > 0) {
      focusBlock(blocks[currentIndex - 1].id);
    }
  }, [blocks, focusedBlockId, focusBlock]);

  // History operations
  const undo = useCallback(() => {
    controller.undo();
    syncState();
  }, [controller, syncState]);

  const redo = useCallback(() => {
    controller.redo();
    syncState();
  }, [controller, syncState]);

  // Selection operations
  const setSelection = useCallback((sel: SelectionState) => {
    setSelectionState(sel);
    setHasTextSelection(!sel.isCollapsed);
    // Sync to EditorState via controller
    controller.setSelection(sel);
  }, [controller]);

  const clearSelection = useCallback(() => {
    setSelectionState(null);
    setHasTextSelection(false);
    controller.clearSelection();
  }, [controller]);

  // Mark operations
  const toggleMark = useCallback((mark: MarkType) => {
    // 1. Get current selection
    const selection = selectionManager.getSelection();

    if (!selection || selection.isCollapsed) {
      // No selection - just update activeMarks for future typing
      if (activeMarks.includes(mark)) {
        setActiveMarks(activeMarks.filter(m => m !== mark));
      } else {
        setActiveMarks([...activeMarks, mark]);
      }
      return;
    }

    // 2. Get the block
    const block = blocks.find(b => b.id === selection.blockId);

    if (!block) {
      return;
    }

    // 3. Handle different block types
    let content: readonly InlineContent[] | null = null;
    let updatePath: string[] = [];

    // Check if it's a text block (paragraph, heading, quote)
    const textBlock = block as TextBlock;
    if (textBlock.content && Array.isArray(textBlock.content)) {
      content = textBlock.content;
      updatePath = ['content'];
    }
    // Check if it's a list block
    else if (block.type === 'list' || block.type === 'bullet-list' || block.type === 'numbered-list') {
      const listBlock = block as ListBlock;
      const itemIndex = selectionManager.findListItemIndex(selection.blockId);

      if (listBlock.items && listBlock.items[itemIndex]) {
        content = listBlock.items[itemIndex].content;
        updatePath = ['items', itemIndex.toString(), 'content'];
      }
    }
    // Check if it's a table block
    else if (block.type === 'table') {
      const tableBlock = block as TableBlock;
      const { rowIndex, cellIndex } = selectionManager.findTableCellIndex(selection.blockId);

      if (tableBlock.rows && tableBlock.rows[rowIndex]?.cells[cellIndex]) {
        content = tableBlock.rows[rowIndex].cells[cellIndex].content;
        updatePath = ['rows', rowIndex.toString(), 'cells', cellIndex.toString(), 'content'];
      }
    }

    if (!content) {
      return;
    }

    // 4. Trim selection - remove leading/trailing spaces
    let trimmedFrom = selection.anchorOffset;
    let trimmedTo = selection.focusOffset;

    // Get the text content to check for spaces
    const getText = (content: readonly InlineContent[]): string => {
      return content.map(item => {
        if (item.type === 'plain') return item.value;
        return ''; // Components don't contribute to text for trimming
      }).join('');
    };

    const textContent = getText(content);

    // Trim leading spaces
    while (trimmedFrom < trimmedTo && textContent[trimmedFrom] === ' ') {
      trimmedFrom++;
    }

    // Trim trailing spaces
    while (trimmedTo > trimmedFrom && textContent[trimmedTo - 1] === ' ') {
      trimmedTo--;
    }

    // If selection is only spaces, don't apply formatting
    if (trimmedFrom >= trimmedTo) {
      return;
    }

    // 5. Apply formatting using MarkManager
    const newContent = markManager.toggleMark(
      content,
      trimmedFrom,
      trimmedTo,
      mark
    );

    // 5. Update the block with the new content
    // For simple blocks (paragraph, heading, quote)
    if (updatePath.length === 1 && updatePath[0] === 'content') {
      updateBlock(selection.blockId, { content: newContent } as Partial<Block>);
    }
    // For list blocks - update the specific item
    else if (block.type === 'list' || block.type === 'bullet-list' || block.type === 'numbered-list') {
      const listBlock = { ...block } as ListBlock;
      const itemIndex = parseInt(updatePath[1]);
      if (listBlock.items && listBlock.items[itemIndex]) {
        listBlock.items = [...listBlock.items];
        listBlock.items[itemIndex] = { ...listBlock.items[itemIndex], content: newContent };
        updateBlock(selection.blockId, listBlock as Partial<Block>);
      }
    }
    // For table blocks - update the specific cell
    else if (block.type === 'table') {
      const tableBlock = { ...block } as TableBlock;
      const rowIndex = parseInt(updatePath[1]);
      const cellIndex = parseInt(updatePath[3]);
      if (tableBlock.rows && tableBlock.rows[rowIndex]?.cells[cellIndex]) {
        tableBlock.rows = [...tableBlock.rows];
        tableBlock.rows[rowIndex] = { ...tableBlock.rows[rowIndex] };
        tableBlock.rows[rowIndex].cells = [...tableBlock.rows[rowIndex].cells];
        tableBlock.rows[rowIndex].cells[cellIndex] = {
          ...tableBlock.rows[rowIndex].cells[cellIndex],
          content: newContent
        };
        updateBlock(selection.blockId, tableBlock as Partial<Block>);
      }
    }

    // 6. Update activeMarks based on new content
    const newActiveMarks = markManager.getActiveMarks(newContent, trimmedFrom);
    setActiveMarks(newActiveMarks);
  }, [blocks, activeMarks, updateBlock, markManager, selectionManager]);

  const applyMark = useCallback((mark: MarkType) => {
    const selection = selectionManager.getSelection();
    if (!selection || selection.isCollapsed) {
      if (!activeMarks.includes(mark)) {
        setActiveMarks([...activeMarks, mark]);
      }
      return;
    }

    const block = blocks.find(b => b.id === selection.blockId);
    if (!block) return;

    const textBlock = block as TextBlock;
    if (!textBlock.content || !Array.isArray(textBlock.content)) {
      return;
    }

    const newContent = markManager.applyMark(
      textBlock.content,
      selection.anchorOffset,
      selection.focusOffset,
      mark
    );

    updateBlock(selection.blockId, { content: newContent } as Partial<Block>);

    const newActiveMarks = markManager.getActiveMarks(newContent, selection.anchorOffset);
    setActiveMarks(newActiveMarks);
  }, [blocks, activeMarks, updateBlock]);

  const removeMark = useCallback((mark: MarkType) => {
    const selection = selectionManager.getSelection();
    if (!selection || selection.isCollapsed) {
      setActiveMarks(activeMarks.filter(m => m !== mark));
      return;
    }

    const block = blocks.find(b => b.id === selection.blockId);
    if (!block) return;

    const textBlock = block as TextBlock;
    if (!textBlock.content || !Array.isArray(textBlock.content)) {
      return;
    }

    const newContent = markManager.removeMark(
      textBlock.content,
      selection.anchorOffset,
      selection.focusOffset,
      mark
    );

    updateBlock(selection.blockId, { content: newContent } as Partial<Block>);

    const newActiveMarks = markManager.getActiveMarks(newContent, selection.anchorOffset);
    setActiveMarks(newActiveMarks);
  }, [blocks, activeMarks, updateBlock]);

  // Slash menu operations
  const openSlashMenu = useCallback((position: { top: number; left: number }, blockId: string) => {
    setSlashMenu({
      isOpen: true,
      position,
      filter: '',
      blockId,
    });
  }, []);

  const closeSlashMenu = useCallback(() => {
    setSlashMenu(prev => ({ ...prev, isOpen: false, filter: '' }));
  }, []);

  const setSlashMenuFilter = useCallback((filter: string) => {
    setSlashMenu(prev => ({ ...prev, filter }));
  }, []);

  const insertBlock = useCallback((type: BlockType) => {
    if (slashMenu.blockId) {
      const currentIndex = blocks.findIndex(b => b.id === slashMenu.blockId);
      const newBlock = addBlock(type, currentIndex + 1);
      focusBlock(newBlock.id);
    } else {
      const newBlock = addBlock(type);
      focusBlock(newBlock.id);
    }
    closeSlashMenu();
  }, [slashMenu.blockId, blocks, addBlock, focusBlock, closeSlashMenu]);

  // Block menu operations
  const openBlockMenu = useCallback((position: { top: number; left: number }, block: Block) => {
    setBlockMenu({
      isOpen: true,
      position,
      block,
    });
  }, []);

  const closeBlockMenu = useCallback(() => {
    setBlockMenu(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleBlockAction = useCallback((action: BlockAction) => {
    if (!blockMenu.block) return;

    const blockId = blockMenu.block.id;
    const currentIndex = blocks.findIndex(b => b.id === blockId);

    switch (action.type) {
      case 'delete':
        removeBlock(blockId);
        break;
      case 'duplicate':
        duplicateBlock(blockId);
        break;
      case 'copy': {
        const b = blockMenu.block as any;
        let text = '';
        if (typeof b.code === 'string') text = b.code;
        else if (typeof b.content === 'string') text = b.content;
        else if (Array.isArray(b.content)) text = b.content.map((c: any) => c.text || c.content || '').join('');
        if (text && navigator.clipboard) navigator.clipboard.writeText(text).catch(console.error);
        break;
      }
      case 'cut': {
        const b = blockMenu.block as any;
        let text = '';
        if (typeof b.code === 'string') text = b.code;
        else if (typeof b.content === 'string') text = b.content;
        else if (Array.isArray(b.content)) text = b.content.map((c: any) => c.text || c.content || '').join('');
        if (text && navigator.clipboard) navigator.clipboard.writeText(text).catch(console.error);
        removeBlock(blockId);
        break;
      }
      case 'move-up':
        if (currentIndex > 0) {
          moveBlock(blockId, currentIndex - 1);
        }
        break;
      case 'move-down':
        if (currentIndex < blocks.length - 1) {
          moveBlock(blockId, currentIndex + 2); // Pass currentIndex + 2 to compensate for internal index shift
        }
        break;
      case 'convert':
        convertBlock(blockId, action.to);
        break;
    }

    closeBlockMenu();
  }, [blockMenu.block, blocks, removeBlock, duplicateBlock, moveBlock, convertBlock, closeBlockMenu]);

  // Link dialog operations
  const openLinkDialog = useCallback(() => {
    // CRITICAL: Save selection BEFORE opening dialog
    const currentSelection = selectionManager.getSelection();

    if (!currentSelection) {
      return;
    }

    setSavedSelection(currentSelection);

    // Get selected text
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim() || '';

    setLinkDialog({
      isOpen: true,
      url: '',
      text: selectedText,
    });
  }, [selectionManager]);

  const closeLinkDialog = useCallback(() => {
    setLinkDialog(prev => ({ ...prev, isOpen: false }));
  }, []);

  const insertLink = useCallback((url: string, text: string) => {
    // Use SAVED selection (not current selection)
    const selection = savedSelection;

    if (!selection) {
      closeLinkDialog();
      return;
    }

    // Get the block
    const block = blocks.find(b => b.id === selection.blockId);

    if (!block) {
      closeLinkDialog();
      return;
    }

    // Get content based on block type
    let content: readonly InlineContent[] | null = null;
    let updatePath: string[] = [];

    const textBlock = block as TextBlock;
    if (textBlock.content && Array.isArray(textBlock.content)) {
      content = textBlock.content;
      updatePath = ['content'];
    } else if (block.type === 'list' || block.type === 'bullet-list' || block.type === 'numbered-list') {
      const listBlock = block as ListBlock;
      const itemIndex = selectionManager.findListItemIndex(selection.blockId);
      if (listBlock.items && listBlock.items[itemIndex]) {
        content = listBlock.items[itemIndex].content;
        updatePath = ['items', itemIndex.toString(), 'content'];
      }
    } else if (block.type === 'table') {
      const tableBlock = block as TableBlock;
      const { rowIndex, cellIndex } = selectionManager.findTableCellIndex(selection.blockId);
      if (tableBlock.rows && tableBlock.rows[rowIndex]?.cells[cellIndex]) {
        content = tableBlock.rows[rowIndex].cells[cellIndex].content;
        updatePath = ['rows', rowIndex.toString(), 'cells', cellIndex.toString(), 'content'];
      }
    }

    if (!content) {
      closeLinkDialog();
      return;
    }

    // CRITICAL: Trim selection - remove leading/trailing spaces
    let trimmedFrom = selection.anchorOffset;
    let trimmedTo = selection.focusOffset;

    // Get the text content to check for spaces
    const getText = (content: readonly InlineContent[]): string => {
      return content.map(item => {
        if (item.type === 'plain') return item.value;
        return ''; // Components don't contribute to text for trimming
      }).join('');
    };

    const textContent = getText(content);

    // Trim leading spaces
    while (trimmedFrom < trimmedTo && textContent[trimmedFrom] === ' ') {
      trimmedFrom++;
    }

    // Trim trailing spaces
    while (trimmedTo > trimmedFrom && textContent[trimmedTo - 1] === ' ') {
      trimmedTo--;
    }

    // If selection is only spaces, don't apply link
    if (trimmedFrom >= trimmedTo) {
      closeLinkDialog();
      return;
    }

    // Create link component
    // IMPORTANT: Use 'url' and 'text' in attributes (not 'href')
    // This matches what ARTOONSerializer expects
    // According to Core Invariants 11-INLINE-COMPONENT-ATTRIBUTES.md:
    // Links support only: [a:: url; text]
    const linkComponent: ASTInlineContent = {
      type: 'inline',
      component: 'a',
      attributes: { url },
      value: text,
      modifiers: [],
    };
    // Insert link at TRIMMED selection using PUBLIC API
    const flat = markManager.flattenContent(content);
    // Use trimmed positions instead of original selection
    flat.splice(trimmedFrom, trimmedTo - trimmedFrom);
    flat.splice(trimmedFrom, 0, {
      char: '\uFFFC',
      modifiers: [],
      component: linkComponent,
    });

    const newContent = markManager.rebuildContent(flat);

    // Update block
    if (updatePath.length === 1 && updatePath[0] === 'content') {
      updateBlock(selection.blockId, { content: newContent } as Partial<Block>);
    } else if (block.type === 'list' || block.type === 'bullet-list' || block.type === 'numbered-list') {
      const listBlock = { ...block } as ListBlock;
      const itemIndex = parseInt(updatePath[1]);
      if (listBlock.items && listBlock.items[itemIndex]) {
        listBlock.items = [...listBlock.items];
        listBlock.items[itemIndex] = { ...listBlock.items[itemIndex], content: newContent };
        updateBlock(selection.blockId, listBlock as Partial<Block>);
      }
    } else if (block.type === 'table') {
      const tableBlock = { ...block } as TableBlock;
      const rowIndex = parseInt(updatePath[1]);
      const cellIndex = parseInt(updatePath[3]);
      if (tableBlock.rows && tableBlock.rows[rowIndex]?.cells[cellIndex]) {
        tableBlock.rows = [...tableBlock.rows];
        tableBlock.rows[rowIndex] = { ...tableBlock.rows[rowIndex] };
        tableBlock.rows[rowIndex].cells = [...tableBlock.rows[rowIndex].cells];
        tableBlock.rows[rowIndex].cells[cellIndex] = {
          ...tableBlock.rows[rowIndex].cells[cellIndex],
          content: newContent
        };
        updateBlock(selection.blockId, tableBlock as Partial<Block>);
      }
    }

    // Clear saved selection
    setSavedSelection(null);
    closeLinkDialog();
  }, [blocks, savedSelection, markManager, updateBlock, closeLinkDialog]);

  // Drag operations
  const startDrag = useCallback((blockId: string) => {
    draggedBlockIdRef.current = blockId;
  }, []);

  const endDrag = useCallback(() => {
    draggedBlockIdRef.current = null;
  }, []);

  const handleDrop = useCallback((targetIndex: number) => {
    if (draggedBlockIdRef.current) {
      moveBlock(draggedBlockIdRef.current, targetIndex);
      draggedBlockIdRef.current = null;
    }
  }, [moveBlock]);

  // Direction operations
  const toggleBlockDirection = useCallback((id: string) => {
    const block = controller.getBlock(id);
    if (block) {
      const newDirection: Direction = block.direction === 'rtl' ? 'ltr' : 'rtl';
      updateBlock(id, { direction: newDirection });
    }
  }, [controller, updateBlock]);

  // Content operations
  const getContent = useCallback((): string => {
    return exporter.export(blocks);
  }, [exporter, blocks]);

  const setContent = useCallback((content: string) => {
    // Clear existing blocks
    blocks.forEach(b => controller.removeBlock(b.id));

    // Import new content
    const newBlocks = importer.import(content);
    newBlocks.forEach(block => controller.addBlock(block));

    syncState();
  }, [blocks, controller, importer, syncState]);

  const createFirstBlock = useCallback(() => {
    const block = addBlock('paragraph');
    focusBlock(block.id);
  }, [addBlock, focusBlock]);

  return {
    // State
    blocks,
    focusedBlockId,
    selection,
    canUndo,
    canRedo,
    hasTextSelection,
    activeMarks,
    selectionPosition,

    // Menu states
    slashMenu,
    blockMenu,
    linkDialog,

    // Block operations
    addBlock,
    removeBlock,
    updateBlock,
    moveBlock,
    duplicateBlock,
    convertBlock,
    insertRawBlock,

    // Focus operations
    focusBlock,
    focusNextBlock,
    focusPreviousBlock,

    // History operations
    undo,
    redo,

    // Selection operations
    setSelection,
    clearSelection,

    // Mark operations
    toggleMark,
    applyMark,
    removeMark,

    // Slash menu operations
    openSlashMenu,
    closeSlashMenu,
    setSlashMenuFilter,
    insertBlock,

    // Block menu operations
    openBlockMenu,
    closeBlockMenu,
    handleBlockAction,

    // Link dialog operations
    openLinkDialog,
    closeLinkDialog,
    insertLink,

    // Drag operations
    startDrag,
    endDrag,
    handleDrop,

    // Direction operations
    toggleBlockDirection,

    // Content operations
    getContent,
    setContent,
    createFirstBlock,

    // Refs
    editorRef,
  };
}

/**
 * Create editor hook (factory function)
 */
export function createUseEditor(options: UseEditorOptions = {}) {
  return () => useEditor(options);
}
