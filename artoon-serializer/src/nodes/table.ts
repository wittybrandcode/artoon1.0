// ARTOON Serializer - Table Nodes

import { TableNode, TableRow, TableCell } from '@artoon/ast';
import type { SerializeOptions } from '../types';
import { getDirectionMarker, DEFAULT_OPTIONS } from '../types';
import { serializeInlineContent } from '../inline';

/**
 * Serialize table node
 * 
 * Output:
 * {dir}.table::
 * th:: col1; col2; col3
 * tr:: val1; val2; val3
 */
export function serializeTable(
  node: TableNode,
  options: SerializeOptions = DEFAULT_OPTIONS
): string {
  const dir = getDirectionMarker(node.direction);
  const lines: string[] = [];
  const lineEnding = options.lineEnding || '\n';
  
  // Table container
  lines.push(`${dir}.table::`);
  
  // Headers
  if (node.headers) {
    lines.push(serializeTableRow(node.headers));
  }
  
  // Rows
  for (const row of node.rows) {
    lines.push(serializeTableRow(row));
  }
  
  return lines.join(lineEnding);
}

/**
 * Serialize table row
 */
function serializeTableRow(row: TableRow): string {
  const rowType = row.rowType; // 'th' or 'tr'
  const cells = row.cells.map(serializeTableCell).join('; ');
  
  return `${rowType}:: ${cells}`;
}

/**
 * Serialize table cell
 */
function serializeTableCell(cell: TableCell): string {
  return serializeInlineContent(cell.content);
}
