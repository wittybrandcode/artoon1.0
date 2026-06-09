// ARTOON AST Node Utilities
// Version 2.0 - Uses new type format with compatibility layer

import {
  ContentNode,
  TextNode,
  ListNode,
  ListItem,
  TableNode,
  CompoundNode,
  BlockNode,
  SeparatorNode,
  InlineContent,
  PlainText,
  InlineComponent,
  Direction,
  Modifier,
  TextType,
  ListType,
  SeparatorType
} from '../types';

import { createCompatNode, getNodeType } from '../compat';

// ============================================================================
// NODE CREATORS
// ============================================================================

/**
 * Create a text node
 */
export function createTextNode(
  textType: TextType,
  content: InlineContent[],
  direction: Direction,
  line: number
): TextNode {
  return createCompatNode<TextNode>({
    type: 'text',
    line,
    direction,
    textType,
    content
  });
}

/**
 * Create a plain text content
 */
export function createPlainText(value: string): PlainText {
  return {
    type: 'plain',
    value
  };
}

/**
 * Create an inline component
 */
export function createInlineComponent(
  component: string | undefined,
  attributes: Record<string, string>,
  modifiers?: Modifier[],
  value?: string
): InlineComponent {
  return {
    type: 'inline',
    attributes,
    ...(component ? { component: component as any } : {}),
    ...(modifiers && modifiers.length > 0 ? { modifiers } : {}),
    ...(value ? { value } : {})
  };
}

/**
 * Create a list node
 */
export function createListNode(
  listType: ListType,
  direction: Direction,
  line: number
): ListNode {
  return createCompatNode<ListNode>({
    type: 'list',
    line,
    direction,
    listType,
    items: []
  });
}

/**
 * Create a separator node
 * 
 * @migration v2.0: Uses separatorType (single) as canonical, keeps separators for compat
 */
export function createSeparatorNode(
  separators: SeparatorType[],
  direction: Direction,
  line: number
): SeparatorNode {
  return createCompatNode<SeparatorNode>({
    type: 'separator',
    line,
    direction,
    separatorType: separators[0], // First separator is the canonical type
    separators // Keep array for backward compatibility
  }) as SeparatorNode;
}

// ============================================================================
// NODE TRAVERSAL
// ============================================================================

/**
 * Visit all nodes in document
 */
export function visitNodes(
  nodes: ContentNode[],
  visitor: (node: ContentNode) => void
): void {
  for (const node of nodes) {
    visitor(node);

    const nodeType = getNodeType(node);

    // Visit children based on node type
    if (nodeType === 'list') {
      const listNode = node as ListNode;
      for (const item of listNode.items) {
        // v2.0: children is ListItem[] (not ListNode)
        if (item.children && Array.isArray(item.children)) {
          // Create a temporary list node to visit children
          visitListItems(item.children, visitor);
        }
      }
    } else if (nodeType === 'compound') {
      for (const child of (node as CompoundNode).children) {
        if (child.node && ('type' in child.node || 'nodeType' in child.node)) {
          visitNodes([child.node as ContentNode], visitor);
        }
      }
    } else if (nodeType === 'block') {
      const block = node as BlockNode;
      if (Array.isArray(block.content)) {
        visitNodes(block.content, visitor);
      }
    }
  }
}

/**
 * Visit list items recursively
 */
function visitListItems(
  items: ListItem[],
  visitor: (node: ContentNode) => void
): void {
  for (const item of items) {
    if (item.children && Array.isArray(item.children)) {
      visitListItems(item.children, visitor);
    }
  }
}

/**
 * Find nodes by type
 */
export function findNodesByType<T extends ContentNode>(
  nodes: ContentNode[],
  nodeType: string
): T[] {
  const result: T[] = [];

  visitNodes(nodes, (node) => {
    if (getNodeType(node) === nodeType) {
      result.push(node as T);
    }
  });

  return result;
}

/**
 * Find all text content in document
 */
export function extractText(nodes: ContentNode[]): string {
  const texts: string[] = [];

  visitNodes(nodes, (node) => {
    if (getNodeType(node) === 'text') {
      const textNode = node as TextNode;
      for (const content of textNode.content) {
        if (content.type === 'plain') {
          texts.push(content.value);
        } else if (content.value) {
          texts.push(content.value);
        }
      }
    }
  });

  return texts.join(' ');
}

/**
 * Count nodes by type
 */
export function countByType(nodes: ContentNode[]): Record<string, number> {
  const counts: Record<string, number> = {};

  visitNodes(nodes, (node) => {
    const nodeType = getNodeType(node);
    counts[nodeType] = (counts[nodeType] || 0) + 1;
  });

  return counts;
}

// ============================================================================
// INLINE CONTENT UTILITIES
// ============================================================================

/**
 * Extract plain text from inline content
 */
export function inlineToText(content: InlineContent[]): string {
  return content
    .map(c => c.type === 'plain' ? c.value : (c.value || ''))
    .join('');
}

/**
 * Check if inline content has modifiers
 */
export function hasModifiers(content: InlineContent[]): boolean {
  return content.some(c =>
    c.type === 'inline' && c.modifiers && c.modifiers.length > 0
  );
}

/**
 * Get all modifiers used in content
 */
export function getModifiers(content: InlineContent[]): Modifier[] {
  const modifiers = new Set<Modifier>();

  for (const c of content) {
    if (c.type === 'inline' && c.modifiers) {
      for (const m of c.modifiers) {
        modifiers.add(m);
      }
    }
  }

  return Array.from(modifiers);
}
