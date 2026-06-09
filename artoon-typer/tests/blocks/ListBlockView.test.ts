/**
 * ListBlockView Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ListBlockView, createListBlockView } from '../../src/blocks/views/ListBlockView';
import type { ListBlock, ListItem, InlineContent } from '../../src/types';

// Helper to create a test block
function createTestBlock(items: ListItem[] = [], type: 'bullet-list' | 'numbered-list' = 'bullet-list'): ListBlock {
  return {
    id: 'test-list-1',
    type,
    direction: 'rtl',
    items,
  };
}

// Helper to create a test item
function createTestItem(content: string, id?: string, children?: ListItem[]): ListItem {
  return {
    id: id || `item-${Math.random().toString(36).substr(2, 9)}`,
    content: [{ type: 'plain', value: content }],
    children,
  };
}

describe('ListBlockView', () => {
  let view: ListBlockView;
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
      const block = createTestBlock([createTestItem('عنصر')]);
      view = createListBlockView({ block });
      
      expect(view).toBeInstanceOf(ListBlockView);
      expect(view.id).toBe('test-list-1');
    });

    it('should render bullet list with ul tag', () => {
      const block = createTestBlock([createTestItem('عنصر')], 'bullet-list');
      view = createListBlockView({ block });
      
      const element = view.render();
      const list = element.querySelector('ul');
      
      expect(list).not.toBeNull();
    });

    it('should render numbered list with ol tag', () => {
      const block = createTestBlock([createTestItem('عنصر')], 'numbered-list');
      view = createListBlockView({ block });
      
      const element = view.render();
      const list = element.querySelector('ol');
      
      expect(list).not.toBeNull();
    });

    it('should render items', () => {
      const block = createTestBlock([
        createTestItem('عنصر 1'),
        createTestItem('عنصر 2'),
      ]);
      view = createListBlockView({ block });
      
      const element = view.render();
      const items = element.querySelectorAll('li');
      
      expect(items).toHaveLength(2);
    });
  });

  describe('listType', () => {
    it('should return bullet for bullet-list', () => {
      const block = createTestBlock([], 'bullet-list');
      view = createListBlockView({ block });
      
      expect(view.listType).toBe('bullet');
    });

    it('should return numbered for numbered-list', () => {
      const block = createTestBlock([], 'numbered-list');
      view = createListBlockView({ block });
      
      expect(view.listType).toBe('numbered');
    });
  });

  describe('getItems', () => {
    it('should return all items', () => {
      const items = [createTestItem('أ'), createTestItem('ب')];
      const block = createTestBlock(items);
      view = createListBlockView({ block });
      
      expect(view.getItems()).toEqual(items);
    });
  });

  describe('getItem', () => {
    it('should find item by ID', () => {
      const item = createTestItem('عنصر', 'item-1');
      const block = createTestBlock([item]);
      view = createListBlockView({ block });
      
      expect(view.getItem('item-1')).toEqual(item);
    });

    it('should return undefined for unknown ID', () => {
      const block = createTestBlock([createTestItem('عنصر')]);
      view = createListBlockView({ block });
      
      expect(view.getItem('unknown')).toBeUndefined();
    });

    it('should find nested item', () => {
      const child = createTestItem('طفل', 'child-1');
      const parent = createTestItem('أب', 'parent-1', [child]);
      const block = createTestBlock([parent]);
      view = createListBlockView({ block });
      
      expect(view.getItem('child-1')).toEqual(child);
    });
  });

  describe('getItemCount', () => {
    it('should count items', () => {
      const block = createTestBlock([
        createTestItem('أ'),
        createTestItem('ب'),
        createTestItem('ج'),
      ]);
      view = createListBlockView({ block });
      
      expect(view.getItemCount()).toBe(3);
    });

    it('should count nested items', () => {
      const block = createTestBlock([
        createTestItem('أ', 'a', [
          createTestItem('أ-1'),
          createTestItem('أ-2'),
        ]),
        createTestItem('ب'),
      ]);
      view = createListBlockView({ block });
      
      expect(view.getItemCount()).toBe(4);
    });
  });

  describe('nested lists', () => {
    it('should render nested items', () => {
      const block = createTestBlock([
        createTestItem('أب', 'parent', [
          createTestItem('طفل 1'),
          createTestItem('طفل 2'),
        ]),
      ]);
      view = createListBlockView({ block });
      
      const element = view.render();
      const nestedList = element.querySelector('.artoon-list--nested');
      
      expect(nestedList).not.toBeNull();
      expect(nestedList?.querySelectorAll('li')).toHaveLength(2);
    });
  });

  describe('item operations', () => {
    it('should add item after specified item', () => {
      const block = createTestBlock([
        createTestItem('أ', 'item-a'),
        createTestItem('ج', 'item-c'),
      ]);
      view = createListBlockView({ block });
      view.render();
      
      const newItem = view.addItemAfter('item-a', [{ type: 'plain', value: 'ب' }]);
      
      expect(view.getItemCount()).toBe(3);
      expect(view.getItems()[1].id).toBe(newItem.id);
    });

    it('should remove item', () => {
      const block = createTestBlock([
        createTestItem('أ', 'item-a'),
        createTestItem('ب', 'item-b'),
      ]);
      view = createListBlockView({ block });
      view.render();
      
      const result = view.removeItem('item-a');
      
      expect(result).toBe(true);
      expect(view.getItemCount()).toBe(1);
      expect(view.getItem('item-a')).toBeUndefined();
    });

    it('should update item content', () => {
      const block = createTestBlock([createTestItem('قديم', 'item-1')]);
      view = createListBlockView({ block });
      
      const newContent: InlineContent[] = [{ type: 'plain', value: 'جديد' }];
      view.updateItemContent('item-1', newContent);
      
      expect(view.getItem('item-1')?.content).toEqual(newContent);
    });
  });

  describe('indent/outdent', () => {
    it('should indent item', () => {
      const block = createTestBlock([
        createTestItem('أ', 'item-a'),
        createTestItem('ب', 'item-b'),
      ]);
      view = createListBlockView({ block });
      view.render();
      
      const result = view.indentItem('item-b');
      
      expect(result).toBe(true);
      expect(view.getItems()).toHaveLength(1);
      expect(view.getItems()[0].children).toHaveLength(1);
    });

    it('should not indent first item', () => {
      const block = createTestBlock([
        createTestItem('أ', 'item-a'),
      ]);
      view = createListBlockView({ block });
      view.render();
      
      const result = view.indentItem('item-a');
      
      expect(result).toBe(false);
    });

    it('should outdent item', () => {
      const block = createTestBlock([
        createTestItem('أ', 'item-a', [
          createTestItem('ب', 'item-b'),
        ]),
      ]);
      view = createListBlockView({ block });
      view.render();
      
      const result = view.outdentItem('item-b');
      
      expect(result).toBe(true);
      expect(view.getItems()).toHaveLength(2);
    });
  });

  describe('focus', () => {
    it('should focus item', () => {
      const block = createTestBlock([createTestItem('عنصر', 'item-1')]);
      view = createListBlockView({ block });
      const element = view.render();
      container.appendChild(element);
      
      view.focusItem('item-1');
      
      expect(view.getFocusedItemId()).toBe('item-1');
    });

    it('should focus first item', () => {
      const block = createTestBlock([
        createTestItem('أول', 'first'),
        createTestItem('ثاني', 'second'),
      ]);
      view = createListBlockView({ block });
      const element = view.render();
      container.appendChild(element);
      
      view.focusFirstItem();
      
      expect(view.getFocusedItemId()).toBe('first');
    });

    it('should focus last item', () => {
      const block = createTestBlock([
        createTestItem('أول', 'first'),
        createTestItem('ثاني', 'second'),
      ]);
      view = createListBlockView({ block });
      const element = view.render();
      container.appendChild(element);
      
      view.focusLastItem();
      
      expect(view.getFocusedItemId()).toBe('second');
    });
  });

  describe('CSS classes', () => {
    it('should have list class', () => {
      const block = createTestBlock([createTestItem('عنصر')]);
      view = createListBlockView({ block });
      
      const element = view.render();
      const list = element.querySelector('.artoon-list');
      
      expect(list).not.toBeNull();
    });

    it('should have item class', () => {
      const block = createTestBlock([createTestItem('عنصر')]);
      view = createListBlockView({ block });
      
      const element = view.render();
      const item = element.querySelector('.artoon-list__item');
      
      expect(item).not.toBeNull();
    });

    it('should have content class', () => {
      const block = createTestBlock([createTestItem('عنصر')]);
      view = createListBlockView({ block });
      
      const element = view.render();
      const content = element.querySelector('.artoon-list__content');
      
      expect(content).not.toBeNull();
    });
  });

  describe('events', () => {
    it('should call onItemChange on input', () => {
      const onItemChange = vi.fn();
      const block = createTestBlock([createTestItem('عنصر', 'item-1')]);
      view = createListBlockView({ block, onItemChange });
      const element = view.render();
      container.appendChild(element);
      
      const content = element.querySelector('.artoon-list__content') as HTMLElement;
      content.innerHTML = 'نص جديد';
      content.dispatchEvent(new Event('input', { bubbles: true }));
      
      expect(onItemChange).toHaveBeenCalledWith('item-1', expect.any(Array));
    });
  });

  describe('update', () => {
    it('should update items', () => {
      const block = createTestBlock([createTestItem('قديم')]);
      view = createListBlockView({ block });
      view.render();
      
      const newBlock: ListBlock = {
        ...block,
        items: [createTestItem('جديد')],
      };
      view.update(newBlock);
      
      expect(view.getItems()[0].content[0]).toEqual({ type: 'plain', value: 'جديد' });
    });
  });
});
