/**
 * CodeBlockView
 * 
 * View for code blocks with syntax highlighting support.
 */

import type { CodeBlock, BlockEvent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';

/**
 * Code block view options
 */
export interface CodeBlockViewOptions extends BlockViewOptions {
  block: CodeBlock;
  /** On code change */
  onCodeChange?: (code: string) => void;
  /** On language change */
  onLanguageChange?: (language: string) => void;
  /** Available languages */
  languages?: string[];
}

/**
 * Default supported languages
 */
const DEFAULT_LANGUAGES = [
  'javascript', 'typescript', 'python', 'java', 'c', 'cpp', 'csharp',
  'go', 'rust', 'ruby', 'php', 'swift', 'kotlin', 'html', 'css',
  'json', 'yaml', 'xml', 'sql', 'bash', 'markdown', 'plaintext',
];

/**
 * CodeBlockView - handles code blocks
 */
export class CodeBlockView extends BaseBlockView {
  protected block: CodeBlock;
  protected options: CodeBlockViewOptions;
  protected codeElement: HTMLTextAreaElement | null = null;
  protected languageSelect: HTMLSelectElement | null = null;
  protected lineNumbers: HTMLElement | null = null;
  
  constructor(options: CodeBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;
  }
  
  /**
   * Get the code
   */
  getCode(): string {
    return this.block.code;
  }
  
  /**
   * Get the language
   */
  getLanguage(): string {
    return this.block.language;
  }
  
  /**
   * Get line count
   */
  getLineCount(): number {
    return this.block.code.split('\n').length;
  }
  
  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    this.element.classList.add('artoon-code-block');
    
    // Header with language selector
    const header = this.createHeader();
    this.element.appendChild(header);
    
    // Code container
    const codeContainer = document.createElement('div');
    codeContainer.className = 'artoon-code-block__container';
    
    // Line numbers
    if (this.block.showLineNumbers !== false) {
      this.lineNumbers = this.createLineNumbers();
      codeContainer.appendChild(this.lineNumbers);
    }
    
    // Code textarea
    this.codeElement = this.createCodeElement();
    codeContainer.appendChild(this.codeElement);
    
    this.element.appendChild(codeContainer);
    
    // Apply styles
    this.applyStyles(this.element);
    
    return this.element;
  }
  
  /**
   * Create header with language selector
   */
  private createHeader(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'artoon-code-block__header';
    
    // Language selector
    this.languageSelect = document.createElement('select');
    this.languageSelect.className = 'artoon-code-block__language';
    
    const languages = this.options.languages || DEFAULT_LANGUAGES;
    for (const lang of languages) {
      const option = document.createElement('option');
      option.value = lang;
      option.textContent = lang;
      if (lang === this.block.language) {
        option.selected = true;
      }
      this.languageSelect.appendChild(option);
    }
    
    if (!this.options.readOnly) {
      this.languageSelect.addEventListener('change', this.handleLanguageChange.bind(this));
    } else {
      this.languageSelect.disabled = true;
    }
    
    header.appendChild(this.languageSelect);
    
    // Copy button
    const copyBtn = document.createElement('button');
    copyBtn.className = 'artoon-code-block__copy';
    copyBtn.textContent = 'نسخ';
    copyBtn.addEventListener('click', this.handleCopy.bind(this));
    header.appendChild(copyBtn);
    
    return header;
  }
  
  /**
   * Create line numbers element
   */
  private createLineNumbers(): HTMLElement {
    const lineNumbers = document.createElement('div');
    lineNumbers.className = 'artoon-code-block__line-numbers';
    this.updateLineNumbers(lineNumbers);
    return lineNumbers;
  }
  
  /**
   * Update line numbers
   */
  private updateLineNumbers(element?: HTMLElement): void {
    const el = element || this.lineNumbers;
    if (!el) return;
    
    const lineCount = this.getLineCount();
    const numbers = Array.from({ length: lineCount }, (_, i) => i + 1);
    el.innerHTML = numbers.map(n => `<span>${n}</span>`).join('\n');
  }
  
  /**
   * Create code textarea
   */
  private createCodeElement(): HTMLTextAreaElement {
    const textarea = document.createElement('textarea');
    textarea.className = 'artoon-code-block__code';
    textarea.value = this.block.code;
    textarea.spellcheck = false;
    textarea.wrap = 'off';
    
    if (this.options.readOnly) {
      textarea.readOnly = true;
    } else {
      textarea.addEventListener('input', this.handleCodeChange.bind(this));
      textarea.addEventListener('keydown', this.handleKeyDown.bind(this));
      textarea.addEventListener('scroll', this.handleScroll.bind(this));
    }
    
    return textarea;
  }
  
  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName() + ' artoon-code-block';
      this.element.dir = this.block.direction;
    }
    
    if (this.codeElement) {
      this.codeElement.value = this.block.code;
    }
    
    if (this.languageSelect) {
      this.languageSelect.value = this.block.language;
    }
    
    this.updateLineNumbers();
  }
  
  /**
   * Handle code change
   */
  private handleCodeChange(): void {
    if (!this.codeElement) return;
    
    const newCode = this.codeElement.value;
    
    if (this.options.onCodeChange) {
      this.options.onCodeChange(newCode);
    }
    
    // Update line numbers
    this.block = { ...this.block, code: newCode };
    this.updateLineNumbers();
    
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: this.block,
    });
  }
  
  /**
   * Handle language change
   */
  private handleLanguageChange(): void {
    if (!this.languageSelect) return;
    
    const newLanguage = this.languageSelect.value;
    
    if (this.options.onLanguageChange) {
      this.options.onLanguageChange(newLanguage);
    }
    
    this.block = { ...this.block, language: newLanguage };
    
    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: this.block,
    });
  }
  
  /**
   * Handle keydown for tab support
   */
  private handleKeyDown(e: KeyboardEvent): void {
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const textarea = this.codeElement!;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      
      // Insert tab (2 spaces)
      const tab = '  ';
      textarea.value = textarea.value.substring(0, start) + tab + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + tab.length;
      
      this.handleCodeChange();
    }
  }
  
  /**
   * Handle scroll to sync line numbers
   */
  private handleScroll(): void {
    if (this.lineNumbers && this.codeElement) {
      this.lineNumbers.scrollTop = this.codeElement.scrollTop;
    }
  }
  
  /**
   * Handle copy button
   */
  private handleCopy(): void {
    if (navigator.clipboard && this.block.code) {
      navigator.clipboard.writeText(this.block.code);
    }
  }
  
  /**
   * Set code
   */
  setCode(code: string): void {
    this.block = { ...this.block, code };
    if (this.codeElement) {
      this.codeElement.value = code;
    }
    this.updateLineNumbers();
  }
  
  /**
   * Set language
   */
  setLanguage(language: string): void {
    this.block = { ...this.block, language };
    if (this.languageSelect) {
      this.languageSelect.value = language;
    }
  }
  
  /**
   * Focus the code element
   */
  protected onFocus(): void {
    if (this.codeElement) {
      this.codeElement.focus();
    }
  }
  
  /**
   * Focus at start
   */
  focusAtStart(): void {
    this.focus();
    if (this.codeElement) {
      this.codeElement.selectionStart = 0;
      this.codeElement.selectionEnd = 0;
    }
  }
  
  /**
   * Focus at end
   */
  focusAtEnd(): void {
    this.focus();
    if (this.codeElement) {
      const len = this.codeElement.value.length;
      this.codeElement.selectionStart = len;
      this.codeElement.selectionEnd = len;
    }
  }
}

/**
 * Create a code block view
 */
export function createCodeBlockView(options: CodeBlockViewOptions): CodeBlockView {
  return new CodeBlockView(options);
}
