/**
 * FigureBlockView
 * 
 * View for figure blocks (media with caption).
 * Supports image, video, and audio with editable caption.
 */

import type { FigureBlock, InlineContent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';
import { InlineParser, createInlineParser } from '../../inline/InlineParser';

/**
 * Figure block view options
 */
export interface FigureBlockViewOptions extends BlockViewOptions {
  block: FigureBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<FigureBlock>) => void;
  /** Upload handler */
  onUpload?: (file: File) => Promise<string>;
}

/**
 * FigureBlockView - handles figure blocks
 */
export class FigureBlockView extends BaseBlockView {
  protected block: FigureBlock;
  protected options: FigureBlockViewOptions;
  protected figureElement: HTMLElement | null = null;
  protected captionElement: HTMLElement | null = null;

  private renderer: InlineRenderer;
  private parser: InlineParser;

  constructor(options: FigureBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;

    this.renderer = createInlineRenderer({ escapeHtml: true });
    this.parser = createInlineParser({ mergeAdjacent: true });
  }

  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');

    // Create figure element
    this.figureElement = document.createElement('figure');
    this.figureElement.className = 'artoon-block__content artoon-block__figure';

    // Figure number badge
    if (this.block.number) {
      const badge = document.createElement('span');
      badge.className = 'artoon-figure-number';
      badge.textContent = `شكل ${this.block.number}`;
      this.figureElement.appendChild(badge);
    }

    // Media element
    const mediaEl = this.renderMedia();
    this.figureElement.appendChild(mediaEl);

    // Caption
    this.captionElement = document.createElement('figcaption');
    this.captionElement.className = 'artoon-figure-caption';
    this.captionElement.innerHTML = this.renderer.render(this.block.caption || []) || '';

    if (!this.options.readOnly) {
      this.captionElement.contentEditable = 'true';
      this.captionElement.setAttribute('data-placeholder', 'أضف وصفاً...');
      this.captionElement.addEventListener('input', () => {
        this.updateCaption(this.parser.parseElement(this.captionElement!));
      });
    }

    this.figureElement.appendChild(this.captionElement);

    // Upload button (if no src)
    if (!this.options.readOnly && !this.block.src) {
      const uploadArea = this.createUploadArea();
      this.figureElement.insertBefore(uploadArea, this.captionElement);
    }

    // Apply styles
    this.applyStyles(this.element);

    this.element.appendChild(this.figureElement);
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
    // Re-render for simplicity
    if (this.element && this.figureElement) {
      const parent = this.element;
      parent.innerHTML = '';
      this.figureElement = null;
      this.captionElement = null;
      const newEl = this.render();
      parent.replaceWith(newEl);
      this.element = newEl;
    }
  }

  /**
   * Render media element
   */
  private renderMedia(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'artoon-figure-media';

    if (!this.block.src) {
      container.classList.add('artoon-figure-media--empty');
      return container;
    }

    let mediaEl: HTMLElement;

    switch (this.block.mediaType) {
      case 'video':
        mediaEl = document.createElement('video');
        (mediaEl as HTMLVideoElement).src = this.block.src;
        (mediaEl as HTMLVideoElement).controls = true;
        break;

      case 'audio':
        mediaEl = document.createElement('audio');
        (mediaEl as HTMLAudioElement).src = this.block.src;
        (mediaEl as HTMLAudioElement).controls = true;
        break;

      case 'image':
      default:
        mediaEl = document.createElement('img');
        (mediaEl as HTMLImageElement).src = this.block.src;
        (mediaEl as HTMLImageElement).alt = this.block.alt || '';
        break;
    }

    mediaEl.className = 'artoon-figure-media-element';
    container.appendChild(mediaEl);

    return container;
  }

  /**
   * Create upload area
   */
  private createUploadArea(): HTMLElement {
    const area = document.createElement('div');
    area.className = 'artoon-figure-upload';

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = this.getAcceptTypes();
    input.style.display = 'none';
    input.onchange = (e) => this.handleUpload(e);

    const label = document.createElement('label');
    label.className = 'artoon-figure-upload-label';
    label.innerHTML = `
      <span class="artoon-figure-upload-icon">📁</span>
      <span class="artoon-figure-upload-text">اختر ملفاً أو اسحبه هنا</span>
    `;
    label.onclick = () => input.click();

    // Drag and drop
    area.ondragover = (e) => {
      e.preventDefault();
      area.classList.add('artoon-figure-upload--dragover');
    };
    area.ondragleave = () => {
      area.classList.remove('artoon-figure-upload--dragover');
    };
    area.ondrop = (e) => {
      e.preventDefault();
      area.classList.remove('artoon-figure-upload--dragover');
      const file = e.dataTransfer?.files[0];
      if (file) this.processFile(file);
    };

    area.appendChild(input);
    area.appendChild(label);

    return area;
  }

  /**
   * Get accept types based on media type
   */
  private getAcceptTypes(): string {
    switch (this.block.mediaType) {
      case 'video': return 'video/*';
      case 'audio': return 'audio/*';
      default: return 'image/*';
    }
  }

  /**
   * Handle file upload
   */
  private async handleUpload(e: Event): Promise<void> {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) {
      await this.processFile(file);
    }
  }

  /**
   * Process uploaded file
   */
  private async processFile(file: File): Promise<void> {
    let src: string;

    if (this.options.onUpload) {
      // Use custom upload handler
      src = await this.options.onUpload(file);
    } else {
      // Use data URL as fallback
      src = await this.fileToDataUrl(file);
    }

    // Detect media type from file
    let mediaType: 'image' | 'video' | 'audio' = 'image';
    if (file.type.startsWith('video/')) mediaType = 'video';
    else if (file.type.startsWith('audio/')) mediaType = 'audio';

    this.notifyChange({ src, mediaType });
  }

  /**
   * Convert file to data URL
   */
  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * Update caption
   */
  private updateCaption(caption: readonly InlineContent[]): void {
    this.notifyChange({ caption: [...caption] });
  }

  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<FigureBlock>): void {
    if (this.options.onBlockChange) {
      this.options.onBlockChange(updates);
    }

    // Emit update event
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: { ...this.block, ...updates },
    });
  }

  protected onFocus(): void {
    if (this.captionElement) {
      this.captionElement.focus();
    }
  }
}

/**
 * Create a figure block view
 */
export function createFigureBlockView(options: FigureBlockViewOptions): FigureBlockView {
  return new FigureBlockView(options);
}
