/**
 * Minimal Preview Theme
 * 
 * A clean, minimal theme with basic styling.
 * Perfect for distraction-free reading.
 */

import type { PreviewTheme } from '../types';

export const minimalTheme: PreviewTheme = {
  id: 'minimal',
  name: 'Minimal',
  nameAr: 'بسيط',
  version: '1.0.0',
  description: 'Clean and minimal styling',
  descriptionAr: 'تنسيق نظيف وبسيط',
  
  tokens: {
    colors: {
      primary: '#000000',
      secondary: '#666666',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      text: {
        primary: '#1a1a1a',
        secondary: '#666666',
        tertiary: '#999999',
        disabled: '#cccccc',
      },
      
      background: {
        primary: '#ffffff',
        secondary: '#f9f9f9',
        tertiary: '#f0f0f0',
        hover: '#f5f5f5',
        active: '#eeeeee',
      },
      
      border: {
        default: '#e0e0e0',
        hover: '#cccccc',
        focus: '#000000',
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
      sm: '0.125rem',
      md: '0.25rem',
      lg: '0.5rem',
      full: '9999px',
    },
    
    shadows: {
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
    },
  },
  
  customCSS: `
    /* Minimal theme - very basic styling */
    body {
      max-width: 650px;
      margin: 0 auto;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2em;
      margin-bottom: 0.5em;
    }
    
    h1:first-child,
    h2:first-child,
    h3:first-child {
      margin-top: 0;
    }
    
    p {
      margin: 1em 0;
    }
    
    a {
      color: inherit;
      text-decoration: underline;
    }
    
    code {
      background: #f5f5f5;
      padding: 0.2em 0.4em;
      border-radius: 3px;
      font-size: 0.9em;
    }
    
    pre {
      background: #f5f5f5;
      padding: 1em;
      overflow-x: auto;
      border-radius: 3px;
    }
    
    pre code {
      background: none;
      padding: 0;
    }
    
    blockquote {
      border-right: 3px solid #e0e0e0;
      padding-right: 1em;
      margin: 1.5em 0;
      color: #666;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
    }
    
    th, td {
      border: 1px solid #e0e0e0;
      padding: 0.5em 1em;
      text-align: right;
    }
    
    th {
      background: #f9f9f9;
      font-weight: 600;
    }
  `,
};
