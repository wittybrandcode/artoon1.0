/**
 * Compatibility Layer Tests
 * 
 * Tests for the compatibility layer that supports both old (nodeType)
 * and new (type) formats during migration.
 * 
 * @migration Part of Type Unification Plan - Phase 1
 */

import {
  normalizeNode,
  createCompatNode,
  isLegacyNode,
  isNewFormatNode,
  getNodeType,
  normalizeSeparatorNode,
  normalizeListItemChildren,
  wrapItemsInListNode,
  normalizeContent,
  needsMigration,
  getMigrationStats,
} from '../src/compat';

import {
  isTextNode,
  isListNode,
  isSeparatorNode,
  TextNode,
  ListNode,
  ListItem,
  SeparatorNode,
  ContentNode,
} from '../src/types';

// ═══════════════════════════════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function createLegacyTextNode(): any {
  return {
    nodeType: 'text',
    textType: 'p',
    line: 1,
    direction: 'rtl',
    content: [{ type: 'plain', value: 'test' }],
  };
}

function createNewTextNode(): TextNode {
  return {
    type: 'text',
    textType: 'p',
    line: 1,
    direction: 'rtl',
    content: [{ type: 'plain', value: 'test' }],
  };
}

function createLegacySeparatorNode(): any {
  return {
    nodeType: 'separator',
    separators: ['hr'],
    line: 1,
    direction: 'rtl',
  };
}

function createNewSeparatorNode(): SeparatorNode {
  return {
    type: 'separator',
    separatorType: 'hr',
    line: 1,
    direction: 'rtl',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// NODE NORMALIZATION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Node Normalization', () => {
  describe('normalizeNode', () => {
    it('adds type from nodeType for legacy nodes', () => {
      const legacy = createLegacyTextNode();
      const normalized = normalizeNode(legacy);
      
      expect(normalized.type).toBe('text');
      expect(normalized.nodeType).toBe('text');
    });

    it('preserves type for new format nodes', () => {
      const newNode = createNewTextNode();
      const normalized = normalizeNode(newNode);
      
      expect(normalized.type).toBe('text');
    });

    it('preserves all other properties', () => {
      const legacy = createLegacyTextNode();
      const normalized = normalizeNode(legacy);
      
      expect(normalized.textType).toBe('p');
      expect(normalized.line).toBe(1);
      expect(normalized.direction).toBe('rtl');
      expect(normalized.content).toEqual([{ type: 'plain', value: 'test' }]);
    });
  });

  describe('createCompatNode', () => {
    it('creates node with both type and nodeType', () => {
      const newNode = createNewTextNode();
      const compat = createCompatNode(newNode);
      
      expect(compat.type).toBe('text');
      expect(compat.nodeType).toBe('text');
    });
  });

  describe('isLegacyNode', () => {
    it('returns true for legacy format', () => {
      const legacy = createLegacyTextNode();
      expect(isLegacyNode(legacy)).toBe(true);
    });

    it('returns false for new format', () => {
      const newNode = createNewTextNode();
      expect(isLegacyNode(newNode)).toBe(false);
    });

    it('returns false for compat format (has both)', () => {
      const compat = { type: 'text', nodeType: 'text', line: 1, direction: 'rtl' };
      expect(isLegacyNode(compat)).toBe(false);
    });
  });

  describe('isNewFormatNode', () => {
    it('returns true for new format', () => {
      const newNode = createNewTextNode();
      expect(isNewFormatNode(newNode)).toBe(true);
    });

    it('returns false for legacy format', () => {
      const legacy = createLegacyTextNode();
      expect(isNewFormatNode(legacy)).toBe(false);
    });
  });

  describe('getNodeType', () => {
    it('returns type from new format', () => {
      const newNode = createNewTextNode();
      expect(getNodeType(newNode)).toBe('text');
    });

    it('returns nodeType from legacy format', () => {
      const legacy = createLegacyTextNode();
      expect(getNodeType(legacy)).toBe('text');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SEPARATOR NODE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Separator Node Normalization', () => {
  describe('normalizeSeparatorNode', () => {
    it('converts separators[] to separatorType', () => {
      const legacy = createLegacySeparatorNode();
      const normalized = normalizeSeparatorNode(legacy);
      
      expect(normalized.separatorType).toBe('hr');
      expect(normalized.type).toBe('separator');
    });

    it('preserves separatorType for new format', () => {
      const newNode = createNewSeparatorNode();
      const normalized = normalizeSeparatorNode(newNode);
      
      expect(normalized.separatorType).toBe('hr');
    });

    it('handles multiple separators (takes first)', () => {
      const legacy = {
        nodeType: 'separator',
        separators: ['br', 'hr', 'wbr'],
        line: 1,
        direction: 'rtl',
      };
      const normalized = normalizeSeparatorNode(legacy as any);
      
      expect(normalized.separatorType).toBe('br');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LIST ITEM TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('List Item Normalization', () => {
  describe('normalizeListItemChildren', () => {
    it('converts ListNode children to ListItem[]', () => {
      const item: any = {
        itemType: 'li',
        content: [{ type: 'plain', value: 'parent' }],
        children: {
          nodeType: 'list',
          listType: 'ul',
          items: [
            { itemType: 'li', content: [{ type: 'plain', value: 'child' }] }
          ],
          line: 1,
          direction: 'rtl',
        },
      };
      
      const normalized = normalizeListItemChildren(item);
      
      expect(Array.isArray(normalized.children)).toBe(true);
      expect(normalized.children).toHaveLength(1);
      expect(normalized.children![0].itemType).toBe('li');
    });

    it('preserves ListItem[] children', () => {
      const item: ListItem = {
        itemType: 'li',
        content: [{ type: 'plain', value: 'parent' }],
        children: [
          { itemType: 'li', content: [{ type: 'plain', value: 'child' }] }
        ],
      };
      
      const normalized = normalizeListItemChildren(item);
      
      expect(normalized.children).toEqual(item.children);
    });

    it('handles items without children', () => {
      const item: ListItem = {
        itemType: 'li',
        content: [{ type: 'plain', value: 'no children' }],
      };
      
      const normalized = normalizeListItemChildren(item);
      
      expect(normalized.children).toBeUndefined();
    });

    it('normalizes nested children recursively', () => {
      const item: any = {
        itemType: 'li',
        content: [{ type: 'plain', value: 'level 1' }],
        children: {
          nodeType: 'list',
          listType: 'ul',
          items: [
            {
              itemType: 'li',
              content: [{ type: 'plain', value: 'level 2' }],
              children: {
                nodeType: 'list',
                listType: 'ul',
                items: [
                  { itemType: 'li', content: [{ type: 'plain', value: 'level 3' }] }
                ],
                line: 1,
                direction: 'rtl',
              },
            }
          ],
          line: 1,
          direction: 'rtl',
        },
      };
      
      const normalized = normalizeListItemChildren(item);
      
      expect(Array.isArray(normalized.children)).toBe(true);
      expect(Array.isArray(normalized.children![0].children)).toBe(true);
    });
  });

  describe('wrapItemsInListNode', () => {
    it('wraps ListItem[] in ListNode', () => {
      const items: ListItem[] = [
        { itemType: 'li', content: [{ type: 'plain', value: 'item 1' }] },
        { itemType: 'li', content: [{ type: 'plain', value: 'item 2' }] },
      ];
      
      const listNode = wrapItemsInListNode(items, 'ul', 1, 'rtl');
      
      expect(listNode.type).toBe('list');
      expect(listNode.listType).toBe('ul');
      expect(listNode.items).toEqual(items);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GUARDS WITH LEGACY SUPPORT
// ═══════════════════════════════════════════════════════════════════════════

describe('Type Guards with Legacy Support', () => {
  describe('isTextNode', () => {
    it('works with type property', () => {
      const node = createNewTextNode();
      expect(isTextNode(node)).toBe(true);
    });

    it('works with nodeType property', () => {
      const node = createLegacyTextNode();
      expect(isTextNode(node)).toBe(true);
    });

    it('rejects non-text nodes', () => {
      const node = createNewSeparatorNode();
      expect(isTextNode(node)).toBe(false);
    });
  });

  describe('isListNode', () => {
    it('works with type property', () => {
      const node: ListNode = {
        type: 'list',
        listType: 'ul',
        items: [],
        line: 1,
        direction: 'rtl',
      };
      expect(isListNode(node)).toBe(true);
    });

    it('works with nodeType property', () => {
      const node: any = {
        nodeType: 'list',
        listType: 'ul',
        items: [],
        line: 1,
        direction: 'rtl',
      };
      expect(isListNode(node)).toBe(true);
    });
  });

  describe('isSeparatorNode', () => {
    it('works with type property', () => {
      const node = createNewSeparatorNode();
      expect(isSeparatorNode(node)).toBe(true);
    });

    it('works with nodeType property', () => {
      const node = createLegacySeparatorNode();
      expect(isSeparatorNode(node)).toBe(true);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// CONTENT NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

describe('Content Normalization', () => {
  describe('normalizeContent', () => {
    it('normalizes all nodes in array', () => {
      const content: any[] = [
        createLegacyTextNode(),
        createLegacySeparatorNode(),
      ];
      
      const normalized = normalizeContent(content);
      
      expect(normalized[0].type).toBe('text');
      expect(normalized[1].type).toBe('separator');
      expect((normalized[1] as SeparatorNode).separatorType).toBe('hr');
    });

    it('normalizes list items', () => {
      const content: any[] = [
        {
          nodeType: 'list',
          listType: 'ul',
          items: [
            {
              itemType: 'li',
              content: [{ type: 'plain', value: 'item' }],
              children: {
                nodeType: 'list',
                listType: 'ul',
                items: [
                  { itemType: 'li', content: [{ type: 'plain', value: 'child' }] }
                ],
                line: 1,
                direction: 'rtl',
              },
            }
          ],
          line: 1,
          direction: 'rtl',
        }
      ];
      
      const normalized = normalizeContent(content);
      const listNode = normalized[0] as ListNode;
      
      expect(listNode.type).toBe('list');
      expect(Array.isArray(listNode.items[0].children)).toBe(true);
    });
  });

  describe('needsMigration', () => {
    it('returns true for legacy content', () => {
      const content: any[] = [createLegacyTextNode()];
      expect(needsMigration(content)).toBe(true);
    });

    it('returns false for new format content', () => {
      const content: ContentNode[] = [createNewTextNode()];
      expect(needsMigration(content)).toBe(false);
    });

    it('returns true for mixed content', () => {
      const content: any[] = [createNewTextNode(), createLegacyTextNode()];
      expect(needsMigration(content)).toBe(true);
    });
  });

  describe('getMigrationStats', () => {
    it('counts legacy and new format nodes', () => {
      const content: any[] = [
        createLegacyTextNode(),
        createLegacyTextNode(),
        createNewTextNode(),
      ];
      
      const stats = getMigrationStats(content);
      
      expect(stats.totalNodes).toBe(3);
      expect(stats.legacyNodes).toBe(2);
      expect(stats.newFormatNodes).toBe(1);
      expect(stats.needsMigration).toBe(true);
    });

    it('reports no migration needed for new format', () => {
      const content: ContentNode[] = [
        createNewTextNode(),
        createNewSeparatorNode(),
      ];
      
      const stats = getMigrationStats(content);
      
      expect(stats.needsMigration).toBe(false);
    });
  });
});
