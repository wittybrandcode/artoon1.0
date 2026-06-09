// ARTOON Serializer - List Node Tests

import { serializeList } from '../src/nodes/list';
import { ListNode } from '@artoon/ast';

describe('serializeList', () => {
  it('should serialize unordered list', () => {
    const node: ListNode = {
      type: 'list',
      listType: 'ul',
      direction: 'rtl',
      line: 1,
      items: [
        { itemType: 'li', content: [{ type: 'plain', value: 'عنصر أول' }] },
        { itemType: 'li', content: [{ type: 'plain', value: 'عنصر ثاني' }] }
      ]
    };
    
    expect(serializeList(node)).toBe(
      '>.ul:: عنصر أول\n' +
      '>.ul:: عنصر ثاني'
    );
  });
  
  it('should serialize ordered list', () => {
    const node: ListNode = {
      type: 'list',
      listType: 'ol',
      direction: 'ltr',
      line: 1,
      items: [
        { itemType: 'li', content: [{ type: 'plain', value: 'First item' }] },
        { itemType: 'li', content: [{ type: 'plain', value: 'Second item' }] }
      ]
    };
    
    expect(serializeList(node)).toBe(
      '<.ol:: First item\n' +
      '<.ol:: Second item'
    );
  });
  
  it('should serialize definition list', () => {
    const node: ListNode = {
      type: 'list',
      listType: 'dl',
      direction: 'rtl',
      line: 1,
      items: [
        { itemType: 'dt', content: [{ type: 'plain', value: 'المصطلح' }] },
        { itemType: 'dd', content: [{ type: 'plain', value: 'التعريف' }] }
      ]
    };
    
    expect(serializeList(node)).toBe(
      '>.dl:: المصطلح\n' +
      '>.dl:: التعريف'
    );
  });
  
  it('should serialize nested list (v2.0: children is ListItem[])', () => {
    const node: ListNode = {
      type: 'list',
      listType: 'ul',
      direction: 'rtl',
      line: 1,
      items: [
        { itemType: 'li', content: [{ type: 'plain', value: 'عنصر أول' }] },
        { 
          itemType: 'li', 
          content: [{ type: 'plain', value: 'عنصر ثاني' }],
          children: [
            { itemType: 'li', content: [{ type: 'plain', value: 'فرعي' }] }
          ]
        },
        { itemType: 'li', content: [{ type: 'plain', value: 'عنصر ثالث' }] }
      ]
    };
    
    expect(serializeList(node)).toBe(
      '>.ul:: عنصر أول\n' +
      '>.ul:: عنصر ثاني\n' +
      '>.-ul:: فرعي\n' +
      '>.ul:: عنصر ثالث'
    );
  });
  
  it('should serialize deeply nested list (v2.0: children is ListItem[])', () => {
    const node: ListNode = {
      type: 'list',
      listType: 'ul',
      direction: 'rtl',
      line: 1,
      items: [
        { 
          itemType: 'li', 
          content: [{ type: 'plain', value: 'مستوى 0' }],
          children: [
            { 
              itemType: 'li', 
              content: [{ type: 'plain', value: 'مستوى 1' }],
              children: [
                { itemType: 'li', content: [{ type: 'plain', value: 'مستوى 2' }] }
              ]
            }
          ]
        }
      ]
    };
    
    expect(serializeList(node)).toBe(
      '>.ul:: مستوى 0\n' +
      '>.-ul:: مستوى 1\n' +
      '>.--ul:: مستوى 2'
    );
  });
});
