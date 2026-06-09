// ARTOON Inline Tokenizer Tests

import { parseInlineContent, hasInlineTokens } from '../src/inline';

describe('Inline - Basic Parsing', () => {
  
  test('no inline tokens', () => {
    const { result, errors } = parseInlineContent('نص عادي بدون تضمين', 1);
    expect(result.text).toBe('نص عادي بدون تضمين');
    expect(result.inlines).toHaveLength(0);
    expect(errors).toHaveLength(0);
  });
  
  test('single inline token', () => {
    const { result, errors } = parseInlineContent('نص مع [s:: مهم] داخله', 1);
    expect(result.text).toBe('نص مع {0} داخله');
    expect(result.inlines).toHaveLength(1);
    expect(result.inlines[0].modifiers).toContain('s');
    expect(errors).toHaveLength(0);
  });
  
  test('multiple inline tokens', () => {
    const { result, errors } = parseInlineContent('[s:: أول] و [e:: ثاني]', 1);
    expect(result.text).toBe('{0} و {1}');
    expect(result.inlines).toHaveLength(2);
  });
  
});

describe('Inline - Modifiers', () => {
  
  test('single modifier', () => {
    const { result } = parseInlineContent('[s:: نص]', 1);
    expect(result.inlines[0].modifiers).toEqual(['s']);
  });
  
  test('multiple modifiers', () => {
    const { result } = parseInlineContent('[s+e:: نص]', 1);
    expect(result.inlines[0].modifiers).toEqual(['s', 'e']);
  });
  
  test('all valid modifiers', () => {
    const modifiers = ['s', 'e', 'u', 'd', 'mark', 'sub', 'sup'];
    for (const mod of modifiers) {
      const { result, errors } = parseInlineContent(`[${mod}:: نص]`, 1);
      expect(errors).toHaveLength(0);
      expect(result.inlines[0].modifiers).toContain(mod);
    }
  });
  
  test('invalid modifier', () => {
    const { errors } = parseInlineContent('[x:: نص]', 1);
    // x is treated as component type, not modifier - no error
    expect(errors).toHaveLength(0);
  });
  
});

describe('Inline - Component Types', () => {
  
  test('link component', () => {
    const { result } = parseInlineContent('[a:: https://example.com; رابط]', 1);
    expect(result.inlines[0].componentType).toBe('a');
    expect(result.inlines[0].attributes).toEqual(['https://example.com', 'رابط']);
  });
  
  test('image component', () => {
    const { result } = parseInlineContent('[img:: photo.jpg; وصف]', 1);
    expect(result.inlines[0].componentType).toBe('img');
    expect(result.inlines[0].attributes).toEqual(['photo.jpg', 'وصف']);
  });
  
  test('code component', () => {
    const { result } = parseInlineContent('[c:: console.log(); js]', 1);
    expect(result.inlines[0].componentType).toBe('c');
    expect(result.inlines[0].attributes).toEqual(['console.log()', 'js']);
  });
  
  test('abbr component', () => {
    const { result } = parseInlineContent('[abbr:: HTML; HyperText Markup Language]', 1);
    expect(result.inlines[0].componentType).toBe('abbr');
    expect(result.inlines[0].attributes).toHaveLength(2);
  });
  
  test('time component', () => {
    const { result } = parseInlineContent('[time:: 2026-01-06; السادس من يناير]', 1);
    expect(result.inlines[0].componentType).toBe('time');
  });
  
});

describe('Inline - Modifier + Type', () => {
  
  test('modifier with link', () => {
    const { result, errors } = parseInlineContent('[s+a:: url; text]', 1);
    expect(errors).toHaveLength(0);
    expect(result.inlines[0].modifiers).toContain('s');
    expect(result.inlines[0].componentType).toBe('a');
  });
  
  test('multiple modifiers with type', () => {
    const { result } = parseInlineContent('[s+e+u+a:: url; text]', 1);
    expect(result.inlines[0].modifiers).toEqual(['s', 'e', 'u']);
    expect(result.inlines[0].componentType).toBe('a');
  });
  
});

describe('Inline - Modifier Restrictions', () => {
  
  test('modifier on img - error', () => {
    const { errors } = parseInlineContent('[s+img:: photo.jpg]', 1);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('semantic');
    expect(errors[0].message).toContain('Modifiers not allowed');
  });
  
  test('modifier on video - error', () => {
    const { errors } = parseInlineContent('[e+video:: video.mp4]', 1);
    expect(errors).toHaveLength(1);
  });
  
  test('modifier on audio - error', () => {
    const { errors } = parseInlineContent('[s+audio:: audio.mp3]', 1);
    expect(errors).toHaveLength(1);
  });
  
  test('modifier on file - error', () => {
    const { errors } = parseInlineContent('[u+file:: doc.pdf]', 1);
    expect(errors).toHaveLength(1);
  });
  
  test('modifier on code - error', () => {
    const { errors } = parseInlineContent('[s+c:: code]', 1);
    expect(errors).toHaveLength(1);
  });
  
});

describe('Inline - Error Handling', () => {
  
  test('unclosed bracket', () => {
    const { errors } = parseInlineContent('نص مع [s:: غير مغلق', 1);
    expect(errors).toHaveLength(1);
    expect(errors[0].type).toBe('syntax');
  });
  
  test('missing separator', () => {
    const { errors } = parseInlineContent('[s نص]', 1);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('::');
  });
  
});

describe('Inline - hasInlineTokens', () => {
  
  test('has tokens', () => {
    expect(hasInlineTokens('text [s:: bold] more')).toBe(true);
  });
  
  test('no tokens', () => {
    expect(hasInlineTokens('plain text')).toBe(false);
  });
  
});
