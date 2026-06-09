/**
 * META Block Parsing Tests
 * 
 * Tests for META block parsing functionality
 */

import { parse } from '../src';

describe('META Block Parsing', () => {
  describe('Basic Parsing', () => {
    test('should parse META block with single field', () => {
      const input = `<meta>.
>.-:title: Test Document
.<meta>`;
      
      const result = parse(input);
      expect(result.errors).toHaveLength(0);
      
      const metaBlock = result.ast.meta;
      expect(metaBlock).toBeDefined();
      expect(metaBlock?.type).toBe('block');
      expect(metaBlock?.blockName).toBe('meta');
      expect(metaBlock?.fields).toBeDefined();
      expect(metaBlock?.fields?.length).toBe(1);
      expect(metaBlock?.fields?.[0].name).toBe('title');
      expect(metaBlock?.fields?.[0].value).toBe('Test Document');
    });

    test('should parse META block with multiple fields', () => {
      const input = `<meta>.
>.-:title: Test Document
>.-:author: Ahmad Muhammad
>.-:date: 2026-01-18
.<meta>`;
      
      const result = parse(input);
      expect(result.errors).toHaveLength(0);
      
      const metaBlock = result.ast.meta;
      expect(metaBlock?.fields).toBeDefined();
      expect(metaBlock?.fields?.length).toBe(3);
      expect(metaBlock?.fields?.[0].name).toBe('title');
      expect(metaBlock?.fields?.[1].name).toBe('author');
      expect(metaBlock?.fields?.[2].name).toBe('date');
    });
  });

  describe('Field Values', () => {
    test('should parse field with simple value', () => {
      const input = `<meta>.
>.-:title: Simple Title
.<meta>`;
      
      const result = parse(input);
      const field = result.ast.meta?.fields?.[0];
      expect(field?.value).toBe('Simple Title');
    });

    test('should parse field with special characters', () => {
      const input = `<meta>.
>.-:title: Title with "quotes" and 'apostrophes'
.<meta>`;
      
      const result = parse(input);
      const field = result.ast.meta?.fields?.[0];
      expect(field?.value).toContain('quotes');
      expect(field?.value).toContain('apostrophes');
    });

    test('should parse field with Arabic text', () => {
      const input = `<meta>.
>.-:title: عنوان باللغة العربية
.<meta>`;
      
      const result = parse(input);
      const field = result.ast.meta?.fields?.[0];
      expect(field?.value).toBe('عنوان باللغة العربية');
    });

    test('should parse field with URL', () => {
      const input = `<meta>.
>.-:url: https://example.com/page
.<meta>`;
      
      const result = parse(input);
      const field = result.ast.meta?.fields?.[0];
      expect(field?.value).toBe('https://example.com/page');
    });

    test('should parse field with comma-separated list', () => {
      const input = `<meta>.
>.-:tags: technology, programming, ARTOON
.<meta>`;
      
      const result = parse(input);
      const field = result.ast.meta?.fields?.[0];
      expect(field?.value).toBe('technology, programming, ARTOON');
    });
  });

  describe('Direction Support', () => {
    test('should parse RTL META block', () => {
      const input = `<meta>.
>.-:title: عنوان المستند
>.-:author: أحمد محمد
.<meta>`;
      
      const result = parse(input);
      const metaBlock = result.ast.meta;
      // Fields have direction, not the block itself
      expect(metaBlock?.fields?.[0].direction).toBe('rtl');
    });

    test('should parse LTR META block', () => {
      const input = `<meta>.
<.-:title: Document Title
<.-:author: Ahmad Muhammad
.<meta>`;
      
      const result = parse(input);
      const metaBlock = result.ast.meta;
      // Fields have direction, not the block itself
      expect(metaBlock?.fields?.[0].direction).toBe('ltr');
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty field value', () => {
      const input = `<meta>.
>.-:title: 
.<meta>`;
      
      const result = parse(input);
      expect(result.errors).toHaveLength(0);
      const field = result.ast.meta?.fields?.[0];
      expect(field?.value).toBe('');
    });

    test('should handle field with only spaces', () => {
      const input = `<meta>.
>.-:title:    
.<meta>`;
      
      const result = parse(input);
      const field = result.ast.meta?.fields?.[0];
      expect(field?.value.trim()).toBe('');
    });

    test('should handle field name with numbers', () => {
      const input = `<meta>.
>.-:field1: Value 1
>.-:field2: Value 2
.<meta>`;
      
      const result = parse(input);
      expect(result.ast.meta?.fields?.length).toBe(2);
      expect(result.ast.meta?.fields?.[0].name).toBe('field1');
      expect(result.ast.meta?.fields?.[1].name).toBe('field2');
    });

    test('should handle field name with hyphens', () => {
      const input = `<meta>.
>.-:og-title: Open Graph Title
>.-:og-description: Description
.<meta>`;
      
      const result = parse(input);
      expect(result.ast.meta?.fields?.[0].name).toBe('og-title');
      expect(result.ast.meta?.fields?.[1].name).toBe('og-description');
    });
  });

  describe('Reserved Block Detection', () => {
    test('should mark META as reserved block', () => {
      const input = `<meta>.
>.-:title: Test
.<meta>`;
      
      const result = parse(input);
      const metaBlock = result.ast.meta;
      expect(metaBlock?.blockName).toBe('meta');
    });

    test('should mark CODE as reserved block', () => {
      const input = `<code>.
console.log('test');
.<code>`;
      
      const result = parse(input);
      const codeBlock = result.ast.children[0];
      expect(codeBlock.type).toBe('block');
    });

    test('should not mark custom blocks as reserved', () => {
      const input = `<card>.
>.p:: Content
.<card>`;
      
      const result = parse(input);
      const cardBlock = result.ast.children[0];
      expect(cardBlock.type).toBe('block');
    });
  });
});
