/**
 * Academic Preview Theme
 * 
 * A formal, scholarly theme suitable for academic papers and research.
 * Features traditional typography and formal styling.
 */

import type { PreviewTheme } from '../types';

export const academicTheme: PreviewTheme = {
  id: 'academic',
  name: 'Academic',
  nameAr: 'أكاديمي',
  version: '1.0.0',
  description: 'Formal academic paper style',
  descriptionAr: 'أسلوب ورقة أكاديمية رسمية',
  
  tokens: {
    colors: {
      primary: '#1e40af',
      secondary: '#64748b',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      
      text: {
        primary: '#0f172a',
        secondary: '#334155',
        tertiary: '#64748b',
        disabled: '#94a3b8',
      },
      
      background: {
        primary: '#ffffff',
        secondary: '#f8fafc',
        tertiary: '#f1f5f9',
        hover: '#f1f5f9',
        active: '#e2e8f0',
      },
      
      border: {
        default: '#cbd5e1',
        hover: '#94a3b8',
        focus: '#1e40af',
      },
    },
    
    typography: {
      fontFamily: {
        heading: 'Georgia, "Times New Roman", serif',
        body: 'Georgia, "Times New Roman", serif',
        code: '"Courier New", Courier, monospace',
      },
      
      fontSize: {
        xs: '0.75rem',
        sm: '0.875rem',
        base: '1.125rem',
        lg: '1.25rem',
        xl: '1.375rem',
        '2xl': '1.625rem',
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
        tight: 1.3,
        normal: 1.8,
        relaxed: 2.0,
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
      sm: '0',
      md: '0',
      lg: '0',
      full: '0',
    },
    
    shadows: {
      sm: 'none',
      md: 'none',
      lg: 'none',
      xl: 'none',
    },
  },
  
  customCSS: `
    /* Academic theme - formal and scholarly */
    body {
      max-width: 700px;
      margin: 0 auto;
      line-height: 1.8;
      text-align: justify;
      font-family: Georgia, "Times New Roman", serif;
    }
    
    h1, h2, h3, h4, h5, h6 {
      font-family: Georgia, "Times New Roman", serif;
      margin-top: 2em;
      margin-bottom: 0.5em;
      line-height: 1.3;
      font-weight: 700;
      text-align: right;
      color: #0f172a;
    }
    
    h1:first-child,
    h2:first-child,
    h3:first-child {
      margin-top: 0;
    }
    
    h1 {
      font-size: 2.25rem;
      text-align: center;
      margin-bottom: 1em;
      border-bottom: 2px solid #0f172a;
      padding-bottom: 0.5em;
    }
    
    h2 {
      font-size: 1.875rem;
      margin-top: 2.5em;
    }
    
    h3 {
      font-size: 1.625rem;
    }
    
    h4 {
      font-size: 1.375rem;
      font-weight: 600;
    }
    
    p {
      margin: 1.5em 0;
      text-indent: 2em;
      line-height: 1.8;
      font-size: 1.125rem;
    }
    
    p:first-of-type,
    h1 + p,
    h2 + p,
    h3 + p,
    h4 + p {
      text-indent: 0;
    }
    
    a {
      color: #1e40af;
      text-decoration: none;
      border-bottom: 1px solid #1e40af;
    }
    
    a:hover {
      color: #1e3a8a;
      border-bottom-color: #1e3a8a;
    }
    
    strong {
      font-weight: 700;
      color: #0f172a;
    }
    
    em {
      font-style: italic;
    }
    
    code {
      font-family: "Courier New", Courier, monospace;
      font-size: 0.95em;
      background: #f1f5f9;
      padding: 0.1em 0.3em;
      border: 1px solid #cbd5e1;
    }
    
    pre {
      font-family: "Courier New", Courier, monospace;
      font-size: 0.9rem;
      background: #f8fafc;
      padding: 1.5em;
      border: 1px solid #cbd5e1;
      overflow-x: auto;
      margin: 2em 0;
      line-height: 1.5;
      direction: ltr;
      text-align: left;
    }
    
    pre code {
      background: none;
      padding: 0;
      border: none;
    }
    
    blockquote {
      border-right: 3px solid #334155;
      padding-right: 1.5em;
      margin: 2em 0;
      font-style: italic;
      color: #334155;
      text-indent: 0;
    }
    
    blockquote p {
      text-indent: 0;
    }
    
    ul, ol {
      margin: 1.5em 0;
      padding-right: 2.5em;
    }
    
    li {
      margin: 0.75em 0;
      line-height: 1.8;
    }
    
    table {
      border-collapse: collapse;
      width: 100%;
      margin: 2em auto;
      border: 2px solid #0f172a;
      font-size: 1rem;
    }
    
    caption {
      caption-side: bottom;
      text-align: center;
      margin-top: 0.5em;
      font-style: italic;
      color: #334155;
    }
    
    th, td {
      border: 1px solid #334155;
      padding: 0.75em 1em;
      text-align: right;
    }
    
    th {
      background: #f8fafc;
      font-weight: 700;
      color: #0f172a;
      border-bottom: 2px solid #0f172a;
    }
    
    tbody tr:nth-child(even) {
      background: #f8fafc;
    }
    
    hr {
      border: none;
      border-top: 1px solid #334155;
      margin: 3em 0;
    }
    
    img {
      display: block;
      margin: 2em auto;
      max-width: 100%;
      border: 1px solid #cbd5e1;
    }
    
    /* Footnotes style */
    .footnote {
      font-size: 0.875rem;
      vertical-align: super;
      color: #1e40af;
    }
    
    .footnotes {
      margin-top: 3em;
      padding-top: 1em;
      border-top: 1px solid #cbd5e1;
      font-size: 0.95rem;
    }
    
    /* Abstract style */
    .abstract {
      background: #f8fafc;
      padding: 1.5em;
      margin: 2em 0;
      border: 1px solid #cbd5e1;
      font-size: 1rem;
    }
    
    .abstract h3 {
      margin-top: 0;
      font-size: 1.25rem;
      text-align: center;
    }
    
    .abstract p {
      text-indent: 0;
      text-align: justify;
    }
  `,
};
