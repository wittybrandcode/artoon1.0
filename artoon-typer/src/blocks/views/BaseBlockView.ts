/**
 * BaseBlockView
 * 
 * Base class for all block views.
 * Handles common functionality like direction, focus, and events.
 */

import type { Block, Direction, BlockEvent } from '../../types';

/**
 * Block view options
 */
export interface BlockViewOptions {
  /** Block data */
  block: Block;
  /** Event handler */
  onEvent?: (event: BlockEvent) => void;
  /** Is read-only */
  readOnly?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * Base class for block views
 */
export abstract class BaseBlockView {
  protected block: Block;
  protected element: HTMLElement | null = null;
  protected options: BlockViewOptions;
  protected isFocused: boolean = false;
  
  constructor(options: BlockViewOptions) {
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Get the block ID
   */
  get id(): string {
    return this.block.id;
  }
  
  /**
   * Get the block type
   */
  get type(): string {
    return this.block.type;
  }
  
  /**
   * Get the block direction
   */
  get direction(): Direction {
    return this.block.direction;
  }
  
  /**
   * Get the DOM element
   */
  getElement(): HTMLElement | null {
    return this.element;
  }
  
  /**
   * Create the DOM element
   */
  abstract render(): HTMLElement;
  
  /**
   * Update the view with new block data
   */
  update(block: Block): void {
    this.block = block;
    if (this.element) {
      this.updateElement();
    }
  }
  
  /**
   * Update the DOM element
   */
  protected abstract updateElement(): void;
  
  /**
   * Focus the block
   */
  focus(): void {
    this.isFocused = true;
    if (this.element) {
      this.element.classList.add('artoon-block--focused');
      this.onFocus();
    }
  }
  
  /**
   * Blur the block
   */
  blur(): void {
    this.isFocused = false;
    if (this.element) {
      this.element.classList.remove('artoon-block--focused');
      this.onBlur();
    }
  }
  
  /**
   * Called when block is focused
   */
  protected onFocus(): void {
    // Override in subclasses
  }
  
  /**
   * Called when block is blurred
   */
  protected onBlur(): void {
    // Override in subclasses
  }
  
  /**
   * Destroy the view and clean up
   */
  destroy(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
  }
  
  /**
   * Emit a block event
   */
  protected emit(event: BlockEvent): void {
    if (this.options.onEvent) {
      this.options.onEvent(event);
    }
  }
  
  /**
   * Create the base wrapper element
   */
  protected createWrapper(tagName: string = 'div'): HTMLElement {
    const el = document.createElement(tagName);
    el.id = `block-${this.block.id}`;
    el.className = this.getClassName();
    el.setAttribute('data-block-id', this.block.id);
    el.setAttribute('data-block-type', this.block.type);
    el.dir = this.block.direction;
    
    if (this.options.readOnly) {
      el.setAttribute('data-readonly', 'true');
    }
    
    return el;
  }
  
  /**
   * Get the CSS class name
   */
  protected getClassName(): string {
    const classes = [
      'artoon-block',
      `artoon-block--${this.block.type}`,
      `artoon-block--${this.block.direction}`,
    ];
    
    if (this.isFocused) {
      classes.push('artoon-block--focused');
    }
    
    if (this.options.readOnly) {
      classes.push('artoon-block--readonly');
    }
    
    if (this.options.className) {
      classes.push(this.options.className);
    }
    
    if (this.block.meta?.className) {
      classes.push(this.block.meta.className);
    }
    
    return classes.join(' ');
  }
  
  /**
   * Apply custom styles from block meta
   */
  protected applyStyles(element: HTMLElement): void {
    if (this.block.meta?.style) {
      for (const [key, value] of Object.entries(this.block.meta.style)) {
        (element.style as any)[key] = value;
      }
    }
    
    if (this.block.meta?.data) {
      for (const [key, value] of Object.entries(this.block.meta.data)) {
        element.setAttribute(`data-${key}`, value);
      }
    }
  }
}
