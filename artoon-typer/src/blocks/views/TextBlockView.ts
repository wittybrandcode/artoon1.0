/**
 * TextBlockView
 * 
 * View for text-based blocks (paragraph, heading, quote).
 * Handles contenteditable, inline formatting, and selection.
 */

import type { TextBlock, InlineContent, SelectionState, MarkType } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';
import { InlineParser, createInlineParser } from '../../inline/InlineParser';
import { MarkManager, createMarkManager } from '../../inline/MarkManager';

/**
 * Text block view options
 */
export interface TextBlockViewOptions extends BlockViewOptions {
  block: TextBlock;
  /** Placeholder text */
  placeholder?: string;
  /** On content change */
  onContentChange?: (content: readonly InlineContent[]) => void;
  /** On selection change */
  onSelectionChange?: (selection: SelectionState | null) => void;
  /** On enter key */
  onEnter?: (atStart: boolean) => void;
  /** On backspace at start */
  onBackspaceAtStart?: () => void;
  /** On delete at end */
  onDeleteAtEnd?: () => void;
}

/**
 * Tag mapping for text block types
 */
const TYPE_TO_TAG: Record<string, string> = {
  'paragraph': 'p',
  'heading1': 'h1',
  'heading2': 'h2',
  'heading3': 'h3',
  'heading4': 'h4',
  'heading5': 'h5',
  'heading6': 'h6',
  'quote': 'blockquote',
};

/**
 * TextBlockView - handles text-based blocks
 */
export class TextBlockView extends BaseBlockView {
  protected block: TextBlock;
  protected options: TextBlockViewOptions;
  protected contentElement: HTMLElement | null = null;

  private renderer: InlineRenderer;
  private parser: InlineParser;
  private markManager: MarkManager;
  private isComposing: boolean = false;

  constructor(options: TextBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;

    this.renderer = createInlineRenderer({ escapeHtml: true });
    this.parser = createInlineParser({ mergeAdjacent: true });
    this.markManager = createMarkManager();
  }

  /**
   * Get the content element
   */
  getContentElement(): HTMLElement | null {
    return this.contentElement;
  }

  /**
   * Get current content
   */
  getContent(): readonly InlineContent[] {
    return this.block.content;
  }

  /**
   * Get plain text content
   */
  getPlainText(): string {
    return this.markManager.getPlainText(this.block.content);
  }

  /**
   * Get content length
   */
  getLength(): number {
    return this.markManager.getLength(this.block.content);
  }

  /**
   * Render the block
   */
  render(): HTMLElement {
    const tag = TYPE_TO_TAG[this.block.type] || 'p';
    this.element = this.createWrapper('div');

    // Create content element
    this.contentElement = document.createElement(tag);
    this.contentElement.className = 'artoon-block__content';

    if (!this.options.readOnly) {
      this.contentElement.contentEditable = 'true';
      this.contentElement.setAttribute('data-placeholder', this.options.placeholder || '');
    }

    // Render content
    this.renderContent();

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
    this.renderContent();
  }

  /**
   * Render inline content
   */
  private renderContent(): void {
    if (!this.contentElement) return;

    const html = this.renderer.render(this.block.content);
    this.contentElement.innerHTML = html || '';

    // Add empty class for placeholder
    if (!html) {
      this.contentElement.classList.add('artoon-block__content--empty');
    } else {
      this.contentElement.classList.remove('artoon-block__content--empty');
    }
  }

  /**
   * Attach event listeners
   */
  private attachEvents(): void {
    if (!this.contentElement || this.options.readOnly) return;

    this.contentElement.addEventListener('input', this.handleInput.bind(this));
    this.contentElement.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.contentElement.addEventListener('compositionstart', () => this.isComposing = true);
    this.contentElement.addEventListener('compositionend', () => {
      this.isComposing = false;
      this.handleInput();
    });
    this.contentElement.addEventListener('focus', this.handleFocus.bind(this));
    this.contentElement.addEventListener('blur', this.handleBlur.bind(this));

    // Selection change
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));
  }

  /**
   * Handle input event
   */
  private handleInput(): void {
    if (this.isComposing || !this.contentElement) return;

    // Parse HTML back to InlineContent
    const newContent = this.parser.parseElement(this.contentElement);

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
    // Enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const selection = this.getSelection();
      const atStart = selection ? selection.anchorOffset === 0 : false;

      if (this.options.onEnter) {
        this.options.onEnter(atStart);
      }
      return;
    }

    // Backspace at start
    if (e.key === 'Backspace') {
      const selection = this.getSelection();
      if (selection && selection.isCollapsed && selection.anchorOffset === 0) {
        e.preventDefault();
        if (this.options.onBackspaceAtStart) {
          this.options.onBackspaceAtStart();
        }
      }
      return;
    }

    // Delete at end
    if (e.key === 'Delete') {
      const selection = this.getSelection();
      const length = this.getLength();
      if (selection && selection.isCollapsed && selection.anchorOffset >= length) {
        e.preventDefault();
        if (this.options.onDeleteAtEnd) {
          this.options.onDeleteAtEnd();
        }
      }
      return;
    }

    // Format shortcuts
    if (e.ctrlKey || e.metaKey) {
      let mark: MarkType | null = null;

      if (e.key === 'b') mark = 'bold';
      else if (e.key === 'i') mark = 'italic';
      else if (e.key === 'u') mark = 'underline';

      if (mark) {
        e.preventDefault();
        this.toggleMark(mark);
      }
    }
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

  /**
   * Handle selection change
   */
  private handleSelectionChange(): void {
    if (!this.isFocused || !this.contentElement) return;

    const selection = this.getSelection();
    if (this.options.onSelectionChange) {
      this.options.onSelectionChange(selection);
    }
  }

  /**
   * Get current selection state
   */
  getSelection(): SelectionState | null {
    const sel = window.getSelection();
    if (!sel || !this.contentElement) return null;

    // Check if selection is within this block
    if (!this.contentElement.contains(sel.anchorNode)) return null;

    const anchorOffset = this.getTextOffset(sel.anchorNode, sel.anchorOffset);
    const focusOffset = this.getTextOffset(sel.focusNode, sel.focusOffset);

    return {
      blockId: this.block.id,
      anchorOffset,
      focusOffset,
      isCollapsed: sel.isCollapsed,
    };
  }

  /**
   * Set selection
   */
  setSelection(start: number, end?: number): void {
    if (!this.contentElement) return;

    const range = document.createRange();
    const sel = window.getSelection();
    if (!sel) return;

    const startPos = this.getNodeAndOffset(start);
    const endPos = end !== undefined ? this.getNodeAndOffset(end) : startPos;

    if (startPos && endPos) {
      range.setStart(startPos.node, startPos.offset);
      range.setEnd(endPos.node, endPos.offset);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }

  /**
   * Get text offset from node and offset
   */
  private getTextOffset(node: Node | null, offset: number): number {
    if (!node || !this.contentElement) return 0;

    let totalOffset = 0;
    const walker = document.createTreeWalker(
      this.contentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      if (currentNode === node) {
        return totalOffset + offset;
      }
      totalOffset += currentNode.textContent?.length || 0;
      currentNode = walker.nextNode();
    }

    return totalOffset;
  }

  /**
   * Get node and offset from text offset
   */
  private getNodeAndOffset(offset: number): { node: Node; offset: number } | null {
    if (!this.contentElement) return null;

    let currentOffset = 0;
    const walker = document.createTreeWalker(
      this.contentElement,
      NodeFilter.SHOW_TEXT,
      null
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      const length = currentNode.textContent?.length || 0;
      if (currentOffset + length >= offset) {
        return { node: currentNode, offset: offset - currentOffset };
      }
      currentOffset += length;
      currentNode = walker.nextNode();
    }

    // Return last position
    const lastChild = this.contentElement.lastChild;
    if (lastChild) {
      return {
        node: lastChild,
        offset: lastChild.textContent?.length || 0
      };
    }

    return { node: this.contentElement, offset: 0 };
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Mark Operations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Apply a mark to selection
   */
  applyMark(mark: MarkType): void {
    const selection = this.getSelection();
    if (!selection || selection.isCollapsed) return;

    const from = Math.min(selection.anchorOffset, selection.focusOffset);
    const to = Math.max(selection.anchorOffset, selection.focusOffset);

    const newContent = this.markManager.applyMark(this.block.content, from, to, mark);
    this.notifyContentChange(newContent);
  }

  /**
   * Remove a mark from selection
   */
  removeMark(mark: MarkType): void {
    const selection = this.getSelection();
    if (!selection || selection.isCollapsed) return;

    const from = Math.min(selection.anchorOffset, selection.focusOffset);
    const to = Math.max(selection.anchorOffset, selection.focusOffset);

    const newContent = this.markManager.removeMark(this.block.content, from, to, mark);
    this.notifyContentChange(newContent);
  }

  /**
   * Toggle a mark on selection
   */
  toggleMark(mark: MarkType): void {
    const selection = this.getSelection();
    if (!selection || selection.isCollapsed) return;

    const from = Math.min(selection.anchorOffset, selection.focusOffset);
    const to = Math.max(selection.anchorOffset, selection.focusOffset);

    const newContent = this.markManager.toggleMark(this.block.content, from, to, mark);
    this.notifyContentChange(newContent);
  }

  /**
   * Check if selection has a mark
   */
  hasMarkInSelection(mark: MarkType): boolean {
    const selection = this.getSelection();
    if (!selection || selection.isCollapsed) return false;

    const from = Math.min(selection.anchorOffset, selection.focusOffset);
    const to = Math.max(selection.anchorOffset, selection.focusOffset);

    return this.markManager.hasMarkInRange(this.block.content, from, to, mark);
  }

  /**
   * Get active marks at cursor
   */
  getActiveMarks(): MarkType[] {
    const selection = this.getSelection();
    if (!selection) return [];

    return this.markManager.getActiveMarks(this.block.content, selection.anchorOffset);
  }

  /**
   * Notify content change
   */
  private notifyContentChange(newContent: readonly InlineContent[]): void {
    if (this.options.onContentChange) {
      this.options.onContentChange(newContent);
    }

    // Update internal state
    this.block = { ...this.block, content: newContent };
    this.renderContent();
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Focus
  // ═══════════════════════════════════════════════════════════════════════════

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
    this.setSelection(0);
  }

  /**
   * Focus at end
   */
  focusAtEnd(): void {
    this.focus();
    const length = this.getLength();
    this.setSelection(length);
  }

  /**
   * Focus at position
   */
  focusAt(position: number): void {
    this.focus();
    this.setSelection(position);
  }

  /**
   * Destroy and clean up
   */
  destroy(): void {
    document.removeEventListener('selectionchange', this.handleSelectionChange.bind(this));
    super.destroy();
  }
}

/**
 * Create a text block view
 */
export function createTextBlockView(options: TextBlockViewOptions): TextBlockView {
  return new TextBlockView(options);
}
