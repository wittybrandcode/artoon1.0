/**
 * CodeBlockView Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { CodeBlockView, createCodeBlockView } from '../../src/blocks/views/CodeBlockView';
import type { CodeBlock } from '../../src/types';

// Helper to create a test block
function createTestBlock(code: string = '', language: string = 'javascript'): CodeBlock {
  return {
    id: 'test-code-1',
    type: 'code',
    direction: 'ltr',
    code,
    language,
  };
}

describe('CodeBlockView', () => {
  let view: CodeBlockView;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    container.remove();
  });

  describe('creation', () => {
    it('should create a view', () => {
      const block = createTestBlock('const x = 1;');
      view = createCodeBlockView({ block });
      
      expect(view).toBeInstanceOf(CodeBlockView);
      expect(view.id).toBe('test-code-1');
    });

    it('should render element', () => {
      const block = createTestBlock('const x = 1;');
      view = createCodeBlockView({ block });
      
      const element = view.render();
      
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.classList.contains('artoon-code-block')).toBe(true);
    });

    it('should render code', () => {
      const block = createTestBlock('const x = 1;');
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const textarea = element.querySelector('textarea');
      
      expect(textarea?.value).toBe('const x = 1;');
    });
  });

  describe('getCode', () => {
    it('should return code', () => {
      const block = createTestBlock('function test() {}');
      view = createCodeBlockView({ block });
      
      expect(view.getCode()).toBe('function test() {}');
    });
  });

  describe('getLanguage', () => {
    it('should return language', () => {
      const block = createTestBlock('', 'python');
      view = createCodeBlockView({ block });
      
      expect(view.getLanguage()).toBe('python');
    });
  });

  describe('getLineCount', () => {
    it('should count lines', () => {
      const block = createTestBlock('line1\nline2\nline3');
      view = createCodeBlockView({ block });
      
      expect(view.getLineCount()).toBe(3);
    });

    it('should return 1 for empty code', () => {
      const block = createTestBlock('');
      view = createCodeBlockView({ block });
      
      expect(view.getLineCount()).toBe(1);
    });
  });

  describe('language selector', () => {
    it('should render language selector', () => {
      const block = createTestBlock('', 'javascript');
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const select = element.querySelector('select');
      
      expect(select).not.toBeNull();
      expect(select?.value).toBe('javascript');
    });

    it('should include default languages', () => {
      const block = createTestBlock();
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const options = element.querySelectorAll('option');
      
      expect(options.length).toBeGreaterThan(10);
    });

    it('should use custom languages', () => {
      const block = createTestBlock('', 'custom');
      view = createCodeBlockView({ 
        block, 
        languages: ['custom', 'other'] 
      });
      
      const element = view.render();
      const options = element.querySelectorAll('option');
      
      expect(options).toHaveLength(2);
    });

    it('should be disabled when readOnly', () => {
      const block = createTestBlock();
      view = createCodeBlockView({ block, readOnly: true });
      
      const element = view.render();
      const select = element.querySelector('select') as HTMLSelectElement;
      
      expect(select?.disabled).toBe(true);
    });
  });

  describe('line numbers', () => {
    it('should render line numbers', () => {
      const block = createTestBlock('line1\nline2\nline3');
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const lineNumbers = element.querySelector('.artoon-code-block__line-numbers');
      
      expect(lineNumbers).not.toBeNull();
      expect(lineNumbers?.querySelectorAll('span')).toHaveLength(3);
    });

    it('should hide line numbers when disabled', () => {
      const block: CodeBlock = {
        ...createTestBlock('code'),
        showLineNumbers: false,
      };
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const lineNumbers = element.querySelector('.artoon-code-block__line-numbers');
      
      expect(lineNumbers).toBeNull();
    });
  });

  describe('copy button', () => {
    it('should render copy button', () => {
      const block = createTestBlock('code');
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const copyBtn = element.querySelector('.artoon-code-block__copy');
      
      expect(copyBtn).not.toBeNull();
    });
  });

  describe('setCode', () => {
    it('should update code', () => {
      const block = createTestBlock('old');
      view = createCodeBlockView({ block });
      view.render();
      
      view.setCode('new');
      
      expect(view.getCode()).toBe('new');
    });
  });

  describe('setLanguage', () => {
    it('should update language', () => {
      const block = createTestBlock('', 'javascript');
      view = createCodeBlockView({ block });
      view.render();
      
      view.setLanguage('python');
      
      expect(view.getLanguage()).toBe('python');
    });
  });

  describe('events', () => {
    it('should call onCodeChange on input', () => {
      const onCodeChange = vi.fn();
      const block = createTestBlock('old');
      view = createCodeBlockView({ block, onCodeChange });
      const element = view.render();
      container.appendChild(element);
      
      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'new';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      
      expect(onCodeChange).toHaveBeenCalledWith('new');
    });

    it('should call onLanguageChange on select change', () => {
      const onLanguageChange = vi.fn();
      const block = createTestBlock('', 'javascript');
      view = createCodeBlockView({ block, onLanguageChange });
      const element = view.render();
      container.appendChild(element);
      
      const select = element.querySelector('select') as HTMLSelectElement;
      select.value = 'python';
      select.dispatchEvent(new Event('change', { bubbles: true }));
      
      expect(onLanguageChange).toHaveBeenCalledWith('python');
    });
  });

  describe('readonly', () => {
    it('should make textarea readonly', () => {
      const block = createTestBlock('code');
      view = createCodeBlockView({ block, readOnly: true });
      
      const element = view.render();
      const textarea = element.querySelector('textarea') as HTMLTextAreaElement;
      
      expect(textarea?.readOnly).toBe(true);
    });
  });

  describe('update', () => {
    it('should update code and language', () => {
      const block = createTestBlock('old', 'javascript');
      view = createCodeBlockView({ block });
      view.render();
      
      const newBlock: CodeBlock = {
        ...block,
        code: 'new',
        language: 'python',
      };
      view.update(newBlock);
      
      expect(view.getCode()).toBe('new');
      expect(view.getLanguage()).toBe('python');
    });
  });

  describe('CSS classes', () => {
    it('should have code block class', () => {
      const block = createTestBlock();
      view = createCodeBlockView({ block });
      
      const element = view.render();
      
      expect(element.classList.contains('artoon-code-block')).toBe(true);
    });

    it('should have header class', () => {
      const block = createTestBlock();
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const header = element.querySelector('.artoon-code-block__header');
      
      expect(header).not.toBeNull();
    });

    it('should have container class', () => {
      const block = createTestBlock();
      view = createCodeBlockView({ block });
      
      const element = view.render();
      const container = element.querySelector('.artoon-code-block__container');
      
      expect(container).not.toBeNull();
    });
  });
});
