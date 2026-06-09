// ARTOON Serializer - Round-trip Tests
// Verifies: parse(serialize(parse(source))) === parse(source)

import { serialize } from '../src';
import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';

describe('Round-trip Tests', () => {
  /**
   * Test round-trip: source → AST → serialized → AST
   * The two ASTs should be equivalent
   */
  function testRoundtrip(source: string, description: string) {
    it(description, () => {
      const result1 = parse(source);
      const doc1 = transform(result1);
      const serialized = serialize(doc1, { blankLinesBetween: false });
      const result2 = parse(serialized);
      const doc2 = transform(result2);
      
      // Compare content (ignoring line numbers which may differ)
      expect(normalizeAST(doc2.content)).toEqual(normalizeAST(doc1.content));
    });
  }
  
  /**
   * Normalize AST by removing line numbers for comparison
   */
  function normalizeAST(content: readonly any[]): any[] {
    return content.map(node => {
      const { line, ...rest } = node;
      
      // Recursively normalize nested content
      if (rest.content && Array.isArray(rest.content)) {
        rest.content = normalizeAST(rest.content);
      }
      if (rest.items && Array.isArray(rest.items)) {
        rest.items = rest.items.map((item: any) => {
          const { children, ...itemRest } = item;
          if (children) {
            return { ...itemRest, children: { ...children, items: normalizeAST([children]).map((n: any) => n.items).flat() } };
          }
          return itemRest;
        });
      }
      if (rest.rows && Array.isArray(rest.rows)) {
        // Keep rows as-is
      }
      if (rest.children && Array.isArray(rest.children)) {
        rest.children = rest.children.map((child: any) => ({
          ...child,
          node: normalizeAST([child.node])[0]
        }));
      }
      
      return rest;
    });
  }
  
  // Text nodes
  describe('Text Nodes', () => {
    testRoundtrip('>.p:: مرحباً بالعالم', 'RTL paragraph');
    testRoundtrip('<.p:: Hello World', 'LTR paragraph');
    testRoundtrip('>.t1:: عنوان رئيسي', 'RTL heading t1');
    testRoundtrip('<.t2:: Heading 2', 'LTR heading t2');
    testRoundtrip('>.q:: اقتباس مهم', 'RTL blockquote');
    testRoundtrip('<.pre:: code here', 'LTR preformatted');
  });
  
  // Inline content
  describe('Inline Content', () => {
    testRoundtrip('>.p:: نص مع [s:: كلمة مهمة] داخله', 'text with strong modifier');
    testRoundtrip('>.p:: [s+e:: مهم ومؤكد]', 'multiple modifiers');
    testRoundtrip('>.p:: زر [a:: https://example.com; الرابط]', 'text with link');
  });
  
  // Separators
  describe('Separators', () => {
    testRoundtrip('>.br', 'line break');
    testRoundtrip('>.hr', 'horizontal rule');
    testRoundtrip('<.wbr', 'word break');
  });
  
  // Comments
  describe('Comments', () => {
    testRoundtrip('>.::: هذا تعليق', 'RTL comment');
    testRoundtrip('<.::: This is a comment', 'LTR comment');
  });
  
  // Lists
  describe('Lists', () => {
    testRoundtrip(
      '>.ul::\nli:: عنصر أول\nli:: عنصر ثاني',
      'unordered list'
    );
    
    testRoundtrip(
      '<.ol::\nli:: First\nli:: Second',
      'ordered list'
    );
  });
  
  // Tables
  describe('Tables', () => {
    testRoundtrip(
      '>.table::\nth:: العمود 1; العمود 2\ntr:: قيمة 1; قيمة 2',
      'simple table'
    );
  });
  
  // Blocks
  describe('Blocks', () => {
    testRoundtrip(
      '<code:js>.\nconst x = 1;\n.<code>',
      'code block with language'
    );
    
    testRoundtrip(
      '<code>.\nplain code\n.<code>',
      'code block without language'
    );
  });
  
  // Mixed content
  describe('Mixed Content', () => {
    testRoundtrip(
      '>.p:: هذه جملة عربية تحتوي على كلمة English وتستمر',
      'Arabic with English words'
    );
    
    testRoundtrip(
      '<.p:: This is English with كلمة عربية inside',
      'English with Arabic words'
    );
  });
});
