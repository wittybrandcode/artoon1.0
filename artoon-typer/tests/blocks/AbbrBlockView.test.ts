/**
 * AbbrBlockView Tests
 */

import { AbbrBlockView, createAbbrBlockView } from '../../src/blocks/views/AbbrBlockView';
import type { AbbrBlock } from '../../src/types';

describe('AbbrBlockView', () => {
  const createBlock = (overrides?: Partial<AbbrBlock>): AbbrBlock => ({
    id: 'test-abbr-1',
    type: 'abbr-block',
    direction: 'rtl',
    abbr: 'HTML',
    title: 'HyperText Markup Language',
    ...overrides,
  });
  
  describe('render', () => {
    test('renders abbr block', () => {
      const block = createBlock();
      const view = createAbbrBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.querySelector('abbr')).toBeTruthy();
    });
    
    test('displays abbreviation text', () => {
      const block = createBlock({ abbr: 'API' });
      const view = createAbbrBlockView({ block });
      const element = view.render();
      
      const abbr = element.querySelector('abbr');
      expect(abbr?.textContent).toBe('API');
    });
    
    test('sets title attribute', () => {
      const block = createBlock({ 
        abbr: 'API',
        title: 'Application Programming Interface'
      });
      const view = createAbbrBlockView({ block });
      const element = view.render();
      
      const abbr = element.querySelector('abbr');
      expect(abbr?.title).toBe('Application Programming Interface');
    });
    
    test('applies correct CSS classes', () => {
      const block = createBlock();
      const view = createAbbrBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
      expect(element.classList.contains('artoon-block--abbr-block')).toBe(true);
    });
  });
  
  describe('editing', () => {
    test('makes abbr editable when not readonly', () => {
      const block = createBlock();
      const view = createAbbrBlockView({ block, readOnly: false });
      const element = view.render();
      
      const abbr = element.querySelector('abbr');
      expect(abbr?.contentEditable).toBe('true');
    });
    
    test('shows title input when not readonly', () => {
      const block = createBlock();
      const view = createAbbrBlockView({ block, readOnly: false });
      const element = view.render();
      
      const input = element.querySelector('.artoon-abbr-title-input');
      expect(input).toBeTruthy();
    });
    
    test('hides title input in readonly mode', () => {
      const block = createBlock();
      const view = createAbbrBlockView({ block, readOnly: true });
      const element = view.render();
      
      const input = element.querySelector('.artoon-abbr-title-input');
      expect(input).toBeFalsy();
    });
  });
  
  describe('getters', () => {
    test('getAbbr returns abbreviation', () => {
      const block = createBlock({ abbr: 'CSS' });
      const view = createAbbrBlockView({ block });
      view.render();
      
      expect(view.getAbbr()).toBe('CSS');
    });
    
    test('getTitle returns title', () => {
      const block = createBlock({ title: 'Cascading Style Sheets' });
      const view = createAbbrBlockView({ block });
      view.render();
      
      expect(view.getTitle()).toBe('Cascading Style Sheets');
    });
  });
  
  describe('Arabic support', () => {
    test('handles RTL abbreviations', () => {
      const block = createBlock({ 
        abbr: 'ج.م.ع',
        title: 'جمهورية مصر العربية',
        direction: 'rtl'
      });
      const view = createAbbrBlockView({ block });
      const element = view.render();
      
      const abbr = element.querySelector('abbr');
      expect(abbr?.textContent).toBe('ج.م.ع');
      expect(abbr?.title).toBe('جمهورية مصر العربية');
    });
  });
});
