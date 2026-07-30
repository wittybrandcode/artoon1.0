/**
 * ARTOON-TYPER Application
 * 
 * Main application component with DUAL THEME SYSTEM:
 * - Editor Theme: Light/Dark toggle (🌙/☀️ button)
 * - Preview Theme: Content presentation selector (Minimal, Blog, Documentation, Academic)
 * 
 * Updated with Lucide icons and Design System
 */

import React, { useState, useCallback } from 'react';
import {
  FileText, Download, Eye, EyeOff, Sun, Moon,
  Upload
} from 'lucide-react';
import { EditorContainer } from './ui/components/EditorContainer';
import { Header } from './ui/components/Header';
import { PreviewPanel } from './ui/components/PreviewPanel';
import { ThemeProvider, useTheme } from './themes';
import { Button, TooltipProvider } from './design-system';

// Import styles
import './ui/styles/bubble-menu.css';
import './ui/styles/wysiwyg.css';

// Sample ARTOON content for demonstration
const SAMPLE_CONTENT = `>.p:: مرحباً بك في محرر ARTOON-TYPER! هذا محرر بلوكات احترافي يدعم العربية بشكل أصلي.

>.t1:: الميزات الرئيسية

>.p:: يدعم المحرر العديد من أنواع البلوكات:

>.ul::
li:: فقرات نصية مع تنسيق غني
li:: عناوين من المستوى 1 إلى 6
li:: قوائم نقطية ومرقمة
li:: بلوكات الكود مع تلوين الصيغة
li:: جداول قابلة للتحرير
li:: صور وفيديو وصوت
li:: فواصل أفقية

>.t2:: التنسيق النصي

>.p:: يمكنك استخدام التنسيقات التالية: [s:: نص عريض] و [e:: نص مائل] و [u:: نص مسطر] و [d:: نص مشطوب] و [mark:: نص مظلل] و [c:: كود].

>.t2:: الكود

<code:javascript>.
// مثال على كود JavaScript
function greet(name) {
  console.log(\`مرحباً \${name}!\`);
}

greet('ARTOON');
.<code>

>.t2:: الاقتباسات

>.q:: "البرمجة ليست عن ما تعرفه، بل عن ما يمكنك اكتشافه." - كريس باين

>.hr

>.p:: جرب المحرر الآن! اضغط على زر + لإضافة بلوك جديد، أو اسحب البلوكات لإعادة ترتيبها.
`;

/**
 * Main App Component
 */
type Direction = 'rtl' | 'ltr';

function AppContent() {
  // DUAL THEME SYSTEM
  const {
    editorMode,           // 'light' | 'dark' - for editor interface
    toggleEditor,         // Toggle editor light/dark
    previewTheme,         // Current preview theme
    previewThemes,        // Available preview themes
    setPreviewTheme       // Set preview theme by ID
  } = useTheme();

  const [content, setContent] = useState(SAMPLE_CONTENT);
  const [showSource, setShowSource] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [contentKey, setContentKey] = useState(0);
  const [defaultDirection, setDefaultDirection] = useState<Direction>('rtl');

  const handleChange = useCallback((newContent: string) => {
    setContent(newContent);
  }, []);

  // Import ARTOON file
  const handleImport = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.artoon,.txt';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        setFileName(file.name);
        try {
          const text = await file.text();
          setContent(text);
          setContentKey(prev => prev + 1); // Force editor recreation
        } catch (err) {
          alert('❌ فشل الاستيراد: ' + (err instanceof Error ? err.message : String(err)));
        }
      }
    };
    input.click();
  }, []);


  // Export ARTOON file
  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName || 'document.artoon';
    a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('❌ فشل التصدير: ' + (err instanceof Error ? err.message : String(err)));
    }
  }, [content, fileName]);

  // Toggle default direction for new blocks
  const toggleDefaultDirection = useCallback(() => {
    setDefaultDirection(prev => prev === 'rtl' ? 'ltr' : 'rtl');
  }, []);

  return (
    <TooltipProvider>
      <div className={`app app--${editorMode}`}>
        {/* Header */}
        <Header
          theme={editorMode}
          direction={defaultDirection}
          onThemeToggle={toggleEditor}
          onDirectionToggle={toggleDefaultDirection}
          onExport={handleExport}
          onImport={handleImport}
          onTogglePreview={() => setShowPreview(!showPreview)}
          isPreviewActive={showPreview}
          onToggleSource={() => setShowSource(!showSource)}
          isSourceActive={showSource}
          fileName={fileName}
        />

        {/* Main Content */}
        <main className="app-main">
          <div className={`app-editor ${showSource || showPreview ? 'app-editor--split' : ''}`}>
            <EditorContainer
              key={contentKey}
              initialContent={content}
              theme={editorMode}
              onChange={handleChange}
              placeholder="اكتب / لإضافة بلوك..."
              defaultDirection={defaultDirection}
            />
          </div>

          {showPreview && (
            <div className="app-preview">
              <div className="app-preview__header">
                <h3>معاينة HTML</h3>

                {/* PREVIEW THEME SELECTOR */}
                <div className="app-preview__theme-selector">
                  <label htmlFor="preview-theme-select">ثيم المعاينة:</label>
                  <select
                    id="preview-theme-select"
                    className="app-preview__theme-select"
                    value={previewTheme.id}
                    onChange={(e) => setPreviewTheme(e.target.value)}
                  >
                    {previewThemes.map(theme => (
                      <option key={theme.id} value={theme.id}>
                        {theme.nameAr} ({theme.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <PreviewPanel content={content} />
            </div>
          )}

          {showSource && (
            <div className="app-source">
              <h3>مصدر ARTOON</h3>
              <textarea
                className="app-source__code"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                }}
                spellCheck={false}
              />
              <button
                className="app-btn app-btn--primary app-source__apply"
                onClick={() => setContentKey(prev => prev + 1)}
              >
                تطبيق التغييرات على المحرر
              </button>
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>
            ARTOON-TYPER v1.0.0 | محرر بلوكات احترافي بدعم RTL أصلي
            <span className="app-footer__separator"> • </span>
            المحرر: {editorMode === 'light' ? 'فاتح' : 'داكن'}
            <span className="app-footer__separator"> • </span>
            المعاينة: {previewTheme.nameAr}
          </p>
        </footer>

        <style>{`
        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-primary, #f5f5f5);
          color: var(--color-text-primary, #1a1a1a);
          transition: background 0.3s, color 0.3s;
        }
        
        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border-default);
        }
        
        .app-header__title h1 {
          font-size: 24px;
          font-weight: 700;
          margin: 0;
        }
        
        .app-header__subtitle {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin-right: 12px;
        }
        
        .app-header__actions {
          display: flex;
          gap: 12px;
        }
        
        .app-btn {
          padding: 8px 16px;
          border: 1px solid var(--color-border-default);
          border-radius: 6px;
          background: var(--color-bg-tertiary);
          color: var(--color-text-primary);
          cursor: pointer;
          font-size: 14px;
          transition: all 0.2s;
        }
        
        .app-btn--primary {
          background: #2563eb;
          border-color: #2563eb;
          color: white;
        }
        
        .app-btn--primary:hover {
          background: #1d4ed8;
        }
        
        .app-btn:hover {
          background: var(--color-border-default);
        }
        
        .app-btn--active {
          background: #059669;
          border-color: #059669;
          color: white;
        }
        
        .app-btn--active:hover {
          background: #047857;
        }
        
        .app-btn--icon {
          padding: 8px 12px;
          font-size: 18px;
        }
        
        .app-btn--direction {
          font-weight: 600;
          min-width: 90px;
        }
        
        .app-btn--direction.rtl {
          background: #059669;
          border-color: #059669;
          color: white;
        }
        
        .app-btn--direction.ltr {
          background: #7c3aed;
          border-color: #7c3aed;
          color: white;
        }
        
        .app-main {
          flex: 1;
          display: flex;
          padding: 24px;
          gap: 24px;
        }
        
        .app-editor {
          flex: 1;
          background: var(--color-bg-secondary);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        
        .app-editor--split {
          flex: 1;
          min-width: 0;
        }
        
        .app-preview {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-secondary);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
          min-width: 0;
        }
        
        .app-preview__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid var(--color-border-default);
          background: var(--color-bg-tertiary);
          gap: 16px;
        }
        
        .app-preview__header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        
        .app-preview__theme-selector {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
        }
        
        .app-preview__theme-selector label {
          color: var(--color-text-secondary);
          white-space: nowrap;
        }
        
        .app-preview__theme-select {
          padding: 6px 12px;
          border: 1px solid var(--color-border-default);
          border-radius: 6px;
          background: var(--color-bg-primary);
          color: var(--color-text-primary);
          font-size: 14px;
          cursor: pointer;
          min-width: 180px;
        }
        
        .app-preview__theme-select:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        
        .app-source {
          flex: 1;
          background: var(--color-bg-secondary);
          border-radius: 12px;
          padding: 16px;
          overflow: auto;
        }
        
        .app-source h3 {
          margin-bottom: 12px;
          font-size: 16px;
        }
        
        .app-source__code {
          font-family: 'Consolas', 'Monaco', monospace;
          font-size: 13px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
          background: var(--color-bg-tertiary);
          padding: 16px;
          border-radius: 8px;
          direction: ltr;
          text-align: left;
          width: 100%;
          min-height: 300px;
          border: 1px solid var(--color-border-default);
          color: inherit;
          resize: vertical;
          outline: none;
          box-sizing: border-box;
        }
        
        .app-source__code:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
        }
        
        .app-source__apply {
          margin-top: 12px;
          width: 100%;
        }
        
        .app-footer {
          padding: 16px 24px;
          text-align: center;
          background: var(--color-bg-secondary);
          border-top: 1px solid var(--color-border-default);
          font-size: 14px;
          color: var(--color-text-secondary);
        }
        
        .app-footer__separator {
          margin: 0 8px;
          color: var(--color-border-default);
        }
        
        /* Editor container styles */
        .artoon-typer {
          min-height: 400px;
          padding: 24px;
        }
        
        .editor-container {
          max-width: 800px;
          margin: 0 auto;
        }
      `}</style>
      </div>
    </TooltipProvider>
  );
}

/**
 * App with Theme Provider
 */
export function App() {
  return (
    <ThemeProvider
      defaultEditorPreference="light"
      defaultPreviewThemeId="minimal"
    >
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
