// ARTOON AST Node Utilities Tests
// Version 2.0 - Uses new type format

import {
  createTextNode,
  createPlainText,
  createInlineComponent,
  createListNode,
  createSeparatorNode,
  visitNodes,
  findNodesByType,
  extractText,
  countByType,
  inlineToText,
  hasModifiers,
  getModifiers
} from '../src/nodes';
import { TextNode, ListNode, ContentNode, InlineContent } from '../src/types';
import { getNodeType } from '../src/compat';

describe('Node Creators', () => {
  
  test('createTextNode', () => {
    const content = [createPlainText('Hello')];
    const node = createTextNode('p', content, 'rtl', 1);
    
    // Should have type (new format)
    expect(node.type).toBe('text');
    expect(node.textType).toBe('p');
    expect(node.direction).toBe('rtl');
    expect(node.line).toBe(1);
    expect(node.content).toHaveLength(1);
  });
  
  test('createPlainText', () => {
    const plain = createPlainText('Hello World');
    
    expect(plain.type).toBe('plain');
    expect(plain.value).toBe('Hello World');
  });
  
  test('createInlineComponent', () => {
    const inline = createInlineComponent('a', { url: 'https://example.com' }, ['s']);
    
    expect(inline.type).toBe('inline');
    expect(inline.component).toBe('a');
    expect(inline.modifiers).toEqual(['s']);
    expect(inline.attributes.url).toBe('https://example.com');
  });
  
  test('createListNode', () => {
    const list = createListNode('ul', 'rtl', 5);
    
    expect(list.type).toBe('list');
    expect(list.listType).toBe('ul');
    expect(list.direction).toBe('rtl');
    expect(list.items).toHaveLength(0);
  });
  
  test('createSeparatorNode', () => {
    const sep = createSeparatorNode(['br', 'hr'], 'rtl', 10);
    
    expect(sep.type).toBe('separator');
    // v2.0: separatorType is the canonical property
    expect(sep.separatorType).toBe('br');
    // Legacy support: separators array still available
    expect(sep.separators).toEqual(['br', 'hr']);
  });
  
});

describe('Node Traversal', () => {
  
  const nodes: ContentNode[] = [
    {
      type: 'text',
      line: 1,
      direction: 'rtl',
      textType: 'p',
      content: [{ type: 'plain', value: 'First' }]
    } as TextNode,
    {
      type: 'text',
      line: 2,
      direction: 'rtl',
      textType: 't1',
      content: [{ type: 'plain', value: 'Second' }]
    } as TextNode,
    {
      type: 'list',
      line: 3,
      direction: 'rtl',
      listType: 'ul',
      items: [
        {
          itemType: 'li',
          content: [{ type: 'plain', value: 'Item' }]
        }
      ]
    } as ListNode
  ];
  
  test('visitNodes', () => {
    const visited: string[] = [];
    
    visitNodes(nodes, (node) => {
      visited.push(getNodeType(node));
    });
    
    expect(visited).toContain('text');
    expect(visited).toContain('list');
    expect(visited.filter(t => t === 'text')).toHaveLength(2);
  });
  
  test('findNodesByType', () => {
    const textNodes = findNodesByType<TextNode>(nodes, 'text');
    
    expect(textNodes).toHaveLength(2);
    expect(textNodes[0].textType).toBe('p');
    expect(textNodes[1].textType).toBe('t1');
  });
  
  test('extractText', () => {
    const text = extractText(nodes);
    
    expect(text).toContain('First');
    expect(text).toContain('Second');
  });
  
  test('countByType', () => {
    const counts = countByType(nodes);
    
    expect(counts.text).toBe(2);
    expect(counts.list).toBe(1);
  });
  
});

describe('Inline Content Utilities', () => {
  
  const content: InlineContent[] = [
    { type: 'plain', value: 'Hello ' },
    { type: 'inline', modifiers: ['s'], attributes: {}, value: 'World' },
    { type: 'plain', value: '!' }
  ];
  
  test('inlineToText', () => {
    const text = inlineToText(content);
    expect(text).toBe('Hello World!');
  });
  
  test('hasModifiers', () => {
    expect(hasModifiers(content)).toBe(true);
    
    const noMods: InlineContent[] = [
      { type: 'plain', value: 'No modifiers' }
    ];
    expect(hasModifiers(noMods)).toBe(false);
  });
  
  test('getModifiers', () => {
    const mods = getModifiers(content);
    expect(mods).toContain('s');
  });
  
});
