import React from 'react';
import { useToolbar } from './ToolbarContext';

export interface ToolbarGroupProps {
    children: React.ReactNode;
    label?: string;
    className?: string;
    /** Let the group hide itself based on the current context selection type */
    showIf?: Array<'caret' | 'text-selection' | 'block-selection'>;
}

export function ToolbarGroup({ children, label, className = '', showIf }: ToolbarGroupProps) {
    const { selection } = useToolbar();

    // Smart display logic based on selection context
    const isVisible = React.useMemo(() => {
        if (!showIf || showIf.length === 0) return true;

        // Determine current selection type
        let currentContext: 'caret' | 'text-selection' | 'block-selection' = 'caret';

        if (!selection) {
            currentContext = 'block-selection'; // Default to block if no text selection
        } else if (selection.isCollapsed) {
            currentContext = 'caret';
        } else {
            currentContext = 'text-selection';
        }

        return showIf.includes(currentContext);
    }, [selection, showIf]);

    if (!isVisible) return null;

    return (
        <div className={`artoon-toolbar-group ${className}`} role="group" aria-label={label}>
            {label && <span className="artoon-toolbar-group-label">{label}</span>}
            <div className="artoon-toolbar-group-content">
                {children}
            </div>
        </div>
    );
}
