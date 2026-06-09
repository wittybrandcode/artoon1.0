/**
 * Format commands - text formatting (marks)
 */

import type { Command, Modifier } from '../types';

/**
 * Toggle strong (bold) formatting
 */
export const toggleStrong: Command = (state, dispatch) => {
  return toggleMark('s')(state, dispatch);
};

/**
 * Toggle emphasis (italic) formatting
 */
export const toggleEmphasis: Command = (state, dispatch) => {
  return toggleMark('e')(state, dispatch);
};

/**
 * Toggle underline formatting
 */
export const toggleUnderline: Command = (state, dispatch) => {
  return toggleMark('u')(state, dispatch);
};

/**
 * Toggle strikethrough formatting
 */
export const toggleStrikethrough: Command = (state, dispatch) => {
  return toggleMark('d')(state, dispatch);
};

/**
 * Toggle highlight/mark formatting
 */
export const toggleHighlight: Command = (state, dispatch) => {
  return toggleMark('mark')(state, dispatch);
};

/**
 * Toggle subscript formatting
 */
export const toggleSubscript: Command = (state, dispatch) => {
  return toggleMark('sub')(state, dispatch);
};

/**
 * Toggle superscript formatting
 */
export const toggleSuperscript: Command = (state, dispatch) => {
  return toggleMark('sup')(state, dispatch);
};

/**
 * Toggle inline code formatting
 * Note: This is for [c:: code] syntax
 */
export const toggleInlineCode: Command = (state, dispatch) => {
  const { selection } = state;
  
  if (selection.empty) {
    return false;
  }
  
  // Would need to wrap selection in inline code component
  // This requires more complex inline content manipulation
  if (dispatch) {
    // Simplified: just mark as code
    const tr = state.tr.setMeta('inlineCode', true);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Generic toggle mark command
 */
export function toggleMark(mark: Modifier): Command {
  return (state, dispatch) => {
    const { selection } = state;
    
    if (selection.empty) {
      // For empty selection, toggle stored marks
      // This would affect next typed text
      return false;
    }
    
    if (dispatch) {
      const tr = state.tr.toggleMark(mark);
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Add mark to selection
 */
export function addMark(mark: Modifier): Command {
  return (state, dispatch) => {
    const { selection } = state;
    
    if (selection.empty) {
      return false;
    }
    
    if (dispatch) {
      const tr = state.tr.addMark(selection.from, selection.to, mark);
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Remove mark from selection
 */
export function removeMark(mark: Modifier): Command {
  return (state, dispatch) => {
    const { selection } = state;
    
    if (selection.empty) {
      return false;
    }
    
    if (dispatch) {
      const tr = state.tr.removeMark(selection.from, selection.to, mark);
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Clear all marks from selection
 */
export const clearMarks: Command = (state, dispatch) => {
  const { selection } = state;
  
  if (selection.empty) {
    return false;
  }
  
  if (dispatch) {
    const tr = state.tr.clearMarks(selection.from, selection.to);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Check if mark is active in selection
 */
export function isMarkActive(state: any, mark: Modifier): boolean {
  const { selection, doc } = state;
  
  if (selection.empty) {
    // Check stored marks
    return false;
  }
  
  // Would need to check inline content in range
  // Simplified implementation
  return false;
}

/**
 * Default format keymap
 */
export const formatKeymap: Record<string, Command> = {
  'Ctrl-b': toggleStrong,
  'Ctrl-i': toggleEmphasis,
  'Ctrl-u': toggleUnderline,
  'Ctrl-Shift-s': toggleStrikethrough,
  'Ctrl-Shift-h': toggleHighlight,
  'Ctrl-`': toggleInlineCode
};

/**
 * All format commands
 */
export const formatCommands = {
  toggleStrong,
  toggleEmphasis,
  toggleUnderline,
  toggleStrikethrough,
  toggleHighlight,
  toggleSubscript,
  toggleSuperscript,
  toggleInlineCode,
  toggleMark,
  addMark,
  removeMark,
  clearMarks
};
