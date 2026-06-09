/**
 * Selection tests
 */

import { DocumentImpl } from '../../src/state/Document';
import {
  TextSelectionImpl,
  NodeSelectionImpl,
  AllSelectionImpl,
  selectionFromJSON
} from '../../src/selection/Selection';
import { MappingImpl } from '../../src/transaction/Mapping';
import type { ContentNode } from '@artoon/ast';

function createDoc(content: string[]): DocumentImpl {
  return DocumentImpl.create({
    version: '1.0',
    content: content.map((text, i) => ({
      type: 'text',
      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: i + 1,
      content: [{ type: 'plain', value: text }]
    }))
  });
}

describe('TextSelectionImpl', () => {
  const doc = createDoc(['مرحباً']);

  describe('creation', () => {
    it('should create at position', () => {
      const sel = TextSelectionImpl.at(1, doc);
      expect(sel.type).toBe('text');
      expect(sel.from).toBe(1);
      expect(sel.to).toBe(1);
      expect(sel.empty).toBe(true);
    });

    it('should create between positions', () => {
      const sel = TextSelectionImpl.between(1, 3, doc);
      expect(sel.from).toBe(1);
      expect(sel.to).toBe(3);
      expect(sel.empty).toBe(false);
    });

    it('should create with create factory', () => {
      const sel = TextSelectionImpl.create(doc, 2, 4);
      expect(sel.anchor).toBe(2);
      expect(sel.head).toBe(4);
    });

    it('should default head to anchor', () => {
      const sel = TextSelectionImpl.create(doc, 2);
      expect(sel.head).toBe(2);
    });
  });

  describe('properties', () => {
    it('should calculate from/to correctly when anchor > head', () => {
      const sel = new TextSelectionImpl(5, 2, doc);
      expect(sel.from).toBe(2);
      expect(sel.to).toBe(5);
      expect(sel.anchor).toBe(5);
      expect(sel.head).toBe(2);
    });

    it('should have $from and $to accessors', () => {
      const sel = TextSelectionImpl.between(1, 3, doc);
      expect(sel.$from).toBeDefined();
      expect(sel.$to).toBeDefined();
    });
  });

  describe('mapping', () => {
    it('should map through mapping', () => {
      const sel = TextSelectionImpl.at(5, doc);
      const mapping = MappingImpl.fromReplace(2, 4, 6);
      const mapped = sel.map(mapping);
      expect(mapped).toBeInstanceOf(TextSelectionImpl);
    });
  });

  describe('equality', () => {
    it('should detect equal selections', () => {
      const sel1 = TextSelectionImpl.at(1, doc);
      const sel2 = TextSelectionImpl.at(1, doc);
      expect(sel1.eq(sel2)).toBe(true);
    });

    it('should detect different selections', () => {
      const sel1 = TextSelectionImpl.at(1, doc);
      const sel2 = TextSelectionImpl.at(2, doc);
      expect(sel1.eq(sel2)).toBe(false);
    });
  });

  describe('content', () => {
    it('should get content slice', () => {
      const sel = TextSelectionImpl.between(1, 3, doc);
      const slice = sel.content();
      expect(slice).toBeDefined();
    });
  });

  describe('JSON', () => {
    it('should serialize to JSON', () => {
      const sel = TextSelectionImpl.create(doc, 1, 3);
      const json = sel.toJSON();
      expect(json.type).toBe('text');
      expect(json.anchor).toBe(1);
      expect(json.head).toBe(3);
    });
  });

  describe('withDoc', () => {
    it('should create selection with new doc', () => {
      const sel = TextSelectionImpl.at(1, doc);
      const newDoc = createDoc(['جديد']);
      const newSel = sel.withDoc(newDoc);
      expect(newSel.anchor).toBe(1);
      expect(newSel.head).toBe(1);
    });
  });
});

describe('NodeSelectionImpl', () => {
  const doc = createDoc(['مرحباً']);

  describe('creation', () => {
    it('should create node selection', () => {
      const sel = NodeSelectionImpl.create(doc, 1);
      expect(sel.type).toBe('node');
      expect(sel.node).toBeDefined();
    });

    it('should throw for invalid position', () => {
      expect(() => NodeSelectionImpl.create(doc, 999)).toThrow('No node at position');
    });
  });

  describe('isSelectable', () => {
    it('should return true for text nodes', () => {
      const node: ContentNode = {
        type: 'text',
        nodeType: 'text',
        textType: 'p',
        direction: 'rtl',
        line: 1,
        content: []
      };
      expect(NodeSelectionImpl.isSelectable(node)).toBe(true);
    });

    it('should return true for list nodes', () => {
      const node: ContentNode = {
        type: 'list',
        nodeType: 'list',
        listType: 'ul',
        direction: 'rtl',
        line: 1,
        items: []
      };
      expect(NodeSelectionImpl.isSelectable(node)).toBe(true);
    });

    it('should return false for unknown node types', () => {
      const node: any = { type: 'unknown', nodeType: 'unknown' };
      expect(NodeSelectionImpl.isSelectable(node)).toBe(false);
    });

    it('should support old format (type only)', () => {
      const node: any = { type: 'text' };
      expect(NodeSelectionImpl.isSelectable(node)).toBe(true);
    });
  });

  describe('mapping', () => {
    it('should map to text selection when node deleted', () => {
      const sel = NodeSelectionImpl.create(doc, 1);
      const mapping = MappingImpl.fromReplace(1, 8, 0);
      const mapped = sel.map(mapping);
      expect(mapped).toBeInstanceOf(TextSelectionImpl);
    });

    it('should map to node selection when not deleted', () => {
      const sel = NodeSelectionImpl.create(doc, 1);
      const mapping = MappingImpl.empty();
      const mapped = sel.map(mapping);
      expect(mapped).toBeInstanceOf(NodeSelectionImpl);
    });
  });

  describe('withDoc', () => {
    it('should create with new doc', () => {
      const sel = NodeSelectionImpl.create(doc, 1);
      const newDoc = createDoc(['جديد']);
      const newSel = sel.withDoc(newDoc);
      expect(newSel).toBeInstanceOf(NodeSelectionImpl);
    });
  });
});

describe('AllSelectionImpl', () => {
  const doc = createDoc(['مرحباً']);

  describe('creation', () => {
    it('should create all selection', () => {
      const sel = AllSelectionImpl.create(doc);
      expect(sel.type).toBe('all');
      expect(sel.from).toBe(0);
      expect(sel.to).toBe(doc.size);
    });
  });

  describe('mapping', () => {
    it('should always cover entire document', () => {
      const sel = AllSelectionImpl.create(doc);
      const mapping = MappingImpl.fromReplace(2, 4, 6);
      const mapped = sel.map(mapping);
      expect(mapped.to).toBe(doc.size);
    });
  });

  describe('withDoc', () => {
    it('should create with new doc', () => {
      const sel = AllSelectionImpl.create(doc);
      const newDoc = createDoc(['واحد', 'اثنان']);
      const newSel = sel.withDoc(newDoc);
      expect(newSel.to).toBe(newDoc.size);
    });
  });
});

describe('selectionFromJSON', () => {
  const doc = createDoc(['مرحباً']);

  it('should create text selection from JSON', () => {
    const sel = selectionFromJSON({ type: 'text', anchor: 1, head: 3 }, doc);
    expect(sel.type).toBe('text');
  });

  it('should create node selection from JSON', () => {
    const sel = selectionFromJSON({ type: 'node', anchor: 1, head: 1 }, doc);
    expect(sel.type).toBe('node');
  });

  it('should create all selection from JSON', () => {
    const sel = selectionFromJSON({ type: 'all', anchor: 0, head: doc.size }, doc);
    expect(sel.type).toBe('all');
  });

  it('should default to text selection for unknown type', () => {
    const sel = selectionFromJSON({ type: 'unknown' as any, anchor: 1, head: 1 }, doc);
    expect(sel.type).toBe('text');
  });
});
