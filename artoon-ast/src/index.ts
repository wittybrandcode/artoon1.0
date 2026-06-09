// ARTOON Canonical AST
// Version 2.0

// Export all types (v2.0 - with compatibility layer)
export * from './types';

// Export unified types (v2.0 - migration target)
export * as unified from './unified';

// Export compatibility utilities
export * from './compat';

// Export transform utilities
export { transform } from './transform';

// Export serialization utilities
export {
  toJSON,
  fromJSON,
  toCompactJSON,
  clone,
  getStats
} from './serialize';

// Export node utilities
export {
  createTextNode,
  createPlainText,
  createInlineComponent,
  createListNode,
  createSeparatorNode,
  visitNodes,
  findNodesByType,
  extractText,
  countByType,
  inlineToText,
  hasModifiers,
  getModifiers
} from './nodes';

// Export builder API
export { ARTOONBuilder } from './builder';

// Export migration tools
export { migrateToV2 } from './migration';

/**
 * AST Version
 */
export const VERSION = '1.0.0';
