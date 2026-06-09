import { FragmentImpl, nodeSize } from '../src/state/Fragment';
import type { ContentNode } from '@artoon/ast';

describe('FragmentImpl', () => {
  const textNode = (content: string): ContentNode =>
    ({
      type: 'text',
      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: content }]
    } as ContentNode);

  describe('creation', () => {
    it('should create from single node', () => {
      const frag = FragmentImpl.from(textNode('hello'));
      expect(frag.childCount).toBe(1);
    });

    it('should create from array', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('b')]);
      expect(frag.childCount).toBe(2);
    });

    it('should create empty fragment', () => {
      const frag = FragmentImpl.empty;
      expect(frag.childCount).toBe(0);
      expect(frag.size).toBe(0);
    });

    it('should create from null', () => {
      const frag = FragmentImpl.from(null);
      expect(frag.childCount).toBe(0);
    });
  });

  describe('size', () => {
    it('should calculate size of text node', () => {
      const frag = FragmentImpl.from(textNode('ab'));
      // 1 open + 2 chars + 1 close = 4
      expect(frag.size).toBe(4);
    });

    it('should calculate size of multiple nodes', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('bc')]);
      // 3 + 4 = 7
      expect(frag.size).toBe(7);
    });
  });

  describe('child access', () => {
    it('should get first and last child', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('b'), textNode('c')]);
      expect(frag.firstChild).toBeDefined();
      expect(frag.lastChild).toBeDefined();
    });

    it('should get child by index', () => {
      const n1 = textNode('a');
      const n2 = textNode('b');
      const frag = FragmentImpl.from([n1, n2]);
      expect(frag.child(0)).toBe(n1);
      expect(frag.child(1)).toBe(n2);
    });

    it('should throw on out of range', () => {
      const frag = FragmentImpl.from(textNode('a'));
      expect(() => frag.child(5)).toThrow(RangeError);
    });
  });

  describe('forEach', () => {
    it('should iterate with offsets', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('bc')]);
      const offsets: number[] = [];
      frag.forEach((node, offset, index) => {
        offsets.push(offset);
      });
      expect(offsets).toEqual([0, 3]);
    });
  });

  describe('findIndex', () => {
    it('should find index at position 0', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('b')]);
      expect(frag.findIndex(0)).toEqual({ index: 0, offset: 0 });
    });

    it('should find index inside first node', () => {
      const frag = FragmentImpl.from([textNode('abc'), textNode('d')]);
      // Position 2 is inside first node (size 5)
      expect(frag.findIndex(2)).toEqual({ index: 0, offset: 0 });
    });

    it('should find index at second node', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('bcd')]);
      // Position 3 is at second node start
      expect(frag.findIndex(3)).toEqual({ index: 1, offset: 3 });
    });
  });

  describe('append', () => {
    it('should append fragments', () => {
      const f1 = FragmentImpl.from(textNode('a'));
      const f2 = FragmentImpl.from(textNode('b'));
      const combined = f1.append(f2);
      expect(combined.childCount).toBe(2);
    });

    it('should return other when empty', () => {
      const f1 = FragmentImpl.empty;
      const f2 = FragmentImpl.from(textNode('a'));
      expect(f1.append(f2)).toBe(f2);
    });
  });

  describe('cut', () => {
    it('should cut fragment', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('b'), textNode('c')]);
      const cut = frag.cut(3, 6);
      expect(cut.childCount).toBeGreaterThan(0);
    });

    it('should return empty when range is invalid', () => {
      const frag = FragmentImpl.from(textNode('a'));
      expect(frag.cut(5, 3)).toBe(FragmentImpl.empty);
    });

    it('should return same when cutting full range', () => {
      const frag = FragmentImpl.from(textNode('abc'));
      expect(frag.cut(0, frag.size)).toBe(frag);
    });
  });

  describe('replaceChild', () => {
    it('should replace child', () => {
      const frag = FragmentImpl.from([textNode('a'), textNode('b')]);
      const newFrag = frag.replaceChild(0, textNode('c'));
      expect(newFrag.childCount).toBe(2);
      expect(newFrag.child(0)).not.toBe(frag.child(0));
    });
  });

  describe('eq', () => {
    it('should be equal to itself', () => {
      const frag = FragmentImpl.from(textNode('a'));
      expect(frag.eq(frag)).toBe(true);
    });

    it('should not be equal to different fragment', () => {
      const f1 = FragmentImpl.from(textNode('a'));
      const f2 = FragmentImpl.from(textNode('b'));
      expect(f1.eq(f2)).toBe(false);
    });
  });

  describe('toArray', () => {
    it('should convert to array', () => {
      const n = textNode('a');
      const frag = FragmentImpl.from(n);
      expect(frag.toArray()).toHaveLength(1);
    });
  });
});

describe('nodeSize', () => {
  it('should calculate text node size', () => {
    const node: ContentNode = {
      type: 'text',
      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: 'abc' }]
    } as ContentNode;
    expect(nodeSize(node)).toBe(5); // 1 + 3 + 1
  });

  it('should calculate separator size', () => {
    const node: ContentNode = {
      type: 'separator',
      nodeType: 'separator',
      separatorType: 'br',
      direction: 'rtl',
      line: 1
    } as ContentNode;
    expect(nodeSize(node)).toBe(1);
  });
});
