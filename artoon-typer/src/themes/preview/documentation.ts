/**
 * Documentation Preview Theme
 * 
 * A clean, professional theme optimized for technical documentation.
 * Features clear hierarchy and excellent code display.
 */

import type { PreviewTheme } from '../types';

export const documentationTheme: PreviewTheme = {
  id: 'documentation',
  name: 'Documentation',
  nameAr: 'توثيق',
  version: '1.0.0',
  description: 'Professional documentation style',
  descriptionAr: 'أسلوب توثيق احترافي',
  
  tokens: {
    colors: {
      primary: '#0ea5e9',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      text: {
        primary: '#0f172a',
        secondary: '#475569',
        tertiary: '#94a3b8',
        disabled: '#cbd5e1',
      },
      
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        hover: '#f1f5f9',
        active: '#e2e8f0',
      },
      
      border: {
        default: '#e2e8f0',
        hover: '#cbd5e1',
        focus: '#0ea5e9',
      },
    },
    
    typography: {
      fontFamily: {
        heading: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        code: '"Fira Code", Consolas, Monaco, monospace',
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
        normal: 1.6,
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
      md: '0.375rem',
      lg: '0.5rem',
      full: '9999px',
    },
    
    shadows: {
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.07)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    },
  },
  
  customCSS: `
    /* Documentation theme - clear and professional */
    body {
      max-width: 800px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    h1, h2, h3, h4, h5, h6 {
      margin-top: 2em;
      margin-bottom: 0.5em;
      line-height: 1.25;
      font-weight: 700;
      color: #0f172a;
    }
    
    h1:first-child,
    h2:first-child,
    h3:first-child {
      margin-top: 0;
    }
    
    h1 {
      font-size: 2.25rem;
      border-bottom: 2px solid #e2e8f0;
      padding-bottom: 0.5em;
    }
    
    h2 {
      font-size: 1.875rem;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 0.3em;
    }
    
    h3 {
      font-size: 1.5rem;
    }
    
    h4 {
      font-size: 1.25rem;
    }
    
    p {
      margin: 1em 0;
      line-height: 1.6;
    }
    
    a {
      color: #0ea5e9;
      text-decoration: none;
      border-bottom: 1px solid transparent;
      transition: border-color 0.2s;
    }
    
    a:hover {
      border-bottom-color: #0ea5e9;
    }
    
    strong {
      font-weight: 600;
      color: #0f172a;
    }
    
    code {
      background: #f1f5f9;
      color: #dc2626;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-size: 0.875em;
      font-family: "Fira Code", Consolas, Monaco, monospace;
      border: 1px solid #e2e8f0;
    }
    
    pre {
      background: #0f172a;
      color: #e2e8f0;
      padding: 1.25em;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 1.5em 0;
      border: 1px solid #1e293b;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    pre code {
      background: none;
      color: inherit;
      padding: 0;
      border: none;
      font-size: 0.875rem;
    }
    
    blockquote {
      background: #f8fafc;
      border-right: 4px solid #0ea5e9;
      padding: 1em 1.5em;
      margin: 1.5em 0;
      border-radius: 0.25rem;
    }
    
    blockquote p {
      margin: 0.5em 0;
      color: #475569;
    }
    
    blockquote p:first-child {
      margin-top: 0;
    }
    
    blockquote p:last-child {
      margin-bottom: 0;
    }
    
    ul, ol {
      margin: 1em 0;
      padding-right: 2em;
    }
    
    li {
      margin: 0.5em 0;
      line-height: 1.6;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 1.5em 0;
      border: 1px solid #e2e8f0;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    
    th, td {
      border: 1px solid #e2e8f0;
      padding: 0.75em 1em;
      text-align: right;
    }
    
    th {
      background: #f8fafc;
      font-weight: 600;
      color: #0f172a;
      border-bottom: 2px solid #e2e8f0;
    }
    
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    
    tbody tr:hover {
      background: #f1f5f9;
    }
    
    hr {
      border: none;
      border-top: 1px solid #e2e8f0;
      margin: 2em 0;
    }
    
    img {
      border-radius: 0.5rem;
      border: 1px solid #e2e8f0;
    }
    
    /* Info boxes */
    .info-box {
      background: #dbeafe;
      border-right: 4px solid #0ea5e9;
      padding: 1em 1.5em;
      margin: 1.5em 0;
      border-radius: 0.25rem;
    }
    
    .warning-box {
      background: #fef3c7;
      border-right: 4px solid #f59e0b;
      padding: 1em 1.5em;
      margin: 1.5em 0;
      border-radius: 0.25rem;
    }
    
    .error-box {
      background: #fee2e2;
      border-right: 4px solid #ef4444;
      padding: 1em 1.5em;
      margin: 1.5em 0;
      border-radius: 0.25rem;
    }
  `,
};
