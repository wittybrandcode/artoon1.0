// ARTOON Table Parser Tests

import { 
  createTableState, 
  parseTableHeader, 
  parseTableRow, 
  splitTableCells,
  buildTableNode,
  isTableComponent,
  isTableStart,
  isTableHeader,
  isTableRow
} from '../src/table';

describe('Table - Cell Splitting', () => {
  
  test('simple cells', () => {
    const cells = splitTableCells('خلية 1; خلية 2; خلية 3');
    expect(cells).toEqual(['خلية 1', 'خلية 2', 'خلية 3']);
  });
  
  test('cells with inline tokens', () => {
    const cells = splitTableCells('[s:: bold]; normal; [a:: url; link]');
    expect(cells).toHaveLength(3);
    expect(cells[0]).toBe('[s:: bold]');
    expect(cells[2]).toBe('[a:: url; link]');
  });
  
  test('empty cells', () => {
    const cells = splitTableCells('a; ; c');
    expect(cells).toEqual(['a', '', 'c']);
  });
  
  test('single cell', () => {
    const cells = splitTableCells('only one');
    expect(cells).toEqual(['only one']);
  });
  
});

describe('Table - Header Parsing', () => {
  
  test('parse headers', () => {
    const state = createTableState('rtl', 1);
    const result = parseTableHeader('العمود 1; العمود 2; العمود 3', state);
    
    expect(result.success).toBe(true);
    expect(state.headers).toEqual(['العمود 1', 'العمود 2', 'العمود 3']);
    expect(state.columnCount).toBe(3);
  });
  
  test('duplicate headers error', () => {
    const state = createTableState('rtl', 1);
    parseTableHeader('col1; col2', state);
    
    const result = parseTableHeader('col3; col4', state);
    
    expect(result.success).toBe(false);
    expect(result.error?.type).toBe('structure');
  });
  
});

describe('Table - Row Parsing', () => {
  
  test('parse row matching column count', () => {
    const state = createTableState('rtl', 1);
    parseTableHeader('col1; col2; col3', state);
    
    const result = parseTableRow('val1; val2; val3', state, 2);
    
    expect(result.success).toBe(true);
    expect(state.rows).toHaveLength(1);
    expect(state.rows[0]).toEqual(['val1', 'val2', 'val3']);
  });
  
  test('row with wrong column count', () => {
    const state = createTableState('rtl', 1);
    parseTableHeader('col1; col2; col3', state);
    
    const result = parseTableRow('val1; val2', state, 2);
    
    expect(result.success).toBe(false);
    expect(result.error?.message).toContain('2 cells');
    expect(result.error?.message).toContain('expected 3');
  });
  
  test('multiple rows', () => {
    const state = createTableState('rtl', 1);
    parseTableHeader('a; b', state);
    parseTableRow('1; 2', state, 2);
    parseTableRow('3; 4', state, 3);
    
    expect(state.rows).toHaveLength(2);
  });
  
});

describe('Table - Build Node', () => {
  
  test('build complete table node', () => {
    const state = createTableState('rtl', 5);
    parseTableHeader('Name; Age', state);
    parseTableRow('Ali; 25', state, 6);
    parseTableRow('Sara; 30', state, 7);
    
    const node = buildTableNode(state);
    
    expect(node.type).toBe('table');
    expect(node.line).toBe(5);
    expect(node.direction).toBe('rtl');
    expect(node.headers).toEqual(['Name', 'Age']);
    expect(node.rows).toHaveLength(2);
  });
  
});

describe('Table - Type Checks', () => {
  
  test('isTableComponent', () => {
    expect(isTableComponent('table')).toBe(true);
    expect(isTableComponent('th')).toBe(true);
    expect(isTableComponent('tr')).toBe(true);
    expect(isTableComponent('p')).toBe(false);
    expect(isTableComponent(null)).toBe(false);
  });
  
  test('isTableStart', () => {
    expect(isTableStart('table')).toBe(true);
    expect(isTableStart('th')).toBe(false);
  });
  
  test('isTableHeader', () => {
    expect(isTableHeader('th')).toBe(true);
    expect(isTableHeader('tr')).toBe(false);
  });
  
  test('isTableRow', () => {
    expect(isTableRow('tr')).toBe(true);
    expect(isTableRow('th')).toBe(false);
  });
  
});
