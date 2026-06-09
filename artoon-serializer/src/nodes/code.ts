// ARTOON Serializer - Inline Code Nodes

import { CodeNode } from '@artoon/ast';
import { getDirectionMarker } from '../types';

/**
 * Serialize inline code node
 * 
 * Output: {dir}.[c:: code] or {dir}.[c:: code; lang]
 */
export function serializeCode(node: CodeNode): string {
  const dir = getDirectionMarker(node.direction);
  
  const parts: string[] = [node.code];
  if (node.language) {
    parts.push(node.language);
  }
  
  return `${dir}.[c:: ${parts.join('; ')}]`;
}
