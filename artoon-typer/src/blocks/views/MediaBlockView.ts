/**
 * MediaBlockView
 * 
 * View for media blocks (image, video, audio).
 */

import type { MediaBlock, InlineContent, BlockEvent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';

/**
 * Media block view options
 */
export interface MediaBlockViewOptions extends BlockViewOptions {
  block: MediaBlock;
  /** On source change */
  onSrcChange?: (src: string) => void;
  /** On caption change */
  onCaptionChange?: (caption: InlineContent[]) => void;
  /** On resize */
  onResize?: (width: string, height: string) => void;
}

/**
 * MediaBlockView - handles image, video, audio blocks
 */
export class MediaBlockView extends BaseBlockView {
  protected block: MediaBlock;
  protected options: MediaBlockViewOptions;
  protected mediaElement: HTMLElement | null = null;
  protected captionElement: HTMLElement | null = null;
  
  private renderer: InlineRenderer;
  
  constructor(options: MediaBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
    this.renderer = createInlineRenderer({ escapeHtml: true });
  }
  
  /**
   * Get media type
   */
  get mediaType(): 'image' | 'video' | 'audio' {
    return this.block.type;
  }
  
  /**
   * Get source URL
   */
  getSrc(): string {
    return this.block.src;
  }
  
  /**
   * Get alt text
   */
  getAlt(): string {
    return this.block.alt || '';
  }
  
  /**
   * Get caption
   */
  getCaption(): InlineContent[] {
    return this.block.caption || [];
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('figure');
    this.element.classList.add('artoon-media-block');
    this.element.classList.add(`artoon-media-block--${this.block.type}`);
    
    // Create media element
    this.mediaElement = this.createMediaElement();
    this.element.appendChild(this.mediaElement);
    
    // Create caption if exists
    if (this.block.caption && this.block.caption.length > 0) {
      this.captionElement = this.createCaptionElement();
      this.element.appendChild(this.captionElement);
    }
    
    // Apply styles
    this.applyStyles(this.element);
    
    return this.element;
  }
  
  /**
   * Create the media element based on type
   */
  private createMediaElement(): HTMLElement {
    switch (this.block.type) {
      case 'image':
        return this.createImageElement();
      case 'video':
        return this.createVideoElement();
      case 'audio':
        return this.createAudioElement();
      default:
        return document.createElement('div');
    }
  }
  
  /**
   * Create image element
   */
  private createImageElement(): HTMLImageElement {
    const img = document.createElement('img');
    img.className = 'artoon-media-block__media';
    img.src = this.block.src;
    img.alt = this.block.alt || '';
    
    if (this.block.width) {
      img.style.width = this.block.width;
    }
    if (this.block.height) {
      img.style.height = this.block.height;
    }
    
    img.addEventListener('load', () => {
      this.element?.classList.add('artoon-media-block--loaded');
    });
    
    img.addEventListener('error', () => {
      this.element?.classList.add('artoon-media-block--error');
    });
    
    return img;
  }
  
  /**
   * Create video element
   */
  private createVideoElement(): HTMLVideoElement {
    const video = document.createElement('video');
    video.className = 'artoon-media-block__media';
    video.src = this.block.src;
    video.controls = true;
    
    if (this.block.width) {
      video.style.width = this.block.width;
    }
    if (this.block.height) {
      video.style.height = this.block.height;
    }
    
    return video;
  }
  
  /**
   * Create audio element
   */
  private createAudioElement(): HTMLAudioElement {
    const audio = document.createElement('audio');
    audio.className = 'artoon-media-block__media';
    audio.src = this.block.src;
    audio.controls = true;
    
    return audio;
  }
  
  /**
   * Create caption element
   */
  private createCaptionElement(): HTMLElement {
    const caption = document.createElement('figcaption');
    caption.className = 'artoon-media-block__caption';
    
    if (!this.options.readOnly) {
      caption.contentEditable = 'true';
      caption.addEventListener('input', this.handleCaptionChange.bind(this));
    }
    
    caption.innerHTML = this.renderer.render(this.block.caption || []);
    
    return caption;
  }
  
  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName() + 
        ' artoon-media-block' + 
        ` artoon-media-block--${this.block.type}`;
      this.element.dir = this.block.direction;
    }
    
    // Update media source
    if (this.mediaElement) {
      if (this.mediaElement instanceof HTMLImageElement) {
        this.mediaElement.src = this.block.src;
        this.mediaElement.alt = this.block.alt || '';
      } else if (this.mediaElement instanceof HTMLVideoElement || 
                 this.mediaElement instanceof HTMLAudioElement) {
        this.mediaElement.src = this.block.src;
      }
    }
    
    // Update caption
    if (this.captionElement && this.block.caption) {
      this.captionElement.innerHTML = this.renderer.render(this.block.caption);
    }
  }
  
  /**
   * Handle caption change
   */
  private handleCaptionChange(): void {
    if (!this.captionElement) return;
    
    // For simplicity, just get text content
    // In production, would use InlineParser
    const text = this.captionElement.textContent || '';
    const newCaption: InlineContent[] = text ? [{ type: 'plain', value: text }] : [];
    
    if (this.options.onCaptionChange) {
      this.options.onCaptionChange(newCaption);
    }
    
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: { ...this.block, caption: newCaption },
    });
  }
  
  /**
   * Set source
   */
  setSrc(src: string): void {
    this.block = { ...this.block, src };
    this.updateElement();
    
    if (this.options.onSrcChange) {
      this.options.onSrcChange(src);
    }
  }
  
  /**
   * Set alt text
   */
  setAlt(alt: string): void {
    this.block = { ...this.block, alt };
    if (this.mediaElement instanceof HTMLImageElement) {
      this.mediaElement.alt = alt;
    }
  }
  
  /**
   * Set caption
   */
  setCaption(caption: InlineContent[]): void {
    this.block = { ...this.block, caption };
    
    if (!this.captionElement && caption.length > 0 && this.element) {
      this.captionElement = this.createCaptionElement();
      this.element.appendChild(this.captionElement);
    } else if (this.captionElement) {
      this.captionElement.innerHTML = this.renderer.render(caption);
    }
  }
  
  /**
   * Set dimensions
   */
  setDimensions(width?: string, height?: string): void {
    this.block = { ...this.block, width, height };
    
    if (this.mediaElement) {
      if (width) {
        this.mediaElement.style.width = width;
      }
      if (height) {
        this.mediaElement.style.height = height;
      }
    }
    
    if (this.options.onResize && width && height) {
      this.options.onResize(width, height);
    }
  }
}

/**
 * Create a media block view
 */
export function createMediaBlockView(options: MediaBlockViewOptions): MediaBlockView {
  return new MediaBlockView(options);
}
