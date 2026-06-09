/**
 * PreBlockView
 * 
 * View for preformatted text blocks.
 * Preserves whitespace and uses monospace font.
 * No inline formatting allowed.
 */

import type { PreformattedBlock, SelectionState } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Pre block view options
 */
export interface PreBlockViewOptions extends BlockViewOptions {
  block: PreformattedBlock;
  /** Placeholder text */
  placeholder?: string;
  /** On content change */
  onContentChange?: (content: string) => void;
  /** On enter key */
  onEnter?: () => void;
  /** On backspace at start */
  onBackspaceAtStart?: () => void;
}

/**
 * PreBlockView - handles preformatted text blocks
 */
export class PreBlockView extends BaseBlockView {
  protected block: PreformattedBlock;
  protected options: PreBlockViewOptions;
  protected contentElement: HTMLPreElement | null = null;
  
  constructor(options: PreBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Get the content element
   */
  getContentElement(): HTMLPreElement | null {
    return this.contentElement;
  }
  
  /**
   * Get current content
   */
  getContent(): string {
    return this.block.content;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    // Create pre element
    this.contentElement = document.createElement('pre');
    this.contentElement.className = 'artoon-block__content artoon-block__pre';
    
    if (!this.options.readOnly) {
      this.contentElement.contentEditable = 'true';
      this.contentElement.setAttribute('data-placeholder', this.options.placeholder || 'نص محفوظ التنسيق...');
    }
    
    // Set content
    this.contentElement.textContent = this.block.content;
    
    // Apply styles
    this.applyStyles(this.element);
    
    // Attach events
    this.attachEvents();
    
    this.element.appendChild(this.contentElement);
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
    if (this.contentElement) {
      this.contentElement.textContent = this.block.content;
    }
  }
  
  /**
   * Attach event listeners
   */
  private attachEvents(): void {
    if (!this.contentElement || this.options.readOnly) return;
    
    this.contentElement.addEventListener('input', this.handleInput.bind(this));
    this.contentElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.contentElement.addEventListener('paste', this.handlePaste.bind(this));
    this.contentElement.addEventListener('focus', this.handleFocus.bind(this));
    this.contentElement.addEventListener('blur', this.handleBlur.bind(this));
  }
  
  /**
   * Handle input event
   */
  private handleInput(): void {
    if (!this.contentElement) return;
    
    const newContent = this.contentElement.textContent || '';
    
    // Notify change
    if (this.options.onContentChange) {
      this.options.onContentChange(newContent);
    }
    
    // Emit update event
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: { ...this.block, content: newContent },
    });
  }
  
  /**
   * Handle keydown event
   */
  private handleKeyDown(e: KeyboardEvent): void {
    // Backspace at start
    if (e.key === 'Backspace') {
      const selection = window.getSelection();
      if (selection && selection.isCollapsed && selection.anchorOffset === 0) {
        e.preventDefault();
        if (this.options.onBackspaceAtStart) {
          this.options.onBackspaceAtStart();
        }
      }
      return;
    }
    
    // Prevent formatting shortcuts
    if ((e.ctrlKey || e.metaKey) && ['b', 'i', 'u'].includes(e.key)) {
      e.preventDefault();
    }
  }
  
  /**
   * Handle paste - always paste as plain text
   */
  private handlePaste(e: ClipboardEvent): void {
    e.preventDefault();
    const text = e.clipboardData?.getData('text/plain') || '';
    document.execCommand('insertText', false, text);
  }
  
  /**
   * Handle focus event
   */
  private handleFocus(): void {
    this.focus();
    this.emit({
      type: 'focus',
      blockId: this.block.id,
      block: this.block,
    });
  }
  
  /**
   * Handle blur event
   */
  private handleBlur(): void {
    this.blur();
  }
  
  protected onFocus(): void {
    if (this.contentElement) {
      this.contentElement.focus();
    }
  }
  
  /**
   * Focus at start
   */
  focusAtStart(): void {
    this.focus();
    if (this.contentElement) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.setStart(this.contentElement, 0);
      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }
  
  /**
   * Focus at end
   */
  focusAtEnd(): void {
    this.focus();
    if (this.contentElement) {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(this.contentElement);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }
}

/**
 * Create a pre block view
 */
export function createPreBlockView(options: PreBlockViewOptions): PreBlockView {
  return new PreBlockView(options);
}
