/**
 * KeyboardManager
 * 
 * Manages keyboard shortcuts and commands for the editor.
 * Handles formatting, editing, navigation, and block operations.
 */

import type { EditorControllerInterface, Block, BlockType, Modifier, TextBlock, InlineContent } from '../types';
import { MarkManager } from '../inline/MarkManager';
import { createSelectionManager } from './SelectionManager';
import { generateId } from './utils';

/**
 * Shortcut context - when the shortcut is active
 */
export type ShortcutContext =
  | 'always'
  | 'hasSelection'
  | 'inBlock'
  | 'atBlockStart'
  | 'atBlockEnd'
  | 'inList'
  | 'menuOpen'
  | 'emptyBlock';

/**
 * Keyboard command function
 */
export type KeyboardCommand = (
  controller: EditorControllerInterface,
  event: KeyboardEvent
) => boolean;

/**
 * Keyboard shortcut definition
 */
export interface KeyboardShortcut {
  /** Key combination (e.g., 'Ctrl+B') */
  key: string;
  /** Command to execute */
  command: KeyboardCommand;
  /** Context when shortcut is active */
  context: ShortcutContext;
  /** Description for display */
  description: string;
  /** Arabic description */
  descriptionAr?: string;
}

/**
 * KeyboardManager options
 */
export interface KeyboardManagerOptions {
  /** Editor controller */
  controller: EditorControllerInterface;
  /** Custom shortcuts to add */
  customShortcuts?: KeyboardShortcut[];
  /** Shortcuts to disable */
  disabledShortcuts?: string[];
}

/**
 * KeyboardManager class
 */
export class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private controller: EditorControllerInterface;
  private disabledShortcuts: Set<string> = new Set();
  private enabled: boolean = true;

  constructor(options: KeyboardManagerOptions) {
    this.controller = options.controller;

    if (options.disabledShortcuts) {
      options.disabledShortcuts.forEach(key => {
        this.disabledShortcuts.add(this.normalizeKey(key));
      });
    }

    this.registerDefaultShortcuts();

    if (options.customShortcuts) {
      options.customShortcuts.forEach(shortcut => this.register(shortcut));
    }
  }

  /**
   * Register a keyboard shortcut
   */
  register(shortcut: KeyboardShortcut): void {
    const key = this.normalizeKey(shortcut.key);
    this.shortcuts.set(key, { ...shortcut, key });
  }

  /**
   * Unregister a keyboard shortcut
   */
  unregister(key: string): void {
    this.shortcuts.delete(this.normalizeKey(key));
  }

  /**
   * Get all registered shortcuts
   */
  getShortcuts(): KeyboardShortcut[] {
    return Array.from(this.shortcuts.values());
  }

  /**
   * Get shortcut by key
   */
  getShortcut(key: string): KeyboardShortcut | undefined {
    return this.shortcuts.get(this.normalizeKey(key));
  }

  /**
   * Enable/disable keyboard handling
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Check if keyboard handling is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Handle keydown event
   */
  handleKeyDown(event: KeyboardEvent): boolean {
    if (!this.enabled) return false;

    const key = this.getKeyFromEvent(event);

    // Check if shortcut is disabled
    if (this.disabledShortcuts.has(key)) {
      return false;
    }

    const shortcut = this.shortcuts.get(key);
    if (!shortcut) {
      return false;
    }

    // Check context
    if (!this.checkContext(shortcut.context)) {
      return false;
    }

    // Execute command
    const result = shortcut.command(this.controller, event);

    if (result) {
      event.preventDefault();
      event.stopPropagation();
    }

    return result;
  }

  /**
   * Register default shortcuts
   */
  private registerDefaultShortcuts(): void {
    // Formatting shortcuts
    this.register({
      key: 'Ctrl+B',
      command: toggleMark('s'),
      context: 'hasSelection',
      description: 'Bold',
      descriptionAr: 'عريض',
    });

    this.register({
      key: 'Ctrl+I',
      command: toggleMark('e'),
      context: 'hasSelection',
      description: 'Italic',
      descriptionAr: 'مائل',
    });

    this.register({
      key: 'Ctrl+U',
      command: toggleMark('u'),
      context: 'hasSelection',
      description: 'Underline',
      descriptionAr: 'مسطر',
    });

    this.register({
      key: 'Ctrl+Shift+S',
      command: toggleMark('d'),
      context: 'hasSelection',
      description: 'Strikethrough',
      descriptionAr: 'مشطوب',
    });

    this.register({
      key: 'Ctrl+Shift+H',
      command: toggleMark('mark'),
      context: 'hasSelection',
      description: 'Highlight',
      descriptionAr: 'تمييز',
    });

    // History shortcuts
    this.register({
      key: 'Ctrl+Z',
      command: undo,
      context: 'always',
      description: 'Undo',
      descriptionAr: 'تراجع',
    });

    this.register({
      key: 'Ctrl+Y',
      command: redo,
      context: 'always',
      description: 'Redo',
      descriptionAr: 'إعادة',
    });

    this.register({
      key: 'Ctrl+Shift+Z',
      command: redo,
      context: 'always',
      description: 'Redo',
      descriptionAr: 'إعادة',
    });

    // Block conversion shortcuts
    this.register({
      key: 'Ctrl+Alt+1',
      command: convertToBlock('heading1'),
      context: 'inBlock',
      description: 'Heading 1',
      descriptionAr: 'عنوان 1',
    });

    this.register({
      key: 'Ctrl+Alt+2',
      command: convertToBlock('heading2'),
      context: 'inBlock',
      description: 'Heading 2',
      descriptionAr: 'عنوان 2',
    });

    this.register({
      key: 'Ctrl+Alt+3',
      command: convertToBlock('heading3'),
      context: 'inBlock',
      description: 'Heading 3',
      descriptionAr: 'عنوان 3',
    });

    this.register({
      key: 'Ctrl+Alt+0',
      command: convertToBlock('paragraph'),
      context: 'inBlock',
      description: 'Paragraph',
      descriptionAr: 'فقرة',
    });

    this.register({
      key: 'Ctrl+Shift+8',
      command: convertToBlock('bullet-list'),
      context: 'inBlock',
      description: 'Bullet List',
      descriptionAr: 'قائمة نقطية',
    });

    this.register({
      key: 'Ctrl+Shift+9',
      command: convertToBlock('numbered-list'),
      context: 'inBlock',
      description: 'Numbered List',
      descriptionAr: 'قائمة مرقمة',
    });

    this.register({
      key: 'Ctrl+Shift+.',
      command: convertToBlock('quote'),
      context: 'inBlock',
      description: 'Quote',
      descriptionAr: 'اقتباس',
    });

    // Enter and Backspace overrides
    this.register({
      key: 'Enter',
      command: splitBlock,
      context: 'inBlock',
      description: 'Split Block',
      descriptionAr: 'تقسيم البلوك',
    });

    this.register({
      key: 'Backspace',
      command: mergeBlockUp,
      context: 'inBlock',
      description: 'Merge Block Up',
      descriptionAr: 'دمج البلوك للأعلى',
    });

    // Block operations
    this.register({
      key: 'Ctrl+D',
      command: duplicateBlock,
      context: 'inBlock',
      description: 'Duplicate Block',
      descriptionAr: 'تكرار البلوك',
    });

    this.register({
      key: 'Ctrl+Shift+ArrowUp',
      command: moveBlockUp,
      context: 'inBlock',
      description: 'Move Block Up',
      descriptionAr: 'نقل البلوك لأعلى',
    });

    this.register({
      key: 'Ctrl+Shift+ArrowDown',
      command: moveBlockDown,
      context: 'inBlock',
      description: 'Move Block Down',
      descriptionAr: 'نقل البلوك لأسفل',
    });

    // Escape to close menus
    this.register({
      key: 'Escape',
      command: closeMenus,
      context: 'always',
      description: 'Close Menus',
      descriptionAr: 'إغلاق القوائم',
    });
  }

  /**
   * Convert keyboard event to normalized key string
   */
  private getKeyFromEvent(event: KeyboardEvent): string {
    const parts: string[] = [];

    if (event.ctrlKey || event.metaKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');

    let key = event.key;
    if (key === ' ') key = 'Space';
    if (key.length === 1) key = key.toUpperCase();

    parts.push(key);

    return parts.join('+');
  }

  /**
   * Normalize key string
   */
  private normalizeKey(key: string): string {
    return key
      .split('+')
      .map(part => part.trim())
      .map(part => {
        const lower = part.toLowerCase();
        if (lower === 'cmd' || lower === 'meta') return 'Ctrl';
        if (lower === 'control') return 'Ctrl';
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
      })
      .sort((a, b) => {
        const order = ['Ctrl', 'Alt', 'Shift'];
        const aIndex = order.indexOf(a);
        const bIndex = order.indexOf(b);
        if (aIndex === -1 && bIndex === -1) return 0;
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      })
      .join('+');
  }

  /**
   * Check if context matches current state
   */
  private checkContext(context: ShortcutContext): boolean {
    const selection = this.controller.getSelection();
    const focusedBlock = this.controller.getFocusedBlock();

    switch (context) {
      case 'always':
        return true;

      case 'hasSelection':
        return selection !== null && !selection.isCollapsed;

      case 'inBlock':
        return focusedBlock !== undefined;

      case 'atBlockStart':
        return selection !== null && selection.anchorOffset === 0;

      case 'atBlockEnd':
        // Simplified check
        return focusedBlock !== undefined;

      case 'inList':
        return focusedBlock?.type === 'bullet-list' || focusedBlock?.type === 'numbered-list';

      case 'menuOpen':
        // Would need menu state from controller
        return false;

      case 'emptyBlock':
        return focusedBlock !== undefined && isBlockEmpty(focusedBlock);

      default:
        return true;
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Command Functions
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Toggle mark command factory
 */
function toggleMark(mark: Modifier): KeyboardCommand {
  return (controller, event) => {
    // Mark toggling would be handled by the editor
    // This is a placeholder that returns true to indicate the shortcut was handled
    return true;
  };
}

/**
 * Undo command
 */
function undo(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  controller.undo();
  return true;
}

/**
 * Redo command
 */
function redo(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  controller.redo();
  return true;
}

/**
 * Convert to block type command factory
 */
function convertToBlock(blockType: BlockType): KeyboardCommand {
  return (controller, event) => {
    const focusedBlock = controller.getFocusedBlock();
    if (!focusedBlock) return false;

    // Would need a convertBlock method on controller
    // For now, just return true to indicate handled
    return true;
  };
}

/**
 * Duplicate block command
 */
function duplicateBlock(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  const focusedBlock = controller.getFocusedBlock();
  if (!focusedBlock) return false;

  // Would need a duplicateBlock method
  return true;
}

/**
 * Move block up command
 */
function moveBlockUp(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  const focusedBlock = controller.getFocusedBlock();
  if (!focusedBlock) return false;

  const blocks = controller.getBlocks();
  const index = blocks.findIndex(b => b.id === focusedBlock.id);

  if (index > 0) {
    controller.moveBlock(focusedBlock.id, index - 1);
    return true;
  }

  return false;
}

/**
 * Move block down command
 */
function moveBlockDown(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  const focusedBlock = controller.getFocusedBlock();
  if (!focusedBlock) return false;

  const blocks = controller.getBlocks();
  const index = blocks.findIndex(b => b.id === focusedBlock.id);

  if (index < blocks.length - 1) {
    controller.moveBlock(focusedBlock.id, index + 1);
    return true;
  }

  return false;
}

/**
 * Close menus command
 */
function closeMenus(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  // Would emit an event to close menus
  return true;
}

/**
 * Check if block is empty
 */
function isBlockEmpty(block: Block): boolean {
  if ('content' in block && Array.isArray(block.content)) {
    return block.content.length === 0 ||
      (block.content.length === 1 &&
        (block.content[0] as any).type === 'plain' &&
        (block.content[0] as any).value === '');
  }
  if ('code' in block) {
    return block.code === '';
  }
  if ('items' in block) {
    return block.items.length === 0;
  }
  return false;
}

/**
 * Split block command (Enter)
 */
function splitBlock(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  const focusedBlock = controller.getFocusedBlock();
  if (!focusedBlock) return false;

  const selectionManager = createSelectionManager();
  const selection = selectionManager.getSelection();

  // We only split if we have a collapsed DOM selection inside the focused block
  if (!selection || selection.blockId !== focusedBlock.id || !selection.isCollapsed) return false;

  // We only handle splitting TextBlocks. 
  if (!('content' in focusedBlock) || !Array.isArray(focusedBlock.content)) {
    // If it's a code block or something, just insert an empty paragraph below it
    const newBlock: TextBlock = {
      id: generateId('p'),
      type: 'paragraph',
      direction: focusedBlock.direction || 'rtl',
      content: []
    };
    const index = controller.getBlocks().findIndex(b => b.id === focusedBlock.id);
    controller.addBlock(newBlock, index + 1);
    controller.focusBlock(newBlock.id);
    return true;
  }

  const textBlock = focusedBlock as TextBlock;
  const markManager = new MarkManager();

  const flat = markManager.flattenContent(textBlock.content);
  const splitIndex = selection.from;

  const firstHalf = flat.slice(0, splitIndex);
  const secondHalf = flat.slice(splitIndex);

  // 1. Update the current block to only contain the first half
  controller.updateBlock(textBlock.id, {
    content: markManager.rebuildContent(firstHalf) as InlineContent[]
  });

  // 2. Create the new block with the second half
  // Usually, heading split creates a paragraph, but paragraph split creates paragraph.
  const isHeading = textBlock.type.startsWith('heading');
  const newType = isHeading ? 'paragraph' : textBlock.type;

  const newBlock: TextBlock = {
    id: generateId(newType.charAt(0)), // 'p' or 'h'
    type: newType,
    direction: textBlock.direction,
    content: markManager.rebuildContent(secondHalf) as InlineContent[],
  };

  const blocks = controller.getBlocks();
  const currentIndex = blocks.findIndex(b => b.id === textBlock.id);

  controller.addBlock(newBlock, currentIndex + 1);
  controller.focusBlock(newBlock.id);

  // Move selection to start of new block
  setTimeout(() => {
    selectionManager.setSelection(newBlock.id, 0, 0);
    // Sync selection to EditorState
    controller.setSelection({
      blockId: newBlock.id,
      anchorOffset: 0,
      focusOffset: 0,
      isCollapsed: true,
    });
  }, 10);

  return true;
}

/**
 * Merge block up command (Backspace at start)
 */
function mergeBlockUp(controller: EditorControllerInterface, event: KeyboardEvent): boolean {
  const focusedBlock = controller.getFocusedBlock();
  if (!focusedBlock) return false;

  const selectionManager = createSelectionManager();
  const selection = selectionManager.getSelection();

  // ONLY intercept if caret is exactly at position 0
  if (!selection || selection.blockId !== focusedBlock.id || !selection.isCollapsed || selection.from !== 0) {
    return false;
  }

  const blocks = controller.getBlocks();
  const index = blocks.findIndex(b => b.id === focusedBlock.id);

  // Nothing to merge with if it's the first block
  if (index <= 0) return false;

  const prevBlock = blocks[index - 1];

  // We only handle merging TextBlocks
  if (!('content' in prevBlock) || !Array.isArray(prevBlock.content) ||
    !('content' in focusedBlock) || !Array.isArray(focusedBlock.content)) {
    return false;
  }

  const prevTextBlock = prevBlock as TextBlock;
  const currTextBlock = focusedBlock as TextBlock;

  const markManager = new MarkManager();
  const prevFlat = markManager.flattenContent(prevTextBlock.content);
  const currFlat = markManager.flattenContent(currTextBlock.content);

  const mergeIndex = prevFlat.length; // The exact point where they join
  const mergedFlat = [...prevFlat, ...currFlat];

  // Update previous block with merged content
  controller.updateBlock(prevTextBlock.id, {
    content: markManager.rebuildContent(mergedFlat) as InlineContent[]
  });

  // Remove current block
  controller.removeBlock(currTextBlock.id);
  controller.focusBlock(prevTextBlock.id);

  // Set selection exactly at the merge point
  setTimeout(() => {
    selectionManager.setSelection(prevTextBlock.id, mergeIndex, mergeIndex);
    // Sync selection to EditorState
    controller.setSelection({
      blockId: prevTextBlock.id,
      anchorOffset: mergeIndex,
      focusOffset: mergeIndex,
      isCollapsed: true,
    });
  }, 10);

  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// Factory Function
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a KeyboardManager instance
 */
export function createKeyboardManager(options: KeyboardManagerOptions): KeyboardManager {
  return new KeyboardManager(options);
}
