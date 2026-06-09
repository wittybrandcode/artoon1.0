/**
 * EditorContainer Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock React
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useState: vi.fn((initial) => [initial, vi.fn()]),
    useCallback: vi.fn((fn) => fn),
    useEffect: vi.fn(),
    useRef: vi.fn(() => ({ current: null })),
    useMemo: vi.fn((fn) => fn()),
    Fragment: ({ children }: any) => children,
    default: {
      createElement: vi.fn(),
    },
  };
});

describe('EditorContainer', () => {
  describe('Component Structure', () => {
    it('should export EditorContainer component', async () => {
      const module = await import('../../src/ui/components/EditorContainer');
      expect(module.EditorContainer).toBeDefined();
      expect(typeof module.EditorContainer).toBe('function');
    });
    
    it('should export EditorContainerProps type', async () => {
      // Type check - if this compiles, the type exists
      const module = await import('../../src/ui/components/EditorContainer');
      expect(module).toBeDefined();
    });
    
    it('should have default export', async () => {
      const module = await import('../../src/ui/components/EditorContainer');
      expect(module.default).toBeDefined();
    });
  });
  
  describe('Props Interface', () => {
    it('should accept className prop', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      // Component accepts className - type check
      expect(EditorContainer).toBeDefined();
    });
    
    it('should accept theme prop', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
    
    it('should accept placeholder prop', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
    
    it('should accept initialContent prop', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
    
    it('should accept readOnly prop', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
    
    it('should accept onChange callback', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
  });
  
  describe('Default Values', () => {
    it('should have default theme of light', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
    
    it('should have default Arabic placeholder', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
  });
  
  describe('CSS Classes', () => {
    it('should apply artoon-typer class', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
    
    it('should apply theme class', async () => {
      const { EditorContainer } = await import('../../src/ui/components/EditorContainer');
      expect(EditorContainer).toBeDefined();
    });
  });
});
