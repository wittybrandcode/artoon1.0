/**
 * WordBreakBlockView
 * 
 * View for word break (wbr) blocks.
 * Provides a word break opportunity for long words.
 */

import type { WordBreakBlock } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Word break block view options
 */
export interface WordBreakBlockViewOptions extends BlockViewOptions {
  block: WordBreakBlock;
}

/**
 * WordBreakBlockView - handles word break blocks
 */
export class WordBreakBlockView extends BaseBlockView {
  protected block: WordBreakBlock;
  protected options: WordBreakBlockViewOptions;
  
  constructor(options: WordBreakBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    const container = document.createElement('div');
    container.className = 'artoon-block__content artoon-block__wbr';
    
    // Visual indicator (only visible in editor)
    const indicator = document.createElement('span');
    indicator.className = 'artoon-wbr-indicator';
    indicator.textContent = '⎵';
    indicator.title = 'فاصل كلمة (wbr)';
    
    // Actual wbr element
    const wbr = document.createElement('wbr');
    
    container.appendChild(indicator);
    container.appendChild(wbr);
    
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
  }
  
  protected onFocus(): void {
    // Word break is not focusable
  }
}

/**
 * Create a word break block view
 */
export function createWordBreakBlockView(options: WordBreakBlockViewOptions): WordBreakBlockView {
  return new WordBreakBlockView(options);
}
