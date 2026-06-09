// ARTOON Serializer - List Nodes
// Phase 18: Flat item-level syntax (no container lines)

import { ListNode, ListItem } from '@artoon/ast';
import type { SerializeOptions } from '../types';
import { getDirectionMarker, DEFAULT_OPTIONS } from '../types';
import { serializeInlineContent } from '../inline';

/**
 * Serialize list node (ul, ol, dl)
 * 
 * Phase 18 output (flat per-item syntax):
 * {dir}.{listType}:: content
 * {dir}.-{listType}:: nested content
 * {dir}.--{listType}:: deeper nested content
 */
export function serializeList(
  node: ListNode,
  options: SerializeOptions = DEFAULT_OPTIONS
): string {
  const dir = getDirectionMarker(node.direction);
  const lines: string[] = [];

  // Emit each item directly with its own type
  for (const item of node.items) {
    serializeListItem(item, 0, dir, node.listType, lines, options);
  }

  return lines.join(options.lineEnding || '\n');
}

/**
 * Serialize list item with depth prefix
 * Each item is emitted as: {dir}.{dashes}{listType}:: content
 */
function serializeListItem(
  item: ListItem,
  depth: number,
  dir: string,
  parentListType: string,
  lines: string[],
  options: SerializeOptions
): void {
  const dashes = '-'.repeat(depth);
  const content = serializeInlineContent(item.content);
  // Use item's own listType if available, otherwise fall back to parent's
  const itemType = item.listType || parentListType;

  lines.push(`${dir}.${dashes}${itemType}:: ${content}`);

  // Nested items
  if (item.children && item.children.length > 0) {
    const childType = item.childListType || itemType;
    for (const child of item.children) {
      serializeListItem(child, depth + 1, dir, childType, lines, options);
    }
  }
}
