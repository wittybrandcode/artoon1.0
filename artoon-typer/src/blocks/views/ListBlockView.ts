/**
 * ListBlockView
 * 
 * View for list blocks (bullet-list, numbered-list).
 * Handles nested lists, indentation, and list item operations.
 */

import type { ListBlock, ListItem, InlineContent, Direction, BlockEvent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';
import { InlineParser, createInlineParser } from '../../inline/InlineParser';
import { generateId } from '../../core/utils';

/**
 * List block view options
 */
export interface ListBlockViewOptions extends BlockViewOptions {
  block: ListBlock;
  /** On item content change */
  onItemChange?: (itemId: string, content: readonly InlineContent[]) => void;
  /** On item add */
  onItemAdd?: (afterItemId: string) => void;
  /** On item remove */
  onItemRemove?: (itemId: string) => void;
  /** On indent */
  onIndent?: (itemId: string) => void;
  /** On outdent */
  onOutdent?: (itemId: string) => void;
}

/**
 * ListBlockView - handles list blocks
 */
export class ListBlockView extends BaseBlockView {
  protected block: ListBlock;
  protected options: ListBlockViewOptions;
  protected listElement: HTMLElement | null = null;

  private renderer: InlineRenderer;
  private parser: InlineParser;
  private focusedItemId: string | null = null;

  constructor(options: ListBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;

    this.renderer = createInlineRenderer({ escapeHtml: true });
    this.parser = createInlineParser({ mergeAdjacent: true });
  }

  /**
   * Get list type
   */
  get listType(): 'bullet' | 'numbered' {
    return this.block.type === 'bullet-list' ? 'bullet' : 'numbered';
  }

  /**
   * Get all items (flat)
   */
  getItems(): readonly ListItem[] {
    return this.block.items;
  }

  /**
   * Get item by ID
   */
  getItem(id: string): ListItem | undefined {
    return this.findItem(this.block.items, id);
  }

  /**
   * Get item count
   */
  getItemCount(): number {
    return this.countItems(this.block.items);
  }

  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');

    // Create list element
    const tag = this.block.type === 'bullet-list' ? 'ul' : 'ol';
    this.listElement = document.createElement(tag);
    this.listElement.className = 'artoon-list';

    // Render items
    this.renderItems(this.block.items, this.listElement);

    // Apply styles
    this.applyStyles(this.element);

    this.element.appendChild(this.listElement);
    return this.element;
  }

  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName();
      this.element.dir = this.block.direction;
    }

    if (this.listElement) {
      this.listElement.innerHTML = '';
      this.renderItems(this.block.items, this.listElement);
    }
  }

  /**
   * Render list items recursively
   */
  private renderItems(items: readonly ListItem[], parent: HTMLElement): void {
    for (const item of items) {
      const li = this.renderItem(item);
      parent.appendChild(li);
    }
  }

  /**
   * Render a single list item
   */
  private renderItem(item: ListItem): HTMLElement {
    const li = document.createElement('li');
    li.className = 'artoon-list__item';
    li.setAttribute('data-item-id', item.id);

    // Content wrapper
    const content = document.createElement('div');
    content.className = 'artoon-list__content';

    if (!this.options.readOnly) {
      content.contentEditable = 'true';
    }

    // Render inline content
    content.innerHTML = this.renderer.render(item.content);

    // Attach events
    if (!this.options.readOnly) {
      this.attachItemEvents(content, item.id);
    }

    li.appendChild(content);

    // Render children if any
    if (item.children && item.children.length > 0) {
      const tag = this.block.type === 'bullet-list' ? 'ul' : 'ol';
      const childList = document.createElement(tag);
      childList.className = 'artoon-list artoon-list--nested';
      this.renderItems(item.children, childList);
      li.appendChild(childList);
    }

    return li;
  }

  /**
   * Attach events to list item
   */
  private attachItemEvents(element: HTMLElement, itemId: string): void {
    element.addEventListener('input', () => this.handleItemInput(element, itemId));
    element.addEventListener('keydown', (e) => this.handleItemKeyDown(e, itemId));
    element.addEventListener('focus', () => this.handleItemFocus(itemId));
  }

  /**
   * Handle item input
   */
  private handleItemInput(element: HTMLElement, itemId: string): void {
    const newContent = this.parser.parseElement(element);

    if (this.options.onItemChange) {
      this.options.onItemChange(itemId, newContent);
    }

    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: this.block,
    });
  }

  /**
   * Handle item keydown
   */
  private handleItemKeyDown(e: KeyboardEvent, itemId: string): void {
    // Enter - add new item
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (this.options.onItemAdd) {
        this.options.onItemAdd(itemId);
      }
      return;
    }

    // Backspace at start - remove or outdent
    if (e.key === 'Backspace') {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.anchorOffset === 0) {
        e.preventDefault();
        if (this.options.onItemRemove) {
          this.options.onItemRemove(itemId);
        }
      }
      return;
    }

    // Tab - indent
    if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      if (this.options.onIndent) {
        this.options.onIndent(itemId);
      }
      return;
    }

    // Shift+Tab - outdent
    if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      if (this.options.onOutdent) {
        this.options.onOutdent(itemId);
      }
      return;
    }
  }

  /**
   * Handle item focus
   */
  private handleItemFocus(itemId: string): void {
    this.focusedItemId = itemId;
    this.focus();
  }

  /**
   * Focus a specific item
   */
  focusItem(itemId: string): void {
    const li = this.element?.querySelector(`[data-item-id="${itemId}"]`);
    const content = li?.querySelector('.artoon-list__content') as HTMLElement;
    if (content) {
      content.focus();
      this.focusedItemId = itemId;
    }
  }

  /**
   * Focus first item
   */
  focusFirstItem(): void {
    if (this.block.items.length > 0) {
      this.focusItem(this.block.items[0].id);
    }
  }

  /**
   * Focus last item
   */
  focusLastItem(): void {
    const lastItem = this.getLastItem(this.block.items);
    if (lastItem) {
      this.focusItem(lastItem.id);
    }
  }

  /**
   * Get focused item ID
   */
  getFocusedItemId(): string | null {
    return this.focusedItemId;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Item Operations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add item after specified item
   */
  addItemAfter(afterItemId: string, content: readonly InlineContent[] = []): ListItem {
    const newItem: ListItem = {
      id: generateId(),
      content,
    };

    const items = [...this.block.items];
    const index = items.findIndex(item => item.id === afterItemId);

    if (index !== -1) {
      items.splice(index + 1, 0, newItem);
    } else {
      items.push(newItem);
    }

    this.block = { ...this.block, items };
    this.updateElement();

    return newItem;
  }

  /**
   * Remove item
   */
  removeItem(itemId: string): boolean {
    const items = this.removeItemFromList(this.block.items, itemId);

    if (items !== this.block.items) {
      this.block = { ...this.block, items };
      this.updateElement();
      return true;
    }

    return false;
  }

  /**
   * Update item content
   */
  updateItemContent(itemId: string, content: readonly InlineContent[]): void {
    const items = this.updateItemInList(this.block.items, itemId, { content });
    this.block = { ...this.block, items };
  }

  /**
   * Indent item (make it a child of previous sibling)
   */
  indentItem(itemId: string): boolean {
    const items = [...this.block.items];
    const index = items.findIndex(item => item.id === itemId);

    if (index <= 0) return false; // Can't indent first item

    const item = items[index];
    const prevItem = items[index - 1];

    // Remove from current position
    items.splice(index, 1);

    // Add as child of previous item
    if (!prevItem.children) {
      prevItem.children = [];
    }
    prevItem.children.push(item);

    this.block = { ...this.block, items };
    this.updateElement();

    return true;
  }

  /**
   * Outdent item (move to parent level)
   */
  outdentItem(itemId: string): boolean {
    // Find item and its parent
    const result = this.findItemWithParent(this.block.items, itemId, null);
    if (!result || !result.parent) return false;

    const { item, parent, index } = result;

    // Remove from parent's children
    const newChildren = [...(parent.children || [])];
    newChildren.splice(index, 1);

    // Update parent
    const updatedParent = { ...parent };
    if (newChildren.length === 0) {
      delete updatedParent.children;
    } else {
      updatedParent.children = newChildren;
    }

    // Find parent in top-level items and add item after it
    const newItems = [...this.block.items];
    const parentIndex = newItems.findIndex(i => i.id === parent.id);

    if (parentIndex !== -1) {
      // Replace parent with updated version
      newItems[parentIndex] = updatedParent;
      // Insert item after parent
      newItems.splice(parentIndex + 1, 0, item);
    }

    this.block = { ...this.block, items: newItems };
    this.updateElement();

    return true;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Helper Methods
  // ═══════════════════════════════════════════════════════════════════════════

  private findItem(items: readonly ListItem[], id: string): ListItem | undefined {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = this.findItem(item.children, id);
        if (found) return found;
      }
    }
    return undefined;
  }

  private findItemWithParent(
    items: readonly ListItem[],
    id: string,
    parent: ListItem | null
  ): { item: ListItem; parent: ListItem | null; parentList: readonly ListItem[]; index: number } | null {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.id === id) {
        return { item, parent, parentList: items, index: i };
      }
      if (item.children) {
        const found = this.findItemWithParent(item.children, id, item);
        if (found) return found;
      }
    }
    return null;
  }

  private countItems(items: readonly ListItem[]): number {
    let count = items.length;
    for (const item of items) {
      if (item.children) {
        count += this.countItems(item.children);
      }
    }
    return count;
  }

  private getLastItem(items: readonly ListItem[]): ListItem | null {
    if (items.length === 0) return null;
    const last = items[items.length - 1];
    if (last.children && last.children.length > 0) {
      return this.getLastItem(last.children);
    }
    return last;
  }

  private removeItemFromList(items: readonly ListItem[], id: string): ListItem[] {
    const result: ListItem[] = [];

    for (const item of items) {
      if (item.id === id) continue;

      const newItem = { ...item };
      if (item.children) {
        newItem.children = this.removeItemFromList(item.children, id);
      }
      result.push(newItem);
    }

    return result;
  }

  private updateItemInList(
    items: readonly ListItem[],
    id: string,
    updates: Partial<ListItem>
  ): ListItem[] {
    return items.map(item => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      if (item.children) {
        return { ...item, children: this.updateItemInList(item.children, id, updates) };
      }
      return item;
    });
  }
}

/**
 * Create a list block view
 */
export function createListBlockView(options: ListBlockViewOptions): ListBlockView {
  return new ListBlockView(options);
}
