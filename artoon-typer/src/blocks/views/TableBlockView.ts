/**
 * TableBlockView
 * 
 * View for table blocks with cell editing support.
 */

import type { TableBlock, TableRow, TableCell, InlineContent, BlockEvent } from '../../types';
import { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
import { InlineRenderer, createInlineRenderer } from '../../inline/InlineRenderer';
import { InlineParser, createInlineParser } from '../../inline/InlineParser';
import { generateId } from '../../core/utils';

/**
 * Table block view options
 */
export interface TableBlockViewOptions extends BlockViewOptions {
  block: TableBlock;
  /** On cell content change */
  onCellChange?: (rowIndex: number, cellIndex: number, content: readonly InlineContent[]) => void;
  /** On row add */
  onRowAdd?: (afterIndex: number) => void;
  /** On row remove */
  onRowRemove?: (index: number) => void;
  /** On column add */
  onColumnAdd?: (afterIndex: number) => void;
  /** On column remove */
  onColumnRemove?: (index: number) => void;
}

/**
 * TableBlockView - handles table blocks
 */
export class TableBlockView extends BaseBlockView {
  protected block: TableBlock;
  protected options: TableBlockViewOptions;
  protected tableElement: HTMLTableElement | null = null;

  private renderer: InlineRenderer;
  private parser: InlineParser;
  private focusedCell: { row: number; col: number } | null = null;

  constructor(options: TableBlockViewOptions) {
    super(options);
    this.block = options.block;
    this.options = options;

    this.renderer = createInlineRenderer({ escapeHtml: true });
    this.parser = createInlineParser({ mergeAdjacent: true });
  }

  /**
   * Get row count
   */
  getRowCount(): number {
    return this.block.rows.length;
  }

  /**
   * Get column count
   */
  getColumnCount(): number {
    if (this.block.rows.length === 0) return 0;
    return this.block.rows[0].cells.length;
  }

  /**
   * Get cell content
   */
  getCellContent(rowIndex: number, cellIndex: number): readonly InlineContent[] {
    const row = this.block.rows[rowIndex];
    if (!row) return [];
    const cell = row.cells[cellIndex];
    return cell?.content || [];
  }

  /**
   * Render the block
   */
  render(): HTMLElement {
    this.element = this.createWrapper('div');
    this.element.classList.add('artoon-table-block');

    // Create table wrapper for scrolling
    const wrapper = document.createElement('div');
    wrapper.className = 'artoon-table-block__wrapper';

    // Create table
    this.tableElement = document.createElement('table');
    this.tableElement.className = 'artoon-table-block__table';

    // Render rows
    this.renderRows();

    wrapper.appendChild(this.tableElement);
    this.element.appendChild(wrapper);

    // Apply styles
    this.applyStyles(this.element);

    return this.element;
  }

  /**
   * Render table rows
   */
  private renderRows(): void {
    if (!this.tableElement) return;

    // Clear existing content
    this.tableElement.innerHTML = '';

    // Create thead if has header
    if (this.block.hasHeader && this.block.rows.length > 0) {
      const thead = document.createElement('thead');
      thead.appendChild(this.renderRow(this.block.rows[0], 0, true));
      this.tableElement.appendChild(thead);

      // Create tbody for remaining rows
      if (this.block.rows.length > 1) {
        const tbody = document.createElement('tbody');
        for (let i = 1; i < this.block.rows.length; i++) {
          tbody.appendChild(this.renderRow(this.block.rows[i], i, false));
        }
        this.tableElement.appendChild(tbody);
      }
    } else {
      // No header, all in tbody
      const tbody = document.createElement('tbody');
      for (let i = 0; i < this.block.rows.length; i++) {
        tbody.appendChild(this.renderRow(this.block.rows[i], i, false));
      }
      this.tableElement.appendChild(tbody);
    }
  }

  /**
   * Render a single row
   */
  private renderRow(row: TableRow, rowIndex: number, isHeader: boolean): HTMLTableRowElement {
    const tr = document.createElement('tr');
    tr.className = 'artoon-table-block__row';
    tr.setAttribute('data-row-index', String(rowIndex));

    for (let i = 0; i < row.cells.length; i++) {
      const cell = row.cells[i];
      tr.appendChild(this.renderCell(cell, rowIndex, i, isHeader));
    }

    return tr;
  }

  /**
   * Render a single cell
   */
  private renderCell(
    cell: TableCell,
    rowIndex: number,
    cellIndex: number,
    isHeader: boolean
  ): HTMLTableCellElement {
    const td = document.createElement(isHeader ? 'th' : 'td');
    td.className = 'artoon-table-block__cell';
    td.setAttribute('data-row-index', String(rowIndex));
    td.setAttribute('data-cell-index', String(cellIndex));

    if (cell.colspan && cell.colspan > 1) {
      td.colSpan = cell.colspan;
    }
    if (cell.rowspan && cell.rowspan > 1) {
      td.rowSpan = cell.rowspan;
    }

    // Content wrapper
    const content = document.createElement('div');
    content.className = 'artoon-table-block__cell-content';

    if (!this.options.readOnly) {
      content.contentEditable = 'true';
      content.addEventListener('input', () => this.handleCellInput(rowIndex, cellIndex, content));
      content.addEventListener('focus', () => this.handleCellFocus(rowIndex, cellIndex));
      content.addEventListener('keydown', (e) => this.handleCellKeyDown(e, rowIndex, cellIndex));
    }

    content.innerHTML = this.renderer.render(cell.content);
    td.appendChild(content);

    return td;
  }

  /**
   * Update the element
   */
  protected updateElement(): void {
    if (this.element) {
      this.element.className = this.getClassName() + ' artoon-table-block';
      this.element.dir = this.block.direction;
    }

    this.renderRows();
  }

  /**
   * Handle cell input
   */
  private handleCellInput(rowIndex: number, cellIndex: number, element: HTMLElement): void {
    const newContent = this.parser.parseElement(element);

    if (this.options.onCellChange) {
      this.options.onCellChange(rowIndex, cellIndex, newContent);
    }

    this.emit({
      type: 'update',
      blockId: this.block.id,
      block: this.block,
    });
  }

  /**
   * Handle cell focus
   */
  private handleCellFocus(rowIndex: number, cellIndex: number): void {
    this.focusedCell = { row: rowIndex, col: cellIndex };
    this.focus();
  }

  /**
   * Handle cell keydown
   */
  private handleCellKeyDown(e: KeyboardEvent, rowIndex: number, cellIndex: number): void {
    // Tab - move to next cell
    if (e.key === 'Tab') {
      e.preventDefault();

      if (e.shiftKey) {
        this.focusPreviousCell(rowIndex, cellIndex);
      } else {
        this.focusNextCell(rowIndex, cellIndex);
      }
    }

    // Arrow keys for navigation
    if (e.key === 'ArrowDown' && e.ctrlKey) {
      e.preventDefault();
      this.focusCell(rowIndex + 1, cellIndex);
    }
    if (e.key === 'ArrowUp' && e.ctrlKey) {
      e.preventDefault();
      this.focusCell(rowIndex - 1, cellIndex);
    }
  }

  /**
   * Focus a specific cell
   */
  focusCell(rowIndex: number, cellIndex: number): void {
    if (rowIndex < 0 || rowIndex >= this.getRowCount()) return;
    if (cellIndex < 0 || cellIndex >= this.getColumnCount()) return;

    const cell = this.element?.querySelector(
      `[data-row-index="${rowIndex}"][data-cell-index="${cellIndex}"] .artoon-table-block__cell-content`
    ) as HTMLElement;

    if (cell) {
      cell.focus();
      this.focusedCell = { row: rowIndex, col: cellIndex };
    }
  }

  /**
   * Focus next cell
   */
  private focusNextCell(rowIndex: number, cellIndex: number): void {
    const colCount = this.getColumnCount();

    if (cellIndex < colCount - 1) {
      this.focusCell(rowIndex, cellIndex + 1);
    } else if (rowIndex < this.getRowCount() - 1) {
      this.focusCell(rowIndex + 1, 0);
    }
  }

  /**
   * Focus previous cell
   */
  private focusPreviousCell(rowIndex: number, cellIndex: number): void {
    if (cellIndex > 0) {
      this.focusCell(rowIndex, cellIndex - 1);
    } else if (rowIndex > 0) {
      this.focusCell(rowIndex - 1, this.getColumnCount() - 1);
    }
  }

  /**
   * Get focused cell
   */
  getFocusedCell(): { row: number; col: number } | null {
    return this.focusedCell;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // Table Operations
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Add row after index
   */
  addRow(afterIndex: number): void {
    const colCount = this.getColumnCount();
    const newRow: TableRow = {
      id: generateId(),
      cells: Array.from({ length: colCount }, () => ({
        id: generateId(),
        content: [],
      })),
    };

    const rows = [...this.block.rows];
    rows.splice(afterIndex + 1, 0, newRow);

    this.block = { ...this.block, rows };
    this.renderRows();

    if (this.options.onRowAdd) {
      this.options.onRowAdd(afterIndex);
    }
  }

  /**
   * Remove row at index
   */
  removeRow(index: number): void {
    if (this.getRowCount() <= 1) return; // Keep at least one row

    const rows = [...this.block.rows];
    rows.splice(index, 1);

    this.block = { ...this.block, rows };
    this.renderRows();

    if (this.options.onRowRemove) {
      this.options.onRowRemove(index);
    }
  }

  /**
   * Add column after index
   */
  addColumn(afterIndex: number): void {
    const rows = this.block.rows.map(row => ({
      ...row,
      cells: [
        ...row.cells.slice(0, afterIndex + 1),
        { id: generateId(), content: [] },
        ...row.cells.slice(afterIndex + 1),
      ],
    }));

    this.block = { ...this.block, rows };
    this.renderRows();

    if (this.options.onColumnAdd) {
      this.options.onColumnAdd(afterIndex);
    }
  }

  /**
   * Remove column at index
   */
  removeColumn(index: number): void {
    if (this.getColumnCount() <= 1) return; // Keep at least one column

    const rows = this.block.rows.map(row => ({
      ...row,
      cells: row.cells.filter((_, i) => i !== index),
    }));

    this.block = { ...this.block, rows };
    this.renderRows();

    if (this.options.onColumnRemove) {
      this.options.onColumnRemove(index);
    }
  }

  /**
   * Update cell content
   */
  updateCellContent(rowIndex: number, cellIndex: number, content: readonly InlineContent[]): void {
    const rows = this.block.rows.map((row, ri) => {
      if (ri !== rowIndex) return row;
      return {
        ...row,
        cells: row.cells.map((cell, ci) => {
          if (ci !== cellIndex) return cell;
          return { ...cell, content };
        }),
      };
    });

    this.block = { ...this.block, rows };
  }
}

/**
 * Create a table block view
 */
export function createTableBlockView(options: TableBlockViewOptions): TableBlockView {
  return new TableBlockView(options);
}
