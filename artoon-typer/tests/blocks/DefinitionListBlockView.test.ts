/**
 * DefinitionListBlockView Tests
 */

import { DefinitionListBlockView, createDefinitionListBlockView } from '../../src/blocks/views/DefinitionListBlockView';
import type { DefinitionListBlock, DefinitionItem } from '../../src/types';

describe('DefinitionListBlockView', () => {
  const createItem = (term: string, definition: string): DefinitionItem => ({
    id: `item-${Math.random().toString(36).substr(2, 9)}`,
    term: [{ type: 'plain', value: term }],
    definition: [{ type: 'plain', value: definition }],
  });
  
  const createBlock = (items?: DefinitionItem[]): DefinitionListBlock => ({
    id: 'test-dl-1',
    type: 'definition-list',
    direction: 'rtl',
    items: items || [createItem('مصطلح', 'تعريف')],
  });
  
  describe('render', () => {
    test('renders definition list block', () => {
      const block = createBlock();
      const view = createDefinitionListBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.querySelector('dl')).toBeTruthy();
    });
    
    test('renders dt and dd elements', () => {
      const block = createBlock([createItem('ARTOON', 'صيغة محتوى')]);
      const view = createDefinitionListBlockView({ block });
      const element = view.render();
      
      expect(element.querySelector('dt')).toBeTruthy();
      expect(element.querySelector('dd')).toBeTruthy();
    });
    
    test('renders multiple items', () => {
      const items = [
        createItem('مصطلح 1', 'تعريف 1'),
        createItem('مصطلح 2', 'تعريف 2'),
        createItem('مصطلح 3', 'تعريف 3'),
      ];
      const block = createBlock(items);
      const view = createDefinitionListBlockView({ block });
      const element = view.render();
      
      const dtElements = element.querySelectorAll('dt');
      const ddElements = element.querySelectorAll('dd');
      
      expect(dtElements.length).toBe(3);
      expect(ddElements.length).toBe(3);
    });
    
    test('applies correct CSS classes', () => {
      const block = createBlock();
      const view = createDefinitionListBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
      expect(element.classList.contains('artoon-block--definition-list')).toBe(true);
    });
    
    test('sets direction on dl element', () => {
      const block = createBlock();
      block.direction = 'ltr';
      const view = createDefinitionListBlockView({ block });
      const element = view.render();
      
      const dl = element.querySelector('dl');
      expect(dl?.dir).toBe('ltr');
    });
  });
  
  describe('editing', () => {
    test('shows add button when not readonly', () => {
      const block = createBlock();
      const view = createDefinitionListBlockView({ block, readOnly: false });
      const element = view.render();
      
      const addBtn = element.querySelector('.artoon-dl-add-btn');
      expect(addBtn).toBeTruthy();
    });
    
    test('hides add button in readonly mode', () => {
      const block = createBlock();
      const view = createDefinitionListBlockView({ block, readOnly: true });
      const element = view.render();
      
      const addBtn = element.querySelector('.artoon-dl-add-btn');
      expect(addBtn).toBeFalsy();
    });
    
    test('makes dt and dd editable when not readonly', () => {
      const block = createBlock();
      const view = createDefinitionListBlockView({ block, readOnly: false });
      const element = view.render();
      
      const dt = element.querySelector('dt');
      const dd = element.querySelector('dd');
      
      expect(dt?.contentEditable).toBe('true');
      expect(dd?.contentEditable).toBe('true');
    });
  });
  
  describe('items management', () => {
    test('getItems returns block items', () => {
      const items = [createItem('A', 'B'), createItem('C', 'D')];
      const block = createBlock(items);
      const view = createDefinitionListBlockView({ block });
      view.render();
      
      expect(view.getItems().length).toBe(2);
    });
    
    test('addItem adds new item', () => {
      const block = createBlock([createItem('A', 'B')]);
      let updatedItems: DefinitionItem[] = [];
      
      const view = createDefinitionListBlockView({ 
        block,
        onItemsChange: (items) => { updatedItems = items; }
      });
      view.render();
      view.addItem();
      
      expect(updatedItems.length).toBe(2);
    });
    
    test('deleteItem removes item', () => {
      const items = [createItem('A', 'B'), createItem('C', 'D')];
      const block = createBlock(items);
      let updatedItems: DefinitionItem[] = [];
      
      const view = createDefinitionListBlockView({ 
        block,
        onItemsChange: (items) => { updatedItems = items; }
      });
      view.render();
      view.deleteItem(0);
      
      expect(updatedItems.length).toBe(1);
    });
    
    test('cannot delete last item', () => {
      const block = createBlock([createItem('A', 'B')]);
      let deleteCalled = false;
      
      const view = createDefinitionListBlockView({ 
        block,
        onItemsChange: () => { deleteCalled = true; }
      });
      view.render();
      view.deleteItem(0);
      
      expect(deleteCalled).toBe(false);
    });
  });
});
