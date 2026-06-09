// ARTOON AST Serialization Tests

import { toJSON, fromJSON, toCompactJSON, clone, getStats } from '../src/serialize';
import { ARTOONDocument } from '../src/types';

describe('Serialization', () => {
  
  const doc: ARTOONDocument = {
    version: '1.0',
    meta: {
      title: 'Test Document',
      author: 'Test Author'
    },
    content: [
      {
        nodeType: 'text',
        line: 1,
        direction: 'rtl',
        textType: 'p',
        content: [{ type: 'plain', value: 'Hello' }]
      } as any
    ]
  };
  
  test('toJSON', () => {
    const json = toJSON(doc);
    
    expect(json).toContain('"version": "1.0"');
    expect(json).toContain('"title": "Test Document"');
  });
  
  test('toJSON compact', () => {
    const json = toJSON(doc, false);
    
    expect(json).not.toContain('\n');
  });
  
  test('toCompactJSON', () => {
    const json = toCompactJSON(doc);
    
    expect(json).not.toContain('\n');
    expect(json).not.toContain('  ');
  });
  
  test('fromJSON', () => {
    const json = toJSON(doc);
    const parsed = fromJSON(json);
    
    expect(parsed.version).toBe('1.0');
    expect(parsed.meta?.title).toBe('Test Document');
    expect(parsed.content).toHaveLength(1);
  });
  
  test('fromJSON invalid version', () => {
    const json = '{"version": "99.0", "content": []}';
    
    expect(() => fromJSON(json)).toThrow('Unsupported AST version');
  });
  
  test('clone', () => {
    const cloned = clone(doc);
    
    expect(cloned).not.toBe(doc);
    expect(cloned.version).toBe(doc.version);
    expect(cloned.meta?.title).toBe(doc.meta?.title);
    
    // Modify clone shouldn't affect original
    (cloned.meta as any)!.title = 'Modified';
    expect(doc.meta?.title).toBe('Test Document');
  });
  
});

describe('Statistics', () => {
  
  test('getStats', () => {
    const doc: ARTOONDocument = {
      version: '2.0',
      meta: { title: 'Test' },
      content: [
        { nodeType: 'text', line: 1, direction: 'rtl', textType: 'p', content: [] } as any,
        { nodeType: 'text', line: 2, direction: 'rtl', textType: 't1', content: [] } as any,
        { nodeType: 'list', line: 3, direction: 'rtl', listType: 'ul', items: [] } as any
      ],
      errors: [
        { type: 'syntax', line: 1, message: 'test error' }
      ]
    };
    
    const stats = getStats(doc);
    
    expect(stats.version).toBe('2.0');
    expect(stats.hasMeta).toBe(true);
    expect(stats.nodeCount).toBe(3);
    expect(stats.errorCount).toBe(1);
    expect(stats.nodeTypes.text).toBe(2);
    expect(stats.nodeTypes.list).toBe(1);
  });
  
});
