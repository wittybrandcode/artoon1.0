/**
 * CustomBlockView
 * 
 * View for user-defined custom blocks.
 * Supports nested children and custom fields.
 */

import type { CustomBlock, CustomBlockChild, InlineContent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { generateId } from '../../core/utils';

/**
 * Custom block view options
 */
export interface CustomBlockViewOptions extends BlockViewOptions {
  block: CustomBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<CustomBlock>) => void;
}

/**
 * CustomBlockView - handles custom blocks
 */
export class CustomBlockView extends BaseBlockView {
  protected block: CustomBlock;
  protected options: CustomBlockViewOptions;
  protected childrenContainer: HTMLElement | null = null;
  
  constructor(options: CustomBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Get block name
   */
  getName(): string {
    return this.block.name;
  }
  
  /**
   * Get children
   */
  getChildren(): CustomBlockChild[] {
    return this.block.children;
  }
  
  /**
   * Get fields
   */
  getFields(): Record<string, string> {
    return this.block.fields || {};
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    const container = document.createElement('div');
    container.className = `artoon-block__content artoon-block__custom artoon-custom-${this.block.name}`;
    
    // Header
    const header = document.createElement('div');
    header.className = 'artoon-custom-header';
    
    const icon = document.createElement('span');
    icon.className = 'artoon-custom-icon';
    icon.textContent = '🧩';
    header.appendChild(icon);
    
    if (this.options.readOnly) {
      const title = document.createElement('span');
      title.className = 'artoon-custom-title';
      title.textContent = this.block.name;
      header.appendChild(title);
    } else {
      const nameInput = document.createElement('input');
      nameInput.type = 'text';
      nameInput.className = 'artoon-custom-name-input';
      nameInput.value = this.block.name;
      nameInput.placeholder = 'اسم البلوك';
      nameInput.addEventListener('input', () => {
        this.notifyChange({ name: nameInput.value });
      });
      header.appendChild(nameInput);
    }
    
    container.appendChild(header);
    
    // Children container
    this.childrenContainer = document.createElement('div');
    this.childrenContainer.className = 'artoon-custom-children';
    this.renderChildren();
    container.appendChild(this.childrenContainer);
    
    // Add child button
    if (!this.options.readOnly) {
      const addBtn = document.createElement('button');
      addBtn.type = 'button';
      addBtn.className = 'artoon-custom-add-btn';
      addBtn.textContent = '+ إضافة عنصر';
      addBtn.onclick = () => this.addChild();
      container.appendChild(addBtn);
    }
    
    this.applyStyles(this.element);
    this.element.appendChild(container);
    return this.element;
  }
  
  /**
   * Render children
   */
  private renderChildren(): void {
    if (!this.childrenContainer) return;
    
    this.childrenContainer.innerHTML = '';
    
    this.block.children.forEach((child, index) => {
      const childEl = this.renderChild(child, index);
      this.childrenContainer!.appendChild(childEl);
    });
  }
  
  /**
   * Render a single child
   */
  private renderChild(child: CustomBlockChild, index: number): HTMLElement {
    const row = document.createElement('div');
    row.className = 'artoon-custom-child';
    row.setAttribute('data-child-id', child.id);
    
    // Type selector
    const typeSelect = document.createElement('select');
    typeSelect.className = 'artoon-custom-child-type';
    typeSelect.disabled = this.options.readOnly || false;
    
    const types = ['p', 't1', 't2', 't3', 'q', 'img', 'code'];
    types.forEach(t => {
      const option = document.createElement('option');
      option.value = t;
      option.textContent = t;
      option.selected = child.type === t;
      typeSelect.appendChild(option);
    });
    
    typeSelect.addEventListener('change', () => {
      this.updateChild(index, { type: typeSelect.value });
    });
    
    row.appendChild(typeSelect);
    
    // Content input
    const contentInput = document.createElement('input');
    contentInput.type = 'text';
    contentInput.className = 'artoon-custom-child-content';
    contentInput.value = typeof child.content === 'string' 
      ? child.content 
      : this.inlineToText(child.content as InlineContent[]);
    contentInput.placeholder = 'المحتوى';
    contentInput.readOnly = this.options.readOnly || false;
    
    contentInput.addEventListener('input', () => {
      this.updateChild(index, { content: contentInput.value });
    });
    
    row.appendChild(contentInput);
    
    // Delete button
    if (!this.options.readOnly) {
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'artoon-custom-delete-btn';
      deleteBtn.textContent = '×';
      deleteBtn.title = 'حذف';
      deleteBtn.onclick = () => this.deleteChild(index);
      row.appendChild(deleteBtn);
    }
    
    return row;
  }
  
  /**
   * Convert inline content to text
   */
  private inlineToText(content: InlineContent[]): string {
    return content.map(c => {
      if (typeof c === 'string') return c;
      if ('text' in c) return c.text;
      return '';
    }).join('');
  }
  
  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName();
      this.element.dir = this.block.direction;
    }
    this.renderChildren();
  }
  
  /**
   * Add a new child
   */
  addChild(type: string = 'p'): void {
    const newChild: CustomBlockChild = {
      id: generateId('child'),
      type,
      content: '',
    };
    
    const children = [...this.block.children, newChild];
    this.notifyChange({ children });
  }
  
  /**
   * Delete a child
   */
  deleteChild(index: number): void {
    const children = this.block.children.filter((_, i) => i !== index);
    this.notifyChange({ children });
  }
  
  /**
   * Update a child
   */
  updateChild(index: number, updates: Partial<CustomBlockChild>): void {
    const children = [...this.block.children];
    children[index] = { ...children[index], ...updates };
    this.notifyChange({ children });
  }
  
  /**
   * Set a field value
   */
  setField(name: string, value: string): void {
    const fields = { ...this.block.fields, [name]: value };
    this.notifyChange({ fields });
  }
  
  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<CustomBlock>): void {
    if (this.options.onBlockChange) {
      this.options.onBlockChange(updates);
    }
    
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: { ...this.block, ...updates },
    });
  }
  
  protected onFocus(): void {
    if (this.childrenContainer) {
      const firstInput = this.childrenContainer.querySelector('input');
      if (firstInput) {
        firstInput.focus();
      }
    }
  }
}

/**
 * Create a custom block view
 */
export function createCustomBlockView(options: CustomBlockViewOptions): CustomBlockView {
  return new CustomBlockView(options);
}
