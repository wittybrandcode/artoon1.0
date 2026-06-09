/**
 * Fragment tests
 */

import { FragmentImpl, nodeSize } from '../../src/state/Fragment';
import type { ContentNode, TextNode } from '@artoon/ast';

describe('FragmentImpl', () => {
  // Helper to create text node
  const createTextNode = (text: string, line: number = 1): TextNode => ({
    type: 'text',
    nodeType: 'text',
    textType: 'p',
    direction: 'rtl',
    line,
    content: [{ type: 'plain', value: text }]
  });

  describe('creation', () => {
    it('should create empty fragment', () => {
      const fragment = FragmentImpl.empty;
      expect(fragment.childCount).toBe(0);
      expect(fragment.size).toBe(0);
    });

    it('should create fragment from single node', () => {
      const node = createTextNode('مرحباً');
      const fragment = FragmentImpl.from(node);
      expect(fragment.childCount).toBe(1);
    });

    it('should create fragment from array', () => {
      const nodes = [
        createTextNode('أولاً', 1),
        createTextNode('ثانياً', 2)
      ];
      const fragment = FragmentImpl.from(nodes);
      expect(fragment.childCount).toBe(2);
    });

    it('should handle null input', () => {
      const fragment = FragmentImpl.from(null);
      expect(fragment.childCount).toBe(0);
    });
  });

  describe('nodeSize', () => {
    it('should calculate text node size', () => {
      const node = createTextNode('مرحباً'); // 6 chars
      // Size = 2 (open/close) + 6 (content) = 8
      expect(nodeSize(node)).toBe(8);
    });

    it('should calculate separator size', () => {
      const node: ContentNode = {
        type: 'separator',
        nodeType: 'separator',
        separatorType: 'hr',
        direction: 'rtl',
        line: 1
      };
      expect(nodeSize(node)).toBe(1);
    });

    it('should calculate comment size', () => {
      const node: ContentNode = {
        type: 'comment',
        nodeType: 'comment',
        content: 'تعليق',
        direction: 'rtl',
        line: 1
      };
      expect(nodeSize(node)).toBe(1);
    });
  });

  describe('child access', () => {
    it('should get child by index', () => {
      const nodes = [
        createTextNode('أولاً', 1),
        createTextNode('ثانياً', 2)
      ];
      const fragment = FragmentImpl.from(nodes);
      
      expect(fragment.child(0)).toBe(nodes[0]);
      expect(fragment.child(1)).toBe(nodes[1]);
    });

    it('should throw on invalid index', () => {
      const fragment = FragmentImpl.from(createTextNode('test'));
      expect(() => fragment.child(5)).toThrow(RangeError);
    });

    it('should get first and last child', () => {
      const nodes = [
        createTextNode('أولاً', 1),
        createTextNode('ثانياً', 2),
        createTextNode('ثالثاً', 3)
      ];
      const fragment = FragmentImpl.from(nodes);
      
      expect(fragment.firstChild).toBe(nodes[0]);
      expect(fragment.lastChild).toBe(nodes[2]);
    });

    it('should return null for empty fragment', () => {
      expect(FragmentImpl.empty.firstChild).toBeNull();
      expect(FragmentImpl.empty.lastChild).toBeNull();
    });
  });

  describe('forEach', () => {
    it('should iterate with correct offsets', () => {
      const nodes = [
        createTextNode('أب', 1),    // size = 4
        createTextNode('جد', 2)     // size = 4
      ];
      const fragment = FragmentImpl.from(nodes);
      
      const results: { node: ContentNode; offset: number; index: number }[] = [];
      fragment.forEach((node, offset, index) => {
        results.push({ node, offset, index });
      });
      
      expect(results).toHaveLength(2);
      expect(results[0].offset).toBe(0);
      expect(results[0].index).toBe(0);
      expect(results[1].offset).toBe(4); // After first node
      expect(results[1].index).toBe(1);
    });
  });

  describe('findIndex', () => {
    it('should find index at position 0', () => {
      const fragment = FragmentImpl.from([
        createTextNode('أب', 1),
        createTextNode('جد', 2)
      ]);
      
      const result = fragment.findIndex(0);
      expect(result.index).toBe(0);
      expect(result.offset).toBe(0);
    });

    it('should find index at middle position', () => {
      const fragment = FragmentImpl.from([
        createTextNode('أب', 1),    // size = 4
        createTextNode('جد', 2)     // size = 4
      ]);
      
      const result = fragment.findIndex(5);
      expect(result.index).toBe(1);
      expect(result.offset).toBe(4);
    });
  });

  describe('operations', () => {
    it('should append fragments', () => {
      const f1 = FragmentImpl.from(createTextNode('أولاً', 1));
      const f2 = FragmentImpl.from(createTextNode('ثانياً', 2));
      
      const combined = f1.append(f2);
      expect(combined.childCount).toBe(2);
    });

    it('should cut fragment', () => {
      const fragment = FragmentImpl.from([
        createTextNode('أب', 1),
        createTextNode('جد', 2),
        createTextNode('هو', 3)
      ]);
      
      const cut = fragment.cut(0, 4);
      expect(cut.childCount).toBe(1);
    });

    it('should convert to array', () => {
      const nodes = [
        createTextNode('أولاً', 1),
        createTextNode('ثانياً', 2)
      ];
      const fragment = FragmentImpl.from(nodes);
      
      const arr = fragment.toArray();
      expect(arr).toHaveLength(2);
      expect(arr).not.toBe(nodes); // Should be a copy
    });
  });

  describe('equality', () => {
    it('should detect equal fragments', () => {
      const node = createTextNode('test');
      const f1 = FragmentImpl.from([node]);
      const f2 = FragmentImpl.from([node]);
      
      expect(f1.eq(f2)).toBe(true);
    });

    it('should detect unequal fragments', () => {
      const f1 = FragmentImpl.from(createTextNode('a'));
      const f2 = FragmentImpl.from(createTextNode('b'));
      
      expect(f1.eq(f2)).toBe(false);
    });
  });
});
