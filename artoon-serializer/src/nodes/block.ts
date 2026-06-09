// ARTOON Serializer - Block Nodes

import { BlockNode, MetaField } from '@artoon/ast';
import type { SerializeOptions } from '../types';
import { DEFAULT_OPTIONS } from '../types';

/**
 * Serialize block node (code, meta, custom blocks)
 * 
 * Output:
 * <blockName>. or <blockName:lang>.
 * content
 * .<blockName>
 */
export function serializeBlock(
  node: BlockNode,
  options: SerializeOptions = DEFAULT_OPTIONS
): string {
  const lineEnding = options.lineEnding || '\n';
  const lines: string[] = [];
  
  // Block start
  if (node.language) {
    lines.push(`<${node.blockName}:${node.language}>.`);
  } else {
    lines.push(`<${node.blockName}>.`);
  }
  
  // Block content
  if (node.isCode || node.blockName === 'code') {
    // Code blocks: raw content only
    if (typeof node.content === 'string') {
      lines.push(node.content);
    }
  } else if (node.blockName === 'meta') {
    // META blocks: fields only, no content
    if (node.fields && node.fields.length > 0) {
      for (const field of node.fields) {
        lines.push(serializeField(field));
      }
    }
    // Don't serialize content for META blocks
  } else {
    // Custom blocks: fields + content
    if (node.fields && node.fields.length > 0) {
      for (const field of node.fields) {
        lines.push(serializeField(field));
      }
    }
    
    if (typeof node.content === 'string' && node.content.trim()) {
      lines.push(node.content);
    }
  }
  
  // Block end
  lines.push(`.<${node.blockName}>`);
  
  return lines.join(lineEnding);
}

/**
 * Serialize hidden field
 * 
 * Output: >.-:fieldName: value
 */
function serializeField(field: MetaField): string {
  const dir = field.direction === 'rtl' ? '>' : '<';
  return `${dir}.-:${field.name}: ${field.value}`;
}
