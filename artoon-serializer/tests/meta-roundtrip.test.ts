/**
 * META Block Roundtrip Tests
 * 
 * Tests for META block roundtrip: ARTOON → Parse → Serialize → Parse
 */

import { parse } from '@artoon/parser';
import { serializeBlock } from '../src/nodes/block';

describe('META Block Roundtrip', () => {
  test('should roundtrip META block with single field', () => {
    const input = `<meta>.
>.-:title: Test Document
.<meta>`;
    
    // Parse
    const parsed1 = parse(input);
    expect(parsed1.errors).toHaveLength(0);
    expect(parsed1.ast.meta).toBeDefined();
    
    // Serialize
    const serialized = serializeBlock(parsed1.ast.meta! as any);
    
    // Parse again
    const parsed2 = parse(serialized);
    expect(parsed2.errors).toHaveLength(0);
    expect(parsed2.ast.meta).toBeDefined();
    
    // Compare
    expect(parsed2.ast.meta?.blockName).toBe('meta');
    expect(parsed2.ast.meta?.fields?.length).toBe(1);
    expect(parsed2.ast.meta?.fields?.[0].name).toBe('title');
    expect(parsed2.ast.meta?.fields?.[0].value).toBe('Test Document');
  });

  test('should roundtrip META block with multiple fields', () => {
    const input = `<meta>.
>.-:title: Test Document
>.-:author: Ahmad Muhammad
>.-:date: 2026-01-18
.<meta>`;
    
    const parsed1 = parse(input);
    const serialized = serializeBlock(parsed1.ast.meta! as any);
    const parsed2 = parse(serialized);
    
    expect(parsed2.ast.meta?.fields?.length).toBe(3);
    expect(parsed2.ast.meta?.fields?.[0].name).toBe('title');
    expect(parsed2.ast.meta?.fields?.[1].name).toBe('author');
    expect(parsed2.ast.meta?.fields?.[2].name).toBe('date');
  });

  test('should roundtrip META block with Arabic text', () => {
    const input = `<meta>.
>.-:title: عنوان المستند
>.-:author: أحمد محمد
.<meta>`;
    
    const parsed1 = parse(input);
    const serialized = serializeBlock(parsed1.ast.meta! as any);
    const parsed2 = parse(serialized);
    
    expect(parsed2.ast.meta?.fields?.[0].value).toBe('عنوان المستند');
    expect(parsed2.ast.meta?.fields?.[1].value).toBe('أحمد محمد');
  });

  test('should roundtrip META block with special characters', () => {
    const input = `<meta>.
>.-:title: Title with "quotes" and 'apostrophes'
>.-:url: https://example.com/page?param=value
.<meta>`;
    
    const parsed1 = parse(input);
    const serialized = serializeBlock(parsed1.ast.meta! as any);
    const parsed2 = parse(serialized);
    
    expect(parsed2.ast.meta?.fields?.[0].value).toContain('quotes');
    expect(parsed2.ast.meta?.fields?.[1].value).toContain('https://example.com');
  });

  test('should roundtrip META block with field names containing hyphens', () => {
    const input = `<meta>.
>.-:og-title: Open Graph Title
>.-:twitter-card: summary
.<meta>`;
    
    const parsed1 = parse(input);
    const serialized = serializeBlock(parsed1.ast.meta! as any);
    const parsed2 = parse(serialized);
    
    expect(parsed2.ast.meta?.fields?.[0].name).toBe('og-title');
    expect(parsed2.ast.meta?.fields?.[1].name).toBe('twitter-card');
  });

  test('should roundtrip empty META block', () => {
    const input = `<meta>.
.<meta>`;
    
    const parsed1 = parse(input);
    const serialized = serializeBlock(parsed1.ast.meta! as any);
    const parsed2 = parse(serialized);
    
    expect(parsed2.ast.meta).toBeDefined();
    expect(parsed2.ast.meta?.blockName).toBe('meta');
  });

  test('should preserve field direction in roundtrip', () => {
    const input = `<meta>.
>.-:title: عنوان
<.-:author: Author
.<meta>`;
    
    const parsed1 = parse(input);
    const serialized = serializeBlock(parsed1.ast.meta! as any);
    const parsed2 = parse(serialized);
    
    expect(parsed2.ast.meta?.fields?.[0].direction).toBe('rtl');
    expect(parsed2.ast.meta?.fields?.[1].direction).toBe('ltr');
  });
});

