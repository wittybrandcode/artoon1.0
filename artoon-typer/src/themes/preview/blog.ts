/**
 * Blog Preview Theme
 * 
 * A warm, readable theme perfect for blog posts and articles.
 * Features serif fonts and comfortable spacing.
 */

import type { PreviewTheme } from '../types';

export const blogTheme: PreviewTheme = {
  id: 'blog',
  name: 'Blog',
  nameAr: 'مدونة',
  version: '1.0.0',
  description: 'Warm and readable blog style',
  descriptionAr: 'أسلوب مدونة دافئ وسهل القراءة',
  
  tokens: {
    colors: {
      primary: '#2563eb',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      text: {
        primary: '#1e293b',
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
        focus: '#2563eb',
      },
    },
    
    typography: {
      fontFamily: {
        heading: 'Georgia, Cambria, "Times New Roman", serif',
        body: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        code: 'Consolas, Monaco, "Courier New", monospace',
      },
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.5rem',
        '2xl': '1.875rem',
        '3xl': '2.25rem',
        '4xl': '2.75rem',
      },
      
      fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
      },
      
      lineHeight: {
        tight: 1.3,
        normal: 1.7,
        relaxed: 1.9,
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
      sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px rgba(0, 0, 0, 0.07)',
      lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
      xl: '0 20px 25px rgba(0, 0, 0, 0.15)',
    },
  },
  
  customCSS: `
    /* Blog theme - warm and readable */
    body {
      max-width: 680px;
      margin: 0 auto;
      line-height: 1.7;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: Georgia, Cambria, "Times New Roman", serif;
      margin-top: 2.5em;
      margin-bottom: 0.75em;
      line-height: 1.3;
    }
    
    h1:first-child,
    h2:first-child,
    h3:first-child {
      margin-top: 0;
    }
    
    h1 {
      font-size: 2.75rem;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    
    h2 {
      font-size: 2.25rem;
      font-weight: 600;
    }
    
    h3 {
      font-size: 1.875rem;
      font-weight: 600;
    }
    
    p {
      margin: 1.5em 0;
      font-size: 1.125rem;
      line-height: 1.7;
    }
    
    a {
      color: #2563eb;
      text-decoration: none;
      border-bottom: 1px solid #93c5fd;
      transition: border-color 0.2s;
    }
    
    a:hover {
      border-bottom-color: #2563eb;
    }
    
    strong {
      font-weight: 600;
      color: #1e293b;
    }
    
    em {
      font-style: italic;
      color: #475569;
    }
    
    code {
      background: #f1f5f9;
      color: #dc2626;
      padding: 0.2em 0.4em;
      border-radius: 0.25rem;
      font-size: 0.9em;
      font-family: Consolas, Monaco, "Courier New", monospace;
    }
    
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1.5em;
      border-radius: 0.5rem;
      overflow-x: auto;
      margin: 2em 0;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    pre code {
      background: none;
      color: inherit;
      padding: 0;
    }
    
    blockquote {
      border-right: 4px solid #2563eb;
      padding-right: 1.5em;
      margin: 2em 0;
      color: #475569;
      font-style: italic;
      font-size: 1.125rem;
    }
    
    blockquote p {
      margin: 0.5em 0;
    }
    
    ul, ol {
      margin: 1.5em 0;
      padding-right: 2em;
    }
    
    li {
      margin: 0.75em 0;
      line-height: 1.7;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 2em 0;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
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
      color: #1e293b;
    }
    
    tbody tr:hover {
      background: #f8fafc;
    }
    
    hr {
      border: none;
      border-top: 2px solid #e2e8f0;
      margin: 3em 0;
    }
    
    img {
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
  `,
};
