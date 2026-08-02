import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEditor } from '../../src/ui/hooks/useEditor';

// Mock validate and parse correctly
vi.mock('@artoon/parser', () => ({
  parse: vi.fn().mockReturnValue({ ast: { children: [] } })
}));

vi.mock('@artoon/validator', () => ({
  validate: vi.fn().mockReturnValue({
    valid: false,
    errors: [{ line: 1, what: 'Fake error' }],
    warnings: [],
    philosophyBreaches: [],
    stats: { totalIssues: 1, errorCount: 1, warningCount: 0, breachCount: 0 }
  })
}));

describe('Editor Validation Integration', () => {
  it('should trigger validation and surface results', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useEditor({ initialContent: 'test' }));

    act(() => {
      // Simulate an update
      result.current.insertBlock('paragraph');
    });

    // Fast forward debounce timer
    act(() => {
      vi.advanceTimersByTime(350);
    });

    // Allow promise resolution
    await vi.runAllTimersAsync();

    expect(result.current.validationResult).not.toBeNull();
    expect(result.current.validationResult?.stats.errorCount).toBe(1);
    expect(result.current.validationResult?.errors[0].what).toBe('Fake error');

    vi.useRealTimers();
  });
});
