/**
 * Selection helpers - utilities for finding valid selections
 */

import type { ContentNode } from '@artoon/ast';
import type { Selection, Position } from '../types';
import { DocumentImpl } from '../state/Document';
import { TextSelectionImpl, NodeSelectionImpl } from './Selection';
import { nodeSize } from '../state/Fragment';

/**
 * Find a valid selection near the given position
 */
export function findSelectionNear(
  doc: DocumentImpl,
  pos: Position,
  bias: -1 | 1 = 1
): Selection {
  // Clamp position to valid range
  pos = Math.max(1, Math.min(doc.size - 1, pos));
  
  // Try to find a text position
  const node = doc.nodeAt(pos);
  if (node && isTextNode(node)) {
    return TextSelectionImpl.at(pos, doc);
  }
  
  // Search in bias direction
  const searchPos = bias === 1 
    ? findForward(doc, pos) 
    : findBackward(doc, pos);
  
  if (searchPos !== null) {
    return TextSelectionImpl.at(searchPos, doc);
  }
  
  // Search in opposite direction
  const oppositePos = bias === 1 
    ? findBackward(doc, pos) 
    : findForward(doc, pos);
  
  if (oppositePos !== null) {
    return TextSelectionImpl.at(oppositePos, doc);
  }
  
  // Fallback to start of document
  return TextSelectionImpl.at(1, doc);
}

/**
 * Find selection at start of document
 */
export function findSelectionAtStart(doc: DocumentImpl): Selection {
  return findSelectionNear(doc, 1, 1);
}

/**
 * Find selection at end of document
 */
export function findSelectionAtEnd(doc: DocumentImpl): Selection {
  return findSelectionNear(doc, doc.size - 1, -1);
}

/**
 * Find selection in a specific node
 */
export function findSelectionIn(
  doc: DocumentImpl,
  node: ContentNode,
  pos: Position,
  bias: -1 | 1 = 1
): Selection | null {
  if (isTextNode(node)) {
    // For text nodes, position at start or end based on bias
    const start = pos + 1;
    const end = pos + nodeSize(node) - 1;
    return TextSelectionImpl.at(bias === 1 ? start : end, doc);
  }
  
  if (NodeSelectionImpl.isSelectable(node)) {
    return NodeSelectionImpl.create(doc, pos);
  }
  
  return null;
}

/**
 * Search forward for a valid text position
 */
function findForward(doc: DocumentImpl, start: Position): Position | null {
  let pos = start;
  
  while (pos < doc.size - 1) {
    const node = doc.nodeAt(pos);
    if (node && isTextNode(node)) {
      return pos;
    }
    pos++;
  }
  
  return null;
}

/**
 * Search backward for a valid text position
 */
function findBackward(doc: DocumentImpl, start: Position): Position | null {
  let pos = start;
  
  while (pos > 0) {
    const node = doc.nodeAt(pos);
    if (node && isTextNode(node)) {
      return pos;
    }
    pos--;
  }
  
  return null;
}

/**
 * Check if node is a text-containing node
 */
function isTextNode(node: ContentNode): boolean {
  return node.nodeType === 'text';
}

/**
 * Check if position is at block boundary
 */
export function atBlockBoundary(
  doc: DocumentImpl,
  pos: Position,
  dir: -1 | 1 = 1
): boolean {
  const resolved = doc.resolve(pos);
  
  if (dir === 1) {
    return resolved.nodeAfter !== null && 
           resolved.nodeAfter.nodeType !== 'text';
  } else {
    return resolved.nodeBefore !== null && 
           resolved.nodeBefore.nodeType !== 'text';
  }
}

/**
 * Get the depth at which two positions diverge
 */
export function selectionDepth(
  doc: DocumentImpl,
  from: Position,
  to: Position
): number {
  const $from = doc.resolve(from);
  const $to = doc.resolve(to);
  
  let depth = 0;
  while (
    depth < $from.depth && 
    depth < $to.depth &&
    $from.node(depth) === $to.node(depth)
  ) {
    depth++;
  }
  
  return depth;
}
