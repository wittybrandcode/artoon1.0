/**
 * Block Definitions Tests - Phase 2 & 3 Blocks
 */

import {
  preformattedDefinition,
  lineBreakDefinition,
  definitionListDefinition,
  figureDefinition,
  fileDefinition,
  detailsDefinition,
  timeBlockDefinition,
  abbrBlockDefinition,
  metaDefinition,
  linkBlockDefinition,
  customBlockDefinition,
  wordBreakDefinition,
  defaultBlockDefinitions,
  getDefinition,
  getDefinitionsByCategory,
} from '../../src/blocks/definitions';

describe('Phase 2 Block Definitions', () => {
  describe('preformattedDefinition', () => {
    test('has correct type', () => {
      expect(preformattedDefinition.type).toBe('preformatted');
    });
    
    test('has Arabic name', () => {
      expect(preformattedDefinition.nameAr).toBe('نص محفوظ التنسيق');
    });
    
    test('is in text category', () => {
      expect(preformattedDefinition.category).toBe('text');
    });
    
    test('create returns valid block', () => {
      const block = preformattedDefinition.create();
      expect(block.type).toBe('preformatted');
      expect(block.direction).toBe('rtl');
      expect((block as any).content).toBe('');
    });
  });
  
  describe('lineBreakDefinition', () => {
    test('has correct type', () => {
      expect(lineBreakDefinition.type).toBe('line-break');
    });
    
    test('has Arabic name', () => {
      expect(lineBreakDefinition.nameAr).toBe('سطر جديد');
    });
    
    test('has Shift+Enter shortcut', () => {
      expect(lineBreakDefinition.shortcut).toBe('Shift+Enter');
    });
    
    test('create returns valid block', () => {
      const block = lineBreakDefinition.create();
      expect(block.type).toBe('line-break');
    });
  });
  
  describe('definitionListDefinition', () => {
    test('has correct type', () => {
      expect(definitionListDefinition.type).toBe('definition-list');
    });
    
    test('has Arabic name', () => {
      expect(definitionListDefinition.nameAr).toBe('قائمة تعريفات');
    });
    
    test('is in list category', () => {
      expect(definitionListDefinition.category).toBe('list');
    });
    
    test('create returns block with one empty item', () => {
      const block = definitionListDefinition.create();
      expect(block.type).toBe('definition-list');
      expect((block as any).items).toHaveLength(1);
      expect((block as any).items[0].term).toEqual([]);
      expect((block as any).items[0].definition).toEqual([]);
    });
  });
  
  describe('figureDefinition', () => {
    test('has correct type', () => {
      expect(figureDefinition.type).toBe('figure');
    });
    
    test('has Arabic name', () => {
      expect(figureDefinition.nameAr).toBe('شكل');
    });
    
    test('is in media category', () => {
      expect(figureDefinition.category).toBe('media');
    });
    
    test('create returns valid block', () => {
      const block = figureDefinition.create();
      expect(block.type).toBe('figure');
      expect((block as any).mediaType).toBe('image');
      expect((block as any).src).toBe('');
      expect((block as any).caption).toEqual([]);
    });
  });
  
  describe('fileDefinition', () => {
    test('has correct type', () => {
      expect(fileDefinition.type).toBe('file');
    });
    
    test('has Arabic name', () => {
      expect(fileDefinition.nameAr).toBe('ملف');
    });
    
    test('is in media category', () => {
      expect(fileDefinition.category).toBe('media');
    });
    
    test('create returns valid block', () => {
      const block = fileDefinition.create();
      expect(block.type).toBe('file');
      expect((block as any).src).toBe('');
      expect((block as any).label).toBe('');
    });
  });
  
  describe('defaultBlockDefinitions', () => {
    test('includes all Phase 2 blocks', () => {
      const types = defaultBlockDefinitions.map(d => d.type);
      
      expect(types).toContain('preformatted');
      expect(types).toContain('line-break');
      expect(types).toContain('definition-list');
      expect(types).toContain('figure');
      expect(types).toContain('file');
    });
    
    test('includes all Phase 3 blocks', () => {
      const types = defaultBlockDefinitions.map(d => d.type);
      
      expect(types).toContain('details');
      expect(types).toContain('time-block');
      expect(types).toContain('abbr-block');
      expect(types).toContain('meta');
    });
    
    test('includes all Phase 4 blocks', () => {
      const types = defaultBlockDefinitions.map(d => d.type);
      
      expect(types).toContain('link-block');
      expect(types).toContain('custom');
      expect(types).toContain('word-break');
    });
    
    test('has 28 total definitions', () => {
      // Original 16 + Phase 2 (5) + Phase 3 (4) + Phase 4 (3) = 28
      expect(defaultBlockDefinitions.length).toBe(28);
    });
  });
  
  describe('getDefinition', () => {
    test('returns preformatted definition', () => {
      const def = getDefinition('preformatted');
      expect(def).toBe(preformattedDefinition);
    });
    
    test('returns line-break definition', () => {
      const def = getDefinition('line-break');
      expect(def).toBe(lineBreakDefinition);
    });
    
    test('returns definition-list definition', () => {
      const def = getDefinition('definition-list');
      expect(def).toBe(definitionListDefinition);
    });
    
    test('returns figure definition', () => {
      const def = getDefinition('figure');
      expect(def).toBe(figureDefinition);
    });
    
    test('returns file definition', () => {
      const def = getDefinition('file');
      expect(def).toBe(fileDefinition);
    });
  });
  
  describe('getDefinitionsByCategory', () => {
    test('text category includes preformatted and line-break', () => {
      const textDefs = getDefinitionsByCategory('text');
      const types = textDefs.map(d => d.type);
      
      expect(types).toContain('preformatted');
      expect(types).toContain('line-break');
    });
    
    test('list category includes definition-list', () => {
      const listDefs = getDefinitionsByCategory('list');
      const types = listDefs.map(d => d.type);
      
      expect(types).toContain('definition-list');
    });
    
    test('media category includes figure and file', () => {
      const mediaDefs = getDefinitionsByCategory('media');
      const types = mediaDefs.map(d => d.type);
      
      expect(types).toContain('figure');
      expect(types).toContain('file');
    });
    
    test('advanced category includes Phase 3 blocks', () => {
      const advancedDefs = getDefinitionsByCategory('advanced');
      const types = advancedDefs.map(d => d.type);
      
      expect(types).toContain('details');
      expect(types).toContain('time-block');
      expect(types).toContain('abbr-block');
      expect(types).toContain('meta');
    });
    
    test('advanced category includes Phase 4 blocks', () => {
      const advancedDefs = getDefinitionsByCategory('advanced');
      const types = advancedDefs.map(d => d.type);
      
      expect(types).toContain('link-block');
      expect(types).toContain('custom');
    });
    
    test('text category includes word-break', () => {
      const textDefs = getDefinitionsByCategory('text');
      const types = textDefs.map(d => d.type);
      
      expect(types).toContain('word-break');
    });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Phase 3 Block Definitions Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Phase 3 Block Definitions', () => {
  describe('detailsDefinition', () => {
    test('has correct type', () => {
      expect(detailsDefinition.type).toBe('details');
    });
    
    test('has Arabic name', () => {
      expect(detailsDefinition.nameAr).toBe('محتوى قابل للطي');
    });
    
    test('is in advanced category', () => {
      expect(detailsDefinition.category).toBe('advanced');
    });
    
    test('create returns valid block', () => {
      const block = detailsDefinition.create();
      expect(block.type).toBe('details');
      expect((block as any).summary).toEqual([]);
      expect((block as any).content).toEqual([]);
      expect((block as any).isOpen).toBe(false);
    });
  });
  
  describe('timeBlockDefinition', () => {
    test('has correct type', () => {
      expect(timeBlockDefinition.type).toBe('time-block');
    });
    
    test('has Arabic name', () => {
      expect(timeBlockDefinition.nameAr).toBe('تاريخ/وقت');
    });
    
    test('is in advanced category', () => {
      expect(timeBlockDefinition.category).toBe('advanced');
    });
    
    test('create returns valid block with current date', () => {
      const block = timeBlockDefinition.create();
      expect(block.type).toBe('time-block');
      expect((block as any).datetime).toBeTruthy();
      expect((block as any).displayText).toBe('');
    });
  });
  
  describe('abbrBlockDefinition', () => {
    test('has correct type', () => {
      expect(abbrBlockDefinition.type).toBe('abbr-block');
    });
    
    test('has Arabic name', () => {
      expect(abbrBlockDefinition.nameAr).toBe('اختصار');
    });
    
    test('is in advanced category', () => {
      expect(abbrBlockDefinition.category).toBe('advanced');
    });
    
    test('create returns valid block', () => {
      const block = abbrBlockDefinition.create();
      expect(block.type).toBe('abbr-block');
      expect((block as any).abbr).toBe('');
      expect((block as any).title).toBe('');
    });
  });
  
  describe('metaDefinition', () => {
    test('has correct type', () => {
      expect(metaDefinition.type).toBe('meta');
    });
    
    test('has Arabic name', () => {
      expect(metaDefinition.nameAr).toBe('بيانات وصفية');
    });
    
    test('is in advanced category', () => {
      expect(metaDefinition.category).toBe('advanced');
    });
    
    test('create returns block with one empty field', () => {
      const block = metaDefinition.create();
      expect(block.type).toBe('meta');
      expect((block as any).fields).toHaveLength(1);
      expect((block as any).fields[0].name).toBe('title');
    });
  });
  
  describe('getDefinition for Phase 3', () => {
    test('returns details definition', () => {
      const def = getDefinition('details');
      expect(def).toBe(detailsDefinition);
    });
    
    test('returns time-block definition', () => {
      const def = getDefinition('time-block');
      expect(def).toBe(timeBlockDefinition);
    });
    
    test('returns abbr-block definition', () => {
      const def = getDefinition('abbr-block');
      expect(def).toBe(abbrBlockDefinition);
    });
    
    test('returns meta definition', () => {
      const def = getDefinition('meta');
      expect(def).toBe(metaDefinition);
    });
  });
});


// ═══════════════════════════════════════════════════════════════════════════
// Phase 4 Block Definitions Tests
// ═══════════════════════════════════════════════════════════════════════════

describe('Phase 4 Block Definitions', () => {
  describe('linkBlockDefinition', () => {
    test('has correct type', () => {
      expect(linkBlockDefinition.type).toBe('link-block');
    });
    
    test('has Arabic name', () => {
      expect(linkBlockDefinition.nameAr).toBe('رابط');
    });
    
    test('is in advanced category', () => {
      expect(linkBlockDefinition.category).toBe('advanced');
    });
    
    test('create returns valid block', () => {
      const block = linkBlockDefinition.create();
      expect(block.type).toBe('link-block');
      expect((block as any).url).toBe('');
      expect((block as any).text).toBe('');
      expect((block as any).modifiers).toEqual([]);
      expect((block as any).direction).toBe('rtl');
    });
  });
  
  describe('customBlockDefinition', () => {
    test('has correct type', () => {
      expect(customBlockDefinition.type).toBe('custom');
    });
    
    test('has Arabic name', () => {
      expect(customBlockDefinition.nameAr).toBe('بلوك مخصص');
    });
    
    test('is in advanced category', () => {
      expect(customBlockDefinition.category).toBe('advanced');
    });
    
    test('create returns valid block', () => {
      const block = customBlockDefinition.create();
      expect(block.type).toBe('custom');
      expect((block as any).name).toBe('custom');
      expect((block as any).children).toEqual([]);
      expect((block as any).fields).toEqual({});
    });
  });
  
  describe('wordBreakDefinition', () => {
    test('has correct type', () => {
      expect(wordBreakDefinition.type).toBe('word-break');
    });
    
    test('has Arabic name', () => {
      expect(wordBreakDefinition.nameAr).toBe('فاصل كلمة');
    });
    
    test('is in text category', () => {
      expect(wordBreakDefinition.category).toBe('text');
    });
    
    test('create returns valid block', () => {
      const block = wordBreakDefinition.create();
      expect(block.type).toBe('word-break');
      expect(block.direction).toBe('rtl');
    });
  });
  
  describe('getDefinition for Phase 4', () => {
    test('returns link-block definition', () => {
      const def = getDefinition('link-block');
      expect(def).toBe(linkBlockDefinition);
    });
    
    test('returns custom definition', () => {
      const def = getDefinition('custom');
      expect(def).toBe(customBlockDefinition);
    });
    
    test('returns word-break definition', () => {
      const def = getDefinition('word-break');
      expect(def).toBe(wordBreakDefinition);
    });
  });
});

