/**
 * SelectionManager
 * 
 * Manages text selection within blocks.
 * Provides a unified interface for getting/setting selection.
 */

import type { SelectionState } from '../types';

export class SelectionManager {
  private currentSelection: SelectionState | null = null;
  
  /**
   * Get current selection from DOM
   */
  getSelection(): SelectionState | null {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    
    const range = selection.getRangeAt(0);
    
    // Find block element
    let blockElement = range.commonAncestorContainer as HTMLElement;
    if (blockElement.nodeType === Node.TEXT_NODE) {
      blockElement = blockElement.parentElement as HTMLElement;
    }
    
    // Walk up the DOM tree to find element with data-block-id
    let attempts = 0;
    const maxAttempts = 20; // Prevent infinite loop
    
    while (blockElement && !blockElement.dataset?.blockId && attempts < maxAttempts) {
      blockElement = blockElement.parentElement as HTMLElement;
      attempts++;
    }
    
    if (!blockElement || !blockElement.dataset?.blockId) {
      // Selection is outside editor blocks (e.g., in menus, dialogs)
      return null;
    }
    
    const blockId = blockElement.dataset.blockId!;
    
    // Calculate offsets
    const from = this.getOffset(blockElement, range.startContainer, range.startOffset);
    const to = this.getOffset(blockElement, range.endContainer, range.endOffset);
    
    const textSelection: SelectionState = {
      blockId,
      anchorOffset: from,
      focusOffset: to,
      isCollapsed: from === to,
    };
    
    this.currentSelection = textSelection;
    return textSelection;
  }
  
  /**
   * Set selection programmatically
   */
  setSelection(blockId: string, from: number, to: number): void {
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
    if (!blockElement) return;
    
    const range = document.createRange();
    const selection = window.getSelection();
    
    // Find text nodes and set range
    const startPos = this.findPosition(blockElement, from);
    const endPos = this.findPosition(blockElement, to);
    
    if (startPos.node && endPos.node) {
      try {
        range.setStart(startPos.node, startPos.offset);
        range.setEnd(endPos.node, endPos.offset);
        
        selection?.removeAllRanges();
        selection?.addRange(range);
        
        this.currentSelection = { blockId, anchorOffset: from, focusOffset: to, isCollapsed: from === to };
      } catch (error) {
        console.warn('SelectionManager: Failed to set selection', error);
      }
    }
  }
  
  /**
   * Check if there's a selection
   */
  hasSelection(): boolean {
    const sel = this.getSelection();
    return sel !== null && !sel.isCollapsed;
  }
  
  /**
   * Clear selection
   */
  clearSelection(): void {
    window.getSelection()?.removeAllRanges();
    this.currentSelection = null;
  }
  
  /**
   * Get last known selection
   */
  getLastSelection(): SelectionState | null {
    return this.currentSelection;
  }
  
  /**
   * Find which list item contains the selection
   */
  findListItemIndex(blockId: string): number {
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
    if (!blockElement) return 0;
    
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return 0;
    
    // Find the list-item__content that contains the selection
    let element = sel.anchorNode as HTMLElement;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement as HTMLElement;
    }
    
    // Walk up to find list-item__content
    while (element && !element.classList?.contains('list-item__content')) {
      element = element.parentElement as HTMLElement;
      if (!element || element === blockElement) break;
    }
    
    if (!element) return 0;
    
    // Find the parent list-item
    const listItem = element.closest('.list-item');
    if (!listItem) return 0;
    
    // Get all list items in this block
    const allItems = blockElement.querySelectorAll('.list-item');
    const index = Array.from(allItems).indexOf(listItem as Element);
    
    return index >= 0 ? index : 0;
  }
  
  /**
   * Find which table cell contains the selection
   */
  findTableCellIndex(blockId: string): { rowIndex: number; cellIndex: number } {
    const blockElement = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
    if (!blockElement) return { rowIndex: 0, cellIndex: 0 };
    
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) return { rowIndex: 0, cellIndex: 0 };
    
    // Find the td/th that contains the selection
    let element = sel.anchorNode as HTMLElement;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement as HTMLElement;
    }
    
    // Walk up to find td or th
    while (element && element.tagName !== 'TD' && element.tagName !== 'TH') {
      element = element.parentElement as HTMLElement;
      if (!element || element === blockElement) break;
    }
    
    if (!element) return { rowIndex: 0, cellIndex: 0 };
    
    const cell = element;
    const row = cell.parentElement as HTMLTableRowElement;
    if (!row) return { rowIndex: 0, cellIndex: 0 };
    
    // Get indices
    const cellIndex = Array.from(row.cells).indexOf(cell as HTMLTableCellElement);
    const allRows = blockElement.querySelectorAll('tr');
    const rowIndex = Array.from(allRows).indexOf(row);
    
    return {
      rowIndex: rowIndex >= 0 ? rowIndex : 0,
      cellIndex: cellIndex >= 0 ? cellIndex : 0,
    };
  }
  
  /**
   * Calculate character offset from start of block
   * Takes into account element boundaries and spaces
   */
  private getOffset(container: HTMLElement, node: Node, offset: number): number {
    let totalOffset = 0;
    
    const countTextInNode = (n: Node): number => {
      if (n === node) {
        return offset;
      }
      
      if (n.nodeType === Node.TEXT_NODE) {
        return n.textContent?.length || 0;
      }
      
      if (n.nodeType === Node.ELEMENT_NODE) {
        const element = n as HTMLElement;
        let length = 0;
        
        for (let i = 0; i < element.childNodes.length; i++) {
          const child = element.childNodes[i];
          if (child === node || child.contains(node)) {
            length += countTextInNode(child);
            return length;
          }
          length += this.getTextLength(child);
        }
        
        return length;
      }
      
      return 0;
    };
    
    for (let i = 0; i < container.childNodes.length; i++) {
      const child = container.childNodes[i];
      if (child === node || child.contains(node)) {
        totalOffset += countTextInNode(child);
        break;
      }
      totalOffset += this.getTextLength(child);
    }
    
    return totalOffset;
  }
  
  /**
   * Get total text length of a node and its children
   */
  private getTextLength(node: Node): number {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent?.length || 0;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
      let length = 0;
      for (let i = 0; i < node.childNodes.length; i++) {
        length += this.getTextLength(node.childNodes[i]);
      }
      return length;
    }
    
    return 0;
  }
  
  /**
   * Find DOM node and offset for character position
   * Properly handles element boundaries
   */
  private findPosition(container: HTMLElement, offset: number): { node: Node | null; offset: number } {
    let remainingOffset = offset;
    
    const findInNode = (n: Node): { node: Node | null; offset: number } | null => {
      if (n.nodeType === Node.TEXT_NODE) {
        const length = n.textContent?.length || 0;
        if (remainingOffset <= length) {
          return { node: n, offset: remainingOffset };
        }
        remainingOffset -= length;
        return null;
      }
      
      if (n.nodeType === Node.ELEMENT_NODE) {
        for (let i = 0; i < n.childNodes.length; i++) {
          const result = findInNode(n.childNodes[i]);
          if (result) return result;
        }
      }
      
      return null;
    };
    
    for (let i = 0; i < container.childNodes.length; i++) {
      const result = findInNode(container.childNodes[i]);
      if (result) return result;
    }
    
    // If offset is beyond text, return last text node
    const lastTextNode = this.getLastTextNode(container);
    if (lastTextNode) {
      return { node: lastTextNode, offset: lastTextNode.textContent?.length || 0 };
    }
    
    return { node: null, offset: 0 };
  }
  
  /**
   * Get the last text node in a container
   */
  private getLastTextNode(container: Node): Node | null {
    if (container.nodeType === Node.TEXT_NODE) {
      return container;
    }
    
    for (let i = container.childNodes.length - 1; i >= 0; i--) {
      const result = this.getLastTextNode(container.childNodes[i]);
      if (result) return result;
    }
    
    return null;
  }
}

/**
 * Create a new SelectionManager instance
 */
export function createSelectionManager(): SelectionManager {
  return new SelectionManager();
}
