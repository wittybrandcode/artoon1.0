/**
 * Dark Editor Theme
 * 
 * Dark mode for editor interface.
 */

import type { EditorTheme } from '../types';

export const darkEditorTheme: EditorTheme = {
  id: 'editor-dark',
  name: 'Dark',
  nameAr: 'داكن',
  mode: 'dark',
  
  tokens: {
    colors: {
      primary: '#3b82f6',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      text: {
        primary: '#f1f5f9',
        secondary: '#cbd5e1',
        tertiary: '#94a3b8',
        disabled: '#475569',
      },
      
      background: {
        primary: '#0f172a',
        secondary: '#1e293b',
        tertiary: '#334155',
        hover: '#334155',
        active: '#475569',
      },
      
      border: {
        default: '#334155',
        hover: '#475569',
        focus: '#3b82f6',
      },
    },
    
    typography: {
      fontFamily: {
        heading: 'system-ui, -apple-system, sans-serif',
        body: 'system-ui, -apple-system, sans-serif',
        code: 'Consolas, Monaco, monospace',
      },
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1rem',
        lg: '1.125rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      
      lineHeight: {
        tight: 1.25,
        normal: 1.5,
        relaxed: 1.75,
      },
    },
    
    spacing: {
      xs: '0.25rem',
      sm: '0.5rem',
      md: '1rem',
      lg: '1.5rem',
      xl: '2rem',
      '2xl': '3rem',
      '3xl': '4rem',
    },
    
    radius: {
      sm: '0.25rem',
      md: '0.5rem',
      lg: '0.75rem',
      full: '9999px',
    },
    
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
      md: '0 4px 6px rgba(0, 0, 0, 0.4)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.6)',
    },
  },
};
