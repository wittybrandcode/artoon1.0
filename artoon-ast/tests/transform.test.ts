// ARTOON AST Transform Tests
// Version 2.0 - Updated for new type format

import { transform } from '../src/transform';
import { parse } from '@artoon/parser';
import { getNodeType } from '../src/compat';

describe('Transform - Basic', () => {
  
  test('transform simple paragraph', () => {
    const result = parse('>.p:: مرحباً بالعالم');
    const ast = transform(result);
    
    expect(ast.version).toBe('2.0');
    expect(ast.content).toHaveLength(1);
    // Use getNodeType for compatibility
    expect(getNodeType(ast.content[0])).toBe('text');
  });
  
  test('transform with meta', () => {
    const source = `<meta>.
>.-:title: عنوان
>.-:author: كاتب
.<meta>
>.p:: فقرة`;
    
    const result = parse(source);
    const ast = transform(result);
    
    expect(ast.meta).toBeDefined();
    expect(ast.meta?.title).toBe('عنوان');
    expect(ast.meta?.author).toBe('كاتب');
  });
  
  test('transform preserves errors', () => {
    const source = '>.p:: نص مع [s:: غير مغلق';
    const result = parse(source);
    const ast = transform(result);
    
    expect(ast.errors).toBeDefined();
    expect(ast.errors!.length).toBeGreaterThan(0);
  });
  
});

describe('Transform - Text Nodes', () => {
  
  test('transform headings', () => {
    const source = `>.t1:: عنوان رئيسي
>.t2:: عنوان فرعي`;
    
    const result = parse(source);
    const ast = transform(result);
    
    expect(ast.content).toHaveLength(2);
    expect((ast.content[0] as any).textType).toBe('t1');
    expect((ast.content[1] as any).textType).toBe('t2');
  });
  
  test('transform with inline content', () => {
    const source = '>.p:: نص مع [s:: كلمة مهمة] داخله';
    
    const result = parse(source);
    const ast = transform(result);
    
    const textNode = ast.content[0] as any;
    expect(textNode.content.length).toBeGreaterThan(1);
    
    // Find inline component
    const inline = textNode.content.find((c: any) => c.type === 'inline');
    expect(inline).toBeDefined();
    expect(inline.modifiers).toContain('s');
  });
  
});

describe('Transform - Lists', () => {
  
  test('transform simple list', () => {
    const source = `>.ul::
li:: عنصر 1
li:: عنصر 2`;
    
    const result = parse(source);
    const ast = transform(result);
    
    expect(ast.content).toHaveLength(1);
    expect(ast.content[0].nodeType).toBe('list');
    expect((ast.content[0] as any).listType).toBe('ul');
    expect((ast.content[0] as any).items).toHaveLength(2);
  });
  
});

describe('Transform - Tables', () => {
  
  test('transform table', () => {
    const source = `>.table::
th:: الاسم; العمر
tr:: أحمد; 25`;
    
    const result = parse(source);
    const ast = transform(result);
    
    expect(ast.content).toHaveLength(1);
    expect(ast.content[0].nodeType).toBe('table');
    
    const table = ast.content[0] as any;
    expect(table.headers).toBeDefined();
    expect(table.headers.cells).toHaveLength(2);
    expect(table.rows).toHaveLength(1);
  });
  
});

describe('Transform - Blocks', () => {
  
  test('transform code block', () => {
    const source = `<code:js>.
const x = 1;
.<code>`;
    
    const result = parse(source);
    const ast = transform(result);
    
    expect(ast.content).toHaveLength(1);
    expect(ast.content[0].nodeType).toBe('block');
    
    const block = ast.content[0] as any;
    expect(block.blockName).toBe('code');
    expect(block.isCode).toBe(true);
    expect(block.language).toBe('js');
  });
  
});

describe('Transform - Compound', () => {
  
  test('transform figure', () => {
    const source = `>.figure::
>.-img:: photo.jpg
>.-caption:: تعليق`;
    
    const result = parse(source);
    const ast = transform(result);
    
    // May have warnings but should have compound
    const compound = ast.content.find(n => n.nodeType === 'compound');
    expect(compound).toBeDefined();
    expect((compound as any).compoundType).toBe('figure');
  });
  
});

describe('Transform - Separators', () => {
  
  test('transform separator', () => {
    const result = parse('>.br');
    const ast = transform(result);
    
    expect(ast.content).toHaveLength(1);
    expect(ast.content[0].type).toBe('separator');
    expect((ast.content[0] as any).separatorType).toBe('br');
  });
  
  test('transform combined separators', () => {
    // v2.0: Combined separators are now separate nodes
    const result = parse('>.br;hr;br');
    const ast = transform(result);
    
    // Should have 3 separate separator nodes
    expect(ast.content).toHaveLength(3);
    expect((ast.content[0] as any).separatorType).toBe('br');
    expect((ast.content[1] as any).separatorType).toBe('hr');
    expect((ast.content[2] as any).separatorType).toBe('br');
  });
  
});
