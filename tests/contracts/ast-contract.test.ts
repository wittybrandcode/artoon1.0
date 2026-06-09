/**
 * AST Contract Tests
 * 
 * These tests define the CONTRACT between packages.
 * They must pass before AND after migration.
 * 
 * Version 2.0 - Updated for new type format with compatibility layer
 * 
 * Run with: npm run test:contracts
 */

import {
  BaseNode,
  ContentNode,
  TextNode,
  ListNode,
  ListItem,
  SeparatorNode,
  InlineContent,
  PlainText,
  InlineComponent,
  isTextNode,
  isListNode,
  isSeparatorNode,
  isPlainText,
  isInlineComponent,
  Direction,
  Modifier,
  ListItemType,
  ListType,
  SeparatorType,
  TextType
} from '../../artoon-ast/src/types';

import { getNodeType, createCompatNode } from '../../artoon-ast/src/compat';

// ═══════════════════════════════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function createTestTextNode(): TextNode {
  return createCompatNode<TextNode>({
    type: 'text',
    textType: 'p',
    line: 1,
    direction: 'rtl',
    content: [{ type: 'plain', value: 'test' }],
  });
}

function createTestListNode(): ListNode {
  return createCompatNode<ListNode>({
    type: 'list',
    listType: 'ul',
    line: 1,
    direction: 'rtl',
    items: [
      {
        itemType: 'li',
        content: [{ type: 'plain', value: 'item 1' }],
      }
    ],
  });
}

function createTestListItem(options?: { withChildren?: boolean }): ListItem {
  const item: ListItem = {
    itemType: 'li',
    content: [{ type: 'plain', value: 'item' }],
  };
  
  if (options?.withChildren) {
    // v2.0: children is ListItem[] (not ListNode)
    item.children = [
      {
        itemType: 'li',
        content: [{ type: 'plain', value: 'child' }],
      }
    ];
  }
  
  return item;
}

function createTestSeparatorNode(): SeparatorNode {
  return createCompatNode<SeparatorNode>({
    type: 'separator',
    separatorType: 'hr',
    line: 1,
    direction: 'rtl',
  });
}

// Legacy format helpers for backward compatibility tests
function createLegacyTextNode(): any {
  return {
    nodeType: 'text',
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

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TESTS - BASE NODE
// ═══════════════════════════════════════════════════════════════════════════

describe('AST Contract Tests', () => {
  
  describe('BaseNode Contract', () => {
    it('MUST have type property (v2.0)', () => {
      const node = createTestTextNode();
      expect(node).toHaveProperty('type');
      expect(typeof node.type).toBe('string');
    });

    it('MAY have nodeType property for backward compatibility', () => {
      const node = createTestTextNode();
      // Compat nodes have both
      expect(node.nodeType).toBe('text');
    });

    it('MUST have line property', () => {
      const node = createTestTextNode();
      expect(node).toHaveProperty('line');
      expect(typeof node.line).toBe('number');
    });

    it('MUST have direction property', () => {
      const node = createTestTextNode();
      expect(node).toHaveProperty('direction');
      expect(['rtl', 'ltr']).toContain(node.direction);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - TYPE GUARDS
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Type Guards Contract', () => {
    it('isTextNode identifies text nodes (new format)', () => {
      const node = createTestTextNode();
      expect(isTextNode(node)).toBe(true);
    });

    it('isTextNode identifies text nodes (legacy format)', () => {
      const node = createLegacyTextNode();
      expect(isTextNode(node)).toBe(true);
    });

    it('isTextNode rejects non-text nodes', () => {
      const node = createTestListNode();
      expect(isTextNode(node)).toBe(false);
    });

    it('isListNode identifies list nodes', () => {
      const node = createTestListNode();
      expect(isListNode(node)).toBe(true);
    });

    it('isListNode rejects non-list nodes', () => {
      const node = createTestTextNode();
      expect(isListNode(node)).toBe(false);
    });

    it('isSeparatorNode identifies separator nodes (new format)', () => {
      const node = createTestSeparatorNode();
      expect(isSeparatorNode(node)).toBe(true);
    });

    it('isSeparatorNode identifies separator nodes (legacy format)', () => {
      const node = createLegacySeparatorNode();
      expect(isSeparatorNode(node)).toBe(true);
    });

    it('isSeparatorNode rejects non-separator nodes', () => {
      const node = createTestTextNode();
      expect(isSeparatorNode(node)).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - TEXT NODE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('TextNode Contract', () => {
    it('MUST have textType property', () => {
      const node = createTestTextNode();
      expect(node).toHaveProperty('textType');
      expect(['p', 't1', 't2', 't3', 't4', 't5', 't6', 'q', 'pre', 'time', 'abbr'])
        .toContain(node.textType);
    });

    it('MUST have content property as array', () => {
      const node = createTestTextNode();
      expect(node).toHaveProperty('content');
      expect(Array.isArray(node.content)).toBe(true);
    });

    it('content items MUST be InlineContent', () => {
      const node = createTestTextNode();
      node.content.forEach(item => {
        expect(item).toHaveProperty('type');
        expect(['plain', 'inline']).toContain(item.type);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - LIST NODE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('ListNode Contract', () => {
    it('MUST have listType property', () => {
      const node = createTestListNode();
      expect(node).toHaveProperty('listType');
      expect(['ul', 'ol', 'dl']).toContain(node.listType);
    });

    it('MUST have items property as array', () => {
      const node = createTestListNode();
      expect(node).toHaveProperty('items');
      expect(Array.isArray(node.items)).toBe(true);
    });

    it('items MUST be ListItem[]', () => {
      const node = createTestListNode();
      node.items.forEach(item => {
        expect(item).toHaveProperty('itemType');
        expect(item).toHaveProperty('content');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - LIST ITEM
  // ═══════════════════════════════════════════════════════════════════════════

  describe('ListItem Contract', () => {
    it('MUST have itemType property', () => {
      const item = createTestListItem();
      expect(item).toHaveProperty('itemType');
      expect(['li', 'dt', 'dd']).toContain(item.itemType);
    });

    it('MUST have content property as array', () => {
      const item = createTestListItem();
      expect(item).toHaveProperty('content');
      expect(Array.isArray(item.content)).toBe(true);
    });

    it('children is optional', () => {
      const item = createTestListItem();
      // children is optional, so this should not throw
      expect(item.children).toBeUndefined();
    });

    it('children structure (v2.0): ListItem[]', () => {
      const item = createTestListItem({ withChildren: true });
      expect(item.children).toBeDefined();
      
      // v2.0: children is ListItem[] (not ListNode)
      expect(Array.isArray(item.children)).toBe(true);
      item.children!.forEach(child => {
        expect(child).toHaveProperty('itemType');
        expect(child).toHaveProperty('content');
        // Should NOT have ListNode properties
        expect(child).not.toHaveProperty('listType');
        expect(child).not.toHaveProperty('items');
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - SEPARATOR NODE
  // ═══════════════════════════════════════════════════════════════════════════

  describe('SeparatorNode Contract', () => {
    it('MUST have separatorType property (v2.0)', () => {
      const node = createTestSeparatorNode();
      expect(node).toHaveProperty('separatorType');
      expect(['br', 'hr', 'wbr']).toContain(node.separatorType);
    });

    it('MAY have separators array for backward compatibility', () => {
      const node = createTestSeparatorNode();
      // Compat nodes may have both
      if (node.separators) {
        expect(Array.isArray(node.separators)).toBe(true);
      }
    });

    it('legacy format with separators[] still works', () => {
      const node = createLegacySeparatorNode();
      expect(isSeparatorNode(node)).toBe(true);
      expect(node.separators).toBeDefined();
      node.separators.forEach((sep: SeparatorType) => {
        expect(['br', 'hr', 'wbr']).toContain(sep);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - INLINE CONTENT
  // ═══════════════════════════════════════════════════════════════════════════

  describe('InlineContent Contract', () => {
    it('PlainText has type="plain" and value', () => {
      const plain: PlainText = { type: 'plain', value: 'test' };
      expect(isPlainText(plain)).toBe(true);
      expect(plain.value).toBe('test');
    });

    it('InlineComponent has type="inline"', () => {
      const inline: InlineComponent = { 
        type: 'inline', 
        modifiers: ['s'],
        attributes: {},
        value: 'bold' 
      };
      expect(isInlineComponent(inline)).toBe(true);
    });

    it('isPlainText correctly identifies plain text', () => {
      const plain: InlineContent = { type: 'plain', value: 'test' };
      const inline: InlineContent = { type: 'inline', attributes: {} };
      
      expect(isPlainText(plain)).toBe(true);
      expect(isPlainText(inline)).toBe(false);
    });

    it('isInlineComponent correctly identifies inline components', () => {
      const plain: InlineContent = { type: 'plain', value: 'test' };
      const inline: InlineContent = { type: 'inline', attributes: {} };
      
      expect(isInlineComponent(inline)).toBe(true);
      expect(isInlineComponent(plain)).toBe(false);
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - TYPE VALUES
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Type Values Contract', () => {
    it('Direction values are rtl or ltr', () => {
      const directions: Direction[] = ['rtl', 'ltr'];
      directions.forEach(dir => {
        expect(['rtl', 'ltr']).toContain(dir);
      });
    });

    it('Modifier values are valid', () => {
      const modifiers: Modifier[] = ['s', 'e', 'u', 'd', 'mark', 'sub', 'sup'];
      modifiers.forEach(mod => {
        expect(['s', 'e', 'u', 'd', 'mark', 'sub', 'sup']).toContain(mod);
      });
    });

    it('ListType values are valid', () => {
      const types: ListType[] = ['ul', 'ol', 'dl'];
      types.forEach(t => {
        expect(['ul', 'ol', 'dl']).toContain(t);
      });
    });

    it('ListItemType values are valid', () => {
      const types: ListItemType[] = ['li', 'dt', 'dd'];
      types.forEach(t => {
        expect(['li', 'dt', 'dd']).toContain(t);
      });
    });

    it('SeparatorType values are valid', () => {
      const types: SeparatorType[] = ['br', 'hr', 'wbr'];
      types.forEach(t => {
        expect(['br', 'hr', 'wbr']).toContain(t);
      });
    });

    it('TextType values are valid', () => {
      const types: TextType[] = ['p', 't1', 't2', 't3', 't4', 't5', 't6', 'q', 'pre', 'time', 'abbr'];
      types.forEach(t => {
        expect(['p', 't1', 't2', 't3', 't4', 't5', 't6', 'q', 'pre', 'time', 'abbr']).toContain(t);
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CONTRACT TESTS - COMPATIBILITY
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Compatibility Contract', () => {
    it('getNodeType works with new format', () => {
      const node = createTestTextNode();
      expect(getNodeType(node)).toBe('text');
    });

    it('getNodeType works with legacy format', () => {
      const node = createLegacyTextNode();
      expect(getNodeType(node)).toBe('text');
    });

    it('createCompatNode creates nodes with both type and nodeType', () => {
      const node = createCompatNode<TextNode>({
        type: 'text',
        textType: 'p',
        line: 1,
        direction: 'rtl',
        content: []
      });
      
      expect(node.type).toBe('text');
      expect(node.nodeType).toBe('text');
    });
  });

});
