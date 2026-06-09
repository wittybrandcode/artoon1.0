import React from 'react';
import { ToolbarContext, type ToolbarContextValue } from './ToolbarContext';

export interface ToolbarRootProps extends ToolbarContextValue {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export function ToolbarRoot({
    children,
    className = '',
    style,
    ...contextValue
}: ToolbarRootProps) {
    return (
        <ToolbarContext.Provider value={contextValue}>
            <div
                className={`artoon-toolbar-root ${className}`}
                style={style}
                role="toolbar"
                aria-orientation="horizontal"
            >
                {children}
            </div>
        </ToolbarContext.Provider>
    );
}
