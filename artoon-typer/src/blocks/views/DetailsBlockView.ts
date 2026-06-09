/**
 * DetailsBlockView
 * 
 * View for collapsible content blocks.
 * Supports nested content with expand/collapse functionality.
 */

import type { DetailsBlock, Block, InlineContent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';
import { InlineParser, createInlineParser } from '../../inline/InlineParser';

/**
 * Details block view options
 */
export interface DetailsBlockViewOptions extends BlockViewOptions {
  block: DetailsBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<DetailsBlock>) => void;
  /** Render nested block */
  renderNestedBlock?: (block: Block) => HTMLElement;
}

/**
 * DetailsBlockView - handles collapsible content blocks
 */
export class DetailsBlockView extends BaseBlockView {
  protected block: DetailsBlock;
  protected options: DetailsBlockViewOptions;
  protected detailsElement: HTMLDetailsElement | null = null;
  protected summaryElement: HTMLElement | null = null;
  protected contentContainer: HTMLElement | null = null;

  private renderer: InlineRenderer;
  private parser: InlineParser;

  constructor(options: DetailsBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;

    this.renderer = createInlineRenderer({ escapeHtml: true });
    this.parser = createInlineParser({ mergeAdjacent: true });
  }

  /**
   * Get open state
   */
  isOpen(): boolean {
    return this.block.isOpen ?? false;
  }

  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');

    // Create details element
    this.detailsElement = document.createElement('details');
    this.detailsElement.className = 'artoon-block__content artoon-block__details';
    this.detailsElement.open = this.block.isOpen ?? false;

    // Handle toggle
    this.detailsElement.addEventListener('toggle', () => {
      this.notifyChange({ isOpen: this.detailsElement?.open });
    });

    // Summary
    this.summaryElement = document.createElement('summary');
    this.summaryElement.className = 'artoon-details-summary';
    this.summaryElement.innerHTML = this.renderer.render(this.block.summary) || '';

    if (!this.options.readOnly) {
      this.summaryElement.contentEditable = 'true';
      this.summaryElement.setAttribute('data-placeholder', 'انقر للتوسيع...');
      this.summaryElement.addEventListener('input', () => {
        this.updateSummary(this.parser.parseElement(this.summaryElement!));
      });
      // Prevent toggle when editing
      this.summaryElement.addEventListener('click', (e) => {
        if (document.activeElement === this.summaryElement) {
          e.preventDefault();
        }
      });
    }

    // Content container
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'artoon-details-content';

    // Render nested content
    this.renderContent();

    // Add content placeholder if empty and editable
    if (!this.options.readOnly && this.block.content.length === 0) {
      const placeholder = document.createElement('div');
      placeholder.className = 'artoon-details-placeholder';
      placeholder.textContent = 'أضف محتوى هنا...';
      this.contentContainer.appendChild(placeholder);
    }

    this.detailsElement.appendChild(this.summaryElement);
    this.detailsElement.appendChild(this.contentContainer);

    // Apply styles
    this.applyStyles(this.element);

    this.element.appendChild(this.detailsElement);
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
    if (this.detailsElement) {
      this.detailsElement.open = this.block.isOpen ?? false;
    }
    if (this.summaryElement) {
      this.summaryElement.innerHTML = this.renderer.render(this.block.summary) || '';
    }
    this.renderContent();
  }

  /**
   * Render nested content
   */
  private renderContent(): void {
    if (!this.contentContainer) return;

    // Clear existing (except placeholder)
    const placeholder = this.contentContainer.querySelector('.artoon-details-placeholder');
    this.contentContainer.innerHTML = '';

    // Render each nested block
    if (this.options.renderNestedBlock) {
      for (const nestedBlock of this.block.content) {
        const nestedEl = this.options.renderNestedBlock(nestedBlock);
        this.contentContainer.appendChild(nestedEl);
      }
    }

    // Re-add placeholder if empty
    if (this.block.content.length === 0 && placeholder) {
      this.contentContainer.appendChild(placeholder);
    }
  }

  /**
   * Update summary
   */
  private updateSummary(summary: readonly InlineContent[]): void {
    this.notifyChange({ summary: [...summary] });
  }

  /**
   * Toggle open state
   */
  toggle(): void {
    const newState = !this.block.isOpen;
    if (this.detailsElement) {
      this.detailsElement.open = newState;
    }
    this.notifyChange({ isOpen: newState });
  }

  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<DetailsBlock>): void {
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
    if (this.summaryElement) {
      this.summaryElement.focus();
    }
  }
}

/**
 * Create a details block view
 */
export function createDetailsBlockView(options: DetailsBlockViewOptions): DetailsBlockView {
  return new DetailsBlockView(options);
}
