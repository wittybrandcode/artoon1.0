/**
 * BlockRegistry Tests
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { BlockRegistry, createBlockRegistry } from '../../src/core/BlockRegistry';
import type { BlockDefinition, TextBlock } from '../../src/types';

// Test block definitions
let idCounter = 0;
const generateId = (prefix: string) => `${prefix}-${++idCounter}`;

const paragraphDef: BlockDefinition = {
  type: 'paragraph',
  name: 'Paragraph',
  nameAr: 'فقرة',
  icon: '📝',
  category: 'text',
  create: () => ({
    id: generateId('p'),
    type: 'paragraph',
    direction: 'rtl',
    content: [],
  } as TextBlock),
};

const heading1Def: BlockDefinition = {
  type: 'heading1',
  name: 'Heading 1',
  nameAr: 'عنوان 1',
  icon: 'H1',
  category: 'text',
  shortcut: '# ',
  create: () => ({
    id: generateId('h1'),
    type: 'heading1',
    direction: 'rtl',
    content: [],
  } as TextBlock),
  canConvertTo: ['paragraph', 'heading2', 'heading3'],
};

const bulletListDef: BlockDefinition = {
  type: 'bullet-list',
  name: 'Bullet List',
  nameAr: 'قائمة نقطية',
  icon: '•',
  category: 'list',
  shortcut: '- ',
  create: () => ({
    id: generateId('ul'),
    type: 'bullet-list',
    direction: 'rtl',
    items: [],
  }),
};

const imageDef: BlockDefinition = {
  type: 'image',
  name: 'Image',
  nameAr: 'صورة',
  icon: '🖼️',
  category: 'media',
  create: () => ({
    id: generateId('img'),
    type: 'image',
    direction: 'rtl',
    src: '',
  }),
};

const codeDef: BlockDefinition = {
  type: 'code',
  name: 'Code Block',
  nameAr: 'كود',
  icon: '💻',
  category: 'advanced',
  shortcut: '```',
  create: () => ({
    id: generateId('code'),
    type: 'code',
    direction: 'ltr',
    language: '',
    code: '',
  }),
};

describe('BlockRegistry', () => {
  let registry: BlockRegistry;

  beforeEach(() => {
    registry = createBlockRegistry();
  });

  describe('register', () => {
    it('should register a block definition', () => {
      registry.register(paragraphDef);
      expect(registry.has('paragraph')).toBe(true);
    });

    it('should allow overwriting existing definition', () => {
      registry.register(paragraphDef);
      const newDef = { ...paragraphDef, name: 'New Paragraph' };
      registry.register(newDef);
      expect(registry.get('paragraph')?.name).toBe('New Paragraph');
    });
  });

  describe('registerAll', () => {
    it('should register multiple definitions', () => {
      registry.registerAll([paragraphDef, heading1Def, bulletListDef]);
      expect(registry.getTypes()).toHaveLength(3);
    });
  });

  describe('get', () => {
    it('should return definition for registered type', () => {
      registry.register(paragraphDef);
      const def = registry.get('paragraph');
      expect(def).toBeDefined();
      expect(def?.name).toBe('Paragraph');
    });

    it('should return undefined for unregistered type', () => {
      expect(registry.get('paragraph')).toBeUndefined();
    });
  });

  describe('has', () => {
    it('should return true for registered type', () => {
      registry.register(paragraphDef);
      expect(registry.has('paragraph')).toBe(true);
    });

    it('should return false for unregistered type', () => {
      expect(registry.has('paragraph')).toBe(false);
    });
  });

  describe('getTypes', () => {
    it('should return all registered types', () => {
      registry.registerAll([paragraphDef, heading1Def]);
      const types = registry.getTypes();
      expect(types).toContain('paragraph');
      expect(types).toContain('heading1');
    });

    it('should return empty array when no types registered', () => {
      expect(registry.getTypes()).toHaveLength(0);
    });
  });

  describe('getAll', () => {
    it('should return all definitions', () => {
      registry.registerAll([paragraphDef, heading1Def]);
      const defs = registry.getAll();
      expect(defs).toHaveLength(2);
    });
  });

  describe('create', () => {
    it('should create a new block', () => {
      registry.register(paragraphDef);
      const block = registry.create('paragraph');
      expect(block.type).toBe('paragraph');
      expect(block.direction).toBe('rtl');
    });

    it('should throw for unknown type', () => {
      expect(() => registry.create('paragraph')).toThrow('Unknown block type');
    });

    it('should create unique IDs', () => {
      registry.register(paragraphDef);
      const block1 = registry.create('paragraph');
      const block2 = registry.create('paragraph');
      expect(block1.id).not.toBe(block2.id);
    });
  });

  describe('getByCategory', () => {
    beforeEach(() => {
      registry.registerAll([paragraphDef, heading1Def, bulletListDef, imageDef, codeDef]);
    });

    it('should return text blocks', () => {
      const textBlocks = registry.getByCategory('text');
      expect(textBlocks).toHaveLength(2);
      expect(textBlocks.map(b => b.type)).toContain('paragraph');
      expect(textBlocks.map(b => b.type)).toContain('heading1');
    });

    it('should return list blocks', () => {
      const listBlocks = registry.getByCategory('list');
      expect(listBlocks).toHaveLength(1);
      expect(listBlocks[0].type).toBe('bullet-list');
    });

    it('should return media blocks', () => {
      const mediaBlocks = registry.getByCategory('media');
      expect(mediaBlocks).toHaveLength(1);
      expect(mediaBlocks[0].type).toBe('image');
    });

    it('should return advanced blocks', () => {
      const advancedBlocks = registry.getByCategory('advanced');
      expect(advancedBlocks).toHaveLength(1);
      expect(advancedBlocks[0].type).toBe('code');
    });
  });

  describe('getAddMenuTabs', () => {
    beforeEach(() => {
      registry.registerAll([paragraphDef, heading1Def, bulletListDef, imageDef, codeDef]);
    });

    it('should return tabs with blocks', () => {
      const tabs = registry.getAddMenuTabs();
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('should have correct Arabic labels', () => {
      const tabs = registry.getAddMenuTabs();
      const textTab = tabs.find(t => t.id === 'text');
      expect(textTab?.labelAr).toBe('نصية');
    });

    it('should not include empty categories', () => {
      const emptyRegistry = createBlockRegistry();
      emptyRegistry.register(paragraphDef);
      const tabs = emptyRegistry.getAddMenuTabs();
      expect(tabs).toHaveLength(1);
      expect(tabs[0].id).toBe('text');
    });
  });

  describe('getSlashMenuItems', () => {
    it('should return items with all required fields', () => {
      registry.registerAll([paragraphDef, heading1Def]);
      const items = registry.getSlashMenuItems();
      
      expect(items).toHaveLength(2);
      expect(items[0]).toHaveProperty('type');
      expect(items[0]).toHaveProperty('name');
      expect(items[0]).toHaveProperty('nameAr');
      expect(items[0]).toHaveProperty('icon');
    });

    it('should include shortcuts when defined', () => {
      registry.register(heading1Def);
      const items = registry.getSlashMenuItems();
      expect(items[0].shortcut).toBe('# ');
    });
  });

  describe('findByShortcut', () => {
    beforeEach(() => {
      registry.registerAll([paragraphDef, heading1Def, bulletListDef, codeDef]);
    });

    it('should find block by shortcut', () => {
      const def = registry.findByShortcut('# ');
      expect(def?.type).toBe('heading1');
    });

    it('should find bullet list by shortcut', () => {
      const def = registry.findByShortcut('- ');
      expect(def?.type).toBe('bullet-list');
    });

    it('should find code block by shortcut', () => {
      const def = registry.findByShortcut('```');
      expect(def?.type).toBe('code');
    });

    it('should return undefined for unknown shortcut', () => {
      expect(registry.findByShortcut('unknown')).toBeUndefined();
    });
  });

  describe('getConvertibleTypes', () => {
    it('should return convertible types', () => {
      registry.register(heading1Def);
      const types = registry.getConvertibleTypes('heading1');
      expect(types).toContain('paragraph');
      expect(types).toContain('heading2');
    });

    it('should return empty array when no conversions defined', () => {
      registry.register(paragraphDef);
      const types = registry.getConvertibleTypes('paragraph');
      expect(types).toHaveLength(0);
    });

    it('should return empty array for unknown type', () => {
      const types = registry.getConvertibleTypes('unknown' as any);
      expect(types).toHaveLength(0);
    });
  });

  describe('clear', () => {
    it('should remove all definitions', () => {
      registry.registerAll([paragraphDef, heading1Def]);
      registry.clear();
      expect(registry.getTypes()).toHaveLength(0);
    });
  });
});
