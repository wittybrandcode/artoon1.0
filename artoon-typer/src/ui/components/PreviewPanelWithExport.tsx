/**
 * Preview Panel with HTML Export
 * 
 * Enhanced version of PreviewPanel with HTML export functionality
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
  content: string;
  className?: string;
}

export function PreviewPanelWithExport({ content, className = '' }: PreviewPanelProps) {
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
      
      const astNode = parseResult.ast as any;
      let nodes = astNode.children || astNode.content || [];
      
      // Pre-process custom blocks
      nodes = nodes.map((node: any) => {
        if (node.type === 'block' && node.blockName !== 'code' && node.blockName !== 'meta') {
          if (typeof node.content === 'string' && node.content.trim()) {
            try {
              const customParsed = parse(node.content);
              const customChildren = customParsed.ast.children || [];
              return { ...node, content: customChildren };
            } catch (err) {
              return node;
            }
          }
        }
        return node;
      });
      
      const doc = {
        version: '2.0' as const,
        content: Array.isArray(nodes) ? nodes : []
      };
      
      return render(doc);
    } catch (error) {
      console.error('Preview error:', error);
      return `<div class="preview-error"><h3>❌ خطأ في المعاينة</h3></div>`;
    }
  }, [content]);
  
  // Generate CSS from theme
  const themeCSS = useMemo(() => {
    const variables = tokensToCSSVariables(previewTheme.tokens);
    const cssVars = Object.entries(variables)
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n');
    
    return `:root {\n${cssVars}\n}\n\n/* Base styles */\nbody { font-family: var(--font-body); padding: 24px; }\n${previewTheme.customCSS || ''}`;
  }, [previewTheme]);
  
  // Generate full HTML
  const fullHTML = useMemo(() => {
    return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>ARTOON Preview</title>
  <style>${themeCSS}</style>
</head>
<body>${html}</body>
</html>`;
  }, [html, themeCSS]);
  
  // Export HTML
  const handleExportHTML = useCallback(() => {
    const blob = new Blob([fullHTML], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `artoon-preview-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [fullHTML]);
  
  // Copy HTML
  const handleCopyHTML = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(fullHTML);
      alert('✅ تم نسخ HTML');
    } catch (err) {
      alert('❌ فشل النسخ');
    }
  }, [fullHTML]);
  
  // Update iframe
  useEffect(() => {
    if (iframeRef.current) {
      iframeRef.current.srcdoc = fullHTML;
    }
  }, [fullHTML]);
  
  return (
    <div className={`preview-panel ${className}`}>
      <div className="preview-toolbar">
        <span>معاينة: {previewTheme.nameAr}</span>
        <div className="preview-actions">
          <Button variant="ghost" size="sm" onClick={handleCopyHTML}>
            <Icon icon={Copy} size="sm" />
            نسخ HTML
          </Button>
          <Button variant="ghost" size="sm" onClick={handleExportHTML}>
            <Icon icon={Download} size="sm" />
            تصدير HTML
          </Button>
        </div>
      </div>
      <iframe ref={iframeRef} className="preview-iframe" sandbox="allow-same-origin allow-scripts" />
      <style>{`
        .preview-panel { display: flex; flex-direction: column; height: 100%; }
        .preview-toolbar { display: flex; justify-content: space-between; padding: 8px 12px; background: var(--color-bg-primary); border-bottom: 1px solid var(--color-border-default); }
        .preview-actions { display: flex; gap: 8px; }
        .preview-iframe { flex: 1; border: none; }
      `}</style>
    </div>
  );
}
