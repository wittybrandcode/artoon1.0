// ARTOON Serializer - Text Nodes

import { TextNode } from '@artoon/ast';
import { getDirectionMarker } from '../types';
import { serializeInlineContent } from '../inline';

/**
 * Serialize text node (p, t1-t6, q, pre)
 * 
 * Output: {dir}.{type}:: {content}
 */
export function serializeText(node: TextNode): string {
  const dir = getDirectionMarker(node.direction);
  const type = node.textType;
  const content = serializeInlineContent(node.content);
  
  return `${dir}.${type}:: ${content}`;
}
