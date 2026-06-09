/**
 * BlockView - Renders a single block
 */

import { createElement, escapeHtml, setCaretToEnd, isElementEmpty } from './DOMUtils.js';

/**
 * BlockView class - renders and manages a single block
 */
export class BlockView {
  constructor(block, options = {}) {
    this.block = block;
    this.options = options;
    this.element = null;
    this.contentElement = null;
  }
  
  /**
   * Render the block to DOM
   */
  render() {
    this.element = createElement('div', `block block--${this.block.type}`, {
      dataset: { blockId: this.block.id },
      dir: this.block.direction || 'rtl',
    });
    
    // Handle for drag
    const handle = createElement('div', 'block__handle');
    handle.innerHTML = '⋮⋮';
    handle.draggable = true;
    
    // Drag events
    handle.addEventListener('dragstart', (e) => {
      if (this.options.onDragStart) {
        this.options.onDragStart(e, this.block.id);
      }
    });
    
    handle.addEventListener('dragend', (e) => {
      if (this.options.onDragEnd) {
        this.options.onDragEnd(e, this.block.id);
      }
    });
    
    handle.addEventListener('mousedown', (e) => {
      if (this.options.onHandleClick) {
        this.options.onHandleClick(e, this.block);
      }
    });
    
    // Content
    this.contentElement = this.createContentElement();
    
    this.element.appendChild(handle);
    this.element.appendChild(this.contentElement);
    
    return this.element;
  }
  
  /**
   * Create content element based on block type
   */
  createContentElement() {
    switch (this.block.type) {
      case 'paragraph':
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'heading4':
      case 'heading5':
      case 'heading6':
      case 'quote':
        return this.createTextContent();
      
      case 'bullet-list':
      case 'numbered-list':
        return this.createListContent();
      
      case 'code':
        return this.createCodeContent();
      
      case 'table':
        return this.createTableContent();
      
      case 'image':
      case 'video':
      case 'audio':
        return this.createMediaContent();
      
      case 'divider':
        return this.createDividerContent();
      
      default:
        return this.createTextContent();
    }
  }
  
  /**
   * Create text content (paragraph, heading, quote)
   */
  createTextContent() {
    const content = createElement('div', 'block__content', {
      contentEditable: 'true',
      dataset: { placeholder: this.getPlaceholder() },
    });
    
    content.innerHTML = this.renderInlineContent(this.block.content);
    
    // Events
    content.addEventListener('input', () => this.handleInput());
    content.addEventListener('focus', () => this.handleFocus());
    content.addEventListener('blur', () => this.handleBlur());
    content.addEventListener('keydown', (e) => this.handleKeydown(e));
    content.addEventListener('paste', (e) => this.handlePaste(e));
    
    return content;
  }
  
  /**
   * Create list content
   */
  createListContent() {
    const wrapper = createElement('div', 'block__content');
    const listTag = this.block.type === 'numbered-list' ? 'ol' : 'ul';
    const list = createElement(listTag, 'block__list');
    
    const items = this.block.items || [];
    items.forEach((item, index) => {
      const li = createElement('li', 'block__list-item');
      const itemContent = createElement('span', 'block__list-item-content', {
        contentEditable: 'true',
        dataset: { itemId: item.id, itemIndex: index },
      });
      itemContent.innerHTML = this.renderInlineContent(item.content);
      
      itemContent.addEventListener('input', () => this.handleListItemInput(index));
      itemContent.addEventListener('keydown', (e) => this.handleListItemKeydown(e, index));
      
      li.appendChild(itemContent);
      list.appendChild(li);
    });
    
    wrapper.appendChild(list);
    return wrapper;
  }
  
  /**
   * Create code content
   */
  createCodeContent() {
    const wrapper = createElement('div', 'block__content');
    
    // Header with language
    const header = createElement('div', 'block__code-header');
    header.textContent = this.block.language || 'plaintext';
    
    // Code content
    const code = createElement('pre', 'block__code-content', {
      contentEditable: 'true',
    });
    code.textContent = this.block.code || '';
    
    code.addEventListener('input', () => this.handleCodeInput());
    code.addEventListener('keydown', (e) => this.handleCodeKeydown(e));
    
    wrapper.appendChild(header);
    wrapper.appendChild(code);
    return wrapper;
  }
  
  /**
   * Create table content
   */
  createTableContent() {
    const wrapper = createElement('div', 'block__content');
    const table = createElement('table', 'block__table');
    
    const rows = this.block.rows || [];
    rows.forEach((row, rowIndex) => {
      const tr = createElement('tr');
      const cells = row.cells || [];
      
      cells.forEach((cell, cellIndex) => {
        const cellTag = row.isHeader ? 'th' : 'td';
        const td = createElement(cellTag);
        const cellContent = createElement('div', 'block__table-cell', {
          contentEditable: 'true',
          dataset: { rowIndex, cellIndex },
        });
        cellContent.innerHTML = this.renderInlineContent(cell.content);
        
        cellContent.addEventListener('input', () => {
          this.handleTableCellInput(rowIndex, cellIndex);
        });
        
        td.appendChild(cellContent);
        tr.appendChild(td);
      });
      
      table.appendChild(tr);
    });
    
    wrapper.appendChild(table);
    return wrapper;
  }
  
  /**
   * Create media content
   */
  createMediaContent() {
    const wrapper = createElement('div', 'block__content');
    
    if (this.block.src) {
      let media;
      switch (this.block.type) {
        case 'video':
          media = createElement('video', 'block__media', {
            src: this.block.src,
            controls: 'true',
          });
          break;
        case 'audio':
          media = createElement('audio', 'block__media', {
            src: this.block.src,
            controls: 'true',
          });
          break;
        default:
          media = createElement('img', 'block__media', {
            src: this.block.src,
            alt: this.block.alt || '',
          });
      }
      wrapper.appendChild(media);
    } else {
      const placeholder = createElement('div', 'block__media-placeholder');
      placeholder.innerHTML = `
        <span style="font-size: 32px;">📷</span>
        <span>انقر لإضافة ${this.getMediaTypeName()}</span>
      `;
      placeholder.addEventListener('click', () => this.handleMediaClick());
      wrapper.appendChild(placeholder);
    }
    
    return wrapper;
  }
  
  /**
   * Create divider content
   */
  createDividerContent() {
    const wrapper = createElement('div', 'block__content');
    const hr = createElement('hr', 'block__divider');
    wrapper.appendChild(hr);
    return wrapper;
  }
  
  /**
   * Render inline content to HTML
   */
  renderInlineContent(content) {
    if (!content || content.length === 0) return '';
    
    return content.map(item => {
      // Plain text
      if (item.type === 'plain') {
        return escapeHtml(item.value || item.text || '');
      }
      
      // Inline with modifiers
      let html = escapeHtml(item.value || item.text || '');
      
      if (item.modifiers && Array.isArray(item.modifiers)) {
        item.modifiers.forEach(mod => {
          switch (mod) {
            case 's': html = `<strong>${html}</strong>`; break;
            case 'e': html = `<em>${html}</em>`; break;
            case 'u': html = `<u>${html}</u>`; break;
            case 'd': html = `<del>${html}</del>`; break;
            case 'mark': html = `<mark>${html}</mark>`; break;
            case 'c': html = `<code>${html}</code>`; break;
          }
        });
      }
      
      // Link
      if (item.component === 'a' && item.attributes) {
        const href = item.attributes.attr0 || '#';
        html = `<a href="${escapeHtml(href)}">${html}</a>`;
      }
      
      return html;
    }).join('');
  }
  
  /**
   * Get placeholder text
   */
  getPlaceholder() {
    switch (this.block.type) {
      case 'heading1': return 'عنوان 1';
      case 'heading2': return 'عنوان 2';
      case 'heading3': return 'عنوان 3';
      case 'quote': return 'اقتباس...';
      default: return 'اكتب شيئاً...';
    }
  }
  
  /**
   * Get media type name
   */
  getMediaTypeName() {
    switch (this.block.type) {
      case 'video': return 'فيديو';
      case 'audio': return 'صوت';
      default: return 'صورة';
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Event Handlers
  // ═══════════════════════════════════════════════════════════════════════════
  
  handleInput() {
    if (this.options.onInput) {
      this.options.onInput(this.block.id, this.getContent());
    }
  }
  
  handleFocus() {
    this.element.classList.add('block--focused');
    if (this.options.onFocus) {
      this.options.onFocus(this.block.id);
    }
  }
  
  handleBlur() {
    this.element.classList.remove('block--focused');
    if (this.options.onBlur) {
      this.options.onBlur(this.block.id);
    }
  }
  
  handleKeydown(e) {
    if (this.options.onKeydown) {
      this.options.onKeydown(e, this.block.id);
    }
  }
  
  handlePaste(e) {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }
  
  handleListItemInput(index) {
    if (this.options.onListItemInput) {
      this.options.onListItemInput(this.block.id, index, this.getListItemContent(index));
    }
  }
  
  handleListItemKeydown(e, index) {
    if (this.options.onListItemKeydown) {
      this.options.onListItemKeydown(e, this.block.id, index);
    }
  }
  
  handleCodeInput() {
    if (this.options.onCodeInput) {
      const code = this.contentElement.querySelector('.block__code-content');
      this.options.onCodeInput(this.block.id, code.textContent);
    }
  }
  
  handleCodeKeydown(e) {
    // Allow Tab in code blocks
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  }
  
  handleTableCellInput(rowIndex, cellIndex) {
    if (this.options.onTableCellInput) {
      const content = this.getTableCellContent(rowIndex, cellIndex);
      this.options.onTableCellInput(this.block.id, rowIndex, cellIndex, content);
    }
  }
  
  handleMediaClick() {
    if (this.options.onMediaClick) {
      this.options.onMediaClick(this.block.id);
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Content Getters
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Get content as InlineContent array
   */
  getContent() {
    const text = this.contentElement.textContent || '';
    if (!text) return [];
    return [{ type: 'plain', value: text }];
  }
  
  /**
   * Get list item content
   */
  getListItemContent(index) {
    const item = this.contentElement.querySelector(`[data-item-index="${index}"]`);
    if (!item) return [];
    const text = item.textContent || '';
    return [{ type: 'plain', value: text }];
  }
  
  /**
   * Get table cell content
   */
  getTableCellContent(rowIndex, cellIndex) {
    const cell = this.contentElement.querySelector(
      `[data-row-index="${rowIndex}"][data-cell-index="${cellIndex}"]`
    );
    if (!cell) return [];
    const text = cell.textContent || '';
    return [{ type: 'plain', value: text }];
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Public Methods
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Focus the block
   */
  focus() {
    if (this.contentElement) {
      if (this.contentElement.contentEditable === 'true') {
        this.contentElement.focus();
        setCaretToEnd(this.contentElement);
      } else {
        const editable = this.contentElement.querySelector('[contenteditable="true"]');
        if (editable) {
          editable.focus();
          setCaretToEnd(editable);
        }
      }
    }
  }
  
  /**
   * Update block data
   */
  update(block) {
    this.block = block;
    // Re-render content
    const newContent = this.createContentElement();
    this.contentElement.replaceWith(newContent);
    this.contentElement = newContent;
  }
  
  /**
   * Get the DOM element
   */
  getElement() {
    return this.element;
  }
  
  /**
   * Check if block is empty
   */
  isEmpty() {
    return isElementEmpty(this.contentElement);
  }
}

/**
 * Create a BlockView
 */
export function createBlockView(block, options) {
  return new BlockView(block, options);
}
