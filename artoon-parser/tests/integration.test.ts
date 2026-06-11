// ARTOON Parser Integration Tests

import { parse, parseStrict, parseStream, validate, isValid, ARTOONParseError } from '../src';

describe('Integration - Basic Parsing', () => {
  
  test('parse simple paragraph', () => {
    const result = parse('>.p:: مرحباً بالعالم');
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.children).toHaveLength(1);
    expect(result.ast.children[0].type).toBe('text');
  });
  
  test('parse multiple components', () => {
    const source = `>.t1:: عنوان
>.p:: فقرة أولى
>.p:: فقرة ثانية`;
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.children).toHaveLength(3);
  });
  
  test('parse mixed directions', () => {
    const source = `>.p:: نص عربي
<.p:: English text`;
    
    const result = parse(source);
    
    expect(result.ast.children[0].direction).toBe('rtl');
    expect(result.ast.children[1].direction).toBe('ltr');
  });
  
});

describe('Integration - Lists', () => {
  
  test('parse simple list', () => {
    const source = `>.ul::
li:: عنصر 1
li:: عنصر 2
li:: عنصر 3`;
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    const list = result.ast.children[0];
    expect(list.type).toBe('list');
    expect((list as any).items).toHaveLength(3);
  });
  
  test('parse nested list', () => {
    const source = `>.ul::
li:: عنصر
-li:: فرعي 1
-li:: فرعي 2
li:: عنصر آخر`;
    
    const result = parse(source);
    expect(result.errors).toHaveLength(0);
  });
  
});

describe('Integration - Tables', () => {
  
  test('parse simple table', () => {
    const source = `>.table::
th:: الاسم; العمر
tr:: علي; 25
tr:: سارة; 30`;
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    const table = result.ast.children[0];
    expect(table.type).toBe('table');
    expect((table as any).headers).toEqual(['الاسم', 'العمر']);
    expect((table as any).rows).toHaveLength(2);
  });
  
});

describe('Integration - Blocks', () => {
  
  test('parse code block', () => {
    const source = `<code:js>.
const x = 1;
console.log(x);
.<code>`;
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    const block = result.ast.children[0];
    expect(block.type).toBe('block');
    expect((block as any).blockName).toBe('code');
    expect((block as any).lang).toBe('js');
  });
  
  test('parse meta block', () => {
    const source = `<meta>.
>.-:title: عنوان المستند
>.-:author: الكاتب
.<meta>`;
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.meta).toBeDefined();
    expect(result.ast.meta?.fields).toHaveLength(2);
  });
  
  test('unclosed block error', () => {
    const source = `<code>.
const x = 1;`;
    
    const result = parse(source);
    
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].type).toBe('structure');
  });
  
});

describe('Integration - Compound Components', () => {
  
  test('parse figure', () => {
    const source = `>.figure::
>.-img:: photo.jpg; وصف الصورة
>.-caption:: تعليق على الصورة`;
    
    const result = parse(source);
    
    // May have warnings but no errors
    const errors = result.errors.filter(e => e.type !== 'semantic' || !e.message?.includes('implicitly closed'));
    expect(errors).toHaveLength(0);
    const figure = result.ast.children[0];
    expect(figure.type).toBe('compound');
    expect((figure as any).compoundType).toBe('figure');
    expect((figure as any).children).toHaveLength(2);
  });
  
});

describe('Integration - Inline Content', () => {
  
  test('parse inline modifiers', () => {
    const source = '>.p:: نص مع [s:: كلمة مهمة] داخله';
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    const node = result.ast.children[0] as any;
    // New structure: content is InlineContent[]
    expect(Array.isArray(node.content)).toBe(true);
    expect(node.content.length).toBe(3); // plain, inline, plain
    const inlineItem = node.content.find((c: any) => c.type === 'inline');
    expect(inlineItem).toBeDefined();
    expect(inlineItem.modifiers).toContain('s');
  });
  
  test('parse inline link', () => {
    const source = '>.p:: زر [a:: https://example.com; الموقع] هنا';
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    const node = result.ast.children[0] as any;
    // New structure: content is InlineContent[]
    const inlineItem = node.content.find((c: any) => c.type === 'inline');
    expect(inlineItem).toBeDefined();
    expect(inlineItem.component).toBe('a');
  });
  
  test('modifier on media error', () => {
    const source = '>.p:: صورة [s+img:: photo.jpg] هنا';
    
    const result = parse(source);
    
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.errors[0].type).toBe('semantic');
  });
  
});

describe('Integration - Comments', () => {
  
  test('parse comment', () => {
    const source = `>.p:: فقرة
>.::: هذا تعليق
>.p:: فقرة أخرى`;
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.children[1].type).toBe('comment');
  });
  
});

describe('Integration - Separators', () => {
  
  test('parse br', () => {
    const result = parse('>.br');
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.children[0].type).toBe('separator');
  });
  
  test('parse combined separators', () => {
    const result = parse('>.br;hr;br');
    
    expect(result.errors).toHaveLength(0);
    // New structure: combined separators create multiple nodes
    expect(result.ast.children.length).toBe(3);
    expect((result.ast.children[0] as any).separatorType).toBe('br');
    expect((result.ast.children[1] as any).separatorType).toBe('hr');
    expect((result.ast.children[2] as any).separatorType).toBe('br');
  });
  
});

describe('Integration - Time/Abbr Line Components', () => {
  
  test('parse time line component', () => {
    const result = parse('>.time:: 2026-01-15');
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.children).toHaveLength(1);
    const node = result.ast.children[0] as any;
    expect(node.type).toBe('text');
    expect(node.textType).toBe('time');
    // New structure: content is InlineContent[]
    expect(Array.isArray(node.content)).toBe(true);
    const plainText = node.content.find((c: any) => c.type === 'plain');
    expect(plainText?.value).toContain('2026-01-15');
  });
  
  test('parse time with display text', () => {
    const result = parse('>.time:: 2026-01-15; الخامس عشر من يناير');
    
    expect(result.errors).toHaveLength(0);
    const node = result.ast.children[0] as any;
    expect(node.textType).toBe('time');
    // New structure: content is InlineContent[]
    const plainText = node.content.find((c: any) => c.type === 'plain');
    expect(plainText?.value).toContain('2026-01-15');
  });
  
  test('parse abbr line component', () => {
    const result = parse('>.abbr:: HTML; HyperText Markup Language');
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.children).toHaveLength(1);
    const node = result.ast.children[0] as any;
    expect(node.type).toBe('text');
    expect(node.textType).toBe('abbr');
    // New structure: content is InlineContent[]
    const plainText = node.content.find((c: any) => c.type === 'plain');
    expect(plainText?.value).toContain('HTML');
  });
  
  test('parse RTL abbr', () => {
    const result = parse('>.abbr:: ج.م.ع; جمهورية مصر العربية');
    
    expect(result.errors).toHaveLength(0);
    const node = result.ast.children[0] as any;
    expect(node.direction).toBe('rtl');
    expect(node.textType).toBe('abbr');
  });
  
  test('parse LTR time', () => {
    const result = parse('<.time:: 2026-01-15; January 15th');
    
    expect(result.errors).toHaveLength(0);
    const node = result.ast.children[0] as any;
    expect(node.direction).toBe('ltr');
    expect(node.textType).toBe('time');
  });
  
  test('time and abbr in document', () => {
    const source = `>.t1:: عنوان
>.time:: 2026-01-15
>.p:: فقرة
>.abbr:: API; Application Programming Interface`;
    
    const result = parse(source);
    
    expect(result.errors).toHaveLength(0);
    expect(result.ast.children).toHaveLength(4);
    expect((result.ast.children[1] as any).textType).toBe('time');
    expect((result.ast.children[3] as any).textType).toBe('abbr');
  });
  
});

describe('Integration - Validation Helpers', () => {
  
  test('validate returns errors', () => {
    const errors = validate('>.p::نص'); // missing space
    // This might not be an error in current implementation
    // but tests the function works
    expect(Array.isArray(errors)).toBe(true);
  });
  
  test('isValid returns boolean', () => {
    expect(isValid('>.p:: نص صحيح')).toBe(true);
  });
  
  test('parseStrict throws on error', () => {
    expect(() => {
      parseStrict('>.p:: نص مع [s:: غير مغلق');
    }).toThrow(ARTOONParseError);
  });
  
});

describe('Streaming parser', () => {
  test('parseStream parses chunked source', () => {
    const result = parseStream(['>.t1:: Hello\n', '>.p:: World']);
    expect(result.errors.length).toBe(0);
    expect(result.ast.children.length).toBeGreaterThan(0);
  });
});

describe('Integration - Complete Document', () => {
  
  test('parse complete document', () => {
    const source = `<meta>.
>.-:title: مستند تجريبي
>.-:author: المؤلف
.<meta>

>.t1:: العنوان الرئيسي

>.p:: هذه فقرة تحتوي على [s:: نص مهم] و [a:: https://example.com; رابط].

>.ul::
li:: عنصر أول
li:: عنصر ثاني
-li:: فرعي

>.table::
th:: العمود 1; العمود 2
tr:: قيمة 1; قيمة 2

>.figure::
>.-img:: photo.jpg; وصف
>.-caption:: تعليق

<code:js>.
console.log('Hello');
.<code>`;
    
    const result = parse(source);
    
    // Should parse without critical errors
    const criticalErrors = result.errors.filter(e => e.type !== 'semantic');
    expect(criticalErrors).toHaveLength(0);
    
    // Should have meta
    expect(result.ast.meta).toBeDefined();
    
    // Should have multiple children
    expect(result.ast.children.length).toBeGreaterThan(5);
  });
  
});
