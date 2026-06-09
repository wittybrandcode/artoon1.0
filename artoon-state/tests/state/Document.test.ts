/**
 * Document tests
 */

import { DocumentImpl } from '../../src/state/Document';
import type { ARTOONDocument, TextNode } from '@artoon/ast';

describe('DocumentImpl', () => {
  // Helper to create simple document
  const createDoc = (paragraphs: string[]): ARTOONDocument => ({
    version: '1.0',
    content: paragraphs.map((text, i) => ({
      type: 'text' as const,
      nodeType: 'text' as const,
      textType: 'p' as const,
      direction: 'rtl' as const,
      line: i + 1,
      content: [{ type: 'plain' as const, value: text }]
    }))
  });

  describe('creation', () => {
    it('should create document from AST', () => {
      const ast = createDoc(['مرحباً']);
      const doc = DocumentImpl.create(ast);
      
      expect(doc.ast).toBe(ast);
      expect(doc.childCount).toBe(1);
    });

    it('should create empty document', () => {
      const doc = DocumentImpl.empty();
      
      expect(doc.childCount).toBe(0);
      expect(doc.ast.version).toBe('1.0');
    });
  });

  describe('size calculation', () => {
    it('should calculate document size', () => {
      const doc = DocumentImpl.create(createDoc(['أب'])); // 2 chars
      // Size = 2 (doc open/close) + 2 (node open/close) + 2 (content) = 6
      expect(doc.size).toBe(6);
    });

    it('should calculate empty document size', () => {
      const doc = DocumentImpl.empty();
      expect(doc.size).toBe(2); // Just open/close
    });
  });

  describe('child access', () => {
    it('should get child by index', () => {
      const ast = createDoc(['أولاً', 'ثانياً']);
      const doc = DocumentImpl.create(ast);
      
      expect(doc.child(0)).toBe(ast.content[0]);
      expect(doc.child(1)).toBe(ast.content[1]);
    });

    it('should get first and last child', () => {
      const ast = createDoc(['أولاً', 'ثانياً', 'ثالثاً']);
      const doc = DocumentImpl.create(ast);
      
      expect(doc.firstChild).toBe(ast.content[0]);
      expect(doc.lastChild).toBe(ast.content[2]);
    });
  });

  describe('nodeAt', () => {
    it('should get node at position', () => {
      const ast = createDoc(['مرحباً']);
      const doc = DocumentImpl.create(ast);
      
      // Position 1 should be at the text node
      const node = doc.nodeAt(1);
      expect(node).toBe(ast.content[0]);
    });

    it('should return null for out of bounds', () => {
      const doc = DocumentImpl.create(createDoc(['test']));
      
      expect(doc.nodeAt(-1)).toBeNull();
      expect(doc.nodeAt(1000)).toBeNull();
    });
  });

  describe('resolve', () => {
    it('should resolve position', () => {
      const doc = DocumentImpl.create(createDoc(['مرحباً']));
      const resolved = doc.resolve(1);
      
      expect(resolved.pos).toBeDefined();
      expect(resolved.depth).toBeGreaterThanOrEqual(0);
    });
  });

  describe('slice', () => {
    it('should get slice of document', () => {
      const doc = DocumentImpl.create(createDoc(['أولاً', 'ثانياً']));
      const slice = doc.slice(1, 5);
      
      expect(slice).toBeDefined();
      expect(slice.content).toBeDefined();
    });

    it('should return empty slice for invalid range', () => {
      const doc = DocumentImpl.create(createDoc(['test']));
      const slice = doc.slice(5, 3);
      
      expect(slice.isEmpty).toBe(true);
    });
  });

  describe('modifications', () => {
    it('should delete range', () => {
      const doc = DocumentImpl.create(createDoc(['أولاً', 'ثانياً']));
      const newDoc = doc.delete(1, 8);
      
      expect(newDoc).not.toBe(doc);
      expect(newDoc.childCount).toBeLessThanOrEqual(doc.childCount);
    });

    it('should insert node', () => {
      const doc = DocumentImpl.create(createDoc(['أولاً']));
      const newNode: TextNode = {
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        direction: 'rtl',
        line: 2,
        content: [{ type: 'plain', value: 'جديد' }]
      };
      
      const newDoc = doc.insert(doc.size - 1, newNode);
      expect(newDoc.childCount).toBe(2);
    });
  });

  describe('forEach', () => {
    it('should iterate children with offsets', () => {
      const ast = createDoc(['أب', 'جد']);
      const doc = DocumentImpl.create(ast);
      
      const results: { offset: number; index: number }[] = [];
      doc.forEach((node, offset, index) => {
        results.push({ offset, index });
      });
      
      expect(results).toHaveLength(2);
      expect(results[0].index).toBe(0);
      expect(results[1].index).toBe(1);
    });
  });

  describe('toAST', () => {
    it('should convert back to AST', () => {
      const ast = createDoc(['مرحباً']);
      const doc = DocumentImpl.create(ast);
      const result = doc.toAST();
      
      expect(result.version).toBe('1.0');
      expect(result.content).toHaveLength(1);
    });
  });

  describe('textContent', () => {
    it('should extract text content', () => {
      const doc = DocumentImpl.create(createDoc(['مرحباً', 'بالعالم']));
      const text = doc.textContent;
      
      expect(text).toContain('مرحباً');
      expect(text).toContain('بالعالم');
    });
  });

  describe('equality', () => {
    it('should detect equal documents', () => {
      const ast = createDoc(['test']);
      const doc1 = DocumentImpl.create(ast);
      const doc2 = DocumentImpl.create(ast);
      
      // Same AST reference means same content
      expect(doc1.eq(doc2)).toBe(true);
    });
  });

  describe('JSON serialization', () => {
    it('should serialize to JSON', () => {
      const ast = createDoc(['مرحباً']);
      const doc = DocumentImpl.create(ast);
      const json = doc.toJSON();
      
      expect(json).toEqual(ast);
    });

    it('should deserialize from JSON', () => {
      const ast = createDoc(['مرحباً']);
      const doc = DocumentImpl.fromJSON(ast);
      
      expect(doc.childCount).toBe(1);
    });
  });
});
