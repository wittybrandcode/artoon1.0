/**
 * TimeBlockView
 * 
 * View for date/time blocks.
 * Displays datetime with optional custom display text.
 */

import type { TimeBlock } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Time block view options
 */
export interface TimeBlockViewOptions extends BlockViewOptions {
  block: TimeBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<TimeBlock>) => void;
  /** Date format for display */
  dateFormat?: 'short' | 'medium' | 'long' | 'full';
  /** Locale for formatting */
  locale?: string;
}

/**
 * TimeBlockView - handles date/time blocks
 */
export class TimeBlockView extends BaseBlockView {
  protected block: TimeBlock;
  protected options: TimeBlockViewOptions;
  protected timeElement: HTMLTimeElement | null = null;
  protected inputElement: HTMLInputElement | null = null;
  
  constructor(options: TimeBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Get datetime value
   */
  getDatetime(): string {
    return this.block.datetime;
  }
  
  /**
   * Get display text
   */
  getDisplayText(): string {
    return this.block.displayText || this.formatDate(this.block.datetime);
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    const container = document.createElement('div');
    container.className = 'artoon-block__content artoon-block__time';
    
    // Time element
    this.timeElement = document.createElement('time');
    this.timeElement.className = 'artoon-time-display';
    this.timeElement.dateTime = this.block.datetime;
    this.timeElement.textContent = this.getDisplayText();
    
    if (!this.options.readOnly) {
      // Make display text editable
      this.timeElement.contentEditable = 'true';
      this.timeElement.setAttribute('data-placeholder', 'نص العرض...');
      this.timeElement.addEventListener('input', () => {
        this.notifyChange({ displayText: this.timeElement?.textContent || '' });
      });
      
      // Date picker
      this.inputElement = document.createElement('input');
      this.inputElement.type = 'date';
      this.inputElement.className = 'artoon-time-picker';
      this.inputElement.value = this.block.datetime;
      this.inputElement.addEventListener('change', () => {
        const newDatetime = this.inputElement?.value || '';
        this.notifyChange({ datetime: newDatetime });
        if (this.timeElement) {
          this.timeElement.dateTime = newDatetime;
          // Update display if no custom text
          if (!this.block.displayText) {
            this.timeElement.textContent = this.formatDate(newDatetime);
          }
        }
      });
      
      container.appendChild(this.inputElement);
    }
    
    container.appendChild(this.timeElement);
    
    // Apply styles
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
    if (this.timeElement) {
      this.timeElement.dateTime = this.block.datetime;
      this.timeElement.textContent = this.getDisplayText();
    }
    if (this.inputElement) {
      this.inputElement.value = this.block.datetime;
    }
  }
  
  /**
   * Format date for display
   */
  private formatDate(datetime: string): string {
    if (!datetime) return '';
    
    try {
      const date = new Date(datetime);
      const locale = this.options.locale || 'ar';
      const format = this.options.dateFormat || 'long';
      
      const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
        short: { year: 'numeric', month: 'numeric', day: 'numeric' },
        medium: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
        full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' },
      };
      
      const options = formatOptions[format] || formatOptions.long;
      
      return date.toLocaleDateString(locale, options);
    } catch {
      return datetime;
    }
  }
  
  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<TimeBlock>): void {
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
    if (this.timeElement) {
      this.timeElement.focus();
    }
  }
}

/**
 * Create a time block view
 */
export function createTimeBlockView(options: TimeBlockViewOptions): TimeBlockView {
  return new TimeBlockView(options);
}
