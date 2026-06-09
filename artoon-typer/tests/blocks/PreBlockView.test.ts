/**
 * PreBlockView Tests
 */

import { PreBlockView, createPreBlockView } from '../../src/blocks/views/PreBlockView';
import type { PreformattedBlock } from '../../src/types';

describe('PreBlockView', () => {
  const createBlock = (content: string = ''): PreformattedBlock => ({
    id: 'test-pre-1',
    type: 'preformatted',
    direction: 'rtl',
    content,
  });
  
  describe('render', () => {
    test('renders preformatted text block', () => {
      const block = createBlock('text    with    spaces');
      const view = createPreBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.querySelector('pre')).toBeTruthy();
    });
    
    test('preserves whitespace in content', () => {
      const content = 'text    with    spaces\n  and  newlines';
      const block = createBlock(content);
      const view = createPreBlockView({ block });
      const element = view.render();
      
      const pre = element.querySelector('pre');
      expect(pre?.textContent).toBe(content);
    });
    
    test('applies correct CSS classes', () => {
      const block = createBlock('test');
      const view = createPreBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
      expect(element.classList.contains('artoon-block--preformatted')).toBe(true);
    });
    
    test('sets direction attribute', () => {
      const block = createBlock('test');
      block.direction = 'ltr';
      const view = createPreBlockView({ block });
      const element = view.render();
      
      expect(element.dir).toBe('ltr');
    });
    
    test('makes content editable when not readonly', () => {
      const block = createBlock('test');
      const view = createPreBlockView({ block, readOnly: false });
      const element = view.render();
      
      const pre = element.querySelector('pre');
      expect(pre?.contentEditable).toBe('true');
    });
    
    test('disables editing in readonly mode', () => {
      const block = createBlock('test');
      const view = createPreBlockView({ block, readOnly: true });
      const element = view.render();
      
      const pre = element.querySelector('pre');
      expect(pre?.contentEditable).not.toBe('true');
    });
  });
  
  describe('content handling', () => {
    test('getContent returns block content', () => {
      const content = 'test content';
      const block = createBlock(content);
      const view = createPreBlockView({ block });
      view.render();
      
      expect(view.getContent()).toBe(content);
    });
    
    test('handles empty content', () => {
      const block = createBlock('');
      const view = createPreBlockView({ block });
      const element = view.render();
      
      const pre = element.querySelector('pre');
      expect(pre?.textContent).toBe('');
    });
  });
});
