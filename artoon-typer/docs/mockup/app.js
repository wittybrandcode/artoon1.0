/**
 * ARTOON-TYPER — Interactive Mockup v2
 * واجهة محسنة حسب رؤية المستخدم
 */

// ═══════════════════════════════════════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════════════════════════════════════

const blockTypes = {
  text: [
    { icon: '¶', name: 'فقرة', desc: 'نص عادي', type: 'p' },
    { icon: 'H₁', name: 'عنوان 1', desc: 'عنوان رئيسي كبير', type: 'h1' },
    { icon: 'H₂', name: 'عنوان 2', desc: 'عنوان فرعي', type: 'h2' },
    { icon: 'H₃', name: 'عنوان 3', desc: 'عنوان صغير', type: 'h3' },
    { icon: '"', name: 'اقتباس', desc: 'نص مقتبس', type: 'quote' },
  ],
  list: [
    { icon: '•', name: 'قائمة نقطية', desc: 'قائمة غير مرتبة', type: 'ul' },
    { icon: '1.', name: 'قائمة مرقمة', desc: 'قائمة مرتبة', type: 'ol' },
    { icon: '☑', name: 'قائمة مهام', desc: 'قائمة تحقق', type: 'todo' },
  ],
  media: [
    { icon: '🖼', name: 'صورة', desc: 'إدراج صورة', type: 'image' },
    { icon: '🎬', name: 'فيديو', desc: 'إدراج فيديو', type: 'video' },
    { icon: '🔊', name: 'صوت', desc: 'إدراج ملف صوتي', type: 'audio' },
    { icon: '📎', name: 'ملف', desc: 'إدراج ملف للتحميل', type: 'file' },
  ],
  advanced: [
    { icon: '&lt;/&gt;', name: 'كود', desc: 'بلوك كود برمجي', type: 'code' },
    { icon: '▦', name: 'جدول', desc: 'جدول بيانات', type: 'table' },
    { icon: '—', name: 'فاصل', desc: 'خط أفقي فاصل', type: 'divider' },
    { icon: '📦', name: 'بلوك مخصص', desc: 'بلوك ARTOON مخصص', type: 'custom' },
  ],
};

const contextMenuItems = [
  { icon: '🗑', label: 'حذف البلوك', action: 'delete', danger: true },
  { icon: '📋', label: 'تكرار', action: 'duplicate' },
  { icon: '✂️', label: 'قص', action: 'cut' },
  { icon: '📄', label: 'نسخ', action: 'copy' },
  { divider: true },
  { icon: '⬆', label: 'نقل لأعلى', action: 'move-up' },
  { icon: '⬇', label: 'نقل لأسفل', action: 'move-down' },
  { divider: true },
  { icon: '🔄', label: 'تحويل إلى...', action: 'convert', submenu: true },
];


// Sample document
const sampleDocument = [
  { id: 1, type: 'h1', dir: 'rtl', content: 'مرحباً بك في ARTOON-TYPER' },
  { id: 2, type: 'p', dir: 'rtl', content: 'هذا محرر نصوص <strong>احترافي</strong> يعتمد على البلوكات، مستوحى من <em>Notion</em> و <em>TipTap</em>.' },
  { id: 3, type: 'h2', dir: 'rtl', content: 'الميزات الرئيسية' },
  { id: 4, type: 'ul', dir: 'rtl', items: [
    'تحرير بصري بأسلوب Notion',
    'دعم كامل للغة العربية (RTL)',
    'اختصارات لوحة مفاتيح متكاملة',
    'سحب وإفلات لإعادة الترتيب',
  ]},
  { id: 5, type: 'p', dir: 'rtl', content: 'جرب النقر على <code>⋮⋮</code> لفتح قائمة الخيارات، أو <code>+</code> لإضافة بلوك جديد.' },
  { id: 6, type: 'quote', dir: 'rtl', content: 'البساطة هي قمة التطور — ليوناردو دافنشي' },
  { id: 7, type: 'h2', dir: 'ltr', content: 'Code Example (LTR Block)' },
  { id: 8, type: 'code', dir: 'ltr', language: 'javascript', content: `// Import the editor
import { ArtoonTyper } from '@artoon/typer';

// Create new editor
const editor = new ArtoonTyper({
  container: '#editor',
  content: '>.p:: مرحباً بالعالم',
});` },
  { id: 9, type: 'h2', dir: 'rtl', content: 'جدول المقارنة' },
  { id: 10, type: 'table', dir: 'rtl', headers: ['الميزة', 'Notion', 'ARTOON-TYPER'], rows: [
    ['دعم RTL', '⚠️ محدود', '✅ أصلي'],
    ['صيغة مخصصة', '❌', '✅ ARTOON'],
    ['مفتوح المصدر', '❌', '✅'],
  ]},
  { id: 11, type: 'divider', dir: 'rtl' },
  { id: 12, type: 'p', dir: 'rtl', content: '' },
];

let blocks = [...sampleDocument];
let focusedBlockId = null;
let currentTab = 'text';

// ═══════════════════════════════════════════════════════════════════════════
// RENDER FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

function renderBlock(block) {
  const isRTL = block.dir === 'rtl';
  const dirSymbol = isRTL ? '>' : '<';
  const dirClass = isRTL ? 'rtl' : 'ltr';
  
  let contentHTML = '';
  
  switch (block.type) {
    case 'h1':
    case 'h2':
    case 'h3':
    case 'p':
    case 'quote':
      contentHTML = `<div class="block__content" contenteditable="true" data-placeholder="اكتب شيئاً...">${block.content || ''}</div>`;
      break;
      
    case 'ul':
    case 'ol':
      const marker = block.type === 'ul' ? '•' : '';
      contentHTML = `<div class="block__content">`;
      block.items.forEach((item, i) => {
        contentHTML += `
          <div class="list-item">
            <span class="list-item__marker">${block.type === 'ul' ? '•' : (i + 1) + '.'}</span>
            <div class="list-item__content" contenteditable="true">${item}</div>
          </div>`;
      });
      contentHTML += `</div>`;
      break;
      
    case 'code':
      contentHTML = `
        <div class="block__content">
          <div class="code-header">
            <span>${block.language || 'plain text'}</span>
            <button class="btn btn--icon" style="font-size:12px" title="نسخ">📋</button>
          </div>
          <pre class="code-content">${escapeHTML(block.content)}</pre>
        </div>`;
      break;
      
    case 'table':
      let tableHTML = '<div class="block__content"><table><thead><tr>';
      block.headers.forEach(h => tableHTML += `<th contenteditable="true">${h}</th>`);
      tableHTML += '</tr></thead><tbody>';
      block.rows.forEach(row => {
        tableHTML += '<tr>';
        row.forEach(cell => tableHTML += `<td contenteditable="true">${cell}</td>`);
        tableHTML += '</tr>';
      });
      tableHTML += '</tbody></table></div>';
      contentHTML = tableHTML;
      break;
      
    case 'divider':
      contentHTML = `<div class="block__content"><hr></div>`;
      break;
      
    default:
      contentHTML = `<div class="block__content" contenteditable="true" data-placeholder="اكتب شيئاً...">${block.content || ''}</div>`;
  }
  
  return `
    <div class="block-row" data-block-id="${block.id}">
      <div class="block block--${block.type}" dir="${block.dir}" data-block-id="${block.id}">
        <div class="block__controls">
          <div class="block__drag" title="اسحب لإعادة الترتيب / انقر للخيارات">⋮⋮</div>
          <button class="block__dir ${dirClass}" title="تغيير اتجاه النص">${dirSymbol}</button>
        </div>
        ${contentHTML}
      </div>
    </div>
    <div class="block-separator" data-after-block="${block.id}">
      <div class="block-separator__line"></div>
      <button class="block-separator__btn" title="إضافة بلوك">+</button>
    </div>
  `;
}

function escapeHTML(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ═══════════════════════════════════════════════════════════════════════════
// RENDER EDITOR
// ═══════════════════════════════════════════════════════════════════════════

function renderEditor() {
  const editor = document.getElementById('editor');
  
  // Initial separator at top
  let html = `
    <div class="block-separator block-separator--first" data-after-block="0">
      <div class="block-separator__line"></div>
      <button class="block-separator__btn" title="إضافة بلوك">+</button>
    </div>
  `;
  
  blocks.forEach(block => {
    html += renderBlock(block);
  });
  
  editor.innerHTML = html;
  
  // Restore focus if needed
  if (focusedBlockId) {
    const focusedBlock = document.querySelector(`.block[data-block-id="${focusedBlockId}"]`);
    if (focusedBlock) focusedBlock.classList.add('focused');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ADD MENU (Tabbed)
// ═══════════════════════════════════════════════════════════════════════════

function renderAddMenuContent(tab) {
  const content = document.getElementById('addMenuContent');
  const items = blockTypes[tab] || [];
  
  content.innerHTML = items.map(item => `
    <div class="add-menu__item" data-type="${item.type}">
      <div class="add-menu__item-icon">${item.icon}</div>
      <div class="add-menu__item-info">
        <div class="add-menu__item-name">${item.name}</div>
        <div class="add-menu__item-desc">${item.desc}</div>
      </div>
    </div>
  `).join('');
}

function showAddMenu(x, y, afterBlockId) {
  const menu = document.getElementById('addMenu');
  menu.dataset.afterBlock = afterBlockId;
  
  // Position menu
  const menuWidth = 340;
  const menuHeight = 380;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let posX = x - menuWidth / 2;
  let posY = y + 10;
  
  // Keep within viewport
  if (posX < 10) posX = 10;
  if (posX + menuWidth > viewportWidth - 10) posX = viewportWidth - menuWidth - 10;
  if (posY + menuHeight > viewportHeight - 10) posY = y - menuHeight - 10;
  
  menu.style.left = posX + 'px';
  menu.style.top = posY + 'px';
  
  // Reset to first tab
  currentTab = 'text';
  document.querySelectorAll('.add-menu__tab').forEach(t => {
    t.classList.toggle('active', t.dataset.tab === 'text');
  });
  renderAddMenuContent('text');
  
  menu.classList.add('visible');
}

function hideAddMenu() {
  document.getElementById('addMenu').classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTEXT MENU (⋮⋮)
// ═══════════════════════════════════════════════════════════════════════════

function renderContextMenu() {
  const menu = document.getElementById('contextMenu');
  
  menu.innerHTML = contextMenuItems.map(item => {
    if (item.divider) {
      return '<div class="context-menu__divider"></div>';
    }
    const dangerClass = item.danger ? 'context-menu__item--danger' : '';
    return `
      <div class="context-menu__item ${dangerClass}" data-action="${item.action}">
        <span class="context-menu__item-icon">${item.icon}</span>
        <span>${item.label}</span>
        ${item.submenu ? '<span style="margin-right:auto">◂</span>' : ''}
      </div>
    `;
  }).join('');
}

function showContextMenu(x, y, blockId) {
  const menu = document.getElementById('contextMenu');
  menu.dataset.blockId = blockId;
  
  // Position menu
  const menuWidth = 200;
  const menuHeight = 280;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let posX = x;
  let posY = y;
  
  // Keep within viewport
  if (posX + menuWidth > viewportWidth - 10) posX = x - menuWidth;
  if (posY + menuHeight > viewportHeight - 10) posY = viewportHeight - menuHeight - 10;
  
  menu.style.left = posX + 'px';
  menu.style.top = posY + 'px';
  
  renderContextMenu();
  menu.classList.add('visible');
}

function hideContextMenu() {
  document.getElementById('contextMenu').classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE TOOLBAR
// ═══════════════════════════════════════════════════════════════════════════

function showInlineToolbar() {
  const selection = window.getSelection();
  if (!selection || selection.isCollapsed || selection.rangeCount === 0) {
    hideInlineToolbar();
    return;
  }
  
  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  const toolbar = document.getElementById('inlineToolbar');
  const toolbarWidth = 280;
  
  let posX = rect.left + rect.width / 2 - toolbarWidth / 2;
  let posY = rect.top - 50;
  
  // Keep within viewport
  if (posX < 10) posX = 10;
  if (posX + toolbarWidth > window.innerWidth - 10) posX = window.innerWidth - toolbarWidth - 10;
  if (posY < 10) posY = rect.bottom + 10;
  
  toolbar.style.left = posX + 'px';
  toolbar.style.top = posY + 'px';
  toolbar.classList.add('visible');
}

function hideInlineToolbar() {
  document.getElementById('inlineToolbar').classList.remove('visible');
}

// ═══════════════════════════════════════════════════════════════════════════
// BLOCK OPERATIONS
// ═══════════════════════════════════════════════════════════════════════════

function addBlock(type, afterBlockId) {
  const newId = Math.max(...blocks.map(b => b.id), 0) + 1;
  const afterIndex = blocks.findIndex(b => b.id === parseInt(afterBlockId));
  
  const newBlock = {
    id: newId,
    type: type,
    dir: 'rtl',
    content: '',
  };
  
  // Special handling for different block types
  if (type === 'ul' || type === 'ol') {
    newBlock.items = [''];
  } else if (type === 'code') {
    newBlock.language = 'javascript';
    newBlock.content = '';
  } else if (type === 'table') {
    newBlock.headers = ['عمود 1', 'عمود 2', 'عمود 3'];
    newBlock.rows = [['', '', '']];
  }
  
  if (afterIndex === -1 || afterBlockId === '0') {
    blocks.unshift(newBlock);
  } else {
    blocks.splice(afterIndex + 1, 0, newBlock);
  }
  
  focusedBlockId = newId;
  renderEditor();
  
  // Focus the new block's content
  setTimeout(() => {
    const newBlockEl = document.querySelector(`.block[data-block-id="${newId}"] .block__content`);
    if (newBlockEl && newBlockEl.getAttribute('contenteditable') === 'true') {
      newBlockEl.focus();
    }
  }, 50);
}

function deleteBlock(blockId) {
  const index = blocks.findIndex(b => b.id === parseInt(blockId));
  if (index !== -1 && blocks.length > 1) {
    blocks.splice(index, 1);
    focusedBlockId = null;
    renderEditor();
  }
}

function duplicateBlock(blockId) {
  const index = blocks.findIndex(b => b.id === parseInt(blockId));
  if (index !== -1) {
    const newId = Math.max(...blocks.map(b => b.id), 0) + 1;
    const duplicate = JSON.parse(JSON.stringify(blocks[index]));
    duplicate.id = newId;
    blocks.splice(index + 1, 0, duplicate);
    focusedBlockId = newId;
    renderEditor();
  }
}

function moveBlock(blockId, direction) {
  const index = blocks.findIndex(b => b.id === parseInt(blockId));
  if (index === -1) return;
  
  const newIndex = direction === 'up' ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= blocks.length) return;
  
  const temp = blocks[index];
  blocks[index] = blocks[newIndex];
  blocks[newIndex] = temp;
  
  renderEditor();
}

function toggleBlockDirection(blockId) {
  const block = blocks.find(b => b.id === parseInt(blockId));
  if (block) {
    block.dir = block.dir === 'rtl' ? 'ltr' : 'rtl';
    renderEditor();
  }
}

function focusBlock(blockId) {
  // Remove previous focus
  document.querySelectorAll('.block.focused').forEach(b => b.classList.remove('focused'));
  
  focusedBlockId = parseInt(blockId);
  const block = document.querySelector(`.block[data-block-id="${blockId}"]`);
  if (block) {
    block.classList.add('focused');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INLINE FORMATTING
// ═══════════════════════════════════════════════════════════════════════════

function applyMark(mark) {
  const commands = {
    bold: 'bold',
    italic: 'italic',
    underline: 'underline',
    strike: 'strikeThrough',
  };
  
  if (commands[mark]) {
    document.execCommand(commands[mark], false, null);
  } else if (mark === 'highlight') {
    document.execCommand('hiliteColor', false, '#fff3b0');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// THEME TOGGLE
// ═══════════════════════════════════════════════════════════════════════════

function toggleTheme() {
  document.body.classList.toggle('dark');
  const btn = document.querySelector('.theme-toggle');
  btn.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
}

// ═══════════════════════════════════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════════════════════════════════

function setupEventListeners() {
  const editor = document.getElementById('editor');
  const addMenu = document.getElementById('addMenu');
  const contextMenu = document.getElementById('contextMenu');
  
  // ─────────────────────────────────────────────────────────────────────────
  // Block Separator + Button → Show Add Menu
  // ─────────────────────────────────────────────────────────────────────────
  editor.addEventListener('click', (e) => {
    const addBtn = e.target.closest('.block-separator__btn');
    if (addBtn) {
      e.stopPropagation();
      const separator = addBtn.closest('.block-separator');
      const afterBlockId = separator.dataset.afterBlock;
      const rect = addBtn.getBoundingClientRect();
      showAddMenu(rect.left + rect.width / 2, rect.bottom, afterBlockId);
      return;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Drag Handle ⋮⋮ → Show Context Menu
    // ─────────────────────────────────────────────────────────────────────────
    const dragHandle = e.target.closest('.block__drag');
    if (dragHandle) {
      e.stopPropagation();
      const block = dragHandle.closest('.block');
      const blockId = block.dataset.blockId;
      const rect = dragHandle.getBoundingClientRect();
      showContextMenu(rect.left, rect.bottom + 5, blockId);
      focusBlock(blockId);
      return;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Direction Toggle Button
    // ─────────────────────────────────────────────────────────────────────────
    const dirBtn = e.target.closest('.block__dir');
    if (dirBtn) {
      e.stopPropagation();
      const block = dirBtn.closest('.block');
      const blockId = block.dataset.blockId;
      toggleBlockDirection(blockId);
      return;
    }
    
    // ─────────────────────────────────────────────────────────────────────────
    // Block Click → Focus Block
    // ─────────────────────────────────────────────────────────────────────────
    const block = e.target.closest('.block');
    if (block) {
      focusBlock(block.dataset.blockId);
    }
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Add Menu Tab Switching
  // ─────────────────────────────────────────────────────────────────────────
  addMenu.addEventListener('click', (e) => {
    const tab = e.target.closest('.add-menu__tab');
    if (tab) {
      document.querySelectorAll('.add-menu__tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentTab = tab.dataset.tab;
      renderAddMenuContent(currentTab);
      return;
    }
    
    // Add Menu Item Click → Add Block
    const item = e.target.closest('.add-menu__item');
    if (item) {
      const type = item.dataset.type;
      const afterBlockId = addMenu.dataset.afterBlock;
      addBlock(type, afterBlockId);
      hideAddMenu();
    }
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Context Menu Actions
  // ─────────────────────────────────────────────────────────────────────────
  contextMenu.addEventListener('click', (e) => {
    const item = e.target.closest('.context-menu__item');
    if (!item) return;
    
    const action = item.dataset.action;
    const blockId = contextMenu.dataset.blockId;
    
    switch (action) {
      case 'delete':
        deleteBlock(blockId);
        break;
      case 'duplicate':
        duplicateBlock(blockId);
        break;
      case 'move-up':
        moveBlock(blockId, 'up');
        break;
      case 'move-down':
        moveBlock(blockId, 'down');
        break;
      case 'cut':
        // TODO: Implement clipboard
        console.log('Cut block:', blockId);
        break;
      case 'copy':
        // TODO: Implement clipboard
        console.log('Copy block:', blockId);
        break;
      case 'convert':
        // TODO: Show conversion submenu
        console.log('Convert block:', blockId);
        break;
    }
    
    hideContextMenu();
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Inline Toolbar Buttons
  // ─────────────────────────────────────────────────────────────────────────
  document.getElementById('inlineToolbar').addEventListener('click', (e) => {
    const btn = e.target.closest('.toolbar-btn');
    if (!btn) return;
    
    const mark = btn.dataset.mark;
    if (mark) {
      applyMark(mark);
    }
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Text Selection → Show Inline Toolbar
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('selectionchange', () => {
    const selection = window.getSelection();
    if (selection && !selection.isCollapsed) {
      // Check if selection is within editor
      const anchorNode = selection.anchorNode;
      if (anchorNode && editor.contains(anchorNode)) {
        showInlineToolbar();
      }
    } else {
      hideInlineToolbar();
    }
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Click Outside → Hide Menus
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (!addMenu.contains(e.target) && !e.target.closest('.block-separator__btn')) {
      hideAddMenu();
    }
    if (!contextMenu.contains(e.target) && !e.target.closest('.block__drag')) {
      hideContextMenu();
    }
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Keyboard Shortcuts
  // ─────────────────────────────────────────────────────────────────────────
  document.addEventListener('keydown', (e) => {
    // Escape → Close menus
    if (e.key === 'Escape') {
      hideAddMenu();
      hideContextMenu();
      hideInlineToolbar();
    }
    
    // Ctrl+B → Bold
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      applyMark('bold');
    }
    
    // Ctrl+I → Italic
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      applyMark('italic');
    }
    
    // Ctrl+U → Underline
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      applyMark('underline');
    }
  });
  
  // ─────────────────────────────────────────────────────────────────────────
  // Theme Toggle
  // ─────────────────────────────────────────────────────────────────────────
  document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);
}

// ═══════════════════════════════════════════════════════════════════════════
// DRAG & DROP
// ═══════════════════════════════════════════════════════════════════════════

let draggedBlockId = null;
let dropIndicator = null;

function setupDragAndDrop() {
  const editor = document.getElementById('editor');
  
  // Create drop indicator
  dropIndicator = document.createElement('div');
  dropIndicator.className = 'drop-indicator';
  dropIndicator.style.display = 'none';
  document.body.appendChild(dropIndicator);
  
  editor.addEventListener('mousedown', (e) => {
    const dragHandle = e.target.closest('.block__drag');
    if (!dragHandle) return;
    
    const blockRow = dragHandle.closest('.block-row');
    if (!blockRow) return;
    
    draggedBlockId = blockRow.dataset.blockId;
    
    // Start drag after small movement
    const startY = e.clientY;
    let isDragging = false;
    
    const onMouseMove = (moveEvent) => {
      if (!isDragging && Math.abs(moveEvent.clientY - startY) > 5) {
        isDragging = true;
        blockRow.classList.add('dragging');
      }
      
      if (isDragging) {
        // Find drop position
        const blockRows = document.querySelectorAll('.block-row:not(.dragging)');
        let closestRow = null;
        let closestDistance = Infinity;
        let insertBefore = true;
        
        blockRows.forEach(row => {
          const rect = row.getBoundingClientRect();
          const midY = rect.top + rect.height / 2;
          const distance = Math.abs(moveEvent.clientY - midY);
          
          if (distance < closestDistance) {
            closestDistance = distance;
            closestRow = row;
            insertBefore = moveEvent.clientY < midY;
          }
        });
        
        if (closestRow) {
          const rect = closestRow.getBoundingClientRect();
          dropIndicator.style.display = 'block';
          dropIndicator.style.left = rect.left + 'px';
          dropIndicator.style.width = rect.width + 'px';
          dropIndicator.style.top = (insertBefore ? rect.top : rect.bottom) + 'px';
          dropIndicator.dataset.targetId = closestRow.dataset.blockId;
          dropIndicator.dataset.insertBefore = insertBefore;
        }
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      
      if (isDragging && dropIndicator.style.display === 'block') {
        const targetId = parseInt(dropIndicator.dataset.targetId);
        const insertBefore = dropIndicator.dataset.insertBefore === 'true';
        
        // Reorder blocks
        const draggedIndex = blocks.findIndex(b => b.id === parseInt(draggedBlockId));
        const targetIndex = blocks.findIndex(b => b.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1 && draggedIndex !== targetIndex) {
          const [draggedBlock] = blocks.splice(draggedIndex, 1);
          const newIndex = insertBefore ? 
            (draggedIndex < targetIndex ? targetIndex - 1 : targetIndex) :
            (draggedIndex < targetIndex ? targetIndex : targetIndex + 1);
          blocks.splice(newIndex, 0, draggedBlock);
          renderEditor();
        }
      }
      
      blockRow.classList.remove('dragging');
      dropIndicator.style.display = 'none';
      draggedBlockId = null;
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════════════════════

function init() {
  renderEditor();
  setupEventListeners();
  setupDragAndDrop();
  
  console.log('🚀 ARTOON-TYPER Mockup initialized');
  console.log('📝 Blocks:', blocks.length);
}

// Start when DOM is ready
document.addEventListener('DOMContentLoaded', init);