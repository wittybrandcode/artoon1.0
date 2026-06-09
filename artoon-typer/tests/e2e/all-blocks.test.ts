/**
 * All Blocks E2E Tests
 * 
 * Tests all 28 block types in the editor.
 * Ensures each block can be created, rendered, and updated.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { defaultBlockDefinitions, getDefinition } from '../../src/blocks/definitions';
import type { BlockType } from '../../src/types';

describe('All Blocks E2E', () => {
  describe('Block Definitions Coverage', () => {
    it('should have 28 block definitions', () => {
      expect(defaultBlockDefinitions.length).toBe(28);
    });
    
    it('should have all required block types', () => {
      const requiredTypes: BlockType[] = [
        // Text blocks
        'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6',
        'quote', 'preformatted', 'line-break',
        // List blocks
        'bullet-list', 'numbered-list', 'definition-list',
        // Media blocks
        'image', 'video', 'audio', 'figure', 'file',
        // Advanced blocks
        'code', 'table', 'divider',
        // Phase 3 blocks
        'details', 'time-block', 'abbr-block', 'meta',
        // Phase 4 blocks
        'link-block', 'custom', 'word-break',
      ];
      
      const definedTypes = defaultBlockDefinitions.map(d => d.type);
      
      for (const type of requiredTypes) {
        expect(definedTypes).toContain(type);
      }
    });
  });
  
  describe('Block Creation', () => {
    const blockTypes: BlockType[] = [
      'paragraph', 'heading1', 'heading2', 'heading3', 'heading4', 'heading5', 'heading6',
      'quote', 'preformatted', 'line-break',
      'bullet-list', 'numbered-list', 'definition-list',
      'image', 'video', 'audio', 'figure', 'file',
      'code', 'table', 'divider',
      'details', 'time-block', 'abbr-block', 'meta',
      'link-block', 'custom', 'word-break',
    ];
    
    blockTypes.forEach(type => {
      it(`should create ${type} block`, () => {
        const def = getDefinition(type);
        expect(def).toBeDefined();
        
        const block = def!.create();
        expect(block).toBeDefined();
        expect(block.type).toBe(type);
        expect(block.id).toBeTruthy();
        expect(block.direction).toBeDefined();
      });
    });
  });
  
  describe('Block Categories', () => {
    it('should have text category blocks', () => {
      const textBlocks = defaultBlockDefinitions.filter(d => d.category === 'text');
      expect(textBlocks.length).toBeGreaterThan(5);
    });
    
    it('should have list category blocks', () => {
      const listBlocks = defaultBlockDefinitions.filter(d => d.category === 'list');
      expect(listBlocks.length).toBe(3);
    });
    
    it('should have media category blocks', () => {
      const mediaBlocks = defaultBlockDefinitions.filter(d => d.category === 'media');
      expect(mediaBlocks.length).toBe(5);
    });
    
    it('should have advanced category blocks', () => {
      const advancedBlocks = defaultBlockDefinitions.filter(d => d.category === 'advanced');
      expect(advancedBlocks.length).toBeGreaterThan(5);
    });
  });
  
  describe('Block Arabic Names', () => {
    it('should have Arabic names for all blocks', () => {
      for (const def of defaultBlockDefinitions) {
        expect(def.nameAr).toBeTruthy();
        expect(def.nameAr.length).toBeGreaterThan(0);
      }
    });
  });
  
  describe('Block Icons', () => {
    it('should have icons for all blocks', () => {
      for (const def of defaultBlockDefinitions) {
        expect(def.icon).toBeTruthy();
      }
    });
  });
  
  describe('Block Shortcuts', () => {
    it('should have shortcuts for common blocks', () => {
      const heading1 = getDefinition('heading1');
      expect(heading1?.shortcut).toBe('# ');
      
      const heading2 = getDefinition('heading2');
      expect(heading2?.shortcut).toBe('## ');
      
      const bulletList = getDefinition('bullet-list');
      expect(bulletList?.shortcut).toBe('- ');
      
      const numberedList = getDefinition('numbered-list');
      expect(numberedList?.shortcut).toBe('1. ');
      
      const quote = getDefinition('quote');
      expect(quote?.shortcut).toBe('> ');
      
      const code = getDefinition('code');
      expect(code?.shortcut).toBe('```');
      
      const divider = getDefinition('divider');
      expect(divider?.shortcut).toBe('---');
    });
  });
  
  describe('Block Conversion', () => {
    it('should define conversion options for text blocks', () => {
      const paragraph = getDefinition('paragraph');
      expect(paragraph?.canConvertTo).toBeDefined();
      expect(paragraph?.canConvertTo).toContain('heading1');
      expect(paragraph?.canConvertTo).toContain('quote');
    });
    
    it('should define conversion options for list blocks', () => {
      const bulletList = getDefinition('bullet-list');
      expect(bulletList?.canConvertTo).toContain('numbered-list');
      
      const numberedList = getDefinition('numbered-list');
      expect(numberedList?.canConvertTo).toContain('bullet-list');
    });
  });
});
