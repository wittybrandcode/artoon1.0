/**
 * Preview Themes
 * 
 * Collection of preview themes for content presentation.
 */

export { minimalTheme } from './minimal';
export { blogTheme } from './blog';
export { documentationTheme } from './documentation';
export { academicTheme } from './academic';

import { minimalTheme } from './minimal';
import { blogTheme } from './blog';
import { documentationTheme } from './documentation';
import { academicTheme } from './academic';
import type { PreviewTheme } from '../types';

/**
 * All available preview themes
 */
export const previewThemes: PreviewTheme[] = [
  minimalTheme,
  blogTheme,
  documentationTheme,
  academicTheme,
];

/**
 * Get preview theme by ID
 */
export function getPreviewTheme(id: string): PreviewTheme | undefined {
  return previewThemes.find(theme => theme.id === id);
}

/**
 * Default preview theme
 */
export const defaultPreviewTheme = minimalTheme;
