import type { Block, ListBlock } from '../../types';
import React from 'react';

export interface BlockRendererProps {
  block: Block;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBlock?: (type: string) => void;
  onSplitListBlock?: (itemsA: ListBlock['items'], itemsB: ListBlock['items']) => void;
  /** Function to render a block, used for recursion without circular imports */
  renderBlock?: (props: BlockRendererProps) => React.ReactNode;
}
