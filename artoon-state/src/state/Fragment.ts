/**
 * Fragment - A collection of nodes with position-aware operations
 */

import type { ContentNode } from '@artoon/ast';
import type { Fragment, Position } from '../types';

/**
 * Calculate the size of a node in positions
 */
export function nodeSize(node: ContentNode): number {
  switch (node.nodeType) {
    case 'text':
      // Text node: 1 (open) + content size + 1 (close)
      return 2 + textContentSize(node.content);
    case 'separator':
      return 1;
    case 'comment':
      return 1;
    case 'list':
      // List: 1 + items size + 1
      // children is now ListItem[] directly, not ListNode
      return 2 + node.items.reduce((sum, item) => {
        const contentSize = textContentSize(item.content);
        // Handle children as ListItem[] (new format) or ListNode (old format)
        let childrenSize = 0;
        if (item.children) {
          if (Array.isArray(item.children)) {
            // New format: ListItem[]
            childrenSize = item.children.reduce((s, child) => {
              const childContentSize = textContentSize(child.content);
              const nestedSize = child.children ? nodeSize({ type: 'list', nodeType: 'list', listType: node.listType, items: child.children, line: node.line, direction: node.direction } as ContentNode) : 0;
              return s + 1 + childContentSize + nestedSize;
            }, 0);
          } else if ('items' in (item.children as any)) {
            // Old format: ListNode
            childrenSize = nodeSize(item.children as unknown as ContentNode);
          }
        }
        return sum + 1 + contentSize + childrenSize;
      }, 0);
    case 'table':
      // Table: 1 + rows size + 1
      const headerSize = node.headers
        ? 1 + node.headers.cells.reduce((s, c) => s + 1 + textContentSize(c.content), 0)
        : 0;
      const rowsSize = node.rows.reduce((sum, row) =>
        sum + 1 + row.cells.reduce((s, c) => s + 1 + textContentSize(c.content), 0), 0);
      return 2 + headerSize + rowsSize;
    case 'block':
      if (node.isCode) {
        // Code block: content is string
        return 2 + (typeof node.content === 'string' ? node.content.length : 0);
      }
      // Regular block: nested content
      return 2 + (Array.isArray(node.content)
        ? node.content.reduce((sum, n) => sum + nodeSize(n), 0)
        : 0);
    case 'compound':
      return 2 + node.children.reduce((sum, child) => {
        if ('nodeType' in child.node) {
          return sum + nodeSize(child.node as ContentNode);
        }
        return sum + 1;
      }, 0);
    case 'media':
    case 'link':
    case 'code':
      return 1;
    default:
      return 1;
  }
}

/**
 * Calculate size of inline content array
 * Handles: InlineContent[], ParsedContent, string, undefined
 */
function textContentSize(content: any): number {
  // Handle undefined/null
  if (!content) {
    return 0;
  }

  // Handle string content (code blocks)
  if (typeof content === 'string') {
    return content.length;
  }

  // Handle ParsedContent from parser (has 'text' property)
  if (content.text !== undefined && typeof content.text === 'string') {
    return content.text.length;
  }

  // Handle array of InlineContent
  if (Array.isArray(content)) {
    return content.reduce((sum: number, item: any) => {
      if (!item) return sum;

      // PlainText: { type: 'plain', value: string }
      if (item.type === 'plain' && typeof item.value === 'string') {
        return sum + item.value.length;
      }

      // InlineComponent: { type: 'inline', value?: string }
      if (item.type === 'inline') {
        return sum + (item.value?.length || 1);
      }

      // Fallback for any other structure
      if (typeof item.value === 'string') {
        return sum + item.value.length;
      }

      return sum + 1;
    }, 0);
  }

  // Unknown structure - return 0
  return 0;
}

/**
 * Fragment implementation
 */
export class FragmentImpl implements Fragment {
  private readonly nodes: ContentNode[];
  private _size: number | null = null;

  constructor(nodes: ContentNode[]) {
    this.nodes = nodes;
  }

  /**
   * Create fragment from nodes
   */
  static from(nodes: ContentNode | readonly ContentNode[] | null): FragmentImpl {
    if (!nodes) {
      return FragmentImpl.empty;
    }
    if (Array.isArray(nodes)) {
      return new FragmentImpl([...nodes]);
    }
    return new FragmentImpl([nodes as ContentNode]);
  }

  /**
   * Empty fragment singleton
   */
  static readonly empty = new FragmentImpl([]);

  get childCount(): number {
    return this.nodes.length;
  }

  get size(): number {
    if (this._size === null) {
      this._size = this.nodes.reduce((sum, node) => sum + nodeSize(node), 0);
    }
    return this._size;
  }

  get firstChild(): ContentNode | null {
    return this.nodes[0] || null;
  }

  get lastChild(): ContentNode | null {
    return this.nodes[this.nodes.length - 1] || null;
  }

  child(index: number): ContentNode {
    const node = this.nodes[index];
    if (!node) {
      throw new RangeError(`Index ${index} out of range for fragment with ${this.childCount} children`);
    }
    return node;
  }

  forEach(fn: (node: ContentNode, offset: number, index: number) => void): void {
    let offset = 0;
    for (let i = 0; i < this.nodes.length; i++) {
      fn(this.nodes[i], offset, i);
      offset += nodeSize(this.nodes[i]);
    }
  }

  findIndex(pos: Position): { index: number; offset: number } {
    if (pos === 0) {
      return { index: 0, offset: 0 };
    }

    let offset = 0;
    for (let i = 0; i < this.nodes.length; i++) {
      const size = nodeSize(this.nodes[i]);
      if (offset + size > pos) {
        return { index: i, offset };
      }
      offset += size;
    }

    return { index: this.nodes.length, offset };
  }

  /**
   * Get node at position within fragment
   */
  nodeAt(pos: Position): ContentNode | null {
    const { index, offset } = this.findIndex(pos);
    if (index >= this.nodes.length) {
      return null;
    }
    const node = this.nodes[index];
    if (pos === offset) {
      return node;
    }
    // Position is inside the node
    return node;
  }

  /**
   * Create new fragment with nodes replaced
   */
  replaceChild(index: number, node: ContentNode): FragmentImpl {
    const newNodes = [...this.nodes];
    newNodes[index] = node;
    return new FragmentImpl(newNodes);
  }

  /**
   * Append content to fragment
   */
  append(other: FragmentImpl): FragmentImpl {
    if (other.childCount === 0) return this;
    if (this.childCount === 0) return other;
    return new FragmentImpl([...this.nodes, ...other.nodes]);
  }

  /**
   * Cut fragment between positions
   */
  cut(from: Position, to?: Position): FragmentImpl {
    if (to === undefined) to = this.size;
    if (from === 0 && to === this.size) return this;
    if (from >= to) return FragmentImpl.empty;

    const result: ContentNode[] = [];
    let pos = 0;

    for (const node of this.nodes) {
      const size = nodeSize(node);
      const nodeEnd = pos + size;

      // Skip nodes entirely before the range
      if (nodeEnd <= from) {
        pos = nodeEnd;
        continue;
      }

      // Stop if we've passed the range
      if (pos >= to) {
        break;
      }

      // Node overlaps with range - include it
      // Note: For proper slicing we'd need to handle partial nodes,
      // but for block-level operations, we include the full node
      if (pos >= from && nodeEnd <= to) {
        // Fully inside range
        result.push(node);
      } else if (pos < from && nodeEnd > to) {
        // Range is entirely within this node - include it
        result.push(node);
      } else if (pos < from && nodeEnd > from) {
        // Node starts before range but extends into it
        result.push(node);
      } else if (pos < to && nodeEnd > to) {
        // Node starts in range but extends past it
        result.push(node);
      }

      pos = nodeEnd;
    }

    return new FragmentImpl(result);
  }

  toArray(): ContentNode[] {
    return [...this.nodes];
  }

  /**
   * Check equality
   */
  eq(other: FragmentImpl): boolean {
    if (this.childCount !== other.childCount) return false;
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i] !== other.nodes[i]) return false;
    }
    return true;
  }

  toJSON(): ContentNode[] {
    return this.nodes;
  }
}
