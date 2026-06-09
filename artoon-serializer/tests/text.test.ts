// ARTOON Serializer - Text Node Tests

import { serializeText } from '../src/nodes/text';
import { TextNode } from '@artoon/ast';

describe('serializeText', () => {
  it('should serialize RTL paragraph', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: 'مرحباً بالعالم' }]
    };
    
    expect(serializeText(node)).toBe('>.p:: مرحباً بالعالم');
  });
  
  it('should serialize LTR paragraph', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'p',
      direction: 'ltr',
      line: 1,
      content: [{ type: 'plain', value: 'Hello World' }]
    };
    
    expect(serializeText(node)).toBe('<.p:: Hello World');
  });
  
  it('should serialize heading t1', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 't1',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: 'عنوان رئيسي' }]
    };
    
    expect(serializeText(node)).toBe('>.t1:: عنوان رئيسي');
  });
  
  it('should serialize heading t2-t6', () => {
    const types: Array<'t2' | 't3' | 't4' | 't5' | 't6'> = ['t2', 't3', 't4', 't5', 't6'];
    
    for (const type of types) {
      const node: TextNode = {
        type: 'text',

        nodeType: 'text',
        textType: type,
        direction: 'ltr',
        line: 1,
        content: [{ type: 'plain', value: 'Heading' }]
      };
      
      expect(serializeText(node)).toBe(`<.${type}:: Heading`);
    }
  });
  
  it('should serialize blockquote', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'q',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: 'اقتباس مهم' }]
    };
    
    expect(serializeText(node)).toBe('>.q:: اقتباس مهم');
  });
  
  it('should serialize preformatted text', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'pre',
      direction: 'ltr',
      line: 1,
      content: [{ type: 'plain', value: 'code here' }]
    };
    
    expect(serializeText(node)).toBe('<.pre:: code here');
  });
  
  it('should serialize text with inline modifiers', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: 1,
      content: [
        { type: 'plain', value: 'نص عادي مع ' },
        { type: 'inline', modifiers: ['s'], attributes: {}, value: 'كلمة مهمة' },
        { type: 'plain', value: ' داخله' }
      ]
    };
    
    expect(serializeText(node)).toBe('>.p:: نص عادي مع [s:: كلمة مهمة] داخله');
  });
  
  it('should serialize text with multiple modifiers', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: 1,
      content: [
        { type: 'inline', modifiers: ['s', 'e'], attributes: {}, value: 'مهم ومؤكد' }
      ]
    };
    
    expect(serializeText(node)).toBe('>.p:: [s+e:: مهم ومؤكد]');
  });
  
  it('should serialize text with link', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: 1,
      content: [
        { type: 'plain', value: 'زر ' },
        { 
          type: 'inline', 
          component: 'a', 
          attributes: { url: 'https://example.com', text: 'الرابط' }
        }
      ]
    };
    
    expect(serializeText(node)).toBe('>.p:: زر [a:: https://example.com; الرابط]');
  });
  
  it('should serialize mixed content (Arabic with English)', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'p',
      direction: 'rtl',
      line: 1,
      content: [
        { type: 'plain', value: 'هذه جملة عربية تحتوي على كلمة English وتستمر' }
      ]
    };
    
    expect(serializeText(node)).toBe('>.p:: هذه جملة عربية تحتوي على كلمة English وتستمر');
  });
  
  it('should serialize time line component', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'time',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: '2026-01-15' }]
    };
    
    expect(serializeText(node)).toBe('>.time:: 2026-01-15');
  });
  
  it('should serialize time with display text', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'time',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: '2026-01-15; الخامس عشر من يناير' }]
    };
    
    expect(serializeText(node)).toBe('>.time:: 2026-01-15; الخامس عشر من يناير');
  });
  
  it('should serialize abbr line component', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'abbr',
      direction: 'ltr',
      line: 1,
      content: [{ type: 'plain', value: 'HTML; HyperText Markup Language' }]
    };
    
    expect(serializeText(node)).toBe('<.abbr:: HTML; HyperText Markup Language');
  });
  
  it('should serialize RTL abbr', () => {
    const node: TextNode = {
      type: 'text',

      nodeType: 'text',
      textType: 'abbr',
      direction: 'rtl',
      line: 1,
      content: [{ type: 'plain', value: 'ج.م.ع; جمهورية مصر العربية' }]
    };
    
    expect(serializeText(node)).toBe('>.abbr:: ج.م.ع; جمهورية مصر العربية');
  });
});
