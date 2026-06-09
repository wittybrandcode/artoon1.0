// ARTOON Serializer - Separator Nodes

import { SeparatorNode } from '@artoon/ast';
import { getDirectionMarker } from '../types';

/**
 * Serialize separator node (br, hr, wbr)
 * 
 * Output: {dir}.{sep}
 * Note: Separators don't use :: because they have no content
 * 
 * @migration v2.0: Uses separatorType (single value) instead of separators[]
 */
export function serializeSeparator(node: SeparatorNode): string {
  const dir = getDirectionMarker(node.direction);
  
  // v2.0: Use separatorType (single value)
  // Fall back to separators[0] for backward compatibility
  const sep = node.separatorType || (node.separators && node.separators[0]) || 'hr';
  
  return `${dir}.${sep}`;
}
