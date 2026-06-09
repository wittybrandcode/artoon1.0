/**
 * Block commands - block-level operations
 */

import type { Command, ContentNode, Direction } from '../types';

/**
 * Set paragraph type
 */
export const setParagraph: Command = (state, dispatch) => {
  return setBlockType('p')(state, dispatch);
};

/**
 * Set heading level 1
 */
export const setHeading1: Command = (state, dispatch) => {
  return setBlockType('t1')(state, dispatch);
};

/**
 * Set heading level 2
 */
export const setHeading2: Command = (state, dispatch) => {
  return setBlockType('t2')(state, dispatch);
};

/**
 * Set heading level 3
 */
export const setHeading3: Command = (state, dispatch) => {
  return setBlockType('t3')(state, dispatch);
};

/**
 * Set heading level 4
 */
export const setHeading4: Command = (state, dispatch) => {
  return setBlockType('t4')(state, dispatch);
};

/**
 * Set heading level 5
 */
export const setHeading5: Command = (state, dispatch) => {
  return setBlockType('t5')(state, dispatch);
};

/**
 * Set heading level 6
 */
export const setHeading6: Command = (state, dispatch) => {
  return setBlockType('t6')(state, dispatch);
};

/**
 * Set blockquote
 */
export const setBlockquote: Command = (state, dispatch) => {
  return setBlockType('q')(state, dispatch);
};

/**
 * Set preformatted text
 */
export const setPreformatted: Command = (state, dispatch) => {
  return setBlockType('pre')(state, dispatch);
};

/**
 * Generic set block type command
 */
export function setBlockType(textType: string): Command {
  return (state, dispatch) => {
    const { selection, doc } = state;
    const node = doc.nodeAt(selection.from);
    
    if (!node || node.nodeType !== 'text') {
      return false;
    }
    
    if (dispatch) {
      const tr = state.tr.setBlockType(selection.from, selection.to, textType);
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Toggle blockquote - wrap/unwrap selection in blockquote
 */
export const toggleBlockquote: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node) return false;
  
  if (node.nodeType === 'text' && (node as any).textType === 'q') {
    // Unwrap - convert to paragraph
    return setParagraph(state, dispatch);
  } else {
    // Wrap - convert to blockquote
    return setBlockquote(state, dispatch);
  }
};

/**
 * Set text direction to RTL
 */
export const setDirectionRTL: Command = (state, dispatch) => {
  return setDirection('rtl')(state, dispatch);
};

/**
 * Set text direction to LTR
 */
export const setDirectionLTR: Command = (state, dispatch) => {
  return setDirection('ltr')(state, dispatch);
};

/**
 * Toggle text direction
 */
export const toggleDirection: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node) return false;
  
  const currentDir = node.direction;
  const newDir: Direction = currentDir === 'rtl' ? 'ltr' : 'rtl';
  
  return setDirection(newDir)(state, dispatch);
};

/**
 * Generic set direction command
 */
export function setDirection(direction: Direction): Command {
  return (state, dispatch) => {
    const { selection } = state;
    
    if (dispatch) {
      const tr = state.tr.setNodeAttrs(selection.from, { direction });
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Insert horizontal rule
 */
export const insertHorizontalRule: Command = (state, dispatch) => {
  if (dispatch) {
    const hrNode: ContentNode = {
      type: 'separator',
      nodeType: 'separator',
      separatorType: 'hr',
      direction: 'rtl',
      line: 1
    };
    
    const tr = state.tr.replaceWith(
      state.selection.from,
      state.selection.to,
      hrNode
    );
    dispatch(tr);
  }
  
  return true;
};

/**
 * Insert line break (br)
 */
export const insertBreak: Command = (state, dispatch) => {
  if (dispatch) {
    const brNode: ContentNode = {
      type: 'separator',
      nodeType: 'separator',
      separatorType: 'br',
      direction: 'rtl',
      line: 1
    };
    
    const tr = state.tr.replaceWith(
      state.selection.from,
      state.selection.to,
      brNode
    );
    dispatch(tr);
  }
  
  return true;
};

/**
 * Lift block out of parent (decrease nesting)
 */
export const liftBlock: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const $from = doc.resolve(selection.from);
  
  if ($from.depth < 2) {
    return false; // Can't lift from top level
  }
  
  // Would need to restructure document
  // Simplified: just return false for now
  return false;
};

/**
 * Sink block into parent (increase nesting)
 */
export const sinkBlock: Command = (state, dispatch) => {
  // Would need to wrap in a container
  return false;
};

/**
 * Join current block with previous
 */
export const joinUp: Command = (state, dispatch) => {
  const { selection, doc } = state;
  
  if (selection.from <= 1) {
    return false;
  }
  
  // Would need to merge blocks
  return false;
};

/**
 * Join current block with next
 */
export const joinDown: Command = (state, dispatch) => {
  const { selection, doc } = state;
  
  if (selection.to >= doc.size - 1) {
    return false;
  }
  
  // Would need to merge blocks
  return false;
};

/**
 * Split block at cursor
 */
export const splitBlock: Command = (state, dispatch) => {
  const { selection, doc } = state;
  
  if (!selection.empty) {
    // Delete selection first
    if (dispatch) {
      const tr = state.tr.delete(selection.from, selection.to);
      dispatch(tr);
    }
  }
  
  // Would need to split the current block into two
  // This is complex and depends on block type
  return false;
};

/**
 * Block keymap
 */
export const blockKeymap: Record<string, Command> = {
  'Ctrl-Shift-0': setParagraph,
  'Ctrl-Shift-1': setHeading1,
  'Ctrl-Shift-2': setHeading2,
  'Ctrl-Shift-3': setHeading3,
  'Ctrl-Shift-4': setHeading4,
  'Ctrl-Shift-5': setHeading5,
  'Ctrl-Shift-6': setHeading6,
  'Ctrl-Shift-q': toggleBlockquote,
  'Ctrl-Shift-d': toggleDirection
};

/**
 * All block commands
 */
export const blockCommands = {
  setParagraph,
  setHeading1,
  setHeading2,
  setHeading3,
  setHeading4,
  setHeading5,
  setHeading6,
  setBlockquote,
  setPreformatted,
  setBlockType,
  toggleBlockquote,
  setDirectionRTL,
  setDirectionLTR,
  toggleDirection,
  setDirection,
  insertHorizontalRule,
  insertBreak,
  liftBlock,
  sinkBlock,
  joinUp,
  joinDown,
  splitBlock
};
