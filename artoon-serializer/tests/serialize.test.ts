// ARTOON Serializer - Main serialize() Tests

import { serialize } from '../src';
import { ARTOONDocument } from '@artoon/ast';

describe('serialize', () => {
  it('should serialize empty document', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: []
    };
    
    expect(serialize(doc)).toBe('');
  });
  
  it('should serialize single paragraph', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: [
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'مرحباً' }]
        }
      ]
    };
    
    expect(serialize(doc)).toBe('>.p:: مرحباً');
  });
  
  it('should serialize multiple paragraphs with blank lines', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: [
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'فقرة أولى' }]
        },
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 2,
          content: [{ type: 'plain', value: 'فقرة ثانية' }]
        }
      ]
    };
    
    expect(serialize(doc)).toBe('>.p:: فقرة أولى\n\n>.p:: فقرة ثانية');
  });
  
  it('should serialize without blank lines when option is false', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: [
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'فقرة أولى' }]
        },
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 2,
          content: [{ type: 'plain', value: 'فقرة ثانية' }]
        }
      ]
    };
    
    expect(serialize(doc, { blankLinesBetween: false })).toBe('>.p:: فقرة أولى\n>.p:: فقرة ثانية');
  });
  
  it('should skip comments when preserveComments is false', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: [
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'فقرة' }]
        },
        {
          type: 'comment',

          nodeType: 'comment',
          content: 'تعليق',
          direction: 'rtl',
          line: 2
        },
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 3,
          content: [{ type: 'plain', value: 'فقرة أخرى' }]
        }
      ]
    };
    
    expect(serialize(doc, { preserveComments: false })).toBe('>.p:: فقرة\n\n>.p:: فقرة أخرى');
  });
  
  it('should preserve comments by default', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: [
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'فقرة' }]
        },
        {
          type: 'comment',

          nodeType: 'comment',
          content: 'تعليق',
          direction: 'rtl',
          line: 2
        }
      ]
    };
    
    expect(serialize(doc)).toBe('>.p:: فقرة\n\n>.::: تعليق');
  });
  
  it('should use custom line ending', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: [
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'فقرة أولى' }]
        },
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 2,
          content: [{ type: 'plain', value: 'فقرة ثانية' }]
        }
      ]
    };
    
    expect(serialize(doc, { lineEnding: '\r\n' })).toBe('>.p:: فقرة أولى\r\n\r\n>.p:: فقرة ثانية');
  });
  
  it('should serialize mixed content document', () => {
    const doc: ARTOONDocument = {
      version: '1.0',
      content: [
        {
          type: 'text',

          nodeType: 'text',
          textType: 't1',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'عنوان' }]
        },
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'rtl',
          line: 2,
          content: [{ type: 'plain', value: 'فقرة' }]
        },
        {
          type: 'separator',
          nodeType: 'separator',
          separatorType: 'hr',
          direction: 'rtl',
          line: 3
        },
        {
          type: 'text',

          nodeType: 'text',
          textType: 'p',
          direction: 'ltr',
          line: 4,
          content: [{ type: 'plain', value: 'English paragraph' }]
        }
      ]
    };
    
    expect(serialize(doc)).toBe(
      '>.t1:: عنوان\n\n' +
      '>.p:: فقرة\n\n' +
      '>.hr\n\n' +
      '<.p:: English paragraph'
    );
  });
});
