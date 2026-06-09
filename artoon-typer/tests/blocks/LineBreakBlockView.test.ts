/**
 * LineBreakBlockView Tests
 */

import { LineBreakBlockView, createLineBreakBlockView } from '../../src/blocks/views/LineBreakBlockView';
import type { LineBreakBlock } from '../../src/types';

describe('LineBreakBlockView', () => {
  const createBlock = (): LineBreakBlock => ({
    id: 'test-br-1',
    type: 'line-break',
    direction: 'rtl',
  });
  
  describe('render', () => {
    test('renders line break block', () => {
      const block = createBlock();
      const view = createLineBreakBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.querySelector('hr')).toBeTruthy();
    });
    
    test('applies correct CSS classes', () => {
      const block = createBlock();
      const view = createLineBreakBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
      expect(element.classList.contains('artoon-block--line-break')).toBe(true);
    });
    
    test('hr element has correct class', () => {
      const block = createBlock();
      const view = createLineBreakBlockView({ block });
      const element = view.render();
      
      const hr = element.querySelector('hr');
      expect(hr?.classList.contains('artoon-line-break')).toBe(true);
    });
  });
  
  describe('properties', () => {
    test('id returns block id', () => {
      const block = createBlock();
      const view = createLineBreakBlockView({ block });
      
      expect(view.id).toBe('test-br-1');
    });
    
    test('type returns line-break', () => {
      const block = createBlock();
      const view = createLineBreakBlockView({ block });
      
      expect(view.type).toBe('line-break');
    });
    
    test('direction returns block direction', () => {
      const block = createBlock();
      block.direction = 'ltr';
      const view = createLineBreakBlockView({ block });
      
      expect(view.direction).toBe('ltr');
    });
  });
});
