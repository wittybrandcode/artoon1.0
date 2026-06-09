/**
 * Text commands - basic text manipulation
 */

import type { Command, Dispatch } from '../types';
import type { EditorState } from '../types';
import { TextSelectionImpl, AllSelectionImpl } from '../selection/Selection';

/**
 * Insert text at current selection
 */
export function insertText(text: string): Command {
  return (state, dispatch) => {
    if (dispatch) {
      const tr = state.tr.insertText(text);
      dispatch(tr);
    }
    return true;
  };
}

/**
 * Delete backward (backspace)
 */
export const deleteBackward: Command = (state, dispatch) => {
  const { selection } = state;
  
  if (!selection.empty) {
    // Delete selection
    if (dispatch) {
      const tr = state.tr.delete(selection.from, selection.to);
      dispatch(tr);
    }
    return true;
  }
  
  // Delete one character backward
  if (selection.from > 1) {
    if (dispatch) {
      const tr = state.tr.delete(selection.from - 1, selection.from);
      dispatch(tr);
    }
    return true;
  }
  
  return false;
};

/**
 * Delete forward (delete key)
 */
export const deleteForward: Command = (state, dispatch) => {
  const { selection, doc } = state;
  
  if (!selection.empty) {
    // Delete selection
    if (dispatch) {
      const tr = state.tr.delete(selection.from, selection.to);
      dispatch(tr);
    }
    return true;
  }
  
  // Delete one character forward
  if (selection.to < doc.size - 1) {
    if (dispatch) {
      const tr = state.tr.delete(selection.from, selection.from + 1);
      dispatch(tr);
    }
    return true;
  }
  
  return false;
};

/**
 * Delete selection or word backward
 */
export const deleteWordBackward: Command = (state, dispatch) => {
  const { selection } = state;
  
  if (!selection.empty) {
    return deleteBackward(state, dispatch);
  }
  
  // Find word boundary
  const wordStart = findWordBoundary(state, selection.from, -1);
  
  if (wordStart < selection.from) {
    if (dispatch) {
      const tr = state.tr.delete(wordStart, selection.from);
      dispatch(tr);
    }
    return true;
  }
  
  return deleteBackward(state, dispatch);
};

/**
 * Delete selection or word forward
 */
export const deleteWordForward: Command = (state, dispatch) => {
  const { selection, doc } = state;
  
  if (!selection.empty) {
    return deleteForward(state, dispatch);
  }
  
  // Find word boundary
  const wordEnd = findWordBoundary(state, selection.from, 1);
  
  if (wordEnd > selection.from) {
    if (dispatch) {
      const tr = state.tr.delete(selection.from, wordEnd);
      dispatch(tr);
    }
    return true;
  }
  
  return deleteForward(state, dispatch);
};

/**
 * Select all content
 */
export const selectAll: Command = (state, dispatch) => {
  if (dispatch) {
    const tr = state.tr.setSelection(AllSelectionImpl.create(state.doc as any));
    dispatch(tr);
  }
  return true;
};

/**
 * Insert line break (soft break)
 */
export const insertLineBreak: Command = (state, dispatch) => {
  if (dispatch) {
    const tr = state.tr.insertText('\n');
    dispatch(tr);
  }
  return true;
};

/**
 * Insert paragraph break (hard break)
 */
export const insertParagraph: Command = (state, dispatch) => {
  // This would split the current paragraph
  // Simplified implementation
  if (dispatch) {
    const tr = state.tr.insertText('\n\n');
    dispatch(tr);
  }
  return true;
};

/**
 * Join with previous block
 */
export const joinBackward: Command = (state, dispatch) => {
  const { selection } = state;
  
  // Only at start of block
  if (!selection.empty || selection.from > 1) {
    return false;
  }
  
  // Would need to merge with previous block
  return false;
};

/**
 * Join with next block
 */
export const joinForward: Command = (state, dispatch) => {
  const { selection, doc } = state;
  
  // Only at end of block
  if (!selection.empty || selection.to < doc.size - 1) {
    return false;
  }
  
  // Would need to merge with next block
  return false;
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Find word boundary in given direction
 */
function findWordBoundary(state: EditorState, pos: number, dir: -1 | 1): number {
  const { doc } = state;
  const text = doc.textContent;
  
  // Simple word boundary detection
  const wordChars = /[\p{L}\p{N}]/u;
  let current = pos;
  
  if (dir === -1) {
    while (current > 0) {
      const char = text.charAt(current - 1);
      if (!wordChars.test(char)) break;
      current--;
    }
  } else {
    while (current < text.length) {
      const char = text.charAt(current);
      if (!wordChars.test(char)) break;
      current++;
    }
  }
  
  return current;
}

/**
 * Default text keymap
 */
export const textKeymap: Record<string, Command> = {
  'Backspace': deleteBackward,
  'Delete': deleteForward,
  'Ctrl-Backspace': deleteWordBackward,
  'Ctrl-Delete': deleteWordForward,
  'Ctrl-a': selectAll,
  'Enter': insertParagraph,
  'Shift-Enter': insertLineBreak
};
