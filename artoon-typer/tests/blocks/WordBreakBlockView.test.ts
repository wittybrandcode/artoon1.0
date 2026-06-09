/**
 * WordBreakBlockView Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { WordBreakBlockView, createWordBreakBlockView } from '../../src/blocks/views/WordBreakBlockView';
import type { WordBreakBlock } from '../../src/types';

describe('WordBreakBlockView', () => {
  let block: WordBreakBlock;
  
  beforeEach(() => {
    block = {
      id: 'wbr-1',
      type: 'word-break',
      direction: 'rtl',
    };
  });
  
  describe('creation', () => {
    it('should create view with block', () => {
      const view = new WordBreakBlockView({ block });
      expect(view).toBeDefined();
    });
    
    it('should create view using factory function', () => {
      const view = createWordBreakBlockView({ block });
      expect(view).toBeDefined();
    });
  });
  
  describe('render', () => {
    it('should render word break block', () => {
      const view = new WordBreakBlockView({ block });
      const element = view.render();
      
      expect(element).toBeDefined();
      expect(element.tagName).toBe('DIV');
      expect(element.classList.contains('artoon-block')).toBe(true);
    });
    
    it('should render with wbr class', () => {
      const view = new WordBreakBlockView({ block });
      const element = view.render();
      
      const content = element.querySelector('.artoon-block__wbr');
      expect(content).toBeDefined();
    });
    
    it('should render visual indicator', () => {
      const view = new WordBreakBlockView({ block });
      const element = view.render();
      
      const indicator = element.querySelector('.artoon-wbr-indicator');
      expect(indicator).toBeDefined();
      expect(indicator?.textContent).toBe('⎵');
    });
    
    it('should render actual wbr element', () => {
      const view = new WordBreakBlockView({ block });
      const element = view.render();
      
      const wbr = element.querySelector('wbr');
      expect(wbr).toBeDefined();
    });
    
    it('should have correct direction', () => {
      const view = new WordBreakBlockView({ block });
      const element = view.render();
      
      expect(element.dir).toBe('rtl');
    });
    
    it('should handle LTR direction', () => {
      const ltrBlock = { ...block, direction: 'ltr' as const };
      const view = new WordBreakBlockView({ block: ltrBlock });
      const element = view.render();
      
      expect(element.dir).toBe('ltr');
    });
  });
});
