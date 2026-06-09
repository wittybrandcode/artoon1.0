/**
 * LineBreakBlockView
 * 
 * View for line break blocks.
 * Simple visual separator that can be added with Shift+Enter.
 */

import type { LineBreakBlock } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Line break block view options
 */
export interface LineBreakBlockViewOptions extends BlockViewOptions {
  block: LineBreakBlock;
}

/**
 * LineBreakBlockView - handles line break blocks
 */
export class LineBreakBlockView extends BaseBlockView {
  protected block: LineBreakBlock;
  protected options: LineBreakBlockViewOptions;
  
  constructor(options: LineBreakBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    this.element.classList.add('artoon-block--line-break');
    
    // Create visual separator
    const separator = document.createElement('hr');
    separator.className = 'artoon-line-break';
    
    // Apply styles
    this.applyStyles(this.element);
    
    this.element.appendChild(separator);
    return this.element;
  }
  
  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName();
      this.element.classList.add('artoon-block--line-break');
    }
  }
}

/**
 * Create a line break block view
 */
export function createLineBreakBlockView(options: LineBreakBlockViewOptions): LineBreakBlockView {
  return new LineBreakBlockView(options);
}
