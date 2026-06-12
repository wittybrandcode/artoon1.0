/**
 * E2E Tests - Basic Editing
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: vi.fn((initial) => [initial, vi.fn()]),
    useCallback: vi.fn((fn) => fn),
    useEffect: vi.fn(),
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    createContext: vi.fn(),
    useContext: vi.fn(),
    default: actual.default || actual,
  };
});

describe('E2E: Basic Editing', () => {
  beforeEach(() => {
    vi.resetModules();
  });
  
  describe('Editor Initialization', () => {
    it('should initialize with default paragraph block', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      expect(controller.getBlocks()).toHaveLength(1);
      expect(controller.getBlocks()[0].type).toBe('paragraph');
    });
    
    it('should initialize with initial blocks', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({
        initialBlocks: [
          { id: 'p1', type: 'paragraph', direction: 'rtl', content: [{ type: 'plain', value: 'test' }] },
        ],
      });
      expect(controller.getBlocks()).toHaveLength(1);
      expect(controller.getBlocks()[0].id).toBe('p1');
    });
  });
  
  describe('Block Operations', () => {
    it('should add paragraph block', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      const initialCount = controller.getBlocks().length;
      controller.addBlock({ id: 'test-1', type: 'paragraph', direction: 'rtl', content: [] });
      expect(controller.getBlocks()).toHaveLength(initialCount + 1);
    });
    
    it('should remove block and keep at least one', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      const defaultBlockId = controller.getBlocks()[0].id;
      controller.removeBlock(defaultBlockId);
      expect(controller.getBlocks()).toHaveLength(1);
    });
    
    it('should update block content', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      const blockId = controller.getBlocks()[0].id;
      controller.updateBlock(blockId, { content: [{ type: 'plain', value: 'Updated' }] });
      expect(controller.getBlock(blockId)).toBeDefined();
    });
    
    it('should move block', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      controller.addBlock({ id: 'b1', type: 'paragraph', direction: 'rtl', content: [] });
      controller.addBlock({ id: 'b2', type: 'paragraph', direction: 'rtl', content: [] });
      controller.moveBlock('b2', 0);
      expect(controller.getBlocks()[0].id).toBe('b2');
    });
    
    it('should duplicate block', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      const blockId = controller.getBlocks()[0].id;
      const initialCount = controller.getBlocks().length;
      const duplicated = controller.duplicateBlock(blockId);
      expect(controller.getBlocks()).toHaveLength(initialCount + 1);
      expect(duplicated).toBeDefined();
    });
  });
  
  describe('Undo/Redo', () => {
    it('should undo add block', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      const initialCount = controller.getBlocks().length;
      controller.addBlock({ id: 'test-1', type: 'paragraph', direction: 'rtl', content: [] });
      expect(controller.getBlocks()).toHaveLength(initialCount + 1);
      controller.undo();
      expect(controller.getBlocks()).toHaveLength(initialCount);
    });
    
    it('should redo after undo', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      const initialCount = controller.getBlocks().length;
      controller.addBlock({ id: 'test-1', type: 'paragraph', direction: 'rtl', content: [] });
      controller.undo();
      controller.redo();
      expect(controller.getBlocks()).toHaveLength(initialCount + 1);
    });
  });
  
  describe('Focus Management', () => {
    it('should focus block', async () => {
      const { createEditorController } = await import('../../src/core/EditorController');
      const controller = createEditorController({});
      controller.addBlock({ id: 'b1', type: 'paragraph', direction: 'rtl', content: [] });
      controller.addBlock({ id: 'b2', type: 'paragraph', direction: 'rtl', content: [] });
      controller.focusBlock('b2');
      expect(controller.getFocusedBlock()?.id).toBe('b2');
    });
  });
});
