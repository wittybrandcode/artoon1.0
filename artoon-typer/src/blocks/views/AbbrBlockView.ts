/**
 * AbbrBlockView
 * 
 * View for abbreviation blocks.
 * Displays abbreviation with tooltip showing full expansion.
 */

import type { AbbrBlock } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Abbr block view options
 */
export interface AbbrBlockViewOptions extends BlockViewOptions {
  block: AbbrBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<AbbrBlock>) => void;
}

/**
 * AbbrBlockView - handles abbreviation blocks
 */
export class AbbrBlockView extends BaseBlockView {
  protected block: AbbrBlock;
  protected options: AbbrBlockViewOptions;
  protected abbrElement: HTMLElement | null = null;
  protected titleInput: HTMLInputElement | null = null;
  
  constructor(options: AbbrBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Get abbreviation
   */
  getAbbr(): string {
    return this.block.abbr;
  }
  
  /**
   * Get title/expansion
   */
  getTitle(): string {
    return this.block.title;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    const container = document.createElement('div');
    container.className = 'artoon-block__content artoon-block__abbr';
    
    // Abbreviation element
    this.abbrElement = document.createElement('abbr');
    this.abbrElement.className = 'artoon-abbr-text';
    this.abbrElement.title = this.block.title;
    this.abbrElement.textContent = this.block.abbr;
    
    if (!this.options.readOnly) {
      // Make abbreviation editable
      this.abbrElement.contentEditable = 'true';
      this.abbrElement.setAttribute('data-placeholder', 'الاختصار...');
      this.abbrElement.addEventListener('input', () => {
        this.notifyChange({ abbr: this.abbrElement?.textContent || '' });
      });
      
      // Title input
      const titleContainer = document.createElement('div');
      titleContainer.className = 'artoon-abbr-title-container';
      
      const titleLabel = document.createElement('label');
      titleLabel.className = 'artoon-abbr-title-label';
      titleLabel.textContent = 'التوسيع:';
      
      this.titleInput = document.createElement('input');
      this.titleInput.type = 'text';
      this.titleInput.className = 'artoon-abbr-title-input';
      this.titleInput.value = this.block.title;
      this.titleInput.placeholder = 'النص الكامل...';
      this.titleInput.addEventListener('input', () => {
        const newTitle = this.titleInput?.value || '';
        this.notifyChange({ title: newTitle });
        if (this.abbrElement) {
          this.abbrElement.title = newTitle;
        }
      });
      
      titleContainer.appendChild(titleLabel);
      titleContainer.appendChild(this.titleInput);
      
      container.appendChild(this.abbrElement);
      container.appendChild(titleContainer);
    } else {
      container.appendChild(this.abbrElement);
    }
    
    // Apply styles
    this.applyStyles(this.element);
    
    this.element.appendChild(container);
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
    if (this.abbrElement) {
      this.abbrElement.textContent = this.block.abbr;
      this.abbrElement.title = this.block.title;
    }
    if (this.titleInput) {
      this.titleInput.value = this.block.title;
    }
  }
  
  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<AbbrBlock>): void {
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
    if (this.abbrElement) {
      this.abbrElement.focus();
    }
  }
}

/**
 * Create an abbr block view
 */
export function createAbbrBlockView(options: AbbrBlockViewOptions): AbbrBlockView {
  return new AbbrBlockView(options);
}
