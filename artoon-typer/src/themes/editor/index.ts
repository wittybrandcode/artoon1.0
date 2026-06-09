/**
 * Editor Themes
 * 
 * Light and dark themes for editor interface.
 */

export { lightEditorTheme } from './light';
export { darkEditorTheme } from './dark';

import { lightEditorTheme } from './light';
import { darkEditorTheme } from './dark';
import type { EditorTheme, EditorMode } from '../types';

/**
 * Get editor theme by mode
 */
export function getEditorTheme(mode: EditorMode): EditorTheme {
  return mode === 'dark' ? darkEditorTheme : lightEditorTheme;
}
