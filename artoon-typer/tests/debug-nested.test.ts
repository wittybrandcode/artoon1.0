import { describe, it, expect } from 'vitest';
import { importARTOON } from '../src/integration/ARTOONImporter';
import type { ListBlock } from '../src/types';

describe('Nested Lists', () => {
  it('should correctly import nested list items', () => {
    const source = `>.ul::
li:: الفواكه
-li:: فواكه استوائية
-li:: فواكه موسمية
li:: الخضروات
-li:: خضروات ورقية`;

    const blocks = importARTOON(source);
    
    expect(blocks).toHaveLength(1);
    expect(blocks[0].type).toBe('list');
    
    const list = blocks[0] as ListBlock;
    
    // Should have 2 top-level items
    expect(list.items.length).toBe(2);
    
    // First item should have children
    const firstItem = list.items[0];
    
    expect(firstItem.children).toBeDefined();
    expect(firstItem.children?.length).toBe(2);
    
    // Second item should have children
    const secondItem = list.items[1];
    
    expect(secondItem.children).toBeDefined();
    expect(secondItem.children?.length).toBe(1);
  });
});

