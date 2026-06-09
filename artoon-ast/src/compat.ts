/**
 * Compatibility Layer for Type Unification
 * 
 * This module provides functions to handle both old (nodeType) and new (type)
 * formats during the migration period.
 * 
 * @migration Part of Type Unification Plan - Phase 1
 * @deprecated This module will be removed in v3.0 when migration is complete.
 */

import type { 
  BaseNode, 
  ContentNode, 
  ListItem, 
  ListNode,
  SeparatorNode,
  SeparatorType
} from './types';

// ═══════════════════════════════════════════════════════════════════════════
// NODE NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize a node to use the new `type` property.
 * Handles both old (nodeType) and new (type) formats.
 * 
 * @param node - Node that may use old or new format
 * @returns Node with `type` property guaranteed
 * 
 * @example
 * const node = normalizeNode(oldNode);
 * console.log(node.type); // Always available
 */
export function normalizeNode<T extends BaseNode>(node: T): T & { type: string } {
  if (!node.type && (node as any).nodeType) {
    return {
      ...node,
      type: (node as any).nodeType,
    };
  }
  return node as T & { type: string };
}

/**
 * Create a node with both `type` and `nodeType` for compatibility.
 * Use during migration period only.
 * 
 * @param node - Node with `type` property
 * @returns Node with both `type` and `nodeType`
 * 
 * @example
 * const node = createCompatNode({ type: 'text', ... });
 * // node.type === 'text'
 * // node.nodeType === 'text'
 */
export function createCompatNode<T extends BaseNode>(
  node: T
): T & { nodeType: string } {
  return {
    ...node,
    nodeType: node.type,
  } as T & { nodeType: string };
}

/**
 * Check if a node uses the legacy format (nodeType only).
 * 
 * @param node - Any node object
 * @returns true if node uses legacy format
 */
export function isLegacyNode(node: any): boolean {
  return 'nodeType' in node && !('type' in node);
}

/**
 * Check if a node uses the new format (type property).
 * 
 * @param node - Any node object
 * @returns true if node uses new format
 */
export function isNewFormatNode(node: any): boolean {
  return 'type' in node;
}

/**
 * Get the type value from a node, regardless of format.
 * 
 * @param node - Node in any format
 * @returns The type value
 */
export function getNodeType(node: any): string {
  return node.type || node.nodeType;
}

// ═══════════════════════════════════════════════════════════════════════════
// SEPARATOR NODE NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize separator node from old format (separators[]) to new (separatorType).
 * 
 * @param node - SeparatorNode in any format
 * @returns SeparatorNode with separatorType
 */
export function normalizeSeparatorNode(node: SeparatorNode): SeparatorNode {
  const normalized = normalizeNode(node);
  
  // Convert separators[] to separatorType
  if ((node as any).separators && !node.separatorType) {
    return {
      ...normalized,
      separatorType: (node as any).separators[0] as SeparatorType,
    };
  }
  
  return normalized;
}

/**
 * Create a separator node with both old and new formats.
 * 
 * @param separatorType - The separator type
 * @param line - Line number
 * @param direction - Text direction
 * @returns SeparatorNode with both formats
 */
export function createCompatSeparatorNode(
  separatorType: SeparatorType,
  line: number,
  direction: 'rtl' | 'ltr'
): SeparatorNode & { separators: SeparatorType[] } {
  return {
    type: 'separator',
    nodeType: 'separator',
    separatorType,
    separators: [separatorType],
    line,
    direction,
  } as SeparatorNode & { separators: SeparatorType[] };
}

// ═══════════════════════════════════════════════════════════════════════════
// LIST ITEM NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize list item children from old format (ListNode) to new (ListItem[]).
 * 
 * @param item - ListItem in any format
 * @returns ListItem with children as ListItem[]
 */
export function normalizeListItemChildren(item: ListItem): ListItem {
  const children = item.children as any;
  
  // If children is a ListNode (has items property), extract items
  if (children && 'items' in children) {
    return {
      ...item,
      children: (children.items as ListItem[]).map(normalizeListItemChildren),
    };
  }
  
  // If children is already ListItem[], normalize recursively
  if (Array.isArray(children)) {
    return {
      ...item,
      children: children.map(normalizeListItemChildren),
    };
  }
  
  return item;
}

/**
 * Convert new format ListItem[] to old format ListNode.
 * Used for backward compatibility with consumers expecting old format.
 * 
 * @param items - Array of ListItem
 * @param listType - Type of list (ul, ol, dl)
 * @param line - Line number
 * @param direction - Text direction
 * @returns ListNode wrapping the items
 */
export function wrapItemsInListNode(
  items: ListItem[],
  listType: 'ul' | 'ol' | 'dl',
  line: number,
  direction: 'rtl' | 'ltr'
): ListNode {
  return {
    type: 'list',
    nodeType: 'list',
    listType,
    items,
    line,
    direction,
  } as ListNode;
}

// ═══════════════════════════════════════════════════════════════════════════
// DOCUMENT NORMALIZATION
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Normalize all nodes in a content array.
 * 
 * @param content - Array of content nodes
 * @returns Normalized content array
 */
export function normalizeContent(content: ContentNode[]): ContentNode[] {
  return content.map(node => {
    const normalized = normalizeNode(node);
    
    // Handle specific node types
    if (getNodeType(node) === 'separator') {
      return normalizeSeparatorNode(node as SeparatorNode);
    }
    
    if (getNodeType(node) === 'list') {
      const listNode = normalized as ListNode;
      return {
        ...listNode,
        items: listNode.items.map(normalizeListItemChildren),
      };
    }
    
    return normalized;
  });
}

// ═══════════════════════════════════════════════════════════════════════════
// MIGRATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Check if content needs migration (contains legacy format nodes).
 * 
 * @param content - Array of content nodes
 * @returns true if any node uses legacy format
 */
export function needsMigration(content: ContentNode[]): boolean {
  return content.some(node => isLegacyNode(node));
}

/**
 * Migration statistics for a document.
 */
export interface MigrationStats {
  totalNodes: number;
  legacyNodes: number;
  newFormatNodes: number;
  needsMigration: boolean;
}

/**
 * Get migration statistics for content.
 * 
 * @param content - Array of content nodes
 * @returns Migration statistics
 */
export function getMigrationStats(content: ContentNode[]): MigrationStats {
  let legacyNodes = 0;
  let newFormatNodes = 0;
  
  function countNode(node: any) {
    if (isLegacyNode(node)) {
      legacyNodes++;
    } else if (isNewFormatNode(node)) {
      newFormatNodes++;
    }
  }
  
  content.forEach(countNode);
  
  return {
    totalNodes: content.length,
    legacyNodes,
    newFormatNodes,
    needsMigration: legacyNodes > 0,
  };
}
