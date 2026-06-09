import { createContext, useContext } from 'react';
import type { MarkType, BlockType, Direction, SelectionState, Block } from '../../types';

export interface ToolbarContextValue {
    activeMarks: MarkType[];
    focusedBlockType?: BlockType;
    focusedBlockAlign?: 'left' | 'center' | 'right';
    selection: SelectionState | null;
    blocks: Block[];
    onToggleMark: (mark: MarkType) => void;
    onConvertBlock: (type: BlockType) => void;
    onAction?: (action: 'undo' | 'redo') => void;
    onAlign?: (align: 'left' | 'center' | 'right') => void;
    onLink?: () => void;
    direction?: Direction;
    disabled?: boolean;
}

export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

export function useToolbar() {
    const context = useContext(ToolbarContext);
    if (!context) {
        throw new Error('Toolbar compound components must be rendered within a Toolbar.Root');
    }
    return context;
}
