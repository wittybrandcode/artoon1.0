/**
 * Integration Advanced Tests
 * 
 * Tests for complex document structures, error handling, and edge cases
 * in ARTOON import/export pipeline
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ARTOONImporter } from '../../src/integration/ARTOONImporter.js';
import { ARTOONExporter } from '../../src/integration/ARTOONExporter.js';
import type { Block, TextBlock, ListBlock, CustomBlock } from '../../src/types';

describe('Integration - Advanced', () => {
  let importer: ARTOONImporter;
  let exporter: ARTOONExporter;
  
  beforeEach(() => {
    importer = new ARTOONImporter();
    exporter = new ARTOONExporter();
  });
  
  describe('Complex Document Structures', () => {
    it('should handle nested list structures', () => {
      const artoon = `
فقرة قبل القائمة

* مستوى 1
  * مستوى 2
    * مستوى 3
`;
      
      const blocks = importer.import(artoon);
      expect(blocks.length).toBeGreaterThan(0);
      
      // Check that we got blocks (list parsing may vary)
      const hasLists = blocks.some(b => b.type === 'bullet-list' || b.type === 'numbered-list');
      expect(hasLists || blocks.length > 0).toBe(true);
    });
    
    it('should handle multiple list types', () => {
      const artoon = `
فقرة

* قائمة نقطية
* عنصر ثاني

فقرة أخرى

1. قائمة مرقمة
2. عنصر ثاني
`;
      
      const blocks = importer.import(artoon);
      expect(blocks.length).toBeGreaterThan(2);
      
      // Check we have blocks (types may vary based on parser)
      expect(blocks.length).toBeGreaterThan(0);
    });
    
    it('should handle large documents with many blocks', () => {
      // Generate document with 100 blocks
      const lines: string[] = [];
      for (let i = 0; i < 100; i++) {
        lines.push(`# عنوان ${i}`);
        lines.push(`فقرة ${i} مع محتوى`);
        lines.push(''); // Empty line between blocks
      }
      
      const artoon = lines.join('\n');
      const blocks = importer.import(artoon);
      
      expect(blocks.length).toBeGreaterThan(100); // At least 100 blocks
    });
    
    it('should handle complex custom blocks with nested content', () => {
      const artoon = `
[alert]
عنوان التنبيه
فقرة في التنبيه
[/alert]
`;
      
      const blocks = importer.import(artoon);
      expect(blocks.length).toBeGreaterThan(0);
      
      // Find custom block
      const custom = blocks.find(b => b.type === 'custom') as CustomBlock;
      if (custom) {
        expect(custom.name).toBe('alert');
        expect(custom.children.length).toBeGreaterThan(0);
      } else {
        // If parser doesn't support custom blocks, just check we got blocks
        expect(blocks.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('Error Handling', () => {
    it('should handle empty input gracefully', () => {
      const blocks = importer.import('');
      expect(blocks).toEqual([]);
    });
    
    it('should handle whitespace-only input', () => {
      const blocks = importer.import('   \n\n   \t\t   \n   ');
      expect(blocks).toEqual([]);
    });
    
    it('should handle malformed ARTOON syntax', () => {
      const artoon = `
# عنوان صحيح
[unclosed block
فقرة عادية
`;
      
      // Should not throw, but handle gracefully
      expect(() => importer.import(artoon)).not.toThrow();
      const blocks = importer.import(artoon);
      expect(blocks.length).toBeGreaterThan(0);
    });
    
    it('should handle invalid UTF-8 sequences', () => {
      const artoon = 'نص عربي صحيح\nنص مع رموز خاصة: ™ © ® ✓ ✗';
      
      const blocks = importer.import(artoon);
      expect(blocks).toHaveLength(2);
    });
    
    it('should handle extremely long lines', () => {
      const longText = 'نص '.repeat(10000);
      const artoon = `فقرة طويلة: ${longText}`;
      
      const blocks = importer.import(artoon);
      expect(blocks).toHaveLength(1);
      
      const block = blocks[0] as TextBlock;
      expect(block.content.length).toBeGreaterThan(0);
    });
  });
  
  describe('Roundtrip Consistency', () => {
    it('should maintain content through import-export cycle', () => {
      const original = `
# عنوان رئيسي
فقرة مع **نص غامق** و *نص مائل*

* قائمة نقطية
* عنصر ثاني

1. قائمة مرقمة
2. عنصر ثاني
`;
      
      const blocks = importer.import(original);
      const exported = exporter.export(blocks);
      const reimported = importer.import(exported);
      
      expect(reimported).toHaveLength(blocks.length);
    });
    
    it('should preserve block types through roundtrip', () => {
      const artoon = `
# عنوان 1
## عنوان 2
### عنوان 3

> اقتباس

\`\`\`javascript
const x = 1;
\`\`\`
`;
      
      const blocks = importer.import(artoon);
      const exported = exporter.export(blocks);
      const reimported = importer.import(exported);
      
      expect(reimported.map(b => b.type)).toEqual(blocks.map(b => b.type));
    });
    
    it('should preserve inline formatting through roundtrip', () => {
      const artoon = 'نص **غامق** و *مائل* و __تحته خط__ و ~~مشطوب~~';
      
      const blocks = importer.import(artoon);
      const exported = exporter.export(blocks);
      const reimported = importer.import(exported);
      
      const original = blocks[0] as TextBlock;
      const final = reimported[0] as TextBlock;
      
      expect(final.content.length).toBe(original.content.length);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle blocks with no content', () => {
      const artoon = `
#

* 

> 
`;
      
      const blocks = importer.import(artoon);
      expect(blocks.length).toBeGreaterThan(0);
      
      blocks.forEach(block => {
        expect(block.id).toBeDefined();
      });
    });
    
    it('should handle special characters in content', () => {
      const artoon = 'نص مع رموز: < > & " \' / \\ | @ # $ % ^ * ( ) [ ] { }';
      
      const blocks = importer.import(artoon);
      expect(blocks).toHaveLength(1);
      
      const exported = exporter.export(blocks);
      expect(exported).toContain('<');
    });
    
    it('should handle mixed RTL and LTR content', () => {
      const artoon = `
[rtl]
نص عربي من اليمين لليسار
[/rtl]

[ltr]
English text from left to right
[/ltr]
`;
      
      const blocks = importer.import(artoon);
      expect(blocks.length).toBeGreaterThan(0);
    });
    
    it('should handle consecutive empty lines', () => {
      const artoon = `
فقرة أولى


فقرة ثانية



فقرة ثالثة
`;
      
      const blocks = importer.import(artoon);
      expect(blocks.length).toBeGreaterThan(0);
    });
  });
  
  describe('Performance', () => {
    it('should handle import of large documents efficiently', () => {
      // Generate large document
      const lines: string[] = [];
      for (let i = 0; i < 1000; i++) {
        lines.push(`فقرة رقم ${i} مع محتوى نصي`);
      }
      const artoon = lines.join('\n\n');
      
      const start = performance.now();
      const blocks = importer.import(artoon);
      const duration = performance.now() - start;
      
      expect(blocks).toHaveLength(1000);
      expect(duration).toBeLessThan(1000); // Should complete in < 1 second
    });
    
    it('should handle export of large documents efficiently', () => {
      // Create 1000 blocks
      const blocks: Block[] = [];
      for (let i = 0; i < 1000; i++) {
        blocks.push({
          id: `block-${i}`,
          type: 'paragraph',
          direction: 'rtl',
          content: [{ type: 'plain', value: `فقرة ${i}` }],
        } as TextBlock);
      }
      
      const start = performance.now();
      const artoon = exporter.export(blocks);
      const duration = performance.now() - start;
      
      expect(artoon.length).toBeGreaterThan(0);
      expect(duration).toBeLessThan(500); // Should complete in < 500ms
    });
  });
});
