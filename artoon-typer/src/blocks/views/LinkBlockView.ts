/**
 * LinkBlockView
 * 
 * View for standalone link blocks.
 * ARTOON-aligned: mirrors LinkNode (url, text, modifiers).
 * Syntax: >.a:: url; text
 */

import type { LinkBlock } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Link block view options
 */
export interface LinkBlockViewOptions extends BlockViewOptions {
  block: LinkBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<LinkBlock>) => void;
}

/**
 * LinkBlockView - handles link blocks (ARTOON-aligned)
 */
export class LinkBlockView extends BaseBlockView {
  protected block: LinkBlock;
  protected options: LinkBlockViewOptions;
  protected urlInput: HTMLInputElement | null = null;
  protected textInput: HTMLInputElement | null = null;

  constructor(options: LinkBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }

  /**
   * Get url
   */
  getUrl(): string {
    return this.block.url;
  }

  /**
   * Get text
   */
  getText(): string {
    return this.block.text;
  }

  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');

    const container = document.createElement('div');
    container.className = 'artoon-block__content artoon-block__link';

    if (this.options.readOnly) {
      // Read-only: render as actual link
      const link = document.createElement('a');
      link.href = this.block.url || '#';
      link.textContent = this.block.text || this.block.url || 'رابط';
      link.className = 'artoon-link-display';
      container.appendChild(link);
    } else {
      // Editable mode
      this.renderEditableContent(container);
    }

    this.applyStyles(this.element);
    this.element.appendChild(container);
    return this.element;
  }

  /**
   * Render editable content
   */
  private renderEditableContent(container: HTMLElement): void {
    // Icon
    const icon = document.createElement('span');
    icon.className = 'artoon-link-icon';
    icon.textContent = '🔗';
    container.appendChild(icon);

    // Fields container
    const fields = document.createElement('div');
    fields.className = 'artoon-link-fields';

    // URL input
    const urlGroup = document.createElement('div');
    urlGroup.className = 'artoon-link-field-group';

    const urlLabel = document.createElement('label');
    urlLabel.textContent = 'الرابط:';
    urlLabel.className = 'artoon-link-label';

    this.urlInput = document.createElement('input');
    this.urlInput.type = 'url';
    this.urlInput.className = 'artoon-link-input';
    this.urlInput.value = this.block.url;
    this.urlInput.placeholder = 'https://example.com';
    this.urlInput.addEventListener('input', () => {
      this.notifyChange({ url: this.urlInput!.value });
    });

    urlGroup.appendChild(urlLabel);
    urlGroup.appendChild(this.urlInput);
    fields.appendChild(urlGroup);

    // Text input
    const textGroup = document.createElement('div');
    textGroup.className = 'artoon-link-field-group';

    const textLabel = document.createElement('label');
    textLabel.textContent = 'النص:';
    textLabel.className = 'artoon-link-label';

    this.textInput = document.createElement('input');
    this.textInput.type = 'text';
    this.textInput.className = 'artoon-link-input';
    this.textInput.value = this.block.text;
    this.textInput.placeholder = 'نص الرابط';
    this.textInput.addEventListener('input', () => {
      this.notifyChange({ text: this.textInput!.value });
    });

    textGroup.appendChild(textLabel);
    textGroup.appendChild(this.textInput);
    fields.appendChild(textGroup);

    container.appendChild(fields);
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

  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<LinkBlock>): void {
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
    if (this.urlInput) {
      this.urlInput.focus();
    }
  }
}

/**
 * Create a link block view
 */
export function createLinkBlockView(options: LinkBlockViewOptions): LinkBlockView {
  return new LinkBlockView(options);
}
