// ARTOON Table Parser
// Handles table structure parsing

import { Direction } from '../types';
import { Token, TableNode, ParseError } from '../ast/types';

/**
 * Table parsing state
 */
export interface TableState {
  direction: Direction;
  startLine: number;
  headers: string[];
  rows: string[][];
  columnCount: number;
}

/**
 * Create new table state
 */
export function createTableState(direction: Direction, line: number): TableState {
  return {
    direction,
    startLine: line,
    headers: [],
    rows: [],
    columnCount: 0
  };
}

/**
 * Parse table header row (th)
 */
export function parseTableHeader(content: string, state: TableState): {
  success: boolean;
  error?: ParseError;
} {
  const cells = splitTableCells(content);
  
  if (state.headers.length > 0) {
    return {
      success: false,
      error: {
        type: 'structure',
        line: state.startLine,
        column: 0,
        message: 'Table already has headers',
        suggestion: 'Use tr:: for additional rows'
      }
    };
  }
  
  state.headers = cells;
  state.columnCount = cells.length;
  
  return { success: true };
}

/**
 * Parse table data row (tr)
 */
export function parseTableRow(
  content: string, 
  state: TableState,
  lineNumber: number
): {
  success: boolean;
  error?: ParseError;
} {
  const cells = splitTableCells(content);
  
  // Validate column count if headers exist
  if (state.columnCount > 0 && cells.length !== state.columnCount) {
    return {
      success: false,
      error: {
        type: 'structure',
        line: lineNumber,
        column: 0,
        message: `Row has ${cells.length} cells, expected ${state.columnCount}`,
        suggestion: `Ensure row has ${state.columnCount} cells separated by ;`
      }
    };
  }
  
  // Set column count from first row if no headers
  if (state.columnCount === 0) {
    state.columnCount = cells.length;
  }
  
  state.rows.push(cells);
  
  return { success: true };
}

/**
 * Split table row content into cells
 * Cells are separated by ;
 */
export function splitTableCells(content: string): string[] {
  // Simple split by ; but respect [...] brackets
  const cells: string[] = [];
  let current = '';
  let bracketDepth = 0;
  
  for (const char of content) {
    if (char === '[') {
      bracketDepth++;
      current += char;
    } else if (char === ']') {
      bracketDepth--;
      current += char;
    } else if (char === ';' && bracketDepth === 0) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  
  // Add last cell
  if (current.trim()) {
    cells.push(current.trim());
  }
  
  return cells;
}

/**
 * Build table node from state
 */
export function buildTableNode(state: TableState): TableNode {
  return {
    type: 'table',
    line: state.startLine,
    direction: state.direction,
    headers: state.headers,
    rows: state.rows
  };
}

/**
 * Check if token is table-related
 */
export function isTableComponent(type: string | null): boolean {
  return type === 'table' || type === 'th' || type === 'tr';
}

/**
 * Check if token starts a table
 */
export function isTableStart(type: string | null): boolean {
  return type === 'table';
}

/**
 * Check if token is table header
 */
export function isTableHeader(type: string | null): boolean {
  return type === 'th';
}

/**
 * Check if token is table row
 */
export function isTableRow(type: string | null): boolean {
  return type === 'tr';
}
