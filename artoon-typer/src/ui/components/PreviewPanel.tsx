/**
 * Preview Panel Component
 * 
 * PROFESSIONAL DUAL-THEME SYSTEM:
 * - Uses Preview Theme (NOT Editor Theme)
 * - Preview themes: Minimal, Blog, Documentation, Academic
 * - Independent from editor's Light/Dark mode
 * 
 * Displays rendered HTML preview of ARTOON content with selected preview theme styling.
 */

import { useMemo, useEffect, useRef, useCallback } from 'react';
import { parse } from '@artoon/parser';
import { render } from '@artoon/renderer-html';
import { useTheme } from '../../themes';
import { tokensToCSSVariables } from '../../themes/types';
import { Button } from '../../design-system/components/Button';
import { Icon } from '../../design-system/components/Icon';
import { Download, Copy } from 'lucide-react';

interface PreviewPanelProps {
  /** ARTOON source content to preview */
  content: string;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Preview Panel Component
 */
export function PreviewPanel({ content, className = '' }: PreviewPanelProps) {
  const { previewTheme } = useTheme();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Parse and render content
  const html = useMemo(() => {
    try {
      const parseResult = parse(content);
      
      if (parseResult.errors.length > 0) {
        const errorList = parseResult.errors
          .map(e => `<li>السطر ${e.line}: ${e.message}</li>`)
          .join('');
        
        return `
          <div class="preview-error">
            <h3>⚠️ أخطاء في التحليل</h3>
            <ul>${errorList}</ul>
          </div>
        `;
      }
      
      // parseResult.ast is a DocumentNode with children property
      const astNode = parseResult.ast as any;
      let nodes = astNode.children || astNode.content || [];
      
      // Filter out META blocks from preview
      nodes = nodes.filter((node: any) => {
        return !(node.type === 'block' && node.blockName === 'meta');
      });
      
      // NOTE: We do NOT parse custom block content here anymore!
      // ARTOONImporter already handles this correctly by treating string content as plain text.
      // Parsing string content here causes issues with code blocks that contain ARTOON syntax as examples.
      
      // Create ARTOONDocument with content array
      const doc = {
        version: '2.0' as const,
        content: Array.isArray(nodes) ? nodes : []
      };
      
      // Render the document
      const rendered = render(doc);
      return rendered;
    } catch (error) {
      console.error('Preview error:', error);
      return `
        <div class="preview-error">
          <h3>❌ خطأ في المعاينة</h3>
          <p>${error instanceof Error ? error.message : 'خطأ غير معروف'}</p>
          <pre style="background: rgba(255,255,255,0.1); padding: 10px; border-radius: 4px; overflow-x: auto; font-size: 12px;">${error instanceof Error ? error.stack : ''}</pre>
        </div>
      `;
    }
  }, [content]);
  
  // Generate CSS from preview theme tokens
  const themeCSS = useMemo(() => {
    const variables = tokensToCSSVariables(previewTheme.tokens);
    const cssVars = Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    
    return `
:root {
${cssVars}
}

/* Base styles */
* {
  box-sizing: border-box;
}

body {
  font-family: var(--font-body, -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif);
  font-size: var(--font-size-base, 16px);
  line-height: var(--line-height-normal, 1.6);
  color: var(--color-text-primary, #1a1a1a);
  background: var(--color-bg-primary, #ffffff);
  padding: var(--spacing-lg, 24px);
  margin: 0;
  direction: rtl;
}

/* Typography */
h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading, inherit);
  font-weight: var(--font-weight-bold, 700);
  line-height: var(--line-height-tight, 1.3);
  margin-top: var(--spacing-xl, 32px);
  margin-bottom: var(--spacing-md, 16px);
  color: var(--color-text-primary, #1a1a1a);
}

h1 { font-size: var(--font-size-4xl, 2.5rem); }
h2 { font-size: var(--font-size-3xl, 2rem); }
h3 { font-size: var(--font-size-2xl, 1.75rem); }
h4 { font-size: var(--font-size-xl, 1.5rem); }
h5 { font-size: var(--font-size-lg, 1.25rem); }
h6 { font-size: var(--font-size-base, 1rem); }

p {
  margin-top: var(--spacing-md, 16px);
  margin-bottom: var(--spacing-md, 16px);
  line-height: var(--line-height-normal, 1.6);
}

/* Links */
a {
  color: var(--color-primary, #0066cc);
  text-decoration: none;
  transition: color 0.2s;
}

a:hover {
  color: var(--color-secondary, #0052a3);
  text-decoration: underline;
}

/* Lists */
ul, ol {
  margin: var(--spacing-md, 16px) 0;
  padding-right: var(--spacing-xl, 32px);
  padding-left: var(--spacing-xl, 32px);
}

li {
  margin: var(--spacing-sm, 8px) 0;
  line-height: var(--line-height-normal, 1.6);
}

/* Code */
code {
  font-family: var(--font-code, 'Courier New', monospace);
  font-size: var(--font-size-sm, 0.875rem);
  background: var(--color-bg-tertiary, #f5f5f5);
  padding: 2px 6px;
  border-radius: var(--radius-sm, 4px);
  color: var(--color-text-primary, #1a1a1a);
}

pre {
  font-family: var(--font-code, 'Courier New', monospace);
  font-size: var(--font-size-sm, 0.875rem);
  background: var(--color-bg-tertiary, #f5f5f5);
  padding: var(--spacing-md, 16px);
  border-radius: var(--radius-md, 8px);
  overflow-x: auto;
  margin: var(--spacing-md, 16px) 0;
  direction: ltr;
  text-align: left;
}

pre code {
  background: none;
  padding: 0;
}

/* Blockquote */
blockquote {
  border-right: 4px solid var(--color-primary, #0066cc);
  padding-right: var(--spacing-md, 16px);
  margin: var(--spacing-lg, 24px) 0;
  color: var(--color-text-secondary, #666666);
  font-style: italic;
}

/* Tables */
table {
  width: 100%;
  border-collapse: collapse;
  margin: var(--spacing-lg, 24px) 0;
  background: var(--color-bg-primary, #ffffff);
}

th, td {
  padding: var(--spacing-sm, 8px) var(--spacing-md, 16px);
  border: 1px solid var(--color-border-default, #e0e0e0);
  text-align: right;
}

th {
  background: var(--color-bg-tertiary, #f5f5f5);
  font-weight: var(--font-weight-semibold, 600);
  color: var(--color-text-primary, #1a1a1a);
}

tr:hover {
  background: var(--color-bg-hover, #f9f9f9);
}

tbody tr:nth-child(even) {
  background: var(--color-bg-secondary, #fafafa);
}

tbody tr:nth-child(even):hover {
  background: var(--color-bg-hover, #f9f9f9);
}

/* Horizontal rule */
hr {
  border: none;
  border-top: 2px solid var(--color-border-default, #e0e0e0);
  margin: var(--spacing-xl, 32px) 0;
}

/* Images */
img {
  max-width: 100%;
  height: auto;
  border-radius: var(--radius-md, 8px);
  display: block;
  margin: var(--spacing-md, 16px) 0;
}

/* Strong, em, etc */
strong { 
  font-weight: var(--font-weight-bold, 700); 
}

em { 
  font-style: italic; 
}

u { 
  text-decoration: underline; 
}

s { 
  text-decoration: line-through; 
}

mark {
  background: var(--color-warning, #fff3cd);
  color: var(--color-text-primary, #1a1a1a);
  padding: 2px 4px;
  border-radius: var(--radius-sm, 4px);
}

/* Custom Blocks */
.custom-block {
  padding: var(--spacing-md, 16px);
  border-radius: var(--radius-md, 8px);
  margin: var(--spacing-md, 16px) 0;
  border-right: 4px solid;
}

.custom-block--card {
  background: var(--color-bg-secondary, #f8f9fa);
  border-color: var(--color-text-secondary, #6c757d);
}

.custom-block--note {
  background: #d1ecf1;
  border-color: #0c5460;
}

.custom-block--warning {
  background: #fff3cd;
  border-color: #856404;
}

.custom-block--callout {
  background: #d4edda;
  border-color: #155724;
}

/* Error styles */
.preview-error {
  background: var(--color-error, #dc3545);
  color: white;
  padding: var(--spacing-lg, 24px);
  border-radius: var(--radius-md, 8px);
  margin: var(--spacing-lg, 24px) 0;
}

.preview-error h3 {
  margin-top: 0;
  color: white;
}

.preview-error ul {
  margin: var(--spacing-md, 16px) 0;
  padding-right: var(--spacing-lg, 24px);
}

.preview-error pre {
  background: rgba(0, 0, 0, 0.2);
  color: white;
  direction: ltr;
  text-align: left;
}

/* Custom theme CSS */
${previewTheme.customCSS || ''}

/* Custom Blocks Styles for Preview - Simple Frame */
div[class^="custom-block"],
div[class*=" custom-block"] {
  padding: var(--spacing-md, 12px);
  margin: var(--spacing-md, 12px) 0;
  border: 1px solid var(--color-border-default, #ddd);
  border-radius: var(--radius-sm, 4px);
}
    `;
  }, [previewTheme]);
  
  // Generate full HTML document
  const fullHTML = useMemo(() => {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>ARTOON Preview - ${previewTheme.nameAr}</title>
  <style>${themeCSS}</style>
</head>
<body data-preview-theme="${previewTheme.id}">
  ${html}
</body>
</html>
    `;
  }, [html, themeCSS, previewTheme]);
  
  // Update iframe when fullHTML changes
  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    iframe.srcdoc = fullHTML;
  }, [fullHTML]);
  
  // Export HTML handler
  const handleExportHTML = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.srcdoc) return;
    
    // Create blob and download
    const blob = new Blob([iframe.srcdoc], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artoon-preview-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);
  
  // Copy HTML to clipboard handler
  const handleCopyHTML = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe || !iframe.srcdoc) return;
    
    navigator.clipboard.writeText(iframe.srcdoc).then(() => {
      alert('✅ تم نسخ HTML إلى الحافظة');
    }).catch(err => {
      console.error('Failed to copy HTML:', err);
      alert('❌ فشل نسخ HTML');
    });
  }, []);
  
  return (
    <div className={`preview-panel ${className}`}>
      {/* Toolbar */}
      <div className="preview-panel__toolbar">
        <div className="preview-panel__toolbar-title">
          معاينة: {previewTheme.nameAr}
        </div>
        <div className="preview-panel__toolbar-actions">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyHTML}
            title="نسخ HTML"
          >
            <Icon icon={Copy} size="sm" />
            <span>نسخ HTML</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleExportHTML}
            title="تصدير HTML"
          >
            <Icon icon={Download} size="sm" />
            <span>تصدير HTML</span>
          </Button>
        </div>
      </div>
      
      <iframe
        ref={iframeRef}
        className="preview-panel__iframe"
        title={`ARTOON Preview - ${previewTheme.nameAr}`}
        sandbox="allow-same-origin allow-scripts"
      />
      
      <style>{`
        .preview-panel {
          display: flex;
          flex-direction: column;
          height: 100%;
          background: var(--color-bg-secondary);
          border-radius: 12px;
          overflow: hidden;
        }
        
        .preview-panel__toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: var(--color-bg-primary);
          border-bottom: 1px solid var(--color-border-default);
          gap: 12px;
        }
        
        .preview-panel__toolbar-title {
          font-size: 14px;
          font-weight: 600;
          color: var(--color-text-primary);
        }
        
        .preview-panel__toolbar-actions {
          display: flex;
          gap: 8px;
        }
        
        .preview-panel__iframe {
          flex: 1;
          width: 100%;
          border: none;
          background: var(--color-bg-primary);
        }
      `}</style>
    </div>
  );
}
