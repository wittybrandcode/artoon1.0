/**
 * EditorView - Main editor view
 */

import { createElement, generateId, setCaretToEnd, showToast } from './DOMUtils.js';
import { BlockView } from './BlockView.js';

/**
 * EditorView class - manages the editor UI
 */
export class EditorView {
  constructor(container, options = {}) {
    this.container = container;
    this.options = options;
    this.controller = options.controller;
    this.importer = options.importer;
    this.exporter = options.exporter;
    
    this.blockViews = new Map(); // blockId -> BlockView
    this.focusedBlockId = null;
    this.blocksContainer = null;
    this.addButton = null;
    
    // Menus
    this.addMenu = null;
    this.contextMenu = null;
    this.toolbar = null;
  }
  
  /**
   * Initialize the editor
   */
  init() {
    this.container.classList.add('editor');
    this.container.setAttribute('dir', 'rtl');
    
    // Create blocks container
    this.blocksContainer = createElement('div', 'editor__blocks');
    this.container.appendChild(this.blocksContainer);
    
    // Create add button
    this.addButton = this.createAddButton();
    this.container.appendChild(this.addButton);
    
    // Create menus
    this.createMenus();
    
    // Bind global events
    this.bindGlobalEvents();
    
    // Initial render
    this.render();
  }
  
  /**
   * Create add block button
   */
  createAddButton() {
    const btn = createElement('button', 'add-block-btn');
    btn.innerHTML = '+ إضافة بلوك';
    btn.addEventListener('click', (e) => this.showAddMenu(e));
    return btn;
  }
  
  /**
   * Create menus
   */
  createMenus() {
    // Add Menu
    this.addMenu = createElement('div', 'menu add-menu');
    this.addMenu.innerHTML = `
      <div class="add-menu__tabs">
        <button class="add-menu__tab add-menu__tab--active" data-tab="text">نصية</button>
        <button class="add-menu__tab" data-tab="list">قوائم</button>
        <button class="add-menu__tab" data-tab="media">وسائط</button>
        <button class="add-menu__tab" data-tab="advanced">متقدم</button>
      </div>
      <div class="add-menu__content">
        ${this.renderAddMenuItems('text')}
      </div>
    `;
    document.body.appendChild(this.addMenu);
    
    // Tab switching
    this.addMenu.querySelectorAll('.add-menu__tab').forEach(tab => {
      tab.addEventListener('click', () => {
        this.addMenu.querySelectorAll('.add-menu__tab').forEach(t => t.classList.remove('add-menu__tab--active'));
        tab.classList.add('add-menu__tab--active');
        this.addMenu.querySelector('.add-menu__content').innerHTML = this.renderAddMenuItems(tab.dataset.tab);
        this.bindAddMenuItems();
      });
    });
    
    this.bindAddMenuItems();
    
    // Context Menu
    this.contextMenu = createElement('div', 'menu context-menu');
    this.contextMenu.innerHTML = `
      <button class="menu__item" data-action="delete">
        <span class="menu__item-icon">🗑️</span>
        <span class="menu__item-text">حذف</span>
      </button>
      <button class="menu__item" data-action="duplicate">
        <span class="menu__item-icon">📋</span>
        <span class="menu__item-text">تكرار</span>
      </button>
      <div class="menu__divider"></div>
      <button class="menu__item" data-action="move-up">
        <span class="menu__item-icon">⬆️</span>
        <span class="menu__item-text">نقل للأعلى</span>
      </button>
      <button class="menu__item" data-action="move-down">
        <span class="menu__item-icon">⬇️</span>
        <span class="menu__item-text">نقل للأسفل</span>
      </button>
      <div class="menu__divider"></div>
      <button class="menu__item" data-action="convert-heading1">
        <span class="menu__item-icon">H1</span>
        <span class="menu__item-text">تحويل لعنوان 1</span>
      </button>
      <button class="menu__item" data-action="convert-heading2">
        <span class="menu__item-icon">H2</span>
        <span class="menu__item-text">تحويل لعنوان 2</span>
      </button>
      <button class="menu__item" data-action="convert-paragraph">
        <span class="menu__item-icon">¶</span>
        <span class="menu__item-text">تحويل لفقرة</span>
      </button>
    `;
    document.body.appendChild(this.contextMenu);
    
    this.contextMenu.querySelectorAll('.menu__item').forEach(item => {
      item.addEventListener('click', () => {
        this.handleContextAction(item.dataset.action);
        this.hideContextMenu();
      });
    });
    
    // Toolbar
    this.toolbar = createElement('div', 'toolbar');
    this.toolbar.innerHTML = `
      <button class="toolbar__btn" data-format="bold" title="عريض (Ctrl+B)"><b>B</b></button>
      <button class="toolbar__btn" data-format="italic" title="مائل (Ctrl+I)"><i>I</i></button>
      <button class="toolbar__btn" data-format="underline" title="مسطر (Ctrl+U)"><u>U</u></button>
      <button class="toolbar__btn" data-format="strikethrough" title="مشطوب"><s>S</s></button>
      <div class="toolbar__divider"></div>
      <button class="toolbar__btn" data-format="code" title="كود">&lt;/&gt;</button>
      <button class="toolbar__btn" data-format="link" title="رابط">🔗</button>
    `;
    document.body.appendChild(this.toolbar);
    
    this.toolbar.querySelectorAll('.toolbar__btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.applyFormat(btn.dataset.format);
      });
    });
  }
  
  /**
   * Render add menu items
   */
  renderAddMenuItems(category) {
    const items = {
      text: [
        { type: 'paragraph', icon: '¶', name: 'فقرة' },
        { type: 'heading1', icon: 'H1', name: 'عنوان 1' },
        { type: 'heading2', icon: 'H2', name: 'عنوان 2' },
        { type: 'heading3', icon: 'H3', name: 'عنوان 3' },
        { type: 'quote', icon: '❝', name: 'اقتباس' },
      ],
      list: [
        { type: 'bullet-list', icon: '•', name: 'قائمة نقطية' },
        { type: 'numbered-list', icon: '1.', name: 'قائمة مرقمة' },
      ],
      media: [
        { type: 'image', icon: '🖼️', name: 'صورة' },
        { type: 'video', icon: '🎬', name: 'فيديو' },
        { type: 'audio', icon: '🎵', name: 'صوت' },
      ],
      advanced: [
        { type: 'code', icon: '💻', name: 'كود' },
        { type: 'table', icon: '📊', name: 'جدول' },
        { type: 'divider', icon: '—', name: 'فاصل' },
      ],
    };
    
    return (items[category] || []).map(item => `
      <button class="menu__item" data-block-type="${item.type}">
        <span class="menu__item-icon">${item.icon}</span>
        <span class="menu__item-text">${item.name}</span>
      </button>
    `).join('');
  }
  
  /**
   * Bind add menu item clicks
   */
  bindAddMenuItems() {
    this.addMenu.querySelectorAll('[data-block-type]').forEach(item => {
      item.addEventListener('click', () => {
        this.addBlock(item.dataset.blockType);
        this.hideAddMenu();
      });
    });
  }
  
  /**
   * Bind global events
   */
  bindGlobalEvents() {
    // Close menus on click outside
    document.addEventListener('click', (e) => {
      if (!this.addMenu.contains(e.target) && !this.addButton.contains(e.target)) {
        this.hideAddMenu();
      }
      if (!this.contextMenu.contains(e.target)) {
        this.hideContextMenu();
      }
    });
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Escape closes menus
      if (e.key === 'Escape') {
        this.hideAddMenu();
        this.hideContextMenu();
        this.hideToolbar();
      }
      
      // Ctrl+B - Bold
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        this.applyFormat('bold');
      }
      
      // Ctrl+I - Italic
      if (e.ctrlKey && e.key === 'i') {
        e.preventDefault();
        this.applyFormat('italic');
      }
      
      // Ctrl+U - Underline
      if (e.ctrlKey && e.key === 'u') {
        e.preventDefault();
        this.applyFormat('underline');
      }
      
      // Ctrl+Z - Undo
      if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        this.undo();
      }
      
      // Ctrl+Y or Ctrl+Shift+Z - Redo
      if ((e.ctrlKey && e.key === 'y') || (e.ctrlKey && e.shiftKey && e.key === 'z')) {
        e.preventDefault();
        this.redo();
      }
    });
    
    // Selection change for toolbar
    document.addEventListener('selectionchange', () => {
      this.handleSelectionChange();
    });
    
    // Drag and drop events
    this.blocksContainer.addEventListener('dragover', (e) => this.handleDragOver(e));
    this.blocksContainer.addEventListener('drop', (e) => this.handleDrop(e));
    this.blocksContainer.addEventListener('dragleave', (e) => this.handleDragLeave(e));
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Drag and Drop
  // ═══════════════════════════════════════════════════════════════════════════
  
  handleDragStart(e, blockId) {
    this.draggedBlockId = blockId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', blockId);
    
    // Add dragging class
    const blockView = this.blockViews.get(blockId);
    if (blockView) {
      setTimeout(() => {
        blockView.getElement().classList.add('block--dragging');
      }, 0);
    }
  }
  
  handleDragEnd(e, blockId) {
    this.draggedBlockId = null;
    this.removeDropIndicator();
    
    // Remove dragging class
    const blockView = this.blockViews.get(blockId);
    if (blockView) {
      blockView.getElement().classList.remove('block--dragging');
    }
  }
  
  handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!this.draggedBlockId) return;
    
    const targetBlock = this.getBlockFromPoint(e.clientY);
    if (targetBlock && targetBlock.id !== this.draggedBlockId) {
      this.showDropIndicator(targetBlock, e.clientY);
    }
  }
  
  handleDrop(e) {
    e.preventDefault();
    
    if (!this.draggedBlockId) return;
    
    const targetBlock = this.getBlockFromPoint(e.clientY);
    if (targetBlock && targetBlock.id !== this.draggedBlockId) {
      const targetIndex = this.controller.getBlockIndex(targetBlock.id);
      const targetRect = this.blockViews.get(targetBlock.id).getElement().getBoundingClientRect();
      const insertAfter = e.clientY > targetRect.top + targetRect.height / 2;
      
      const newIndex = insertAfter ? targetIndex + 1 : targetIndex;
      this.controller.moveBlock(this.draggedBlockId, newIndex);
      this.render();
    }
    
    this.removeDropIndicator();
    this.draggedBlockId = null;
  }
  
  handleDragLeave(e) {
    // Only remove indicator if leaving the container
    if (!this.blocksContainer.contains(e.relatedTarget)) {
      this.removeDropIndicator();
    }
  }
  
  getBlockFromPoint(y) {
    const blocks = this.controller.getBlocks();
    for (const block of blocks) {
      const blockView = this.blockViews.get(block.id);
      if (blockView) {
        const rect = blockView.getElement().getBoundingClientRect();
        if (y >= rect.top && y <= rect.bottom) {
          return block;
        }
      }
    }
    return null;
  }
  
  showDropIndicator(targetBlock, y) {
    this.removeDropIndicator();
    
    const blockView = this.blockViews.get(targetBlock.id);
    if (!blockView) return;
    
    const rect = blockView.getElement().getBoundingClientRect();
    const insertAfter = y > rect.top + rect.height / 2;
    
    const indicator = createElement('div', 'drop-indicator');
    this.dropIndicator = indicator;
    
    const blockEl = blockView.getElement();
    if (insertAfter) {
      blockEl.after(indicator);
    } else {
      blockEl.before(indicator);
    }
  }
  
  removeDropIndicator() {
    if (this.dropIndicator) {
      this.dropIndicator.remove();
      this.dropIndicator = null;
    }
  }
  
  /**
   * Render all blocks
   */
  render() {
    this.blocksContainer.innerHTML = '';
    this.blockViews.clear();
    
    const blocks = this.controller.getBlocks();
    
    if (blocks.length === 0) {
      this.showPlaceholder();
      return;
    }
    
    blocks.forEach((block) => {
      this.renderBlock(block);
    });
  }
  
  /**
   * Render a single block
   */
  renderBlock(block, insertIndex = null) {
    const blockView = new BlockView(block, {
      onInput: (id, content) => this.handleBlockInput(id, content),
      onFocus: (id) => this.handleBlockFocus(id),
      onBlur: (id) => this.handleBlockBlur(id),
      onKeydown: (e, id) => this.handleBlockKeydown(e, id),
      onHandleClick: (e, block) => this.showContextMenu(e, block),
      onDragStart: (e, id) => this.handleDragStart(e, id),
      onDragEnd: (e, id) => this.handleDragEnd(e, id),
      onListItemInput: (id, index, content) => this.handleListItemInput(id, index, content),
      onListItemKeydown: (e, id, index) => this.handleListItemKeydown(e, id, index),
      onCodeInput: (id, code) => this.handleCodeInput(id, code),
      onTableCellInput: (id, row, cell, content) => this.handleTableCellInput(id, row, cell, content),
      onMediaClick: (id) => this.handleMediaClick(id),
    });
    
    const element = blockView.render();
    this.blockViews.set(block.id, blockView);
    
    if (insertIndex !== null && insertIndex < this.blocksContainer.children.length) {
      this.blocksContainer.insertBefore(element, this.blocksContainer.children[insertIndex]);
    } else {
      this.blocksContainer.appendChild(element);
    }
    
    return blockView;
  }
  
  /**
   * Show placeholder when empty
   */
  showPlaceholder() {
    const placeholder = createElement('div', 'editor__placeholder');
    placeholder.textContent = 'انقر لبدء الكتابة...';
    placeholder.addEventListener('click', () => {
      this.addBlock('paragraph');
    });
    this.blocksContainer.appendChild(placeholder);
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Block Operations
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Add a new block
   */
  addBlock(type, afterBlockId = null) {
    const block = this.createBlock(type);
    
    let insertIndex;
    if (afterBlockId) {
      insertIndex = this.controller.getBlockIndex(afterBlockId) + 1;
    } else if (this.focusedBlockId) {
      insertIndex = this.controller.getBlockIndex(this.focusedBlockId) + 1;
    } else {
      insertIndex = this.controller.getBlocks().length;
    }
    
    // Remove placeholder if exists
    const placeholder = this.blocksContainer.querySelector('.editor__placeholder');
    if (placeholder) placeholder.remove();
    
    this.controller.addBlock(block, insertIndex);
    const blockView = this.renderBlock(block, insertIndex);
    
    // Focus the new block
    setTimeout(() => blockView.focus(), 0);
    
    return block;
  }
  
  /**
   * Create a block of given type
   */
  createBlock(type) {
    const id = generateId(type);
    const direction = 'rtl';
    
    switch (type) {
      case 'paragraph':
      case 'heading1':
      case 'heading2':
      case 'heading3':
      case 'heading4':
      case 'heading5':
      case 'heading6':
      case 'quote':
        return { id, type, direction, content: [] };
      
      case 'bullet-list':
      case 'numbered-list':
        return { 
          id, type, direction, 
          items: [{ id: generateId('item'), content: [] }] 
        };
      
      case 'code':
        return { id, type, direction, language: 'javascript', code: '' };
      
      case 'table':
        return {
          id, type, direction,
          rows: [
            { id: generateId('row'), cells: [
              { id: generateId('cell'), content: [] },
              { id: generateId('cell'), content: [] },
            ], isHeader: true },
            { id: generateId('row'), cells: [
              { id: generateId('cell'), content: [] },
              { id: generateId('cell'), content: [] },
            ] },
          ],
        };
      
      case 'image':
      case 'video':
      case 'audio':
        return { id, type, direction, src: '' };
      
      case 'divider':
        return { id, type, direction };
      
      default:
        return { id, type: 'paragraph', direction, content: [] };
    }
  }
  
  /**
   * Remove a block
   */
  removeBlock(blockId) {
    const blockView = this.blockViews.get(blockId);
    if (blockView) {
      blockView.getElement().remove();
      this.blockViews.delete(blockId);
    }
    
    this.controller.removeBlock(blockId);
    
    // Show placeholder if empty
    if (this.controller.getBlocks().length === 0) {
      this.showPlaceholder();
    }
  }
  
  /**
   * Duplicate a block
   */
  duplicateBlock(blockId) {
    const newBlock = this.controller.duplicateBlock(blockId);
    if (newBlock) {
      const index = this.controller.getBlockIndex(newBlock.id);
      const blockView = this.renderBlock(newBlock, index);
      setTimeout(() => blockView.focus(), 0);
    }
  }
  
  /**
   * Move block up
   */
  moveBlockUp(blockId) {
    const index = this.controller.getBlockIndex(blockId);
    if (index > 0) {
      this.controller.moveBlock(blockId, index - 1);
      this.render();
      this.focusBlock(blockId);
    }
  }
  
  /**
   * Move block down
   */
  moveBlockDown(blockId) {
    const index = this.controller.getBlockIndex(blockId);
    const blocks = this.controller.getBlocks();
    if (index < blocks.length - 1) {
      this.controller.moveBlock(blockId, index + 2);
      this.render();
      this.focusBlock(blockId);
    }
  }
  
  /**
   * Convert block type
   */
  convertBlock(blockId, newType) {
    const block = this.controller.getBlock(blockId);
    if (!block) return;
    
    // Preserve content when converting
    const content = block.content || [];
    this.controller.convertBlock(blockId, newType);
    
    // Re-render the block completely
    const index = this.controller.getBlockIndex(blockId);
    const blockView = this.blockViews.get(blockId);
    if (blockView) {
      blockView.getElement().remove();
      this.blockViews.delete(blockId);
    }
    
    const updatedBlock = this.controller.getBlock(blockId);
    if (updatedBlock) {
      // Restore content
      updatedBlock.content = content;
      this.renderBlock(updatedBlock, index);
    }
  }
  
  /**
   * Focus a block
   */
  focusBlock(blockId) {
    const blockView = this.blockViews.get(blockId);
    if (blockView) {
      blockView.focus();
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Event Handlers
  // ═══════════════════════════════════════════════════════════════════════════
  
  handleBlockInput(blockId, content) {
    this.controller.updateBlock(blockId, { content });
    if (this.options.onChange) {
      this.options.onChange();
    }
  }
  
  handleBlockFocus(blockId) {
    this.focusedBlockId = blockId;
    this.controller.focusBlock(blockId);
  }
  
  handleBlockBlur(blockId) {
    // Keep focusedBlockId for context menu
  }
  
  handleBlockKeydown(e, blockId) {
    // Enter - create new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.addBlock('paragraph', blockId);
    }
    
    // Backspace in empty block - delete it
    if (e.key === 'Backspace') {
      const blockView = this.blockViews.get(blockId);
      if (blockView && blockView.isEmpty()) {
        const blocks = this.controller.getBlocks();
        if (blocks.length > 1) {
          e.preventDefault();
          const index = this.controller.getBlockIndex(blockId);
          const prevBlockId = index > 0 ? blocks[index - 1].id : null;
          this.removeBlock(blockId);
          if (prevBlockId) {
            this.focusBlock(prevBlockId);
          }
        }
      }
    }
    
    // Arrow Up at start - focus previous block
    if (e.key === 'ArrowUp') {
      const index = this.controller.getBlockIndex(blockId);
      if (index > 0) {
        const blocks = this.controller.getBlocks();
        // Check if at start of block
        const selection = window.getSelection();
        if (selection.anchorOffset === 0) {
          e.preventDefault();
          this.focusBlock(blocks[index - 1].id);
        }
      }
    }
    
    // Arrow Down at end - focus next block
    if (e.key === 'ArrowDown') {
      const blocks = this.controller.getBlocks();
      const index = this.controller.getBlockIndex(blockId);
      if (index < blocks.length - 1) {
        e.preventDefault();
        this.focusBlock(blocks[index + 1].id);
      }
    }
  }
  
  handleListItemInput(blockId, index, content) {
    const block = this.controller.getBlock(blockId);
    if (block && block.items) {
      block.items[index].content = content;
      this.controller.updateBlock(blockId, { items: block.items });
    }
  }
  
  handleListItemKeydown(e, blockId, index) {
    if (e.key === 'Enter') {
      e.preventDefault();
      const block = this.controller.getBlock(blockId);
      if (block && block.items) {
        const newItem = { id: generateId('item'), content: [] };
        block.items.splice(index + 1, 0, newItem);
        this.controller.updateBlock(blockId, { items: block.items });
        
        // Re-render and focus new item
        const blockView = this.blockViews.get(blockId);
        if (blockView) {
          blockView.update(block);
          setTimeout(() => {
            const newItemEl = blockView.getElement().querySelector(`[data-item-index="${index + 1}"]`);
            if (newItemEl) {
              newItemEl.focus();
            }
          }, 0);
        }
      }
    }
  }
  
  handleCodeInput(blockId, code) {
    this.controller.updateBlock(blockId, { code });
  }
  
  handleTableCellInput(blockId, rowIndex, cellIndex, content) {
    const block = this.controller.getBlock(blockId);
    if (block && block.rows && block.rows[rowIndex]) {
      block.rows[rowIndex].cells[cellIndex].content = content;
      this.controller.updateBlock(blockId, { rows: block.rows });
    }
  }
  
  handleMediaClick(blockId) {
    const url = prompt('أدخل رابط الوسائط:');
    if (url) {
      this.controller.updateBlock(blockId, { src: url });
      const block = this.controller.getBlock(blockId);
      const blockView = this.blockViews.get(blockId);
      if (blockView && block) {
        blockView.update(block);
      }
    }
  }
  
  handleSelectionChange() {
    const selection = window.getSelection();
    if (selection.toString().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      this.showToolbar(rect);
    } else {
      this.hideToolbar();
    }
  }
  
  handleContextAction(action) {
    if (!this.contextMenuBlockId) return;
    
    switch (action) {
      case 'delete':
        this.removeBlock(this.contextMenuBlockId);
        break;
      case 'duplicate':
        this.duplicateBlock(this.contextMenuBlockId);
        break;
      case 'move-up':
        this.moveBlockUp(this.contextMenuBlockId);
        break;
      case 'move-down':
        this.moveBlockDown(this.contextMenuBlockId);
        break;
      case 'convert-heading1':
        this.convertBlock(this.contextMenuBlockId, 'heading1');
        break;
      case 'convert-heading2':
        this.convertBlock(this.contextMenuBlockId, 'heading2');
        break;
      case 'convert-paragraph':
        this.convertBlock(this.contextMenuBlockId, 'paragraph');
        break;
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Menu Methods
  // ═══════════════════════════════════════════════════════════════════════════
  
  showAddMenu(e) {
    const rect = e.target.getBoundingClientRect();
    this.addMenu.style.top = `${rect.top - this.addMenu.offsetHeight - 10}px`;
    this.addMenu.style.left = `${rect.left}px`;
    this.addMenu.classList.add('menu--open');
  }
  
  hideAddMenu() {
    this.addMenu.classList.remove('menu--open');
  }
  
  showContextMenu(e, block) {
    e.preventDefault();
    e.stopPropagation();
    
    this.contextMenuBlockId = block.id;
    
    const rect = e.target.getBoundingClientRect();
    this.contextMenu.style.top = `${rect.bottom + 5}px`;
    this.contextMenu.style.left = `${rect.left}px`;
    this.contextMenu.classList.add('menu--open');
  }
  
  hideContextMenu() {
    this.contextMenu.classList.remove('menu--open');
    this.contextMenuBlockId = null;
  }
  
  showToolbar(rect) {
    this.toolbar.style.top = `${rect.top - this.toolbar.offsetHeight - 10}px`;
    this.toolbar.style.left = `${rect.left + rect.width / 2 - this.toolbar.offsetWidth / 2}px`;
    this.toolbar.classList.add('toolbar--open');
  }
  
  hideToolbar() {
    this.toolbar.classList.remove('toolbar--open');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Formatting
  // ═══════════════════════════════════════════════════════════════════════════
  
  applyFormat(format) {
    switch (format) {
      case 'bold':
        document.execCommand('bold', false, null);
        break;
      case 'italic':
        document.execCommand('italic', false, null);
        break;
      case 'underline':
        document.execCommand('underline', false, null);
        break;
      case 'strikethrough':
        document.execCommand('strikeThrough', false, null);
        break;
      case 'code':
        // Wrap in code tag
        const selection = window.getSelection();
        if (selection.toString()) {
          document.execCommand('insertHTML', false, `<code>${selection.toString()}</code>`);
        }
        break;
      case 'link':
        const url = prompt('أدخل الرابط:');
        if (url) {
          document.execCommand('createLink', false, url);
        }
        break;
    }
    
    // Update block content after formatting
    if (this.focusedBlockId) {
      const blockView = this.blockViews.get(this.focusedBlockId);
      if (blockView) {
        this.handleBlockInput(this.focusedBlockId, blockView.getContent());
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // History
  // ═══════════════════════════════════════════════════════════════════════════
  
  undo() {
    this.controller.undo();
    this.render();
    showToast('تم التراجع');
  }
  
  redo() {
    this.controller.redo();
    this.render();
    showToast('تم الإعادة');
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // Export
  // ═══════════════════════════════════════════════════════════════════════════
  
  /**
   * Get ARTOON source
   */
  getSource() {
    if (this.exporter) {
      return this.exporter.export(this.controller.getBlocks());
    }
    return '';
  }
  
  /**
   * Load ARTOON content
   */
  loadContent(artoonText) {
    if (this.importer) {
      const blocks = this.importer.import(artoonText);
      // Clear existing
      this.controller.getBlocks().forEach(b => this.controller.removeBlock(b.id));
      // Add new
      blocks.forEach(block => this.controller.addBlock(block));
      this.render();
    }
  }
}

/**
 * Create an EditorView
 */
export function createEditorView(container, options) {
  return new EditorView(container, options);
}
