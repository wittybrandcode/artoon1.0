/**
 * Converter Tests
 * 
 * Tests for ParsedContent ↔ InlineContent[] conversion.
 * 
 * @migration Part of Type Unification Plan - Phase 0
 */

import { 
  convertParsedToInline, 
  convertInlineToParsed,
  isPlainTextContent,
  isInlineComponentContent,
  hasInlineFormatting,
  getPlainTextFromContent
} from '../src/inline/converter';
import type { ParsedContent, InlineToken } from '../src/ast/types';
import type { InlineContent, PlainText, InlineComponent } from '@artoon/ast';

// ═══════════════════════════════════════════════════════════════════════════
// TEST HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function createParsedContent(text: string, inlines: Partial<InlineToken>[] = []): ParsedContent {
  return {
    text,
    inlines: inlines.map((inline, index) => ({
      index: inline.index ?? index,
      modifiers: inline.modifiers ?? [],
      componentType: inline.componentType ?? null,
      attributes: inline.attributes ?? [],
      raw: inline.raw ?? ''
    }))
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// PLAIN TEXT TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('convertParsedToInline - Plain Text', () => {
  it('handles empty content', () => {
    const result = convertParsedToInline({ text: '', inlines: [] });
    expect(result).toEqual([]);
  });

  it('handles plain text without inlines', () => {
    const result = convertParsedToInline({ 
      text: 'مرحباً بالعالم', 
      inlines: [] 
    });
    expect(result).toEqual([
      { type: 'plain', value: 'مرحباً بالعالم' }
    ]);
  });

  it('handles English text', () => {
    const result = convertParsedToInline({ 
      text: 'Hello World', 
      inlines: [] 
    });
    expect(result).toEqual([
      { type: 'plain', value: 'Hello World' }
    ]);
  });

  it('handles mixed RTL/LTR text', () => {
    const result = convertParsedToInline({ 
      text: 'مرحباً Hello عالم', 
      inlines: [] 
    });
    expect(result).toEqual([
      { type: 'plain', value: 'مرحباً Hello عالم' }
    ]);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// SINGLE INLINE TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('convertParsedToInline - Single Inline', () => {
  it('handles bold text (s modifier)', () => {
    const result = convertParsedToInline({
      text: 'نص {0} هنا',
      inlines: [{
        index: 0,
        modifiers: ['s'],
        componentType: null,
        attributes: ['عريض'],
        raw: '[s:: عريض]'
      }]
    });
    
    expect(result).toHaveLength(3);
    expect(result[0]).toEqual({ type: 'plain', value: 'نص ' });
    expect(result[1]).toMatchObject({ 
      type: 'inline', 
      modifiers: ['s'],
      value: 'عريض'
    });
    expect(result[2]).toEqual({ type: 'plain', value: ' هنا' });
  });

  it('handles italic text (e modifier)', () => {
    const result = convertParsedToInline({
      text: '{0}',
      inlines: [{
        index: 0,
        modifiers: ['e'],
        componentType: null,
        attributes: ['مائل'],
        raw: '[e:: مائل]'
      }]
    });
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ 
      type: 'inline', 
      modifiers: ['e'],
      value: 'مائل'
    });
  });

  it('handles link component', () => {
    // Link attributes: [url, text]
    const result = convertParsedToInline({
      text: 'انقر {0}',
      inlines: [{
        index: 0,
        modifiers: [],
        componentType: 'a',
        attributes: ['https://example.com', 'هنا'],
        raw: '[a:: https://example.com; هنا]'
      }]
    });
    
    expect(result).toHaveLength(2);
    expect(result[0]).toEqual({ type: 'plain', value: 'انقر ' });
    expect(result[1]).toMatchObject({ 
      type: 'inline', 
      component: 'a',
      value: 'هنا'
    });
    expect((result[1] as InlineComponent).attributes).toHaveProperty('url', 'https://example.com');
  });

  it('handles image component', () => {
    // Image attributes: [path, alt, title]
    const result = convertParsedToInline({
      text: '{0}',
      inlines: [{
        index: 0,
        modifiers: [],
        componentType: 'img',
        attributes: ['image.png', 'صورة', 'عنوان'],
        raw: '[img:: image.png; صورة; عنوان]'
      }]
    });
    
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ 
      type: 'inline', 
      component: 'img',
      value: 'image.png'
    });
    expect((result[0] as InlineComponent).attributes).toHaveProperty('path', 'image.png');
    expect((result[0] as InlineComponent).attributes).toHaveProperty('alt', 'صورة');
    expect((result[0] as InlineComponent).attributes).toHaveProperty('title', 'عنوان');
  });

  it('handles code component', () => {
    const result = convertParsedToInline({
      text: 'استخدم {0} للطباعة',
      inlines: [{
        index: 0,
        modifiers: [],
        componentType: 'c',
        attributes: ['console.log()'],
        raw: '[c:: console.log()]'
      }]
    });
    
    expect(result).toHaveLength(3);
    expect(result[1]).toMatchObject({ 
      type: 'inline', 
      component: 'c',
      value: 'console.log()'
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MULTIPLE INLINES TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('convertParsedToInline - Multiple Inlines', () => {
  it('handles multiple inlines in order', () => {
    const result = convertParsedToInline({
      text: '{0} و {1}',
      inlines: [
        { index: 0, modifiers: ['s'], componentType: null, attributes: ['أول'], raw: '' },
        { index: 1, modifiers: ['e'], componentType: null, attributes: ['ثاني'], raw: '' }
      ]
    });
    
    expect(result).toHaveLength(3);
    expect(result[0]).toMatchObject({ type: 'inline', modifiers: ['s'] });
    expect(result[1]).toEqual({ type: 'plain', value: ' و ' });
    expect(result[2]).toMatchObject({ type: 'inline', modifiers: ['e'] });
  });

  it('handles adjacent inlines', () => {
    const result = convertParsedToInline({
      text: '{0}{1}',
      inlines: [
        { index: 0, modifiers: ['s'], componentType: null, attributes: ['أول'], raw: '' },
        { index: 1, modifiers: ['e'], componentType: null, attributes: ['ثاني'], raw: '' }
      ]
    });
    
    expect(result).toHaveLength(2);
    expect(result[0]).toMatchObject({ type: 'inline', modifiers: ['s'] });
    expect(result[1]).toMatchObject({ type: 'inline', modifiers: ['e'] });
  });

  it('handles mixed components and modifiers', () => {
    const result = convertParsedToInline({
      text: 'نص {0} مع {1} ورابط {2}',
      inlines: [
        { index: 0, modifiers: ['s'], componentType: null, attributes: ['عريض'], raw: '' },
        { index: 1, modifiers: [], componentType: 'c', attributes: ['كود'], raw: '' },
        { index: 2, modifiers: [], componentType: 'a', attributes: ['هنا', 'url'], raw: '' }
      ]
    });
    
    expect(result).toHaveLength(6);
    expect(result[0]).toEqual({ type: 'plain', value: 'نص ' });
    expect(result[1]).toMatchObject({ type: 'inline', modifiers: ['s'] });
    expect(result[2]).toEqual({ type: 'plain', value: ' مع ' });
    expect(result[3]).toMatchObject({ type: 'inline', component: 'c' });
    expect(result[4]).toEqual({ type: 'plain', value: ' ورابط ' });
    expect(result[5]).toMatchObject({ type: 'inline', component: 'a' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// EDGE CASES TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('convertParsedToInline - Edge Cases', () => {
  it('handles inline at start', () => {
    const result = convertParsedToInline({
      text: '{0} نص',
      inlines: [{ index: 0, modifiers: ['s'], componentType: null, attributes: ['بداية'], raw: '' }]
    });
    
    expect(result[0]).toMatchObject({ type: 'inline' });
    expect(result[1]).toEqual({ type: 'plain', value: ' نص' });
  });

  it('handles inline at end', () => {
    const result = convertParsedToInline({
      text: 'نص {0}',
      inlines: [{ index: 0, modifiers: ['s'], componentType: null, attributes: ['نهاية'], raw: '' }]
    });
    
    expect(result[0]).toEqual({ type: 'plain', value: 'نص ' });
    expect(result[1]).toMatchObject({ type: 'inline' });
  });

  it('handles multiple modifiers', () => {
    const result = convertParsedToInline({
      text: '{0}',
      inlines: [{ index: 0, modifiers: ['s', 'e', 'u'], componentType: null, attributes: ['متعدد'], raw: '' }]
    });
    
    expect((result[0] as InlineComponent).modifiers).toEqual(['s', 'e', 'u']);
  });

  it('handles empty attributes', () => {
    const result = convertParsedToInline({
      text: '{0}',
      inlines: [{ index: 0, modifiers: ['s'], componentType: null, attributes: [], raw: '' }]
    });
    
    expect(result[0]).toMatchObject({ type: 'inline', modifiers: ['s'] });
    expect((result[0] as InlineComponent).value).toBeUndefined();
  });

  it('handles key=value attributes', () => {
    // For time component: [datetime, display]
    // key=value pairs are only parsed for unknown component types
    const result = convertParsedToInline({
      text: '{0}',
      inlines: [{ 
        index: 0, 
        modifiers: ['s'], 
        componentType: null, 
        attributes: ['نص', 'format=short'], 
        raw: '' 
      }]
    });
    
    expect((result[0] as InlineComponent).attributes).toHaveProperty('format', 'short');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// REVERSE CONVERSION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('convertInlineToParsed', () => {
  it('handles plain text only', () => {
    const content: InlineContent[] = [
      { type: 'plain', value: 'مرحباً بالعالم' }
    ];
    
    const result = convertInlineToParsed(content);
    expect(result.text).toBe('مرحباً بالعالم');
    expect(result.inlines).toHaveLength(0);
  });

  it('handles single inline', () => {
    const content: InlineContent[] = [
      { type: 'plain', value: 'نص ' },
      { type: 'inline', modifiers: ['s'], attributes: { value: 'عريض' }, value: 'عريض' },
      { type: 'plain', value: ' هنا' }
    ];
    
    const result = convertInlineToParsed(content);
    expect(result.text).toBe('نص {0} هنا');
    expect(result.inlines).toHaveLength(1);
    expect(result.inlines[0].modifiers).toEqual(['s']);
  });

  it('handles multiple inlines', () => {
    const content: InlineContent[] = [
      { type: 'inline', modifiers: ['s'], attributes: { value: 'أول' }, value: 'أول' },
      { type: 'plain', value: ' و ' },
      { type: 'inline', modifiers: ['e'], attributes: { value: 'ثاني' }, value: 'ثاني' }
    ];
    
    const result = convertInlineToParsed(content);
    expect(result.text).toBe('{0} و {1}');
    expect(result.inlines).toHaveLength(2);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// ROUNDTRIP TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Roundtrip Conversion', () => {
  const testCases: ParsedContent[] = [
    { text: 'نص عادي', inlines: [] },
    { 
      text: 'نص {0} هنا', 
      inlines: [{ index: 0, modifiers: ['s'], componentType: null, attributes: ['عريض'], raw: '' }] 
    },
    { 
      text: '{0} و {1}', 
      inlines: [
        { index: 0, modifiers: ['s'], componentType: null, attributes: ['أول'], raw: '' },
        { index: 1, modifiers: ['e'], componentType: null, attributes: ['ثاني'], raw: '' }
      ] 
    },
  ];

  testCases.forEach((original, i) => {
    it(`roundtrip test case ${i + 1}`, () => {
      const inline = convertParsedToInline(original);
      const back = convertInlineToParsed(inline);
      
      // Text should match
      expect(back.text).toBe(original.text);
      // Number of inlines should match
      expect(back.inlines.length).toBe(original.inlines.length);
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTION TESTS
// ═══════════════════════════════════════════════════════════════════════════

describe('Utility Functions', () => {
  describe('isPlainTextContent', () => {
    it('returns true for plain text', () => {
      expect(isPlainTextContent({ type: 'plain', value: 'test' })).toBe(true);
    });

    it('returns false for inline component', () => {
      expect(isPlainTextContent({ type: 'inline', attributes: {} })).toBe(false);
    });
  });

  describe('isInlineComponentContent', () => {
    it('returns true for inline component', () => {
      expect(isInlineComponentContent({ type: 'inline', attributes: {} })).toBe(true);
    });

    it('returns false for plain text', () => {
      expect(isInlineComponentContent({ type: 'plain', value: 'test' })).toBe(false);
    });
  });

  describe('hasInlineFormatting', () => {
    it('returns false for plain text only', () => {
      expect(hasInlineFormatting({ text: 'test', inlines: [] })).toBe(false);
    });

    it('returns true when inlines present', () => {
      expect(hasInlineFormatting({ 
        text: '{0}', 
        inlines: [{ index: 0, modifiers: ['s'], componentType: null, attributes: [], raw: '' }] 
      })).toBe(true);
    });
  });

  describe('getPlainTextFromContent', () => {
    it('extracts text from plain content', () => {
      const content: InlineContent[] = [
        { type: 'plain', value: 'Hello ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'World' },
        { type: 'plain', value: '!' }
      ];
      
      expect(getPlainTextFromContent(content)).toBe('Hello World!');
    });
  });
});
