/**
 * ResolvedPos - A position resolved to its context in the document
 */

import type { ContentNode } from '@artoon/ast';
import type { ResolvedPos, Position } from '../types';
import { nodeSize } from './Fragment';

/**
 * Path entry for resolved position
 */
interface PathEntry {
  node: ContentNode;
  index: number;
  offset: number;
}

/**
 * ResolvedPos implementation
 */
export class ResolvedPosImpl implements ResolvedPos {
  readonly pos: Position;
  readonly depth: number;
  readonly path: ContentNode[];
  readonly index: number[];
  
  private readonly pathEntries: PathEntry[];
  private readonly parentNode: ContentNode | null;

  constructor(
    pos: Position,
    pathEntries: PathEntry[],
    parentNode: ContentNode | null
  ) {
    this.pos = pos;
    this.pathEntries = pathEntries;
    this.depth = pathEntries.length;
    this.path = pathEntries.map(e => e.node);
    this.index = pathEntries.map(e => e.index);
    this.parentNode = parentNode;
  }

  /**
   * Get node at given depth (0 = document root)
   */
  node(depth?: number): ContentNode | null {
    const d = depth ?? this.depth;
    if (d < 0 || d >= this.pathEntries.length) {
      return null;
    }
    return this.pathEntries[d].node;
  }

  /**
   * Get index at given depth
   */
  indexAt(depth?: number): number {
    const d = depth ?? this.depth;
    if (d < 0 || d >= this.pathEntries.length) {
      return 0;
    }
    return this.pathEntries[d].index;
  }

  /**
   * Get start position of node at depth
   */
  start(depth?: number): Position {
    const d = depth ?? this.depth;
    if (d === 0) return 0;
    if (d < 0 || d > this.pathEntries.length) {
      return this.pos;
    }
    
    let pos = 0;
    for (let i = 0; i < d; i++) {
      pos += this.pathEntries[i].offset + 1; // +1 for node open
    }
    return pos;
  }

  /**
   * Get end position of node at depth
   */
  end(depth?: number): Position {
    const d = depth ?? this.depth;
    const node = this.node(d);
    if (!node) return this.pos;
    return this.start(d) + nodeSize(node) - 1;
  }

  /**
   * Get node directly before this position
   */
  get nodeBefore(): ContentNode | null {
    if (this.depth === 0) return null;
    const parent = this.node(this.depth - 1);
    if (!parent) return null;
    
    const idx = this.indexAt(this.depth - 1);
    if (idx === 0) return null;
    
    // Get previous sibling
    const content = this.getNodeContent(parent);
    if (content && idx > 0 && idx <= content.length) {
      return content[idx - 1] || null;
    }
    return null;
  }

  /**
   * Get node directly after this position
   */
  get nodeAfter(): ContentNode | null {
    if (this.depth === 0) return null;
    const parent = this.node(this.depth - 1);
    if (!parent) return null;
    
    const idx = this.indexAt(this.depth - 1);
    const content = this.getNodeContent(parent);
    if (content && idx < content.length) {
      return content[idx] || null;
    }
    return null;
  }

  /**
   * Get content array from a node
   */
  private getNodeContent(node: ContentNode): ContentNode[] | null {
    if (node.nodeType === 'block' && Array.isArray(node.content)) {
      return node.content;
    }
    if (node.nodeType === 'compound') {
      return node.children
        .filter(c => 'nodeType' in c.node)
        .map(c => c.node as ContentNode);
    }
    return null;
  }

  /**
   * Get parent node
   */
  get parent(): ContentNode | null {
    return this.node(this.depth - 1);
  }

  /**
   * Position at start of parent
   */
  get parentOffset(): number {
    return this.pos - this.start(this.depth - 1);
  }

  /**
   * Check if at start of parent
   */
  get atStart(): boolean {
    return this.parentOffset === 0;
  }

  /**
   * Check if at end of parent
   */
  get atEnd(): boolean {
    const parent = this.parent;
    if (!parent) return true;
    return this.pos === this.end(this.depth - 1);
  }

  /**
   * Get text offset within text node (if applicable)
   */
  get textOffset(): number {
    const node = this.node(this.depth);
    if (!node || node.nodeType !== 'text') return 0;
    return this.pos - this.start(this.depth);
  }

  /**
   * Check if positions are in same parent
   */
  sameParent(other: ResolvedPosImpl): boolean {
    return this.depth === other.depth && 
           this.start(this.depth - 1) === other.start(other.depth - 1);
  }

  /**
   * Get shared depth with another position
   */
  sharedDepth(pos: Position): number {
    for (let depth = this.depth; depth > 0; depth--) {
      if (this.start(depth - 1) <= pos && this.end(depth - 1) >= pos) {
        return depth;
      }
    }
    return 0;
  }

  /**
   * Get position before node at depth
   */
  before(depth?: number): Position {
    const d = depth ?? this.depth;
    if (d === 0) {
      throw new RangeError('Cannot get position before document');
    }
    return this.start(d) - 1;
  }

  /**
   * Get position after node at depth
   */
  after(depth?: number): Position {
    const d = depth ?? this.depth;
    if (d === 0) {
      throw new RangeError('Cannot get position after document');
    }
    return this.end(d) + 1;
  }
}

/**
 * Resolve a position in a document
 */
export function resolvePos(
  pos: Position,
  content: ContentNode[]
): ResolvedPosImpl {
  const pathEntries: PathEntry[] = [];
  let currentPos = 0;
  let currentContent = content;
  let parentNode: ContentNode | null = null;

  // Walk through document to find position
  while (currentContent.length > 0) {
    let found = false;
    
    for (let i = 0; i < currentContent.length; i++) {
      const node = currentContent[i];
      const size = nodeSize(node);
      
      if (currentPos + size > pos) {
        // Position is within or at this node
        pathEntries.push({
          node,
          index: i,
          offset: currentPos
        });
        
        // Check if we need to go deeper
        if (pos > currentPos && pos < currentPos + size) {
          // Position is inside the node
          const innerContent = getInnerContent(node);
          if (innerContent) {
            currentContent = innerContent;
            currentPos += 1; // Account for node open
            parentNode = node;
            found = true;
            break;
          }
        }
        
        // Position is at node boundary or node has no inner content
        return new ResolvedPosImpl(pos, pathEntries, parentNode);
      }
      
      currentPos += size;
    }
    
    if (!found) break;
  }

  return new ResolvedPosImpl(pos, pathEntries, parentNode);
}

/**
 * Get inner content of a node (if it has any)
 */
function getInnerContent(node: ContentNode): ContentNode[] | null {
  switch (node.nodeType) {
    case 'block':
      if (!node.isCode && Array.isArray(node.content)) {
        return node.content;
      }
      return null;
    case 'compound':
      return node.children
        .filter(c => 'nodeType' in c.node)
        .map(c => c.node as ContentNode);
    default:
      return null;
  }
}
