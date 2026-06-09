/**
 * TextBlockView Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TextBlockView, createTextBlockView } from '../../src/blocks/views/TextBlockView';
import type { TextBlock, InlineContent } from '../../src/types';

// Helper to create a test block
function createTestBlock(content: InlineContent[] = []): TextBlock {
  return {
    id: 'test-block-1',
    type: 'paragraph',
    direction: 'rtl',
    content,
  };
}

describe('TextBlockView', () => {
  let view: TextBlockView;
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
      const block = createTestBlock();
      view = createTextBlockView({ block });
      
      expect(view).toBeInstanceOf(TextBlockView);
      expect(view.id).toBe('test-block-1');
      expect(view.type).toBe('paragraph');
    });

    it('should render element', () => {
      const block = createTestBlock([{ type: 'plain', value: 'مرحبا' }]);
      view = createTextBlockView({ block });
      
      const element = view.render();
      
      expect(element).toBeInstanceOf(HTMLElement);
      expect(element.getAttribute('data-block-id')).toBe('test-block-1');
      expect(element.getAttribute('data-block-type')).toBe('paragraph');
    });

    it('should set direction', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      
      const element = view.render();
      
      expect(element.dir).toBe('rtl');
    });

    it('should render content', () => {
      const block = createTestBlock([{ type: 'plain', value: 'مرحبا عالم' }]);
      view = createTextBlockView({ block });
      
      const element = view.render();
      
      expect(element.textContent).toContain('مرحبا عالم');
    });
  });

  describe('block types', () => {
    it('should render paragraph with p tag', () => {
      const block: TextBlock = { ...createTestBlock(), type: 'paragraph' };
      view = createTextBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.tagName).toBe('P');
    });

    it('should render heading1 with h1 tag', () => {
      const block: TextBlock = { ...createTestBlock(), type: 'heading1' };
      view = createTextBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.tagName).toBe('H1');
    });

    it('should render heading2 with h2 tag', () => {
      const block: TextBlock = { ...createTestBlock(), type: 'heading2' };
      view = createTextBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.tagName).toBe('H2');
    });

    it('should render quote with blockquote tag', () => {
      const block: TextBlock = { ...createTestBlock(), type: 'quote' };
      view = createTextBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.tagName).toBe('BLOCKQUOTE');
    });
  });

  describe('contenteditable', () => {
    it('should be editable by default', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content') as HTMLElement;
      
      // jsdom returns 'inherit' for contentEditable property, check the attribute
      expect(content?.isContentEditable || content?.contentEditable === 'true').toBe(true);
    });

    it('should not be editable when readOnly', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block, readOnly: true });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.getAttribute('contenteditable')).toBeNull();
    });
  });

  describe('placeholder', () => {
    it('should set placeholder attribute', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block, placeholder: 'اكتب هنا...' });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.getAttribute('data-placeholder')).toBe('اكتب هنا...');
    });

    it('should add empty class when no content', () => {
      const block = createTestBlock([]);
      view = createTextBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.classList.contains('artoon-block__content--empty')).toBe(true);
    });

    it('should not have empty class when has content', () => {
      const block = createTestBlock([{ type: 'plain', value: 'نص' }]);
      view = createTextBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-block__content');
      
      expect(content?.classList.contains('artoon-block__content--empty')).toBe(false);
    });
  });

  describe('inline formatting', () => {
    it('should render bold text', () => {
      const block = createTestBlock([
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
      ]);
      view = createTextBlockView({ block });
      
      const element = view.render();
      
      expect(element.innerHTML).toContain('<strong>عريض</strong>');
    });

    it('should render italic text', () => {
      const block = createTestBlock([
        { type: 'inline', modifiers: ['e'], attributes: {}, value: 'مائل' },
      ]);
      view = createTextBlockView({ block });
      
      const element = view.render();
      
      expect(element.innerHTML).toContain('<em>مائل</em>');
    });

    it('should render mixed content', () => {
      const block = createTestBlock([
        { type: 'plain', value: 'نص ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'عريض' },
        { type: 'plain', value: ' ونص' },
      ]);
      view = createTextBlockView({ block });
      
      const element = view.render();
      
      expect(element.textContent).toContain('نص عريض ونص');
    });
  });

  describe('getContent', () => {
    it('should return content', () => {
      const content: InlineContent[] = [{ type: 'plain', value: 'مرحبا' }];
      const block = createTestBlock(content);
      view = createTextBlockView({ block });
      
      expect(view.getContent()).toEqual(content);
    });
  });

  describe('getPlainText', () => {
    it('should return plain text', () => {
      const block = createTestBlock([
        { type: 'plain', value: 'أ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'ب' },
      ]);
      view = createTextBlockView({ block });
      
      expect(view.getPlainText()).toBe('أب');
    });
  });

  describe('getLength', () => {
    it('should return content length', () => {
      const block = createTestBlock([{ type: 'plain', value: 'مرحبا' }]);
      view = createTextBlockView({ block });
      
      expect(view.getLength()).toBe(5);
    });
  });

  describe('update', () => {
    it('should update content', () => {
      const block = createTestBlock([{ type: 'plain', value: 'قديم' }]);
      view = createTextBlockView({ block });
      view.render();
      
      const newBlock: TextBlock = {
        ...block,
        content: [{ type: 'plain', value: 'جديد' }],
      };
      view.update(newBlock);
      
      expect(view.getPlainText()).toBe('جديد');
    });

    it('should update direction', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      const element = view.render();
      
      const newBlock: TextBlock = { ...block, direction: 'ltr' };
      view.update(newBlock);
      
      expect(element.dir).toBe('ltr');
    });
  });

  describe('focus', () => {
    it('should add focused class', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      const element = view.render();
      
      view.focus();
      
      expect(element.classList.contains('artoon-block--focused')).toBe(true);
    });

    it('should remove focused class on blur', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      const element = view.render();
      
      view.focus();
      view.blur();
      
      expect(element.classList.contains('artoon-block--focused')).toBe(false);
    });
  });

  describe('events', () => {
    it('should call onContentChange on input', async () => {
      const onContentChange = vi.fn();
      const block = createTestBlock([{ type: 'plain', value: 'نص' }]);
      view = createTextBlockView({ block, onContentChange });
      const element = view.render();
      container.appendChild(element);
      
      const content = element.querySelector('.artoon-block__content') as HTMLElement;
      content.innerHTML = 'نص جديد';
      content.dispatchEvent(new Event('input', { bubbles: true }));
      
      expect(onContentChange).toHaveBeenCalled();
    });

    it('should emit focus event', () => {
      const onEvent = vi.fn();
      const block = createTestBlock();
      view = createTextBlockView({ block, onEvent });
      const element = view.render();
      container.appendChild(element);
      
      const content = element.querySelector('.artoon-block__content') as HTMLElement;
      content.dispatchEvent(new FocusEvent('focus'));
      
      expect(onEvent).toHaveBeenCalledWith(expect.objectContaining({
        type: 'focus',
        blockId: 'test-block-1',
      }));
    });
  });

  describe('CSS classes', () => {
    it('should have base class', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
    });

    it('should have type class', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block--paragraph')).toBe(true);
    });

    it('should have direction class', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block--rtl')).toBe(true);
    });

    it('should have readonly class when readonly', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block, readOnly: true });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block--readonly')).toBe(true);
    });

    it('should include custom className', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block, className: 'my-custom-class' });
      const element = view.render();
      
      expect(element.classList.contains('my-custom-class')).toBe(true);
    });
  });

  describe('meta styles', () => {
    it('should apply custom styles', () => {
      const block: TextBlock = {
        ...createTestBlock(),
        meta: { style: { color: 'red' } },
      };
      view = createTextBlockView({ block });
      const element = view.render();
      
      expect(element.style.color).toBe('red');
    });

    it('should apply data attributes', () => {
      const block: TextBlock = {
        ...createTestBlock(),
        meta: { data: { custom: 'value' } },
      };
      view = createTextBlockView({ block });
      const element = view.render();
      
      expect(element.getAttribute('data-custom')).toBe('value');
    });
  });

  describe('destroy', () => {
    it('should remove element', () => {
      const block = createTestBlock();
      view = createTextBlockView({ block });
      const element = view.render();
      container.appendChild(element);
      
      expect(container.contains(element)).toBe(true);
      
      view.destroy();
      
      expect(container.contains(element)).toBe(false);
    });
  });
});
