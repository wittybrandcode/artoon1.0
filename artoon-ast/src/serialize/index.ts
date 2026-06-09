// ARTOON AST Serialization
// Convert AST to JSON/YAML

import { ARTOONDocument } from '../types';

/**
 * Serialize AST to JSON string
 */
export function toJSON(doc: ARTOONDocument, pretty: boolean = true): string {
  return JSON.stringify(doc, null, pretty ? 2 : 0);
}

/**
 * Parse JSON string to AST
 */
export function fromJSON(json: string): ARTOONDocument {
  const parsed = JSON.parse(json);

  // Validate version
  if (parsed.version !== '1.0' && parsed.version !== '2.0') {
    throw new Error(`Unsupported AST version: ${parsed.version}`);
  }

  return parsed as ARTOONDocument;
}

/**
 * Serialize AST to compact JSON (no whitespace)
 */
export function toCompactJSON(doc: ARTOONDocument): string {
  return JSON.stringify(doc);
}

/**
 * Clone AST document (deep copy)
 */
export function clone(doc: ARTOONDocument): ARTOONDocument {
  return JSON.parse(JSON.stringify(doc));
}

/**
 * Get document statistics
 */
export function getStats(doc: ARTOONDocument): DocumentStats {
  const stats: DocumentStats = {
    version: doc.version,
    hasMeta: !!doc.meta,
    nodeCount: 0,
    errorCount: doc.errors?.length || 0,
    nodeTypes: {}
  };

  countNodes(doc.content, stats);

  return stats;
}

interface DocumentStats {
  version: string;
  hasMeta: boolean;
  nodeCount: number;
  errorCount: number;
  nodeTypes: Record<string, number>;
}

function countNodes(nodes: readonly any[], stats: DocumentStats): void {
  for (const node of nodes) {
    stats.nodeCount++;

    // Support both old and new formats
    const type = node.type || node.nodeType;
    if (type) {
      stats.nodeTypes[type] = (stats.nodeTypes[type] || 0) + 1;
    }

    // Count children recursively
    if (node.content && Array.isArray(node.content)) {
      countNodes(node.content, stats);
    }
    if (node.children && Array.isArray(node.children)) {
      for (const child of node.children) {
        if (child.node) {
          countNodes([child.node], stats);
        }
      }
    }
    if (node.items && Array.isArray(node.items)) {
      for (const item of node.items) {
        if (item.children) {
          countNodes(item.children, stats);
        }
      }
    }
  }
}
