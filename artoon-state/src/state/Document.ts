/**
 * Document - Wrapper around ARTOONDocument with position-based operations
 */

import type { ARTOONDocument, ContentNode } from '@artoon/ast';
import type { Document, Position, ResolvedPos } from '../types';
import { FragmentImpl, nodeSize } from './Fragment';
import { SliceImpl } from './Slice';
import { ResolvedPosImpl, resolvePos } from './ResolvedPos';

export { nodeSize };

/**
 * Document implementation
 */
export class DocumentImpl implements Document {
  readonly ast: ARTOONDocument;
  readonly content: FragmentImpl;
  private _size: number | null = null;

  constructor(ast: ARTOONDocument) {
    this.ast = ast;
    this.content = FragmentImpl.from(ast.content as ContentNode[]); // Copy readonly ast content
  }

  /**
   * Create document from AST
   */
  static create(ast: ARTOONDocument): DocumentImpl {
    return new DocumentImpl(ast);
  }

  /**
   * Create empty document
   */
  static empty(): DocumentImpl {
    return new DocumentImpl({
      version: '1.0',
      content: []
    });
  }

  /**
   * Total size in positions
   * Document size = 1 (open) + content size + 1 (close)
   */
  get size(): number {
    if (this._size === null) {
      this._size = this.content.size + 2;
    }
    return this._size;
  }

  /**
   * Get node at position
   */
  nodeAt(pos: Position): ContentNode | null {
    if (pos < 0 || pos >= this.size) {
      return null;
    }
    // Adjust for document open position
    return this.content.nodeAt(pos - 1);
  }

  /**
   * Resolve position to context
   */
  resolve(pos: Position): ResolvedPos {
    if (pos < 0) pos = 0;
    if (pos > this.size) pos = this.size;
    return resolvePos(pos - 1, this.ast.content as ContentNode[]); // Convert readonly back to mutable for internal resolving
  }

  /**
   * Get slice between positions
   */
  slice(from: Position, to?: Position): SliceImpl {
    if (to === undefined) to = this.size - 1;

    // Clamp positions
    from = Math.max(0, from);
    to = Math.min(this.size - 1, to);

    if (from >= to) {
      return SliceImpl.empty;
    }

    // Adjust for document boundaries
    const adjustedFrom = Math.max(0, from - 1);
    const adjustedTo = Math.min(this.content.size, to - 1);

    const content = this.content.cut(adjustedFrom, adjustedTo);
    return new SliceImpl(content, 0, 0);
  }

  /**
   * Replace range with slice
   * 
   * Position model:
   * - Position 0 is document open
   * - Position 1 is start of first node (node open position)
   * - Position 2 is first character inside first node
   * - Content positions are 1-indexed relative to document
   * 
   * For a text node with content "مرحبا" (5 chars):
   * - nodeStart = 1 (node open)
   * - positions 2-6 are the characters
   * - nodeEnd = 7 (node close)
   * - total size = 7 (1 open + 5 content + 1 close)
   */
  replace(from: Position, to: Position, slice: SliceImpl): DocumentImpl {
    // Convert document positions to content positions (0-indexed within content array)
    // from=1 means start of first node, which is content position 0
    const contentFrom = Math.max(0, from - 1);
    const contentTo = Math.max(0, to - 1);

    const nodes = this.content.toArray();
    const result: ContentNode[] = [];
    let pos = 0;
    let replaced = false;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const size = nodeSize(node);
      const nodeStart = pos;
      const nodeEnd = pos + size;

      // Check if this node overlaps with the replacement range
      // A node overlaps if: nodeStart < contentTo AND nodeEnd > contentFrom
      const overlapsRange = nodeStart < contentTo && nodeEnd > contentFrom;

      if (!overlapsRange) {
        // Node doesn't overlap - keep it as is
        result.push(node);
      } else {
        // Node overlaps with the range
        if (!replaced) {
          // Add the replacement content (only once)
          const sliceNodes = slice.content.toArray();
          result.push(...sliceNodes);
          replaced = true;
        }
        // Skip this node (it's being replaced)
      }

      pos = nodeEnd;
    }

    // If we never replaced anything (empty document or insertion at end)
    if (!replaced && slice.content.childCount > 0) {
      result.push(...slice.content.toArray());
    }

    return new DocumentImpl({
      ...this.ast,
      content: result
    });
  }

  /**
   * Replace range with nodes
   */
  replaceWith(from: Position, to: Position, nodes: ContentNode | readonly ContentNode[]): DocumentImpl {
    const content = Array.isArray(nodes) ? [...nodes] : [nodes];
    const slice = new SliceImpl(FragmentImpl.from(content), 0, 0);
    return this.replace(from, to, slice);
  }

  /**
   * Insert nodes at position
   */
  insert(pos: Position, nodes: ContentNode | readonly ContentNode[]): DocumentImpl {
    return this.replaceWith(pos, pos, nodes);
  }

  /**
   * Delete range
   */
  delete(from: Position, to: Position): DocumentImpl {
    return this.replace(from, to, SliceImpl.empty);
  }

  /**
   * Get child at index
   */
  child(index: number): ContentNode {
    return this.content.child(index);
  }

  /**
   * Number of top-level children
   */
  get childCount(): number {
    return this.content.childCount;
  }

  /**
   * First child
   */
  get firstChild(): ContentNode | null {
    return this.content.firstChild;
  }

  /**
   * Last child
   */
  get lastChild(): ContentNode | null {
    return this.content.lastChild;
  }

  /**
   * Iterate children
   */
  forEach(fn: (node: ContentNode, offset: number, index: number) => void): void {
    this.content.forEach((node, offset, index) => {
      fn(node, offset + 1, index); // +1 for document open
    });
  }

  /**
   * Find position of node
   */
  positionOf(node: ContentNode): Position | null {
    let pos = 1; // Start after document open
    for (let i = 0; i < this.content.childCount; i++) {
      const child = this.content.child(i);
      if (child === node) {
        return pos;
      }
      pos += nodeSize(child);
    }
    return null;
  }

  /**
   * Convert back to AST
   */
  toAST(): ARTOONDocument {
    return {
      ...this.ast,
      content: this.content.toArray()
    };
  }

  /**
   * Convert to JSON
   */
  toJSON(): unknown {
    return this.ast;
  }

  /**
   * Create from JSON
   */
  static fromJSON(json: ARTOONDocument): DocumentImpl {
    return new DocumentImpl(json);
  }

  /**
   * Check equality
   */
  eq(other: DocumentImpl): boolean {
    return this.content.eq(other.content);
  }

  /**
   * Get text content (for debugging/display)
   */
  get textContent(): string {
    const texts: string[] = [];

    const extractText = (node: ContentNode): void => {
      if (node.nodeType === 'text') {
        for (const item of node.content) {
          if (item.type === 'plain') {
            texts.push(item.value);
          } else if (item.value) {
            texts.push(item.value);
          }
        }
      } else if (node.nodeType === 'list') {
        for (const item of node.items) {
          for (const c of item.content) {
            if (c.type === 'plain') {
              texts.push(c.value);
            }
          }
        }
      }
    };

    this.content.forEach(extractText);
    return texts.join('\n');
  }
}
