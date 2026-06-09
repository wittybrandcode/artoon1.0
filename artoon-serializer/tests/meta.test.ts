// META Block Serialization Tests

import { serialize } from '../src';
import { serializeBlock } from '../src/nodes/block';
import type { ARTOONDocument, BlockNode } from '@artoon/ast';

describe('META Block Serialization', () => {
  describe('serializeBlock - META', () => {
    test('serialize META with single field', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [
          { name: 'title', value: 'Test Title', direction: 'ltr' }
        ],
        content: '',
        line: 1,
        direction: 'ltr'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toContain('<meta>.');
      expect(output).toContain('<.-:title: Test Title');
      expect(output).toContain('.<meta>');
      // Verify no extra content line between field and closing tag
      const lines = output.split('\n');
      expect(lines).toHaveLength(3); // Opening, field, closing
    });
    
    test('serialize META with multiple fields', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [
          { name: 'title', value: 'Test Title', direction: 'ltr' },
          { name: 'author', value: 'John Doe', direction: 'ltr' },
          { name: 'date', value: '2026-01-18', direction: 'ltr' }
        ],
        content: '',
        line: 1,
        direction: 'ltr'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toContain('<meta>.');
      expect(output).toContain('<.-:title: Test Title');
      expect(output).toContain('<.-:author: John Doe');
      expect(output).toContain('<.-:date: 2026-01-18');
      expect(output).toContain('.<meta>');
    });
    
    test('serialize META with RTL fields', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [
          { name: 'title', value: 'عنوان الوثيقة', direction: 'rtl' },
          { name: 'author', value: 'المؤلف', direction: 'rtl' }
        ],
        content: '',
        line: 1,
        direction: 'rtl'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toContain('<meta>.');
      expect(output).toContain('>.-:title: عنوان الوثيقة');
      expect(output).toContain('>.-:author: المؤلف');
      expect(output).toContain('.<meta>');
    });
    
    test('serialize META ignores content', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [
          { name: 'title', value: 'Test', direction: 'ltr' }
        ],
        content: 'This content should not appear',
        line: 1,
        direction: 'ltr'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toContain('<.-:title: Test');
      expect(output).not.toContain('This content should not appear');
    });
    
    test('serialize empty META', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [],
        content: '',
        line: 1,
        direction: 'ltr'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toBe('<meta>.\n.<meta>');
    });
  });
  
  describe('serialize - Document with META', () => {
    test('serialize document with META as BlockNode in content', () => {
      const doc: ARTOONDocument = {
        version: '2.0',
        content: [
          {
            type: 'block',
            blockName: 'meta',
            isCode: false,
            fields: [
              { name: 'title', value: 'Test Document', direction: 'ltr' }
            ],
            content: '',
            line: 1,
            direction: 'ltr'
          },
          {
            type: 'text',
            textType: 't1',
            content: [{ type: 'plain', value: 'Heading' }],
            line: 5,
            direction: 'rtl' // RTL for > marker
          }
        ]
      };
      
      const output = serialize(doc);
      
      // META should be first
      expect(output.indexOf('<meta>.')).toBeLessThan(output.indexOf('>.t1::'));
      
      // Both parts should be present
      expect(output).toContain('<meta>.');
      expect(output).toContain('<.-:title: Test Document');
      expect(output).toContain('.<meta>');
      expect(output).toContain('>.t1:: Heading');
    });
    
    test('serialize document without META', () => {
      const doc: ARTOONDocument = {
        version: '2.0',
        content: [
          {
            type: 'text',
            textType: 't1',
            content: [{ type: 'plain', value: 'Heading' }],
            line: 1,
            direction: 'rtl' // RTL for > marker
          }
        ]
      };
      
      const output = serialize(doc);
      
      expect(output).toContain('>.t1:: Heading');
    });
  });
  
  describe('Edge Cases', () => {
    test('META with special characters in values', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [
          { name: 'title', value: 'Test: "Value" & More', direction: 'ltr' }
        ],
        content: '',
        line: 1,
        direction: 'ltr'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toContain('<.-:title: Test: "Value" & More');
    });
    
    test('META with empty field value', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [
          { name: 'title', value: '', direction: 'ltr' }
        ],
        content: '',
        line: 1,
        direction: 'ltr'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toContain('<.-:title: ');
    });
    
    test('META with mixed RTL/LTR fields', () => {
      const metaBlock: BlockNode = {
        type: 'block',
        blockName: 'meta',
        isCode: false,
        fields: [
          { name: 'title', value: 'English Title', direction: 'ltr' },
          { name: 'author', value: 'مؤلف عربي', direction: 'rtl' }
        ],
        content: '',
        line: 1,
        direction: 'ltr'
      };
      
      const output = serializeBlock(metaBlock);
      
      expect(output).toContain('<.-:title: English Title');
      expect(output).toContain('>.-:author: مؤلف عربي');
    });
  });
});
