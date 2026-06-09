/**
 * Theme System - DUAL SYSTEM
 * 
 * Exports for the ARTOON-TYPER dual theme system:
 * 1. Editor Themes: Light/Dark mode for editor interface
 * 2. Preview Themes: Content presentation themes
 */

// Types
export type {
  DesignTokens,
  ComponentMapping,
  EditorTheme,
  EditorMode,
  EditorPreference,
  PreviewTheme,
  ThemeContextValue,
  CSSVariables,
} from './types';

export { tokensToCSSVariables } from './types';

// Editor themes
export { lightEditorTheme, darkEditorTheme, getEditorTheme } from './editor';

// Preview themes
export {
  minimalTheme,
  blogTheme,
  documentationTheme,
  academicTheme,
  previewThemes,
  getPreviewTheme,
  defaultPreviewTheme,
} from './preview';

// Provider and hook
export { ThemeProvider, useTheme } from './ThemeProvider';

