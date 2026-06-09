// ARTOON Serializer - Inline Content Tests

import { serializeInlineContent } from '../src/inline';
import { InlineContent } from '@artoon/ast';

describe('serializeInlineContent', () => {
  it('should serialize plain text', () => {
    const content: InlineContent[] = [
      { type: 'plain', value: 'نص عادي' }
    ];
    
    expect(serializeInlineContent(content)).toBe('نص عادي');
  });
  
  it('should serialize single modifier', () => {
    const content: InlineContent[] = [
      { type: 'inline', modifiers: ['s'], attributes: {}, value: 'مهم' }
    ];
    
    expect(serializeInlineContent(content)).toBe('[s:: مهم]');
  });
  
  it('should serialize multiple modifiers', () => {
    const content: InlineContent[] = [
      { type: 'inline', modifiers: ['s', 'e'], attributes: {}, value: 'مهم ومؤكد' }
    ];
    
    expect(serializeInlineContent(content)).toBe('[s+e:: مهم ومؤكد]');
  });
  
  it('should serialize all modifier types', () => {
    const modifiers = ['s', 'e', 'u', 'd', 'mark', 'sub', 'sup'] as const;
    
    for (const mod of modifiers) {
      const content: InlineContent[] = [
        { type: 'inline', modifiers: [mod], attributes: {}, value: 'text' }
      ];
      
      expect(serializeInlineContent(content)).toBe(`[${mod}:: text]`);
    }
  });
  
  it('should serialize link component', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'a', 
        attributes: { url: 'https://example.com', text: 'الرابط' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[a:: https://example.com; الرابط]');
  });
  
  it('should serialize link with modifier', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        modifiers: ['s'],
        component: 'a', 
        attributes: { url: 'https://example.com', text: 'رابط مهم' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[s+a:: https://example.com; رابط مهم]');
  });
  
  it('should serialize inline image', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'img', 
        attributes: { path: 'photo.jpg', alt: 'وصف', title: 'عنوان' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[img:: photo.jpg; وصف; عنوان]');
  });
  
  it('should serialize inline video', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'video', 
        attributes: { path: 'video.mp4', title: 'فيديو' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[video:: video.mp4; فيديو]');
  });
  
  it('should serialize inline audio', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'audio', 
        attributes: { path: 'audio.mp3', title: 'صوت' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[audio:: audio.mp3; صوت]');
  });
  
  it('should serialize inline file', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'file', 
        attributes: { path: 'doc.pdf', label: 'ملف PDF' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[file:: doc.pdf; ملف PDF]');
  });
  
  it('should serialize time component', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'time', 
        attributes: { datetime: '2026-01-11', display: 'اليوم' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[time:: 2026-01-11; اليوم]');
  });
  
  it('should serialize time with modifier', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        modifiers: ['s'],
        component: 'time', 
        attributes: { datetime: '2026-01-11', display: 'تاريخ مهم' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[s+time:: 2026-01-11; تاريخ مهم]');
  });
  
  it('should serialize abbreviation', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'abbr', 
        attributes: { short: 'HTML', full: 'HyperText Markup Language' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[abbr:: HTML; HyperText Markup Language]');
  });
  
  it('should serialize inline code', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'c', 
        attributes: { code: 'const x = 1' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[c:: const x = 1]');
  });
  
  it('should serialize inline code with language', () => {
    const content: InlineContent[] = [
      { 
        type: 'inline', 
        component: 'c', 
        attributes: { code: 'const x = 1', lang: 'js' }
      }
    ];
    
    expect(serializeInlineContent(content)).toBe('[c:: const x = 1; js]');
  });
  
  it('should serialize mixed content', () => {
    const content: InlineContent[] = [
      { type: 'plain', value: 'نص عادي مع ' },
      { type: 'inline', modifiers: ['s'], attributes: {}, value: 'كلمة مهمة' },
      { type: 'plain', value: ' و' },
      { type: 'inline', component: 'a', attributes: { url: 'https://example.com', text: 'رابط' } },
      { type: 'plain', value: ' في النهاية' }
    ];
    
    expect(serializeInlineContent(content)).toBe(
      'نص عادي مع [s:: كلمة مهمة] و[a:: https://example.com; رابط] في النهاية'
    );
  });
});
