/**
 * E2E Tests - Import/Export
 * 
 * Tests for ARTOON import and export functionality.
 * 
 * NOTE: 
 * - Parser input format: >.p:: text, <code:lang>. content .<code>
 * - Serializer output format: >.p:: text, <code:lang>. content .<code>
 */

import { describe, it, expect } from 'vitest';

describe('E2E: Import/Export', () => {
  describe('Import', () => {
    it('should import paragraph', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({});
      
      const blocks = importer.import('>.p:: مرحباً بالعالم');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('paragraph');
    });
    
    it('should import heading', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({});
      
      const blocks = importer.import('>.t1:: عنوان رئيسي');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('heading1');
    });
    
    it('should import quote', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({});
      
      const blocks = importer.import('>.q:: اقتباس');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('quote');
    });
    
    it('should import bullet list', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({});
      
      const blocks = importer.import('>.ul::\n  >.li:: عنصر أول\n  >.li:: عنصر ثاني');
      
      expect(blocks).toHaveLength(1);
      expect(blocks[0].type).toBe('list');
    });
    
    it('should import code block', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({});
      
      // Code block format: <code:lang>. content .<code>
      const blocks = importer.import('<code:javascript>.\nconst x = 1;\n.<code>');
      
      expect(blocks.length).toBeGreaterThanOrEqual(1);
      // Find the code block
      const codeBlock = blocks.find(b => b.type === 'code');
      expect(codeBlock).toBeDefined();
    });
    
    it('should import multiple blocks', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({});
      
      const content = `>.t1:: عنوان
>.p:: فقرة أولى
>.p:: فقرة ثانية`;
      
      const blocks = importer.import(content);
      
      expect(blocks).toHaveLength(3);
    });
    
    it('should handle RTL direction', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({ defaultDirection: 'rtl' });
      
      const blocks = importer.import('>.p:: نص عربي');
      
      expect(blocks[0].direction).toBe('rtl');
    });
    
    it('should handle LTR direction', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const importer = createARTOONImporter({});
      
      const blocks = importer.import('<.p:: English text');
      
      expect(blocks[0].direction).toBe('ltr');
    });
  });
  
  describe('Export', () => {
    it('should export paragraph', async () => {
      const { createARTOONExporter } = await import('../../src/integration/ARTOONExporter');
      const exporter = createARTOONExporter();
      
      const artoon = exporter.export([{
        id: 'p1',
        type: 'paragraph',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'مرحباً' }],
      }]);
      
      expect(artoon).toContain('>.p::');
      expect(artoon).toContain('مرحباً');
    });
    
    it('should export heading', async () => {
      const { createARTOONExporter } = await import('../../src/integration/ARTOONExporter');
      const exporter = createARTOONExporter();
      
      const artoon = exporter.export([{
        id: 'h1',
        type: 'heading1',
        direction: 'rtl',
        content: [{ type: 'plain', value: 'عنوان' }],
      }]);
      
      expect(artoon).toContain('>.t1::');
    });
    
    it('should export list', async () => {
      const { createARTOONExporter } = await import('../../src/integration/ARTOONExporter');
      const exporter = createARTOONExporter();
      
      const artoon = exporter.export([{
        id: 'ul1',
        type: 'bullet-list',
        direction: 'rtl',
        items: [
          { id: 'li1', content: [{ type: 'plain', value: 'عنصر' }] },
        ],
      }]);
      
      expect(artoon).toContain('>.ul::');
      // List items may have different format
      expect(artoon).toContain('عنصر');
    });
    
    it('should export code block', async () => {
      const { createARTOONExporter } = await import('../../src/integration/ARTOONExporter');
      const exporter = createARTOONExporter();
      
      const artoon = exporter.export([{
        id: 'code1',
        type: 'code',
        direction: 'ltr',
        language: 'javascript',
        code: 'const x = 1;',
      }]);
      
      // Code block format: <code:lang>. content .<code>
      expect(artoon).toContain('<code:javascript>');
      expect(artoon).toContain('const x = 1;');
    });
  });
  
  describe('Roundtrip', () => {
    it('should preserve content through import/export cycle', async () => {
      const { createARTOONImporter } = await import('../../src/integration/ARTOONImporter');
      const { createARTOONExporter } = await import('../../src/integration/ARTOONExporter');
      
      const importer = createARTOONImporter({});
      const exporter = createARTOONExporter();
      
      const original = '>.p:: مرحباً بالعالم';
      const blocks = importer.import(original);
      const exported = exporter.export(blocks);
      
      expect(exported).toContain('مرحباً بالعالم');
    });
  });
});

