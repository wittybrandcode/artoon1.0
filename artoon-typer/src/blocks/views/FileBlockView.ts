/**
 * FileBlockView
 * 
 * View for file blocks (downloadable attachments).
 * Shows file icon, name, size, and download button.
 */

import type { FileBlock } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * File block view options
 */
export interface FileBlockViewOptions extends BlockViewOptions {
  block: FileBlock;
  /** On block change */
  onBlockChange?: (updates: Partial<FileBlock>) => void;
  /** Upload handler */
  onUpload?: (file: File) => Promise<{ src: string; size: number; mimeType: string }>;
}

/**
 * File type icons
 */
const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'application/msword': '📝',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '📝',
  'application/vnd.ms-excel': '📊',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '📊',
  'application/vnd.ms-powerpoint': '📽️',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': '📽️',
  'application/zip': '📦',
  'application/x-rar-compressed': '📦',
  'text/plain': '📃',
  'text/html': '🌐',
  'text/css': '🎨',
  'text/javascript': '⚙️',
  'application/json': '📋',
  'image/': '🖼️',
  'video/': '🎬',
  'audio/': '🎵',
  'default': '📎',
};

/**
 * FileBlockView - handles file blocks
 */
export class FileBlockView extends BaseBlockView {
  protected block: FileBlock;
  protected options: FileBlockViewOptions;
  protected fileElement: HTMLElement | null = null;
  
  constructor(options: FileBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    
    // Create file container
    this.fileElement = document.createElement('div');
    this.fileElement.className = 'artoon-block__content artoon-block__file';
    
    if (this.block.src) {
      this.renderFileInfo();
    } else if (!this.options.readOnly) {
      this.renderUploadArea();
    }
    
    // Apply styles
    this.applyStyles(this.element);
    
    this.element.appendChild(this.fileElement);
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
    if (this.fileElement) {
      this.fileElement.innerHTML = '';
      if (this.block.src) {
        this.renderFileInfo();
      } else if (!this.options.readOnly) {
        this.renderUploadArea();
      }
    }
  }
  
  /**
   * Render file info
   */
  private renderFileInfo(): void {
    if (!this.fileElement) return;
    
    // Icon
    const icon = document.createElement('span');
    icon.className = 'artoon-file-icon';
    icon.textContent = this.getFileIcon();
    
    // Info container
    const info = document.createElement('div');
    info.className = 'artoon-file-info';
    
    // Label
    const label = document.createElement('span');
    label.className = 'artoon-file-label';
    
    if (!this.options.readOnly) {
      label.contentEditable = 'true';
      label.addEventListener('input', () => {
        this.notifyChange({ label: label.textContent || '' });
      });
    }
    label.textContent = this.block.label || 'ملف';
    
    // Size
    const size = document.createElement('span');
    size.className = 'artoon-file-size';
    size.textContent = this.formatSize(this.block.size);
    
    info.appendChild(label);
    if (this.block.size) {
      info.appendChild(size);
    }
    
    // Download button
    const downloadBtn = document.createElement('a');
    downloadBtn.href = this.block.src;
    downloadBtn.download = this.block.label || 'file';
    downloadBtn.className = 'artoon-file-download';
    downloadBtn.textContent = 'تحميل';
    downloadBtn.title = 'تحميل الملف';
    
    // Change file button (edit mode)
    if (!this.options.readOnly) {
      const changeBtn = this.createChangeButton();
      this.fileElement.appendChild(icon);
      this.fileElement.appendChild(info);
      this.fileElement.appendChild(downloadBtn);
      this.fileElement.appendChild(changeBtn);
    } else {
      this.fileElement.appendChild(icon);
      this.fileElement.appendChild(info);
      this.fileElement.appendChild(downloadBtn);
    }
  }
  
  /**
   * Render upload area
   */
  private renderUploadArea(): void {
    if (!this.fileElement) return;
    
    const area = document.createElement('div');
    area.className = 'artoon-file-upload';
    
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.onchange = (e) => this.handleUpload(e);
    
    const label = document.createElement('label');
    label.className = 'artoon-file-upload-label';
    label.innerHTML = `
      <span class="artoon-file-upload-icon">📎</span>
      <span class="artoon-file-upload-text">اختر ملفاً للرفع</span>
    `;
    label.onclick = () => input.click();
    
    // Drag and drop
    area.ondragover = (e) => {
      e.preventDefault();
      area.classList.add('artoon-file-upload--dragover');
    };
    area.ondragleave = () => {
      area.classList.remove('artoon-file-upload--dragover');
    };
    area.ondrop = (e) => {
      e.preventDefault();
      area.classList.remove('artoon-file-upload--dragover');
      const file = e.dataTransfer?.files[0];
      if (file) this.processFile(file);
    };
    
    area.appendChild(input);
    area.appendChild(label);
    this.fileElement.appendChild(area);
  }
  
  /**
   * Create change file button
   */
  private createChangeButton(): HTMLElement {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'artoon-file-change';
    btn.textContent = 'تغيير';
    btn.title = 'تغيير الملف';
    
    const input = document.createElement('input');
    input.type = 'file';
    input.style.display = 'none';
    input.onchange = (e) => this.handleUpload(e);
    
    btn.onclick = () => input.click();
    btn.appendChild(input);
    
    return btn;
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
    let result: { src: string; size: number; mimeType: string };
    
    if (this.options.onUpload) {
      // Use custom upload handler
      result = await this.options.onUpload(file);
    } else {
      // Use data URL as fallback
      const src = await this.fileToDataUrl(file);
      result = {
        src,
        size: file.size,
        mimeType: file.type,
      };
    }
    
    this.notifyChange({
      src: result.src,
      label: file.name,
      size: result.size,
      mimeType: result.mimeType,
    });
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
   * Get file icon based on MIME type
   */
  private getFileIcon(): string {
    const mimeType = this.block.mimeType || '';
    
    // Check exact match
    if (FILE_ICONS[mimeType]) {
      return FILE_ICONS[mimeType];
    }
    
    // Check prefix match
    for (const [prefix, icon] of Object.entries(FILE_ICONS)) {
      if (prefix.endsWith('/') && mimeType.startsWith(prefix)) {
        return icon;
      }
    }
    
    return FILE_ICONS['default'];
  }
  
  /**
   * Format file size
   */
  private formatSize(bytes?: number): string {
    if (!bytes) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }
  
  /**
   * Notify block change
   */
  private notifyChange(updates: Partial<FileBlock>): void {
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
}

/**
 * Create a file block view
 */
export function createFileBlockView(options: FileBlockViewOptions): FileBlockView {
  return new FileBlockView(options);
}
