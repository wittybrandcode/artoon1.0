/**
 * LinkDialog - Professional Link Insertion Dialog
 * 
 * Material Design inspired dialog for inserting/editing links.
 * Supports ARTOON link syntax: [a:: url; text; title]
 * 
 * @module LinkDialog
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { Link as LinkIcon, X, Check } from 'lucide-react';

export interface LinkDialogProps {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Callback when dialog is closed */
  onClose: () => void;
  /** Callback when link is inserted */
  onInsert: (url: string, text: string) => void;
  /** Initial URL (for editing existing link) */
  initialUrl?: string;
  /** Initial text (for editing existing link) */
  initialText?: string;
  /** Selected text (to use as link text) */
  selectedText?: string;
}

/**
 * Professional Link Dialog Component
 * 
 * Provides a clean interface for inserting/editing links.
 * Follows Material Design principles.
 */
export function LinkDialog({
  isOpen,
  onClose,
  onInsert,
  initialUrl = '',
  initialText = '',
  selectedText = '',
}: LinkDialogProps) {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText || selectedText);
  const [error, setError] = useState('');
  
  const urlInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  
  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl);
      setText(initialText || selectedText);
      setError('');
      
      // Focus URL input after a short delay
      setTimeout(() => {
        urlInputRef.current?.focus();
        urlInputRef.current?.select();
      }, 100);
    }
  }, [isOpen, initialUrl, initialText, selectedText]);
  
  /**
   * Validate URL
   */
  const validateUrl = useCallback((url: string): boolean => {
    if (!url.trim()) {
      setError('الرجاء إدخال رابط');
      return false;
    }
    
    // Basic URL validation
    try {
      new URL(url);
      return true;
    } catch {
      // Try with https:// prefix
      try {
        new URL('https://' + url);
        return true;
      } catch {
        setError('الرابط غير صحيح');
        return false;
      }
    }
  }, []);
  
  /**
   * Handle insert button click
   */
  const handleInsert = useCallback(() => {
    if (!validateUrl(url)) {
      return;
    }
    
    if (!text.trim()) {
      setError('الرجاء إدخال نص الرابط');
      return;
    }
    
    // Normalize URL (add https:// if missing)
    let normalizedUrl = url.trim();
    if (!normalizedUrl.match(/^https?:\/\//i)) {
      normalizedUrl = 'https://' + normalizedUrl;
    }
    
    onInsert(normalizedUrl, text.trim());
    onClose();
  }, [url, text, validateUrl, onInsert, onClose]);
  
  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleInsert();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  }, [handleInsert, onClose]);
  
  /**
   * Handle backdrop click
   */
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="link-dialog-backdrop" 
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="link-dialog-title"
    >
      <div className="link-dialog" onKeyDown={handleKeyDown}>
        {/* Header */}
        <div className="link-dialog__header">
          <div className="link-dialog__title" id="link-dialog-title">
            <LinkIcon size={20} />
            <span>إضافة رابط</span>
          </div>
          <button
            className="link-dialog__close"
            onClick={onClose}
            title="إغلاق (Esc)"
            aria-label="إغلاق"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Body */}
        <div className="link-dialog__body">
          {/* URL Input */}
          <div className="link-dialog__field">
            <label htmlFor="link-url" className="link-dialog__label">
              الرابط (URL)
            </label>
            <input
              ref={urlInputRef}
              id="link-url"
              type="text"
              className="link-dialog__input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError('');
              }}
              dir="ltr"
            />
          </div>
          
          {/* Text Input */}
          <div className="link-dialog__field">
            <label htmlFor="link-text" className="link-dialog__label">
              نص الرابط
            </label>
            <input
              ref={textInputRef}
              id="link-text"
              type="text"
              className="link-dialog__input"
              placeholder="انقر هنا"
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setError('');
              }}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="link-dialog__error" role="alert">
              {error}
            </div>
          )}
          
          {/* Syntax Preview */}
          <div className="link-dialog__preview">
            <div className="link-dialog__preview-label">معاينة السانتاكس:</div>
            <code className="link-dialog__preview-code">
              [a:: {url || 'url'}; {text || 'text'}]
            </code>
          </div>
        </div>
        
        {/* Footer */}
        <div className="link-dialog__footer">
          <button
            className="link-dialog__btn link-dialog__btn--secondary"
            onClick={onClose}
          >
            إلغاء
          </button>
          <button
            className="link-dialog__btn link-dialog__btn--primary"
            onClick={handleInsert}
          >
            <Check size={18} />
            <span>إدراج</span>
          </button>
        </div>
        
        {/* Keyboard Hint */}
        <div className="link-dialog__hint">
          اضغط <kbd>Ctrl+Enter</kbd> للإدراج أو <kbd>Esc</kbd> للإلغاء
        </div>
      </div>
      
      <style>{`
        .link-dialog-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10000;
          animation: fadeIn 0.2s ease-out;
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .link-dialog {
          background: var(--color-bg-primary, #ffffff);
          border-radius: 12px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          width: 90%;
          max-width: 500px;
          animation: slideUp 0.3s ease-out;
          overflow: hidden;
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        .link-dialog__header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--color-border-default, #e0e0e0);
        }
        
        .link-dialog__title {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 18px;
          font-weight: 600;
          color: var(--color-text-primary, #1a1a1a);
        }
        
        .link-dialog__close {
          background: none;
          border: none;
          padding: 8px;
          cursor: pointer;
          color: var(--color-text-secondary, #666666);
          border-radius: 6px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .link-dialog__close:hover {
          background: var(--color-bg-hover, #f5f5f5);
          color: var(--color-text-primary, #1a1a1a);
        }
        
        .link-dialog__body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .link-dialog__field {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        
        .link-dialog__label {
          font-size: 14px;
          font-weight: 500;
          color: var(--color-text-primary, #1a1a1a);
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .link-dialog__label-hint {
          font-size: 12px;
          font-weight: 400;
          color: var(--color-text-tertiary, #999999);
        }
        
        .link-dialog__input {
          padding: 12px 16px;
          border: 2px solid var(--color-border-default, #e0e0e0);
          border-radius: 8px;
          font-size: 15px;
          font-family: inherit;
          color: var(--color-text-primary, #1a1a1a);
          background: var(--color-bg-primary, #ffffff);
          transition: all 0.2s;
          outline: none;
        }
        
        .link-dialog__input:focus {
          border-color: var(--color-primary, #0066cc);
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }
        
        .link-dialog__input::placeholder {
          color: var(--color-text-tertiary, #999999);
        }
        
        .link-dialog__error {
          padding: 12px 16px;
          background: rgba(220, 53, 69, 0.1);
          border: 1px solid rgba(220, 53, 69, 0.3);
          border-radius: 8px;
          color: #dc3545;
          font-size: 14px;
        }
        
        .link-dialog__preview {
          padding: 16px;
          background: var(--color-bg-secondary, #f8f9fa);
          border-radius: 8px;
          border: 1px solid var(--color-border-default, #e0e0e0);
        }
        
        .link-dialog__preview-label {
          font-size: 12px;
          font-weight: 500;
          color: var(--color-text-secondary, #666666);
          margin-bottom: 8px;
        }
        
        .link-dialog__preview-code {
          display: block;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: var(--color-text-primary, #1a1a1a);
          direction: ltr;
          text-align: left;
          word-break: break-all;
        }
        
        .link-dialog__footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 24px;
          border-top: 1px solid var(--color-border-default, #e0e0e0);
        }
        
        .link-dialog__btn {
          padding: 10px 20px;
          border: none;
          border-radius: 8px;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
          font-family: inherit;
        }
        
        .link-dialog__btn--secondary {
          background: var(--color-bg-secondary, #f8f9fa);
          color: var(--color-text-primary, #1a1a1a);
        }
        
        .link-dialog__btn--secondary:hover {
          background: var(--color-bg-hover, #e9ecef);
        }
        
        .link-dialog__btn--primary {
          background: var(--color-primary, #0066cc);
          color: white;
        }
        
        .link-dialog__btn--primary:hover {
          background: var(--color-secondary, #0052a3);
        }
        
        .link-dialog__hint {
          padding: 12px 24px;
          background: var(--color-bg-tertiary, #f5f5f5);
          font-size: 13px;
          color: var(--color-text-secondary, #666666);
          text-align: center;
        }
        
        .link-dialog__hint kbd {
          padding: 2px 6px;
          background: var(--color-bg-primary, #ffffff);
          border: 1px solid var(--color-border-default, #e0e0e0);
          border-radius: 4px;
          font-family: 'Courier New', monospace;
          font-size: 12px;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}

export default LinkDialog;
