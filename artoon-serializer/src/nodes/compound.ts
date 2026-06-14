// ARTOON Serializer - Compound Nodes

import { CompoundNode, CompoundChild, ContentNode, TextNode, MediaNode } from '@artoon/ast';
import type { SerializeOptions } from '../types';
import { getDirectionMarker, DEFAULT_OPTIONS } from '../types';
import { serializeInlineContent } from '../inline';

/**
 * Serialize compound node (figure, details)
 * 
 * Output for figure:
 * {dir}.figure::
 * >.-img:: path; alt
 * >.-caption:: text
 * 
 * Output for details:
 * {dir}.details:: summary text
 * {dir}.p:: content
 */
export function serializeCompound(
  node: CompoundNode,
  options: SerializeOptions = DEFAULT_OPTIONS
): string {
  const dir = getDirectionMarker(node.direction);
  const lineEnding = options.lineEnding || '\n';
  const lines: string[] = [];
  
  if (node.compoundType === 'details') {
    // Details with inline summary
    const summary = node.children.find(c => c.role === 'summary');
    if (summary && isTextNode(summary.node)) {
      const summaryText = serializeInlineContent((summary.node as TextNode).content);
      lines.push(`${dir}.details:: ${summaryText}`);
    } else {
      lines.push(`${dir}.details::`);
    }
    
    // Content children
    for (const child of node.children) {
      if (child.role !== 'summary') {
        lines.push(serializeCompoundChild(child, dir));
      }
    }
  } else {
    // Figure
    lines.push(`${dir}.figure::`);
    
    for (const child of node.children) {
      lines.push(serializeCompoundChild(child, dir));
    }
  }
  
  return lines.join(lineEnding);
}

/**
 * Serialize compound child element
 */
function serializeCompoundChild(child: CompoundChild, dir: '>' | '<'): string {
  const node = child.node;
  
  if (isMediaNode(node)) {
    const media = node as MediaNode;
    const parts = [media.src];
    if (media.alt) parts.push(media.alt);
    if (media.title) parts.push(media.title);
    return `${dir}.-${media.mediaType}:: ${parts.join('; ')}`;
  }
  
  if (isTextNode(node)) {
    const text = node as TextNode;
    const content = serializeInlineContent(text.content);
    
    if (child.role === 'caption') {
      return `${dir}.-caption:: ${content}`;
    }
    
    return `${dir}.${text.textType}:: ${content}`;
  }
  
  return '';
}

// Type guards
function isTextNode(node: any): node is TextNode {
  return node && (node.type === 'text' || node.nodeType === 'text');
}

function isMediaNode(node: any): node is MediaNode {
  return node && (node.type === 'media' || node.nodeType === 'media');
}
