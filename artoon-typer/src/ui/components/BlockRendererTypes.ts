import type { Block, ListBlock } from '../../types';

export interface BlockRendererProps {
  block: Block;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBlock?: (type: string) => void;
  onSplitListBlock?: (itemsA: ListBlock['items'], itemsB: ListBlock['items']) => void;
}
