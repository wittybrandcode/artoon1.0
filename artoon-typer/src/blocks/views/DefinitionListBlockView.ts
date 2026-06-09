/**
 * DefinitionListBlockView
 * 
 * View for definition list blocks (dl/dt/dd).
 * Handles term-definition pairs with inline formatting.
 */

import type { DefinitionListBlock, DefinitionItem, InlineContent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';
import { InlineParser, createInlineParser } from '../../inline/InlineParser';
import { generateId } from '../../core/utils';

/**
 * Definition list block view options
 */
export interface DefinitionListBlockViewOptions extends BlockViewOptions {
  block: DefinitionListBlock;
  /** On items change */
  onItemsChange?: (items: DefinitionItem[]) => void;
}

/**
 * DefinitionListBlockView - handles definition list blocks
 */
export class DefinitionListBlockView extends BaseBlockView {
  protected block: DefinitionListBlock;
  protected options: DefinitionListBlockViewOptions;
  protected dlElement: HTMLDListElement | null = null;
  
  private renderer: InlineRenderer;
  private parser: InlineParser;
  
  constructor(options: DefinitionListBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
    
    this.renderer = createInlineRenderer({ escapeHtml: true });
    this.parser = createInlineParser({ mergeAdjacent: true });
  }
  
  /**
   * Get items
   */
  getItems(): DefinitionItem[] {
    return this.block.items;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    // Create dl element
    this.dlElement = document.createElement('dl');
    this.dlElement.className = 'artoon-block__content artoon-block__dl';
    this.dlElement.dir = this.block.direction;
    
    // Render items
    this.renderItems();
    
    // Add button
    if (!this.options.readOnly) {
      const addBtn = this.createAddButton();
      this.element.appendChild(this.dlElement);
      this.element.appendChild(addBtn);
    } else {
      this.element.appendChild(this.dlElement);
    }
    
    // Apply styles
    this.applyStyles(this.element);
    
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
    if (this.dlElement) {
      this.dlElement.dir = this.block.direction;
      this.renderItems();
    }
  }
  
  /**
   * Render all items
   */
  private renderItems(): void {
    if (!this.dlElement) return;
    
    // Clear existing
    this.dlElement.innerHTML = '';
    
    // Render each item
    this.block.items.forEach((item, index) => {
      const itemEl = this.renderItem(item, index);
      this.dlElement!.appendChild(itemEl);
    });
  }
  
  /**
   * Render a single item
   */
  private renderItem(item: DefinitionItem, index: number): HTMLElement {
    const container = document.createElement('div');
    container.className = 'artoon-dl-item';
    container.setAttribute('data-item-id', item.id);
    
    // Term (dt)
    const dt = document.createElement('dt');
    dt.className = 'artoon-dl-term';
    dt.innerHTML = this.renderer.render(item.term) || '';
    
    if (!this.options.readOnly) {
      dt.contentEditable = 'true';
      dt.setAttribute('data-placeholder', 'المصطلح...');
      dt.addEventListener('input', () => {
        this.updateItem(index, 'term', this.parser.parseElement(dt));
      });
    }
    
    // Definition (dd)
    const dd = document.createElement('dd');
    dd.className = 'artoon-dl-definition';
    dd.innerHTML = this.renderer.render(item.definition) || '';
    
    if (!this.options.readOnly) {
      dd.contentEditable = 'true';
      dd.setAttribute('data-placeholder', 'التعريف...');
      dd.addEventListener('input', () => {
        this.updateItem(index, 'definition', this.parser.parseElement(dd));
      });
    }
    
    container.appendChild(dt);
    container.appendChild(dd);
    
    // Delete button
    if (!this.options.readOnly && this.block.items.length > 1) {
      const deleteBtn = this.createDeleteButton(index);
      container.appendChild(deleteBtn);
    }
    
    return container;
  }
  
  /**
   * Create add button
   */
  private createAddButton(): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'artoon-dl-add-btn';
    btn.textContent = '+ إضافة مصطلح';
    btn.onclick = () => this.addItem();
    return btn;
  }
  
  /**
   * Create delete button
   */
  private createDeleteButton(index: number): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'artoon-dl-delete-btn';
    btn.textContent = '×';
    btn.title = 'حذف';
    btn.onclick = (e) => {
      e.stopPropagation();
      this.deleteItem(index);
    };
    return btn;
  }
  
  /**
   * Add a new item
   */
  addItem(): void {
    const newItem: DefinitionItem = {
      id: generateId('di'),
      term: [],
      definition: [],
    };
    
    const items = [...this.block.items, newItem];
    this.notifyItemsChange(items);
  }
  
  /**
   * Delete an item
   */
  deleteItem(index: number): void {
    if (this.block.items.length <= 1) return;
    
    const items = this.block.items.filter((_, i) => i !== index);
    this.notifyItemsChange(items);
  }
  
  /**
   * Update an item
   */
  updateItem(index: number, field: 'term' | 'definition', content: readonly InlineContent[]): void {
    const items = [...this.block.items];
    items[index] = { ...items[index], [field]: content };
    this.notifyItemsChange(items);
  }
  
  /**
   * Notify items change
   */
  private notifyItemsChange(items: DefinitionItem[]): void {
    if (this.options.onItemsChange) {
      this.options.onItemsChange(items);
    }
    
    // Emit update event
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: { ...this.block, items },
    });
  }
  
  protected onFocus(): void {
    // Focus first term
    if (this.dlElement) {
      const firstDt = this.dlElement.querySelector('dt');
      if (firstDt instanceof HTMLElement) {
        firstDt.focus();
      }
    }
  }
}

/**
 * Create a definition list block view
 */
export function createDefinitionListBlockView(options: DefinitionListBlockViewOptions): DefinitionListBlockView {
  return new DefinitionListBlockView(options);
}
