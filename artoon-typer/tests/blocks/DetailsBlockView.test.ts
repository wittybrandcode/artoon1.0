/**
 * DetailsBlockView Tests
 */

import { DetailsBlockView, createDetailsBlockView } from '../../src/blocks/views/DetailsBlockView';
import type { DetailsBlock, Block } from '../../src/types';

describe('DetailsBlockView', () => {
  const createBlock = (overrides?: Partial<DetailsBlock>): DetailsBlock => ({
    id: 'test-details-1',
    type: 'details',
    direction: 'rtl',
    summary: [{ type: 'plain', value: 'انقر للتوسيع' }],
    content: [],
    isOpen: false,
    ...overrides,
  });
  
  describe('render', () => {
    test('renders details block', () => {
      const block = createBlock();
      const view = createDetailsBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.querySelector('details')).toBeTruthy();
    });
    
    test('renders summary element', () => {
      const block = createBlock();
      const view = createDetailsBlockView({ block });
      const element = view.render();
      
      const summary = element.querySelector('summary');
      expect(summary).toBeTruthy();
      expect(summary?.textContent).toContain('انقر للتوسيع');
    });
    
    test('applies correct CSS classes', () => {
      const block = createBlock();
      const view = createDetailsBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
      expect(element.classList.contains('artoon-block--details')).toBe(true);
    });
    
    test('respects isOpen state', () => {
      const block = createBlock({ isOpen: true });
      const view = createDetailsBlockView({ block });
      const element = view.render();
      
      const details = element.querySelector('details') as HTMLDetailsElement;
      expect(details?.open).toBe(true);
    });
    
    test('closed by default', () => {
      const block = createBlock({ isOpen: false });
      const view = createDetailsBlockView({ block });
      const element = view.render();
      
      const details = element.querySelector('details') as HTMLDetailsElement;
      expect(details?.open).toBe(false);
    });
  });
  
  describe('editing', () => {
    test('makes summary editable when not readonly', () => {
      const block = createBlock();
      const view = createDetailsBlockView({ block, readOnly: false });
      const element = view.render();
      
      const summary = element.querySelector('summary');
      expect(summary?.contentEditable).toBe('true');
    });
    
    test('summary not editable in readonly mode', () => {
      const block = createBlock();
      const view = createDetailsBlockView({ block, readOnly: true });
      const element = view.render();
      
      const summary = element.querySelector('summary');
      expect(summary?.contentEditable).not.toBe('true');
    });
  });
  
  describe('toggle', () => {
    test('isOpen returns current state', () => {
      const block = createBlock({ isOpen: true });
      const view = createDetailsBlockView({ block });
      view.render();
      
      expect(view.isOpen()).toBe(true);
    });
    
    test('toggle changes state', () => {
      const block = createBlock({ isOpen: false });
      let updatedOpen: boolean | undefined;
      
      const view = createDetailsBlockView({ 
        block,
        onBlockChange: (updates) => { updatedOpen = updates.isOpen; }
      });
      view.render();
      view.toggle();
      
      expect(updatedOpen).toBe(true);
    });
  });
  
  describe('nested content', () => {
    test('renders content container', () => {
      const block = createBlock();
      const view = createDetailsBlockView({ block });
      const element = view.render();
      
      const content = element.querySelector('.artoon-details-content');
      expect(content).toBeTruthy();
    });
    
    test('shows placeholder when empty and editable', () => {
      const block = createBlock({ content: [] });
      const view = createDetailsBlockView({ block, readOnly: false });
      const element = view.render();
      
      const placeholder = element.querySelector('.artoon-details-placeholder');
      expect(placeholder).toBeTruthy();
    });
  });
});
