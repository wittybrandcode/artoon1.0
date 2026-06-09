/**
 * Table commands - table manipulation
 */

import type { Command, TableNode } from '../types';
import type { TableRow as ASTTableRow, TableCell as ASTTableCell } from '@artoon/ast';

// Use AST types
type TableRow = ASTTableRow;
type TableCell = ASTTableCell;

/**
 * Insert a new table
 */
export function insertTable(rows: number = 3, cols: number = 3): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const tableNode = createTable(rows, cols, state.selection.$from.node(0)?.direction || 'rtl');
      const tr = state.tr.replaceWith(
        state.selection.from,
        state.selection.to,
        tableNode
      );
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Create a table node
 */
function createTable(rows: number, cols: number, direction: 'rtl' | 'ltr'): TableNode {
  const headerCells: TableCell[] = Array(cols).fill(null).map(() => ({
    content: []
  }));
  
  const bodyRows: TableRow[] = Array(rows - 1).fill(null).map(() => ({
    rowType: 'tr' as const,
    cells: Array(cols).fill(null).map(() => ({
      content: []
    }))
  }));
  
  return {
    type: 'table',
    nodeType: 'table',
    direction,
    line: 1,
    headers: {
      rowType: 'th',
      cells: headerCells
    },
    rows: bodyRows
  };
}

/**
 * Add row after current
 */
export const addRowAfter: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  if (dispatch) {
    const tableNode = node as TableNode;
    const colCount = tableNode.headers?.cells.length || tableNode.rows[0]?.cells.length || 1;
    
    const newRow: TableRow = {
      rowType: 'tr',
      cells: Array(colCount).fill(null).map(() => ({ content: [] }))
    };
    
    const newTable: TableNode = {
      ...tableNode,
      rows: [...tableNode.rows, newRow]
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newTable);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Add row before current
 */
export const addRowBefore: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  if (dispatch) {
    const tableNode = node as TableNode;
    const colCount = tableNode.headers?.cells.length || tableNode.rows[0]?.cells.length || 1;
    
    const newRow: TableRow = {
      rowType: 'tr',
      cells: Array(colCount).fill(null).map(() => ({ content: [] }))
    };
    
    const newTable: TableNode = {
      ...tableNode,
      rows: [newRow, ...tableNode.rows]
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newTable);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Add column after current
 */
export const addColumnAfter: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  if (dispatch) {
    const tableNode = node as TableNode;
    
    // Add cell to header
    const newHeaders = tableNode.headers ? {
      ...tableNode.headers,
      cells: [...tableNode.headers.cells, { content: [] }]
    } : undefined;
    
    // Add cell to each row
    const newRows = tableNode.rows.map(row => ({
      ...row,
      cells: [...row.cells, { content: [] }]
    }));
    
    const newTable: TableNode = {
      ...tableNode,
      headers: newHeaders,
      rows: newRows
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newTable);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Add column before current
 */
export const addColumnBefore: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  if (dispatch) {
    const tableNode = node as TableNode;
    
    // Add cell to header
    const newHeaders = tableNode.headers ? {
      ...tableNode.headers,
      cells: [{ content: [] }, ...tableNode.headers.cells]
    } : undefined;
    
    // Add cell to each row
    const newRows = tableNode.rows.map(row => ({
      ...row,
      cells: [{ content: [] }, ...row.cells]
    }));
    
    const newTable: TableNode = {
      ...tableNode,
      headers: newHeaders,
      rows: newRows
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newTable);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Delete current row
 */
export const deleteRow: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  const tableNode = node as TableNode;
  
  if (tableNode.rows.length <= 1) {
    // Can't delete last row
    return false;
  }
  
  if (dispatch) {
    // Delete last row (simplified - would need to track current row)
    const newTable: TableNode = {
      ...tableNode,
      rows: tableNode.rows.slice(0, -1)
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newTable);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Delete current column
 */
export const deleteColumn: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  const tableNode = node as TableNode;
  const colCount = tableNode.headers?.cells.length || tableNode.rows[0]?.cells.length || 0;
  
  if (colCount <= 1) {
    // Can't delete last column
    return false;
  }
  
  if (dispatch) {
    // Delete last column (simplified)
    const newHeaders = tableNode.headers ? {
      ...tableNode.headers,
      cells: tableNode.headers.cells.slice(0, -1)
    } : undefined;
    
    const newRows = tableNode.rows.map(row => ({
      ...row,
      cells: row.cells.slice(0, -1)
    }));
    
    const newTable: TableNode = {
      ...tableNode,
      headers: newHeaders,
      rows: newRows
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newTable);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Delete entire table
 */
export const deleteTable: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  if (dispatch) {
    const tr = state.tr.delete(selection.from, selection.to);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Toggle header row
 */
export const toggleHeaderRow: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'table') {
    return false;
  }
  
  if (dispatch) {
    const tableNode = node as TableNode;
    
    let newTable: TableNode;
    
    if (tableNode.headers) {
      // Remove header - convert to regular row
      newTable = {
        ...tableNode,
        headers: undefined,
        rows: [
          { rowType: 'tr', cells: tableNode.headers.cells },
          ...tableNode.rows
        ]
      };
    } else {
      // Add header - convert first row to header
      const [firstRow, ...restRows] = tableNode.rows;
      newTable = {
        ...tableNode,
        headers: firstRow ? { rowType: 'th', cells: firstRow.cells } : undefined,
        rows: restRows
      };
    }
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newTable);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Move to next cell
 */
export const goToNextCell: Command = (state, dispatch) => {
  // Would need cell-level selection tracking
  return false;
};

/**
 * Move to previous cell
 */
export const goToPreviousCell: Command = (state, dispatch) => {
  // Would need cell-level selection tracking
  return false;
};

/**
 * Table keymap
 */
export const tableKeymap: Record<string, Command> = {
  'Tab': goToNextCell,
  'Shift-Tab': goToPreviousCell
};

/**
 * All table commands
 */
export const tableCommands = {
  insertTable,
  addRowAfter,
  addRowBefore,
  addColumnAfter,
  addColumnBefore,
  deleteRow,
  deleteColumn,
  deleteTable,
  toggleHeaderRow,
  goToNextCell,
  goToPreviousCell
};
