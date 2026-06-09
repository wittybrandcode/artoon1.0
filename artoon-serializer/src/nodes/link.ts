// ARTOON Serializer - Link Nodes

import { LinkNode } from '@artoon/ast';
import { getDirectionMarker } from '../types';

/**
 * Serialize link node
 * 
 * Output: {dir}.a:: url; text
 * With modifiers: {dir}.[s+a:: url; text]
 */
export function serializeLink(node: LinkNode): string {
  const dir = getDirectionMarker(node.direction);
  
  // Build value
  const parts: string[] = [node.url];
  if (node.text) {
    parts.push(node.text);
  }
  const value = parts.join('; ');
  
  // With modifiers
  if (node.modifiers && node.modifiers.length > 0) {
    const mods = node.modifiers.join('+');
    return `${dir}.[${mods}+a:: ${value}]`;
  }
  
  // Simple link
  return `${dir}.a:: ${value}`;
}
