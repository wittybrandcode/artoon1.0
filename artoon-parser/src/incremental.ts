/**
 * ARTOON Incremental Parser
 *
 * Optimized parser that only re-processes changed parts of the document.
 */

import { Token } from './ast/types';
import { tokenizeLine } from './lexer';
import { buildAST, ParseResult } from './ast';

export interface IncrementalState {
  lines: string[];
  tokens: Token[];
  result: ParseResult;
}

/**
 * Initialize incremental state from full source
 */
export function initIncremental(source: string): IncrementalState {
  const lines = source.split(/\r?\n/);
  const tokens = lines.map((line, i) => tokenizeLine(line, i + 1));
  const result = buildAST(tokens);

  return { lines, tokens, result };
}

/**
 * Update incremental state with a change at a specific line
 */
export function updateLine(state: IncrementalState, lineNumber: number, newText: string): ParseResult {
  const index = lineNumber - 1;
  if (index < 0 || index >= state.lines.length) {
    // Fallback to push or ignore
    return state.result;
  }

  // Only re-tokenize the changed line
  state.lines[index] = newText;
  state.tokens[index] = tokenizeLine(newText, lineNumber);

  // For now, we still rebuild the AST from the tokens array
  // but we avoided full re-tokenization of the entire file.
  // Future optimization: block-level partial AST rebuilding.
  state.result = buildAST(state.tokens);

  return state.result;
}
