/**
 * DividerBlockView
 * 
 * View for divider/separator blocks.
 */

import type { DividerBlock } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Divider block view options
 */
export interface DividerBlockViewOptions extends BlockViewOptions {
  block: DividerBlock;
}

/**
 * DividerBlockView - handles divider blocks
 */
export class DividerBlockView extends BaseBlockView {
  protected block: DividerBlock;
  protected options: DividerBlockViewOptions;
  protected hrElement: HTMLHRElement | null = null;
  
  constructor(options: DividerBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    this.element.classList.add('artoon-divider-block');
    
    // Create hr element
    this.hrElement = document.createElement('hr');
    this.hrElement.className = 'artoon-divider-block__hr';
    
    this.element.appendChild(this.hrElement);
    
    // Apply styles
    this.applyStyles(this.element);
    
    // Make focusable
    this.element.tabIndex = 0;
    this.element.addEventListener('focus', () => this.focus());
    this.element.addEventListener('blur', () => this.blur());
    this.element.addEventListener('keydown', this.handleKeyDown.bind(this));
    
    return this.element;
  }
  
  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName() + ' artoon-divider-block';
      this.element.dir = this.block.direction;
    }
  }
  
  /**
   * Handle keydown for deletion
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      this.emit({
        type: 'remove',
        blockId: this.block.id,
        block: this.block,
      });
    }
  }
  
  /**
   * Focus the divider
   */
  protected onFocus(): void {
    if (this.element) {
      this.element.focus();
    }
  }
}

/**
 * Create a divider block view
 */
export function createDividerBlockView(options: DividerBlockViewOptions): DividerBlockView {
  return new DividerBlockView(options);
}
