import React from 'react';
import { useToolbar } from './ToolbarContext';
import { Tooltip } from '../components/Tooltip/Tooltip';
import type { MarkType, BlockType } from '../../types';

export interface ToolbarButtonProps {
    /** The icon to display */
    icon: React.ReactNode;
    /** Primary tooltip text */
    tooltip: string;
    /** Optional keyboard shortcut to display in tooltip */
    shortcut?: string;
    /** Optional CSS class */
    className?: string;

    // Behaviors (Pick one)
    /** If this button toggles a text mark (e.g., bold, italic) */
    format?: MarkType | 'mark';
    /** If this button converts the current block type (e.g., heading, quote) */
    blockType?: BlockType;
    /** General action string (e.g., undo, link) */
    action?: 'undo' | 'redo' | 'link';
    /** If this button aligns the current block */
    align?: 'left' | 'center' | 'right';
}

export function ToolbarButton({
    icon,
    tooltip,
    shortcut,
    className = '',
    format,
    blockType,
    action,
    align,
}: ToolbarButtonProps) {
    const {
        activeMarks,
        focusedBlockType,
        focusedBlockAlign,
        onToggleMark,
        onConvertBlock,
        onAction,
        onAlign,
        onLink,
        disabled
    } = useToolbar();

    // Determine active state based on provided behavior prop
    const isActive = React.useMemo(() => {
        if (format) {
            if (format === 'mark') {
                // Special case: check if any highglighter mark exists, though normally it's just 'mark' in activeMarks
                return activeMarks.includes(format as MarkType);
            }
            return activeMarks.includes(format);
        }
        if (blockType) return focusedBlockType === blockType;
        if (align && focusedBlockAlign) return focusedBlockAlign === align;
        return false;
    }, [format, blockType, align, activeMarks, focusedBlockType, focusedBlockAlign]);

    // Handle click based on behavior
    const handleClick = React.useCallback(() => {
        if (disabled) return;

        if (format) onToggleMark(format as MarkType);
        else if (blockType) onConvertBlock(blockType);
        else if (align && onAlign) onAlign(align);
        else if (action === 'undo' && onAction) onAction('undo');
        else if (action === 'redo' && onAction) onAction('redo');
        else if (action === 'link' && onLink) onLink();
    }, [disabled, format, blockType, align, action, onToggleMark, onConvertBlock, onAlign, onAction, onLink]);

    return (
        <Tooltip content={
            <div className="artoon-toolbar-tooltip-content">
                <span>{tooltip}</span>
                {shortcut && <kbd className="artoon-toolbar-kbd">{shortcut}</kbd>}
            </div>
        }>
            <button
                type="button"
                className={`artoon-toolbar-btn ${isActive ? 'artoon-toolbar-btn--active' : ''} ${className}`}
                onClick={handleClick}
                disabled={disabled}
                aria-label={tooltip}
                aria-pressed={isActive}
            >
                {icon}
            </button>
        </Tooltip>
    );
}
