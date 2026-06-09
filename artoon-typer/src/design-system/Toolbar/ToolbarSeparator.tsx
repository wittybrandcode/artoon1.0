import React from 'react';

export interface ToolbarSeparatorProps {
    className?: string;
}

export function ToolbarSeparator({ className = '' }: ToolbarSeparatorProps) {
    return (
        <div className={`artoon-toolbar-separator ${className}`} role="separator" aria-orientation="vertical" />
    );
}
