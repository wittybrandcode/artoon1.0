// ARTOON AST Schema Utilities

import schema from './artoon-ast.schema.json';

/**
 * Get the JSON Schema
 */
export function getSchema(): object {
  return schema;
}

/**
 * Schema version
 */
export const SCHEMA_VERSION = '1.0';

/**
 * Schema ID
 */
export const SCHEMA_ID = 'https://artoon.dev/schemas/ast/v1.0.json';

export { schema };
