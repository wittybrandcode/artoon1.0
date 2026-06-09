/**
 * DragDropManager
 * 
 * Manages drag and drop functionality for reordering blocks.
 * Supports both mouse and touch interactions.
 */

import type { EditorControllerInterface, Block } from '../types';

/**
 * Drag state
 */
export interface DragState {
  /** ID of the block being dragged */
  blockId: string;
  /** Starting Y position */
  startY: number;
  /** Original index of the block */
  originalIndex: number;
  /** Is currently dragging */
  isDragging: boolean;
}

/**
 * Drop position
 */
export interface DropPosition {
  /** Target index */
  index: number;
  /** Position relative to target (before/after) */
  position: 'before' | 'after';
}

/**
 * DragDropManager options
 */
export interface DragDropManagerOptions {
  /** Editor controller */
  controller: EditorControllerInterface;
  /** Container element (optional, for calculating positions) */
  container?: HTMLElement | null;
  /** Callback when drag starts */
  onDragStart?: (blockId: string) => void;
  /** Callback when drag ends */
  onDragEnd?: (blockId: string) => void;
  /** Callback when drop position changes */
  onDropPositionChange?: (position: DropPosition | null) => void;
}

/**
 * DragDropManager class
 */
export class DragDropManager {
  private controller: EditorControllerInterface;
  private container: HTMLElement | null = null;
  private dragState: DragState | null = null;
  private dropPosition: DropPosition | null = null;
  private onDragStart?: (blockId: string) => void;
  private onDragEnd?: (blockId: string) => void;
  private onDropPositionChange?: (position: DropPosition | null) => void;

  constructor(options: DragDropManagerOptions) {
    this.controller = options.controller;
    this.container = options.container || null;
    this.onDragStart = options.onDragStart;
    this.onDragEnd = options.onDragEnd;
    this.onDropPositionChange = options.onDropPositionChange;
  }

  /**
   * Set container element
   */
  setContainer(container: HTMLElement | null): void {
    this.container = container;
  }

  /**
   * Get current drag state
   */
  getDragState(): DragState | null {
    return this.dragState;
  }

  /**
   * Get current drop position
   */
  getDropPosition(): DropPosition | null {
    return this.dropPosition;
  }

  /**
   * Check if currently dragging
   */
  isDragging(): boolean {
    return this.dragState !== null && this.dragState.isDragging;
  }

  /**
   * Start drag operation
   */
  startDrag(blockId: string, event: DragEvent | MouseEvent | TouchEvent): void {
    const block = this.controller.getBlock(blockId);
    if (!block) return;

    const blocks = this.controller.getBlocks();
    const originalIndex = blocks.findIndex(b => b.id === blockId);

    if (originalIndex === -1) return;

    // Get Y position from event
    let startY: number;
    if ('touches' in event) {
      startY = event.touches[0].clientY;
    } else {
      startY = event.clientY;
    }

    this.dragState = {
      blockId,
      startY,
      originalIndex,
      isDragging: true,
    };

    // Set up drag data if it's a DragEvent
    if ('dataTransfer' in event && event.dataTransfer) {
      event.dataTransfer.setData('application/artoon-block', blockId);
      event.dataTransfer.effectAllowed = 'move';
    }

    this.onDragStart?.(blockId);
  }

  /**
   * Handle drag over
   */
  handleDragOver(event: DragEvent | MouseEvent | TouchEvent): void {
    if (!this.dragState) return;

    // Prevent default to allow drop
    if ('preventDefault' in event) {
      event.preventDefault();
    }

    if ('dataTransfer' in event && event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }

    // Get Y position
    let clientY: number;
    if ('touches' in event) {
      clientY = event.touches[0].clientY;
    } else {
      clientY = event.clientY;
    }

    // Calculate drop position
    const newPosition = this.calculateDropPosition(clientY);

    // Update if changed
    if (!this.positionsEqual(newPosition, this.dropPosition)) {
      this.dropPosition = newPosition;
      this.onDropPositionChange?.(newPosition);
    }
  }

  /**
   * Handle drop
   */
  handleDrop(event: DragEvent | MouseEvent | TouchEvent): void {
    if (!this.dragState) return;

    if ('preventDefault' in event) {
      event.preventDefault();
    }

    // Get final drop position
    let clientY: number;
    if ('touches' in event) {
      // For touch end, use last known position
      clientY = this.dragState.startY;
    } else {
      clientY = event.clientY;
    }

    const dropPosition = this.calculateDropPosition(clientY);

    // Move block if position changed
    if (dropPosition && dropPosition.index !== this.dragState.originalIndex) {
      this.controller.moveBlock(this.dragState.blockId, dropPosition.index);
    }

    this.endDrag();
  }

  /**
   * End drag operation
   */
  endDrag(): void {
    if (!this.dragState) return;

    const blockId = this.dragState.blockId;

    this.dragState = null;
    this.dropPosition = null;

    this.onDragEnd?.(blockId);
    this.onDropPositionChange?.(null);
  }

  /**
   * Cancel drag operation
   */
  cancelDrag(): void {
    this.endDrag();
  }

  /**
   * Calculate drop position from Y coordinate
   */
  private calculateDropPosition(clientY: number): DropPosition {
    const blocks = this.controller.getBlocks();

    if (!this.container || blocks.length === 0) {
      return { index: 0, position: 'before' };
    }

    // Get all block elements
    const blockElements = this.container.querySelectorAll('[data-block-id]');
    if (blockElements.length === 0) {
      // Without DOM block anchors we cannot infer a reliable drop index.
      // Keep the original index to avoid accidental reordering.
      if (this.dragState) {
        return { index: this.dragState.originalIndex, position: 'before' };
      }
      return { index: 0, position: 'before' };
    }

    for (let i = 0; i < blockElements.length; i++) {
      const element = blockElements[i] as HTMLElement;
      const rect = element.getBoundingClientRect();
      const midY = rect.top + rect.height / 2;

      if (clientY < midY) {
        return { index: i, position: 'before' };
      }
    }

    return { index: blocks.length, position: 'after' };
  }

  /**
   * Check if two positions are equal
   */
  private positionsEqual(a: DropPosition | null, b: DropPosition | null): boolean {
    if (a === null && b === null) return true;
    if (a === null || b === null) return false;
    return a.index === b.index && a.position === b.position;
  }

  /**
   * Get block preview text for drag image
   */
  getBlockPreview(block: Block): string {
    const icon = this.getBlockIcon(block.type);
    const text = this.getBlockText(block);
    const preview = text.slice(0, 50);
    return `${icon} ${preview}${text.length > 50 ? '...' : ''}`;
  }

  /**
   * Get icon for block type
   */
  private getBlockIcon(type: string): string {
    const icons: Record<string, string> = {
      'paragraph': '¶',
      'heading1': 'H₁',
      'heading2': 'H₂',
      'heading3': 'H₃',
      'heading4': 'H₄',
      'heading5': 'H₅',
      'heading6': 'H₆',
      'quote': '"',
      'bullet-list': '•',
      'numbered-list': '1.',
      'code': '</>',
      'table': '▦',
      'image': '🖼',
      'video': '🎬',
      'audio': '🔊',
      'divider': '—',
    };
    return icons[type] || '□';
  }

  /**
   * Get text content from block
   */
  private getBlockText(block: Block): string {
    if ('content' in block && Array.isArray(block.content)) {
      return block.content
        .map((item: any) => item.type === 'plain' ? item.value : '')
        .join('');
    }
    if ('code' in block) {
      return block.code;
    }
    if ('items' in block && block.items.length > 0) {
      const firstItem = block.items[0];
      // Handle both ListItem (content) and DefinitionItem (term)
      if ('content' in firstItem) {
        return firstItem.content
          .map(item => item.type === 'plain' ? item.value : '')
          .join('');
      }
      if ('term' in firstItem) {
        return firstItem.term
          .map(item => item.type === 'plain' ? item.value : '')
          .join('');
      }
    }
    return '';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// Factory Function
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Create a DragDropManager instance
 */
export function createDragDropManager(options: DragDropManagerOptions): DragDropManager {
  return new DragDropManager(options);
}
