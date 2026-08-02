import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ValidationPanel } from '../../src/ui/components/ValidationPanel';

describe('ValidationPanel', () => {
  it('renders nothing when validationResult is null', () => {
    const { container } = render(<ValidationPanel validationResult={null} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders nothing when there are no issues', () => {
    const emptyResult: any = {
      valid: true,
      errors: [],
      warnings: [],
      philosophyBreaches: [],
      stats: { totalIssues: 0, errorCount: 0, warningCount: 0, breachCount: 0 }
    };
    const { container } = render(<ValidationPanel validationResult={emptyResult} onClose={() => {}} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders errors, warnings, and philosophy breaches', () => {
    const result: any = {
      valid: false,
      errors: [{ line: 1, what: 'Error message' }],
      warnings: [{ line: 2, what: 'Warning message' }],
      philosophyBreaches: [{ line: 3, what: 'Philosophy breach message' }],
      stats: { totalIssues: 3, errorCount: 1, warningCount: 1, breachCount: 1 }
    };
    render(<ValidationPanel validationResult={result} onClose={() => {}} />);

    expect(screen.getByText('الأخطاء (1)')).toBeTruthy();
    expect(screen.getByText('Error message')).toBeTruthy();

    expect(screen.getByText('التحذيرات (1)')).toBeTruthy();
    expect(screen.getByText('Warning message')).toBeTruthy();

    expect(screen.getByText('مخالفات الفلسفة (1)')).toBeTruthy();
    expect(screen.getByText('Philosophy breach message')).toBeTruthy();
  });

  it('calls onClose when close button is clicked', () => {
    const result: any = {
      valid: false,
      errors: [{ line: 1, what: 'Error message' }],
      warnings: [],
      philosophyBreaches: [],
      stats: { totalIssues: 1, errorCount: 1, warningCount: 0, breachCount: 0 }
    };
    const handleClose = vi.fn();
    render(<ValidationPanel validationResult={result} onClose={handleClose} />);

    fireEvent.click(screen.getByText('×'));
    expect(handleClose).toHaveBeenCalledTimes(1);
  });
});
