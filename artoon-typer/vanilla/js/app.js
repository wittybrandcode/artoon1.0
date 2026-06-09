/**
 * ARTOON Editor - Vanilla JS Application
 * 
 * Main entry point - standalone version without TypeScript dependencies.
 * This demonstrates the UI working independently.
 */

import { EditorView } from './EditorView.js';
import { generateId } from './DOMUtils.js';

/**
 * Simple EditorController (standalone version)
 * In production, use the full @artoon/typer package
 */
class SimpleEditorController {
  constructor(config = {}) {
    this.blocks = [];
    this.focusedBlockId = null;
    this.history = [];
    this.historyIndex = -1;
    this.config = config;
  }
  
  getBlocks() {
    return [...this.blocks];
  }
  
  getBlock(id) {
    return this.blocks.find(b => b.id === id);
  }
  
  getBlockIndex(id) {
    return this.blocks.findIndex(b => b.id === id);
  }
  
  addBlock(block, index) {
    this.saveHistory();
    const insertIndex = index ?? this.blocks.length;
    this.blocks.splice(insertIndex, 0, block);
  }
  
  removeBlock(id) {
    this.saveHistory();
    const index = this.getBlockIndex(id);
    if (index !== -1) {
      this.blocks.splice(index, 1);
    }
  }
  
  updateBlock(id, updates) {
    this.saveHistory();
    const index = this.getBlockIndex(id);
    if (index !== -1) {
      this.blocks[index] = { ...this.blocks[index], ...updates };
    }
  }
  
  moveBlock(id, newIndex) {
    this.saveHistory();
    const currentIndex = this.getBlockIndex(id);
    if (currentIndex === -1) return;
    
    const block = this.blocks[currentIndex];
    this.blocks.splice(currentIndex, 1);
    const adjustedIndex = newIndex > currentIndex ? newIndex - 1 : newIndex;
    this.blocks.splice(adjustedIndex, 0, block);
  }
  
  duplicateBlock(id) {
    const block = this.getBlock(id);
    if (!block) return null;
    
    const newBlock = JSON.parse(JSON.stringify(block));
    newBlock.id = generateId(block.type);
    
    const index = this.getBlockIndex(id);
    this.addBlock(newBlock, index + 1);
    return newBlock;
  }
  
  convertBlock(id, newType) {
    const block = this.getBlock(id);
    if (!block) return;
    
    this.updateBlock(id, { type: newType });
  }
  
  focusBlock(id) {
    this.focusedBlockId = id;
  }
  
  saveHistory() {
    // Simple history - keep last 50 states
    const state = JSON.stringify(this.blocks);
    this.history = this.history.slice(0, this.historyIndex + 1);
    this.history.push(state);
    if (this.history.length > 50) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }
  
  undo() {
    if (this.historyIndex > 0) {
      this.historyIndex--;
      this.blocks = JSON.parse(this.history[this.historyIndex]);
    }
  }
  
  redo() {
    if (this.historyIndex < this.history.length - 1) {
      this.historyIndex++;
      this.blocks = JSON.parse(this.history[this.historyIndex]);
    }
  }
}

/**
 * Simple ARTOON Importer (standalone version)
 */
class SimpleARTOONImporter {
  import(text) {
    if (!text) return [];
    
    const blocks = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      
      // Parse ARTOON syntax
      const match = trimmed.match(/^>\.?\[([^\]]+)\]::?\s*(.*)/);
      if (match) {
        const [, typeCode, content] = match;
        const block = this.parseBlock(typeCode, content);
        if (block) blocks.push(block);
      }
    }
    
    return blocks;
  }
  
  parseBlock(typeCode, content) {
    const id = generateId('block');
    const direction = 'rtl';
    
    switch (typeCode) {
      case 'p':
        return { id, type: 'paragraph', direction, content: [{ type: 'plain', value: content }] };
      case 't1':
        return { id, type: 'heading1', direction, content: [{ type: 'plain', value: content }] };
      case 't2':
        return { id, type: 'heading2', direction, content: [{ type: 'plain', value: content }] };
      case 't3':
        return { id, type: 'heading3', direction, content: [{ type: 'plain', value: content }] };
      case 'q':
        return { id, type: 'quote', direction, content: [{ type: 'plain', value: content }] };
      case 'hr':
        return { id, type: 'divider', direction };
      case 'ul':
        return { 
          id, type: 'bullet-list', direction, 
          items: this.parseListItems(content) 
        };
      case 'ol':
        return { 
          id, type: 'numbered-list', direction, 
          items: this.parseListItems(content) 
        };
      default:
        return { id, type: 'paragraph', direction, content: [{ type: 'plain', value: content }] };
    }
  }
  
  parseListItems(content) {
    // Simple list parsing - split by newlines starting with -
    const items = [];
    const lines = content.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-') || trimmed.startsWith('*')) {
        items.push({
          id: generateId('item'),
          content: [{ type: 'plain', value: trimmed.slice(1).trim() }]
        });
      }
    }
    
    if (items.length === 0 && content) {
      items.push({
        id: generateId('item'),
        content: [{ type: 'plain', value: content }]
      });
    }
    
    return items;
  }
}

/**
 * Simple ARTOON Exporter (standalone version)
 */
class SimpleARTOONExporter {
  export(blocks) {
    if (!blocks || blocks.length === 0) return '';
    
    return blocks.map(block => this.exportBlock(block)).join('\n\n');
  }
  
  exportBlock(block) {
    const content = this.getBlockContent(block);
    
    switch (block.type) {
      case 'paragraph':
        return `>.[p]:: ${content}`;
      case 'heading1':
        return `>.[t1]:: ${content}`;
      case 'heading2':
        return `>.[t2]:: ${content}`;
      case 'heading3':
        return `>.[t3]:: ${content}`;
      case 'quote':
        return `>.[q]:: ${content}`;
      case 'divider':
        return `>.[hr]::`;
      case 'bullet-list':
        return `>.[ul]::\n${this.exportListItems(block.items)}`;
      case 'numbered-list':
        return `>.[ol]::\n${this.exportListItems(block.items)}`;
      case 'code':
        return `<code:${block.language || 'plaintext'}>\n${block.code || ''}\n<code>`;
      default:
        return `>.[p]:: ${content}`;
    }
  }
  
  getBlockContent(block) {
    if (!block.content) return '';
    return block.content.map(c => c.value || c.text || '').join('');
  }
  
  exportListItems(items) {
    if (!items) return '';
    return items.map(item => {
      const content = item.content?.map(c => c.value || c.text || '').join('') || '';
      return `- ${content}`;
    }).join('\n');
  }
}

function createEditorController(config) {
  return new SimpleEditorController(config);
}

function createARTOONImporter() {
  return new SimpleARTOONImporter();
}

function createARTOONExporter() {
  return new SimpleARTOONExporter();
}

// Sample ARTOON content
const SAMPLE_CONTENT = `>.[t1]:: مرحباً بك في محرر ARTOON

>.[p]:: هذا محرر بلوكات احترافي يدعم العربية بشكل أصلي. يمكنك الكتابة والتحرير بسهولة.

>.[t2]:: الميزات الرئيسية

>.[ul]::
- فقرات نصية مع تنسيق غني
- عناوين من المستوى 1 إلى 6
- قوائم نقطية ومرقمة
- بلوكات الكود
- جداول قابلة للتحرير
- فواصل أفقية

>.[t2]:: كيفية الاستخدام

>.[p]:: اضغط على زر + لإضافة بلوك جديد، أو اضغط Enter لإنشاء فقرة جديدة.

>.[q]:: "البرمجة ليست عن ما تعرفه، بل عن ما يمكنك اكتشافه."

>.[hr]::

>.[p]:: جرب المحرر الآن!`;

/**
 * Initialize the application
 */
function init() {
  // Get DOM elements
  const editorContainer = document.getElementById('editor');
  const sourcePanel = document.getElementById('source');
  const sourceCode = document.getElementById('source-code');
  const btnSource = document.getElementById('btn-source');
  const btnTheme = document.getElementById('btn-theme');
  const btnExport = document.getElementById('btn-export');
  const blockCount = document.getElementById('block-count');
  
  // Create core instances
  const controller = createEditorController({
    defaultDirection: 'rtl',
  });
  
  const importer = createARTOONImporter({
    defaultDirection: 'rtl',
  });
  
  const exporter = createARTOONExporter();
  
  // Load initial content
  const initialBlocks = importer.import(SAMPLE_CONTENT);
  initialBlocks.forEach(block => controller.addBlock(block));
  
  // Create editor view
  const editorView = new EditorView(editorContainer, {
    controller,
    importer,
    exporter,
    onChange: () => updateSource(),
  });
  
  editorView.init();
  
  // Update source panel
  function updateSource() {
    const source = editorView.getSource();
    if (sourceCode) {
      sourceCode.textContent = source;
    }
    if (blockCount) {
      blockCount.textContent = `${controller.getBlocks().length} بلوك`;
    }
  }
  
  // Initial source update
  updateSource();
  
  // Toggle source panel
  if (btnSource) {
    btnSource.addEventListener('click', () => {
      sourcePanel.classList.toggle('source-panel--visible');
      document.querySelector('.editor-wrapper').classList.toggle('editor-wrapper--with-source');
      btnSource.textContent = sourcePanel.classList.contains('source-panel--visible') 
        ? 'إخفاء المصدر' 
        : 'عرض المصدر';
      updateSource();
    });
  }
  
  // Toggle theme
  let isDark = false;
  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      isDark = !isDark;
      document.body.dataset.theme = isDark ? 'dark' : 'light';
      btnTheme.textContent = isDark ? '☀️' : '🌙';
    });
  }
  
  // Export
  if (btnExport) {
    btnExport.addEventListener('click', () => {
      const source = editorView.getSource();
      const blob = new Blob([source], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'document.artoon';
      a.click();
      URL.revokeObjectURL(url);
    });
  }
  
  // Make editor available globally for debugging
  window.artoonEditor = {
    controller,
    importer,
    exporter,
    editorView,
    getSource: () => editorView.getSource(),
    loadContent: (content) => editorView.loadContent(content),
  };
  
  console.log('ARTOON Editor initialized!');
  console.log('Access via window.artoonEditor');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
