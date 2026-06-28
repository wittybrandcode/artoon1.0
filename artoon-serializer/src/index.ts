// ARTOON Serializer
// Converts AST to ARTOON text format

import { ARTOONDocument, ContentNode, InlineContent } from '@artoon/ast';
import type { SerializeOptions } from './types';
import { DEFAULT_OPTIONS } from './types';
import { serializeNode, serializeBlock } from './nodes';
import { serializeInlineContent } from './inline';

export interface SerializeStateInput {
  doc?: {
    toAST?: () => unknown;
    ast?: unknown;
  };
  toJSON?: () => { doc?: unknown };
}

/**
 * Serialize ARTOON document to text
 * 
 * @param doc - ARTOON document AST (can have BlockNode in meta for parser output)
 * @param options - Serialization options
 * @returns ARTOON text
 */
export function serialize(
  doc: ARTOONDocument | { version: string; meta?: any; content: ContentNode[] },
  options: SerializeOptions = {}
): string {
  const opts: Required<SerializeOptions> = { ...DEFAULT_OPTIONS, ...options };
  const lines: string[] = [];
  
  // Serialize META block first if present
  // Handle both BlockNode (from parser) and DocumentMeta (from AST)
  if (doc && doc.meta) {
    // Check if it's a BlockNode (has type property)
    if (typeof doc.meta === 'object' && 'type' in doc.meta && doc.meta.type === 'block') {
      const metaSerialized = serializeBlock(doc.meta as any, opts);
      lines.push(metaSerialized);
      
      // Add blank line after META if there's content
      const childrenCount = doc.content ? doc.content.length : ((doc as any).children ? (doc as any).children.length : 0);
      if (childrenCount > 0 && opts.blankLinesBetween) {
        lines.push('');
      }
    }
    // Otherwise it's DocumentMeta - skip for now (could be serialized as META block in future)
  }
  
  // Handle both AST shapes: `content` or `children`
  const children = doc ? (doc.content || (doc as any).children || []) : [];
  if (children.length > 0) {
    for (let i = 0; i < children.length; i++) {
      const node = children[i];

      // Skip comments if not preserving
      if (!opts.preserveComments && node.nodeType === 'comment') {
        continue;
      }

      // Serialize node
      const serialized = serializeNode(node, opts);
      lines.push(serialized);

      // Add blank line between elements (except last)
      if (opts.blankLinesBetween && i < children.length - 1) {
        lines.push('');
      }
    }
  }
  
  return lines.join(opts.lineEnding);
}

/**
 * Serialize from state kernel shape (EditorState-like).
 */
export function serializeState(
  state: SerializeStateInput,
  options: SerializeOptions = {}
): string {
  return serialize(resolveStateDocument(state), options);
}

/**
 * Serialize single content node to text
 * 
 * @param node - Content node
 * @param options - Serialization options
 * @returns ARTOON text
 */
export { serializeNode } from './nodes';

/**
 * Serialize inline content array to text
 * 
 * @param content - Inline content array
 * @returns Inline text
 */
export { serializeInlineContent } from './inline';

// Re-export types
export type { SerializeOptions } from './types';
export { DEFAULT_OPTIONS, getDirectionMarker } from './types';

// Re-export individual node serializers for advanced use
export {
  serializeText,
  serializeList,
  serializeTable,
  serializeBlock,
  serializeCompound,
  serializeSeparator,
  serializeMedia,
  serializeLink,
  serializeCode,
  serializeComment
} from './nodes';

/**
 * Serializer version
 */
export const VERSION = '1.0.0';

function resolveStateDocument(state: SerializeStateInput): ARTOONDocument {
  const doc = state?.doc;
  if (doc?.toAST) {
    const ast = doc.toAST();
    if (isArtoonDocument(ast)) return ast;
  }
  if (isArtoonDocument(doc?.ast)) {
    return doc.ast;
  }

  const jsonDoc = state?.toJSON?.().doc;
  if (isArtoonDocument(jsonDoc)) {
    return jsonDoc;
  }

  throw new Error('Invalid state input: expected state.doc.toAST() or state.toJSON().doc');
}

function isArtoonDocument(value: unknown): value is ARTOONDocument {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as { version?: unknown; content?: unknown };
  return typeof candidate.version === 'string' && Array.isArray(candidate.content);
}
