import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TooltipProvider } from '../../src/design-system/components/Tooltip/Tooltip';
import { ToolbarButton } from '../../src/design-system/Toolbar/ToolbarButton';
import { ToolbarRoot } from '../../src/design-system/Toolbar/ToolbarRoot';

function renderButton(
  props: React.ComponentProps<typeof ToolbarButton>,
  options: Partial<React.ComponentProps<typeof ToolbarRoot>> = {}
) {
  render(
    <TooltipProvider>
      <ToolbarRoot
        activeMarks={[]}
        selection={null}
        blocks={[]}
        onToggleMark={vi.fn()}
        onConvertBlock={vi.fn()}
        {...options}
      >
        <ToolbarButton {...props} />
      </ToolbarRoot>
    </TooltipProvider>
  );
}

describe('ToolbarButton history actions', () => {
  it('dispatches undo when the undo button is clicked', () => {
    const onAction = vi.fn();
    renderButton({ action: 'undo', icon: <span />, tooltip: 'undo' }, { onAction });

    fireEvent.click(screen.getByRole('button', { name: 'undo' }));

    expect(onAction).toHaveBeenCalledWith('undo');
  });

  it('dispatches redo when the redo button is clicked', () => {
    const onAction = vi.fn();
    renderButton({ action: 'redo', icon: <span />, tooltip: 'redo' }, { onAction });

    fireEvent.click(screen.getByRole('button', { name: 'redo' }));

    expect(onAction).toHaveBeenCalledWith('redo');
  });
});

describe('ToolbarButton accessibility semantics', () => {
  it('renders an explicitly typed button with an accessible name', () => {
    renderButton({ format: 'bold', icon: <span />, tooltip: 'Bold', shortcut: 'Ctrl+B' });

    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('type')).toBe('button');
  });

  it('exposes toggle state through aria-pressed', () => {
    renderButton(
      { format: 'bold', icon: <span />, tooltip: 'Bold' },
      { activeMarks: ['bold'] }
    );

    expect(screen.getByRole('button', { name: 'Bold' }).getAttribute('aria-pressed')).toBe('true');
  });

  it('uses the native disabled state and suppresses actions while disabled', () => {
    const onToggleMark = vi.fn();
    renderButton(
      { format: 'bold', icon: <span />, tooltip: 'Bold' },
      { disabled: true, onToggleMark }
    );

    const button = screen.getByRole('button', { name: 'Bold' });
    expect((button as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(button);
    expect(onToggleMark).not.toHaveBeenCalled();
  });

  it('marks the toolbar root with horizontal toolbar semantics', () => {
    renderButton({ format: 'bold', icon: <span />, tooltip: 'Bold' });

    expect(screen.getByRole('toolbar').getAttribute('aria-orientation')).toBe('horizontal');
  });
});
