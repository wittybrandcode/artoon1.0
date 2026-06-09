// ARTOON Serializer - Node Dispatcher

import {
  ContentNode,
  isTextNode,
  isListNode,
  isTableNode,
  isCompoundNode,
  isBlockNode,
  isMediaNode,
  isLinkNode,
  isCodeNode,
  isSeparatorNode,
  isCommentNode
} from '@artoon/ast';
import type { SerializeOptions } from '../types';
import { DEFAULT_OPTIONS } from '../types';
import { serializeText } from './text';
import { serializeList } from './list';
import { serializeTable } from './table';
import { serializeBlock } from './block';
import { serializeCompound } from './compound';
import { serializeSeparator } from './separator';
import { serializeMedia } from './media';
import { serializeLink } from './link';
import { serializeCode } from './code';
import { serializeComment } from './comment';

/**
 * Serialize any content node to ARTOON text
 */
export function serializeNode(
  node: ContentNode,
  options: SerializeOptions = DEFAULT_OPTIONS
): string {
  if (isTextNode(node)) {
    return serializeText(node);
  }
  
  if (isListNode(node)) {
    return serializeList(node, options);
  }
  
  if (isTableNode(node)) {
    return serializeTable(node, options);
  }
  
  if (isCompoundNode(node)) {
    return serializeCompound(node, options);
  }
  
  if (isBlockNode(node)) {
    return serializeBlock(node, options);
  }
  
  if (isMediaNode(node)) {
    return serializeMedia(node);
  }
  
  if (isLinkNode(node)) {
    return serializeLink(node);
  }
  
  if (isCodeNode(node)) {
    return serializeCode(node);
  }
  
  if (isSeparatorNode(node)) {
    return serializeSeparator(node);
  }
  
  if (isCommentNode(node)) {
    return serializeComment(node);
  }
  
  // Unknown node type
  throw new Error(`Unknown node type: ${(node as any).nodeType}`);
}

// Re-export individual serializers
export { serializeText } from './text';
export { serializeList } from './list';
export { serializeTable } from './table';
export { serializeBlock } from './block';
export { serializeCompound } from './compound';
export { serializeSeparator } from './separator';
export { serializeMedia } from './media';
export { serializeLink } from './link';
export { serializeCode } from './code';
export { serializeComment } from './comment';
