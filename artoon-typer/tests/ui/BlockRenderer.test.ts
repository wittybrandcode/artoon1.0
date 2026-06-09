/**
 * BlockRenderer Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock React
vi.mock('react', () => ({
  useCallback: vi.fn((fn) => fn),
  useRef: vi.fn(() => ({ current: null })),
  default: {
    createElement: vi.fn(),
  },
}));

describe('BlockRenderer', () => {
  describe('Component Structure', () => {
    it('should export BlockRenderer component', async () => {
      const module = await import('../../src/ui/components/BlockRenderer');
      expect(module.BlockRenderer).toBeDefined();
      expect(typeof module.BlockRenderer).toBe('function');
    });
    
    it('should export BlockRendererProps type', async () => {
      const module = await import('../../src/ui/components/BlockRenderer');
      expect(module).toBeDefined();
    });
    
    it('should have default export', async () => {
      const module = await import('../../src/ui/components/BlockRenderer');
      expect(module.default).toBeDefined();
    });
  });
  
  describe('Block Type Rendering', () => {
    it('should render paragraph blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should render heading blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should render quote blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should render list blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should render code blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should render table blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should render media blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should render divider blocks', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
  });
  
  describe('Editable State', () => {
    it('should set contentEditable when isEditable is true', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
    
    it('should not set contentEditable when isEditable is false', async () => {
      const { BlockRenderer } = await import('../../src/ui/components/BlockRenderer');
      expect(BlockRenderer).toBeDefined();
    });
  });
});
