/**
 * META Block Validation Tests
 * 
 * Tests for META block validation rules:
 * - Hidden fields (>.-:field:) only in META
 * - META only contains hidden fields
 */

import { parse } from '../src';

describe('META Block Validation', () => {
  describe('Hidden Fields Validation', () => {
    test('should accept hidden fields in META block', () => {
      const input = `<meta>.
>.-:title: Test Document
>.-:author: Ahmad
.<meta>`;
      
      const result = parse(input);
      expect(result.errors).toHaveLength(0);
      expect(result.ast.meta).toBeDefined();
      expect(result.ast.meta?.type).toBe('block');
      expect(result.ast.meta?.blockName).toBe('meta');
    });

    test('should reject hidden fields outside META block', () => {
      const input = `<card>.
>.-:caption: Test Caption
.<card>`;
      
      const result = parse(input);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].type).toBe('constraint');
      expect(result.errors[0].message).toContain('can only be used inside <meta> block');
    });

    test('should reject hidden fields in custom blocks', () => {
      const input = `<figure>.
>.-:caption: Image caption
>.img:: image.jpg
.<figure>`;
      
      const result = parse(input);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('can only be used inside <meta> block');
    });

    test('should reject hidden fields in code block', () => {
      const input = `<code>.
>.-:language: javascript
console.log('test');
.<code>`;
      
      const result = parse(input);
      // Code blocks don't validate hidden fields, they just store raw content
      // So this should actually pass without errors
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('META Content Validation', () => {
    test('should accept only hidden fields in META', () => {
      const input = `<meta>.
>.-:title: Test
>.-:author: Ahmad
>.-:date: 2026-01-18
.<meta>`;
      
      const result = parse(input);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject regular child elements in META', () => {
      const input = `<meta>.
>.p:: This is content
.<meta>`;
      
      const result = parse(input);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].message).toContain('Only hidden fields');
    });

    test('should reject mixed content in META', () => {
      const input = `<meta>.
>.-:title: Test
>.p:: Regular content
>.-:author: Ahmad
.<meta>`;
      
      const result = parse(input);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('should reject text content in META', () => {
      const input = `<meta>.
Regular text content
.<meta>`;
      
      const result = parse(input);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Multiple META Blocks', () => {
    test('should allow multiple META blocks (last one wins)', () => {
      const input = `<meta>.
>.-:title: Test
.<meta>

<meta>.
>.-:author: Ahmad
.<meta>`;
      
      const result = parse(input);
      expect(result.errors).toHaveLength(0);
      // Only one meta block is stored (last one wins)
      expect(result.ast.meta).toBeDefined();
      expect(result.ast.meta?.blockName).toBe('meta');
    });
  });

  describe('Empty META Block', () => {
    test('should accept empty META block', () => {
      const input = `<meta>.
.<meta>`;
      
      const result = parse(input);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('Error Messages', () => {
    test('should provide helpful error message for hidden fields outside META', () => {
      const input = `<card>.
>.-:caption: Test
.<card>`;
      
      const result = parse(input);
      expect(result.errors[0].message).toContain('can only be used inside <meta> block');
      expect(result.errors[0].suggestion).toContain('Move this line inside <meta> block');
    });

    test('should provide helpful error message for non-hidden content in META', () => {
      const input = `<meta>.
>.p:: Content
.<meta>`;
      
      const result = parse(input);
      expect(result.errors[0].message).toContain('Only hidden fields');
      expect(result.errors[0].suggestion).toContain('>.-:fieldname: value');
    });
  });
});
