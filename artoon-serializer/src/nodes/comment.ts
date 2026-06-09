// ARTOON Serializer - Comment Nodes

import { CommentNode } from '@artoon/ast';
import { getDirectionMarker } from '../types';

/**
 * Serialize comment node
 * 
 * Output: {dir}.::: comment text
 */
export function serializeComment(node: CommentNode): string {
  const dir = getDirectionMarker(node.direction);
  return `${dir}.::: ${node.content}`;
}
