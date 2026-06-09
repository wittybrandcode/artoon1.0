/**
 * History commands - undo/redo
 */

import type { Command } from '../types';

/**
 * Undo command
 */
export const undo: Command = (state, dispatch) => {
  if (!state.history.canUndo) {
    return false;
  }
  
  if (dispatch) {
    const tr = state.tr.setMeta('history', 'undo');
    dispatch(tr);
  }
  
  return true;
};

/**
 * Redo command
 */
export const redo: Command = (state, dispatch) => {
  if (!state.history.canRedo) {
    return false;
  }
  
  if (dispatch) {
    const tr = state.tr.setMeta('history', 'redo');
    dispatch(tr);
  }
  
  return true;
};

/**
 * History keymap
 */
export const historyKeymap: Record<string, Command> = {
  'Ctrl-z': undo,
  'Ctrl-y': redo,
  'Ctrl-Shift-z': redo
};
