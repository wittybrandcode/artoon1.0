/**
 * TableBlockView Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TableBlockView, createTableBlockView } from '../../src/blocks/views/TableBlockView';
import type { TableBlock, TableRow, TableCell } from '../../src/types';

// Helper to create a test cell
function createCell(content: string = ''): TableCell {
  return {
    id: `cell-${Math.random().toString(36).substr(2, 9)}`,
    content: content ? [{ type: 'plain', value: content }] : [],
  };
}

// Helper to create a test row
function createRow(cells: string[]): TableRow {
  return {
    id: `row-${Math.random().toString(36).substr(2, 9)}`,
    cells: cells.map(c => createCell(c)),
  };
}

// Helper to create a test block
function createTestBlock(rows: string[][] = [['أ', 'ب'], ['ج', 'د']]): TableBlock {
  return {
    id: 'test-table-1',
    type: 'table',
    direction: 'rtl',
    rows: rows.map(r => createRow(r)),
  };
}

describe('TableBlockView', () => {
  let view: TableBlockView;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    container.remove();
  });

  describe('creation', () => {
    it('should create a view', () => {
      const block = createTestBlock();
      view = createTableBlockView({ block });
      
      expect(view).toBeInstanceOf(TableBlockView);
      expect(view.id).toBe('test-table-1');
    });

    it('should render table element', () => {
      const block = createTestBlock();
      view = createTableBlockView({ block });
      
      const element = view.render();
      const table = element.querySelector('table');
      
      expect(table).not.toBeNull();
    });
  });

  describe('getRowCount', () => {
    it('should return row count', () => {
      const block = createTestBlock([['أ'], ['ب'], ['ج']]);
      view = createTableBlockView({ block });
      
      expect(view.getRowCount()).toBe(3);
    });

    it('should return 0 for empty table', () => {
      const block = createTestBlock([]);
      view = createTableBlockView({ block });
      
      expect(view.getRowCount()).toBe(0);
    });
  });

  describe('getColumnCount', () => {
    it('should return column count', () => {
      const block = createTestBlock([['أ', 'ب', 'ج']]);
      view = createTableBlockView({ block });
      
      expect(view.getColumnCount()).toBe(3);
    });

    it('should return 0 for empty table', () => {
      const block = createTestBlock([]);
      view = createTableBlockView({ block });
      
      expect(view.getColumnCount()).toBe(0);
    });
  });

  describe('getCellContent', () => {
    it('should return cell content', () => {
      const block = createTestBlock([['محتوى']]);
      view = createTableBlockView({ block });
      
      const content = view.getCellContent(0, 0);
      
      expect(content).toHaveLength(1);
      expect(content[0]).toEqual({ type: 'plain', value: 'محتوى' });
    });

    it('should return empty for invalid indices', () => {
      const block = createTestBlock([['أ']]);
      view = createTableBlockView({ block });
      
      expect(view.getCellContent(10, 10)).toEqual([]);
    });
  });

  describe('table structure', () => {
    it('should render rows', () => {
      const block = createTestBlock([['أ'], ['ب'], ['ج']]);
      view = createTableBlockView({ block });
      
      const element = view.render();
      const rows = element.querySelectorAll('tr');
      
      expect(rows).toHaveLength(3);
    });

    it('should render cells', () => {
      const block = createTestBlock([['أ', 'ب', 'ج']]);
      view = createTableBlockView({ block });
      
      const element = view.render();
      const cells = element.querySelectorAll('td');
      
      expect(cells).toHaveLength(3);
    });

    it('should render header row with th', () => {
      const block: TableBlock = {
        ...createTestBlock([['عنوان 1', 'عنوان 2'], ['بيانات 1', 'بيانات 2']]),
        hasHeader: true,
      };
      view = createTableBlockView({ block });
      
      const element = view.render();
      const headers = element.querySelectorAll('th');
      
      expect(headers).toHaveLength(2);
    });
  });

  describe('cell editing', () => {
    it('should make cells editable when not readonly', () => {
      const block = createTestBlock([['أ']]);
      view = createTableBlockView({ block, readOnly: false });
      
      const element = view.render();
      const content = element.querySelector('.artoon-table-block__cell-content') as HTMLElement;
      
      // jsdom returns 'inherit' for contentEditable property
      expect(content?.isContentEditable || content?.contentEditable === 'true').toBe(true);
    });

    it('should not make cells editable when readonly', () => {
      const block = createTestBlock([['أ']]);
      view = createTableBlockView({ block, readOnly: true });
      
      const element = view.render();
      const content = element.querySelector('.artoon-table-block__cell-content');
      
      expect(content?.getAttribute('contenteditable')).toBeNull();
    });
  });

  describe('addRow', () => {
    it('should add row after index', () => {
      const block = createTestBlock([['أ', 'ب']]);
      view = createTableBlockView({ block });
      view.render();
      
      view.addRow(0);
      
      expect(view.getRowCount()).toBe(2);
    });

    it('should call onRowAdd', () => {
      const onRowAdd = vi.fn();
      const block = createTestBlock([['أ']]);
      view = createTableBlockView({ block, onRowAdd });
      view.render();
      
      view.addRow(0);
      
      expect(onRowAdd).toHaveBeenCalledWith(0);
    });
  });

  describe('removeRow', () => {
    it('should remove row at index', () => {
      const block = createTestBlock([['أ'], ['ب'], ['ج']]);
      view = createTableBlockView({ block });
      view.render();
      
      view.removeRow(1);
      
      expect(view.getRowCount()).toBe(2);
    });

    it('should not remove last row', () => {
      const block = createTestBlock([['أ']]);
      view = createTableBlockView({ block });
      view.render();
      
      view.removeRow(0);
      
      expect(view.getRowCount()).toBe(1);
    });
  });

  describe('addColumn', () => {
    it('should add column after index', () => {
      const block = createTestBlock([['أ', 'ب']]);
      view = createTableBlockView({ block });
      view.render();
      
      view.addColumn(0);
      
      expect(view.getColumnCount()).toBe(3);
    });
  });

  describe('removeColumn', () => {
    it('should remove column at index', () => {
      const block = createTestBlock([['أ', 'ب', 'ج']]);
      view = createTableBlockView({ block });
      view.render();
      
      view.removeColumn(1);
      
      expect(view.getColumnCount()).toBe(2);
    });

    it('should not remove last column', () => {
      const block = createTestBlock([['أ']]);
      view = createTableBlockView({ block });
      view.render();
      
      view.removeColumn(0);
      
      expect(view.getColumnCount()).toBe(1);
    });
  });

  describe('focusCell', () => {
    it('should focus cell', () => {
      const block = createTestBlock([['أ', 'ب'], ['ج', 'د']]);
      view = createTableBlockView({ block });
      const element = view.render();
      container.appendChild(element);
      
      view.focusCell(1, 1);
      
      expect(view.getFocusedCell()).toEqual({ row: 1, col: 1 });
    });

    it('should not focus invalid cell', () => {
      const block = createTestBlock([['أ']]);
      view = createTableBlockView({ block });
      view.render();
      
      view.focusCell(10, 10);
      
      expect(view.getFocusedCell()).toBeNull();
    });
  });

  describe('CSS classes', () => {
    it('should have table block class', () => {
      const block = createTestBlock();
      view = createTableBlockView({ block });
      
      const element = view.render();
      
      expect(element.classList.contains('artoon-table-block')).toBe(true);
    });

    it('should have wrapper class', () => {
      const block = createTestBlock();
      view = createTableBlockView({ block });
      
      const element = view.render();
      const wrapper = element.querySelector('.artoon-table-block__wrapper');
      
      expect(wrapper).not.toBeNull();
    });
  });

  describe('update', () => {
    it('should update table', () => {
      const block = createTestBlock([['قديم']]);
      view = createTableBlockView({ block });
      view.render();
      
      const newBlock: TableBlock = {
        ...block,
        rows: [createRow(['جديد'])],
      };
      view.update(newBlock);
      
      expect(view.getCellContent(0, 0)[0]).toEqual({ type: 'plain', value: 'جديد' });
    });
  });
});
