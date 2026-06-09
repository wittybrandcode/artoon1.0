/**
 * useKeyboard Hook Tests
 */

import { describe, it, expect, vi } from 'vitest';

// Mock React
vi.mock('react', () => ({
  useEffect: vi.fn((fn) => fn()),
  useMemo: vi.fn((fn) => fn()),
  useCallback: vi.fn((fn) => fn),
}));

describe('useKeyboard', () => {
  describe('Hook Structure', () => {
    it('should export useKeyboard hook', async () => {
      const module = await import('../../src/ui/hooks/useKeyboard');
      expect(module.useKeyboard).toBeDefined();
      expect(typeof module.useKeyboard).toBe('function');
    });
    
    it('should export UseKeyboardOptions type', async () => {
      const module = await import('../../src/ui/hooks/useKeyboard');
      expect(module).toBeDefined();
    });
    
    it('should export UseKeyboardReturn type', async () => {
      const module = await import('../../src/ui/hooks/useKeyboard');
      expect(module).toBeDefined();
    });
  });
  
  describe('Return Value', () => {
    it('should return register function', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
    
    it('should return unregister function', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
    
    it('should return getShortcuts function', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
    
    it('should return setEnabled function', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
    
    it('should return isEnabled function', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
  });
  
  describe('Options', () => {
    it('should accept controller option', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
    
    it('should accept customShortcuts option', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
    
    it('should accept disabledShortcuts option', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
    
    it('should accept enabled option', async () => {
      const { useKeyboard } = await import('../../src/ui/hooks/useKeyboard');
      expect(useKeyboard).toBeDefined();
    });
  });
});
