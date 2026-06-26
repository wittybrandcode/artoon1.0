/**
 * EditorControllerV2
 *
 * Main controller for the block editor, now backed by @artoon/state.
 * Delegates all mutations to immutable EditorState transactions.
 *
 * Phase 4: Unify State Management
 */

import type {
  Block,
  TextBlock,
  EditorConfig,
  EditorState as TyperEditorState,
  SelectionState,
  EditorControllerInterface,
  BlockEvent,
  EditorEventHandler,
  Direction,
} from '../types';
import { BlockRegistry, getDefaultRegistry } from './BlockRegistry';
import { generateId, deepClone } from './utils';
import { ARTOONImporter } from '../integration/ARTOONImporter';

import {
  blocksToEditorState,
  editorStateToBlocks,
  addBlockToState,
  removeBlockFromState,
  updateBlockInState,
  moveBlockInState,
  setSelectionInState,
  stateSelectionToTyperSelection,
} from '../integration/StateBridge';

import type { EditorState, Transaction } from '@artoon/state';
import { undo as stateUndo, redo as stateRedo } from '@artoon/state';

/**
 * EditorControllerV2 - main editor controller backed by @artoon/state
 */
export class EditorController implements EditorControllerInterface {
  private _editorState: EditorState;
  private focusedBlockId: string | null = null;
  private selection: SelectionState | null = null;
  private selectionCleared = false;
  private registry: BlockRegistry;
  private config: EditorConfig;
  private eventHandlers: Set<EditorEventHandler> = new Set();

  constructor(config: EditorConfig = {}) {
    this.config = {
      defaultDirection: 'rtl',
      placeholder: 'Type something...',
      readOnly: false,
      autoFocus: true,
      theme: 'light',
      ...config,
    };

    this.registry = config.customBlocks
      ? this.createRegistryWithCustomBlocks(config.customBlocks)
      : getDefaultRegistry();

    // Initialize blocks from config
    let blocks: Block[];
    if (config.initialBlocks) {
      blocks = deepClone(config.initialBlocks);
    } else if (config.initialContent) {
      // Parse ARTOON content using importer
      const importer = new ARTOONImporter({
        defaultDirection: this.config.defaultDirection
      });
      blocks = importer.import(config.initialContent);
    } else {
      blocks = [this.createDefaultBlock()];
    }

    this._editorState = blocksToEditorState(blocks);
    this.syncSelectionFromState();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Block Operations (delegated to @artoon/state via StateBridge)
  // ─────────────────────────────────────────────────────────────────────────

  getBlocks(): Block[] {
    return editorStateToBlocks(this._editorState);
  }

  getBlock(id: string): Block | undefined {
    return this.getBlocks().find(b => b.id === id);
  }

  getBlockIndex(id: string): number {
    return this.getBlocks().findIndex(b => b.id === id);
  }

  getFocusedBlock(): Block | undefined {
    if (!this.focusedBlockId) return undefined;
    return this.getBlock(this.focusedBlockId);
  }

  addBlock(block: Block, index?: number): void {
    const insertIndex = index ?? this.getBlocks().length;

    // Ensure unique ID
    if (this.getBlocks().some(b => b.id === block.id)) {
      block = { ...block, id: generateId(block.type) };
    }

    this._editorState = addBlockToState(this._editorState, block, insertIndex);
    this.selectionCleared = false;
    this.syncSelectionFromState();
    this.emit({ type: 'add', blockId: block.id, block, newIndex: insertIndex });
  }

  removeBlock(id: string): void {
    const index = this.getBlockIndex(id);
    if (index === -1) return;

    const block = this.getBlock(id);
    this._editorState = removeBlockFromState(this._editorState, index);

    // Ensure at least one block exists
    if (this.getBlocks().length === 0) {
      const defaultBlock = this.createDefaultBlock();
      this._editorState = addBlockToState(this._editorState, defaultBlock, 0);
    }

    // Update focus if removed block was focused
    if (this.focusedBlockId === id) {
      const blocks = this.getBlocks();
      const newFocusIndex = Math.min(index, blocks.length - 1);
      this.focusedBlockId = blocks[newFocusIndex]?.id ?? null;
    }

    this.selectionCleared = false;
    this.syncSelectionFromState();
    this.emit({ type: 'remove', blockId: id, block, previousIndex: index });
  }

  updateBlock(id: string, updates: Partial<Block>): void {
    const index = this.getBlockIndex(id);
    if (index === -1) return;

    const block = this.getBlock(id);
    const newBlock = { ...block, ...updates, id } as Block;

    this._editorState = updateBlockInState(this._editorState, index, newBlock);
    this.selectionCleared = false;
    this.syncSelectionFromState();
    this.emit({ type: 'update', blockId: id, block: newBlock });
  }

  moveBlock(id: string, newIndex: number): void {
    const currentIndex = this.getBlockIndex(id);
    if (currentIndex === -1) return;
    if (currentIndex === newIndex) return;

    const block = this.getBlock(id);
    this._editorState = moveBlockInState(this._editorState, currentIndex, newIndex);
    this.selectionCleared = false;
    this.syncSelectionFromState();
    this.emit({
      type: 'move',
      blockId: id,
      block,
      previousIndex: currentIndex,
      newIndex: newIndex > currentIndex ? newIndex - 1 : newIndex,
    });
  }

  duplicateBlock(id: string): Block | undefined {
    const index = this.getBlockIndex(id);
    if (index === -1) return undefined;

    const original = this.getBlock(id)!;
    const duplicate: Block = {
      ...deepClone(original),
      id: generateId(original.type),
    };

    this.addBlock(duplicate, index + 1);
    return duplicate;
  }

  convertBlock(id: string, newType: Block['type']): void {
    const block = this.getBlock(id);
    if (!block) return;

    // Check if conversion is allowed
    const convertibleTypes = this.registry.getConvertibleTypes(block.type);
    if (!convertibleTypes.includes(newType)) {
      console.warn(`Cannot convert ${block.type} to ${newType}`);
      return;
    }

    // Create new block of target type
    const newBlock = this.registry.create(newType);
    newBlock.direction = block.direction;
    newBlock.id = id;

    // Content mapping based on source → target structure
    const srcHasContent = 'content' in block && Array.isArray((block as any).content);
    const dstHasContent = 'content' in newBlock && Array.isArray((newBlock as any).content);
    const srcHasItems = 'items' in block && Array.isArray((block as any).items);
    const dstHasItems = 'items' in newBlock && Array.isArray((newBlock as any).items);

    if (srcHasContent && dstHasContent) {
      (newBlock as any).content = (block as any).content;
    } else if (srcHasContent && dstHasItems) {
      (newBlock as any).items = [{
        id: generateId('li'),
        content: (block as any).content || [],
      }];
    } else if (srcHasItems && dstHasContent) {
      const items = (block as any).items;
      (newBlock as any).content = items?.[0]?.content || items?.[0]?.term || [];
    } else if (srcHasItems && dstHasItems) {
      const srcItems = (block as any).items;
      const srcIsDl = block.type === 'definition-list';
      const dstIsDl = newType === 'definition-list';

      if (srcIsDl && !dstIsDl) {
        (newBlock as any).items = srcItems.map((item: any) => ({
          id: item.id || generateId('li'),
          itemType: 'li' as const,
          content: [...(item.term || []), ...(item.definition || [])],
        }));
      } else if (!srcIsDl && dstIsDl) {
        (newBlock as any).items = srcItems.map((item: any) => ({
          id: item.id || generateId('di'),
          term: item.content || [],
          definition: [],
        }));
      } else {
        (newBlock as any).items = srcItems;
      }
    }

    this.updateBlock(id, newBlock);
  }

  toggleBlockDirection(id: string): void {
    const block = this.getBlock(id);
    if (!block) return;

    const newDirection: Direction = block.direction === 'rtl' ? 'ltr' : 'rtl';
    this.updateBlock(id, { direction: newDirection });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Focus & Selection (unchanged from V1)
  // ─────────────────────────────────────────────────────────────────────────

  focusBlock(id: string): void {
    if (!this.getBlock(id)) return;
    this.focusedBlockId = id;
    this.emit({ type: 'focus', blockId: id });
  }

  focusNextBlock(): void {
    if (!this.focusedBlockId) {
      const blocks = this.getBlocks();
      if (blocks.length > 0) {
        this.focusBlock(blocks[0].id);
      }
      return;
    }
    const currentIndex = this.getBlockIndex(this.focusedBlockId);
    const blocks = this.getBlocks();
    if (currentIndex < blocks.length - 1) {
      this.focusBlock(blocks[currentIndex + 1].id);
    }
  }

  focusPreviousBlock(): void {
    if (!this.focusedBlockId) return;
    const currentIndex = this.getBlockIndex(this.focusedBlockId);
    if (currentIndex > 0) {
      this.focusBlock(this.getBlocks()[currentIndex - 1].id);
    }
  }

  getSelection(): SelectionState | null {
    if (this.selectionCleared) return null;
    return this.syncSelectionFromState();
  }

  setSelection(selection: SelectionState): void {
    this._editorState = setSelectionInState(
      this._editorState,
      this.getBlocks(),
      selection
    );
    this.selectionCleared = false;
    this.syncSelectionFromState();
  }

  clearSelection(): void {
    this.selection = null;
    this.selectionCleared = true;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // History (delegated to @artoon/state - inverse steps)
  // ─────────────────────────────────────────────────────────────────────────

  undo(): void {
    stateUndo(this._editorState, (tr: Transaction) => {
      this._editorState = this._editorState.apply(tr);
      this.selectionCleared = false;
      this.syncSelectionFromState();
      this.config.onChange?.(this.getBlocks());
    });
  }

  redo(): void {
    stateRedo(this._editorState, (tr: Transaction) => {
      this._editorState = this._editorState.apply(tr);
      this.selectionCleared = false;
      this.syncSelectionFromState();
      this.config.onChange?.(this.getBlocks());
    });
  }

  canUndo(): boolean {
    return this._editorState.history.canUndo;
  }

  canRedo(): boolean {
    return this._editorState.history.canRedo;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // State (compatible with V1 interface)
  // ─────────────────────────────────────────────────────────────────────────

  getState(): TyperEditorState {
    return {
      blocks: this.getBlocks(),
      focusedBlockId: this.focusedBlockId,
      selection: this.selection,
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Events (unchanged)
  // ─────────────────────────────────────────────────────────────────────────

  on(handler: EditorEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  private emit(event: BlockEvent): void {
    this.eventHandlers.forEach(handler => handler(event));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Registry Access
  // ─────────────────────────────────────────────────────────────────────────

  getRegistry(): BlockRegistry {
    return this.registry;
  }

  getConfig(): EditorConfig {
    return this.config;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Internal
  // ─────────────────────────────────────────────────────────────────────────

  private createRegistryWithCustomBlocks(customBlocks: any[]): BlockRegistry {
    const registry = getDefaultRegistry();
    registry.registerAll(customBlocks);
    return registry;
  }

  private createDefaultBlock(): TextBlock {
    return {
      id: generateId('p'),
      type: 'paragraph',
      direction: this.config.defaultDirection || 'rtl',
      content: [],
    };
  }

  private syncSelectionFromState(): SelectionState | null {
    const stateSel = this._editorState.selection;
    const converted = stateSelectionToTyperSelection(this.getBlocks(), stateSel);
    if (!converted) return this.selection;

    this.selection = {
      blockId: converted.blockId,
      anchorOffset: converted.anchorOffset,
      focusOffset: converted.focusOffset,
      isCollapsed: converted.isCollapsed,
    };

    this.focusedBlockId = converted.blockId;
    return this.selection;
  }
}

/**
 * Factory function (drop-in replacement for createEditorController)
 */
export function createEditorController(config?: EditorConfig): EditorController {
  return new EditorController(config);
}

export default EditorController;
