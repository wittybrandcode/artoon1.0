// ARTOON Parser - Main Entry Point
// Parses ARTOON format to AST

import { tokenize, tokenizeLine } from './lexer/index';
import { buildAST, ParseResult, DocumentNode, ParseError } from './ast/index';

// Re-export types from ast/types (which re-exports from @artoon/ast)
export * from './ast/types';

// Re-export specific types from ./types that don't conflict
export { 
  VALID_MODIFIERS, 
  NO_MODIFIER_COMPONENTS,
  SEPARATOR_COMPONENTS,
  MODIFIER_ACCEPTING_COMPONENTS,
  VALID_COMPONENTS
} from './types';

// Re-export type aliases
export type {
  TextComponent,
  SemanticComponent,
  MediaComponent,
  SeparatorComponent,
  ListComponent,
  TableComponent,
  CompoundComponent,
  CompoundChildComponent,
  CodeComponent,
  ComponentType
} from './types';

export { tokenize, tokenizeLine } from './lexer/index';
export { parseInlineContent, hasInlineTokens } from './inline/index';
export { ContextStack, createContextStack } from './context/index';
export { buildAST } from './ast/index';
export { convertParsedToInline, convertInlineToParsed } from './inline/converter';

export class ARTOONParseError extends Error {
  readonly errors: ParseError[];
  readonly source: string;

  constructor(source: string, errors: ParseError[]) {
    const message = errors.map(e => `Line ${e.line}: ${e.message}`).join('\n');
    super(`Parse errors:\n${message}`);
    this.name = 'ARTOONParseError';
    this.source = source;
    this.errors = errors;
  }
}

/**
 * Parse ARTOON source to AST
 * 
 * @param source - ARTOON source text
 * @returns ParseResult with AST and errors
 * 
 * @example
 * ```typescript
 * const result = parse(`
 * >.t1:: مرحباً بالعالم
 * >.p:: هذه فقرة بالعربية
 * `);
 * 
 * console.log(result.ast);
 * console.log(result.errors);
 * ```
 */
export function parse(source: string): ParseResult {
  const tokens = tokenize(source);
  return buildAST(tokens);
}

/**
 * Parse and return only AST (throws on errors)
 * 
 * @param source - ARTOON source text
 * @returns DocumentNode AST
 * @throws Error if parsing has errors
 */
export function parseStrict(source: string): DocumentNode {
  const result = parse(source);
  
  if (result.errors.length > 0) {
    throw new ARTOONParseError(source, result.errors);
  }
  
  return result.ast;
}

/**
 * Parse source received in stream chunks.
 */
export function parseStream(chunks: Iterable<string>): ParseResult {
  let source = '';
  for (const chunk of chunks) {
    source += chunk;
  }
  return parse(source);
}

/**
 * Validate ARTOON source without building full AST
 * 
 * @param source - ARTOON source text
 * @returns Array of errors (empty if valid)
 */
export function validate(source: string): ParseError[] {
  const result = parse(source);
  return result.errors;
}

/**
 * Check if source is valid ARTOON
 * 
 * @param source - ARTOON source text
 * @returns true if valid, false otherwise
 */
export function isValid(source: string): boolean {
  return validate(source).length === 0;
}

/**
 * Parser version
 */
export const VERSION = '1.0.0';

/**
 * Default export
 */
export default {
  parse,
  parseStrict,
  parseStream,
  validate,
  isValid,
  tokenize,
  buildAST,
  ARTOONParseError,
  VERSION
};
export * from './incremental';
