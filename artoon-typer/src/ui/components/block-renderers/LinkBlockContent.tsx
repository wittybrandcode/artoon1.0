import React, { useEffect, useState } from 'react';
import type { Block, LinkBlock } from '../../../types';

interface LinkBlockContentProps {
  block: LinkBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function LinkBlockContent({ block, isEditable, onUpdate }: LinkBlockContentProps) {
  const direction = block.direction || 'rtl';
  const [isEditing, setIsEditing] = useState(!block.url);
  const [localUrl, setLocalUrl] = useState(block.url || '');
  const [localText, setLocalText] = useState(block.text || '');

  useEffect(() => {
    setLocalUrl(block.url || '');
    setLocalText(block.text || '');
  }, [block.url, block.text]);

  const handleSave = () => {
    if (!localUrl.trim()) return;
    onUpdate({
      url: localUrl.trim(),
      text: localText.trim() || localUrl.trim(),
      modifiers: block.modifiers || [],
    } as Partial<LinkBlock>);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      if (block.url) setIsEditing(false);
    }
  };

  if (isEditable && isEditing) {
    return (
      <div className="block__content" dir={direction}>
        <div style={{
          background: 'var(--color-bg-secondary, #f8f9fa)',
          border: '2px solid var(--color-primary, #0066cc)',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}>
          <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-primary, #0066cc)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            🔗 رابط مستقل ({">.a::"})
          </div>
          <input
            type="text"
            placeholder="https://example.com"
            value={localUrl}
            onChange={e => setLocalUrl(e.target.value)}
            onKeyDown={handleKeyDown}
            dir="ltr"
            style={{
              padding: '8px 12px',
              border: '1px solid var(--color-border-default, #ddd)',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: 'monospace',
              outline: 'none',
              background: 'var(--color-bg-primary, #fff)',
              color: 'var(--color-text-primary, #1a1a1a)',
            }}
            autoFocus
          />
          <input
            type="text"
            placeholder="نص الرابط"
            value={localText}
            onChange={e => setLocalText(e.target.value)}
            onKeyDown={handleKeyDown}
            dir={direction}
            style={{
              padding: '8px 12px',
              border: '1px solid var(--color-border-default, #ddd)',
              borderRadius: '6px',
              fontSize: '14px',
              outline: 'none',
              background: 'var(--color-bg-primary, #fff)',
              color: 'var(--color-text-primary, #1a1a1a)',
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <code style={{ fontSize: '11px', color: 'var(--color-text-tertiary, #999)', direction: 'ltr' }}>
              {'>.a:: '}{localUrl || 'url'}{'; '}{localText || 'text'}
            </code>
            <button
              onClick={handleSave}
              disabled={!localUrl.trim()}
              style={{
                padding: '6px 16px',
                background: localUrl.trim() ? 'var(--color-primary, #0066cc)' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: localUrl.trim() ? 'pointer' : 'not-allowed',
                fontSize: '13px',
                fontWeight: 500,
              }}
            >
              حفظ
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="block__content" dir={direction}>
      <div
        onClick={() => isEditable && setIsEditing(true)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 14px',
          background: 'var(--color-primary, #0066cc)',
          color: 'white',
          borderRadius: '6px',
          cursor: isEditable ? 'pointer' : 'default',
          fontSize: '14px',
          textDecoration: 'none',
          transition: 'opacity 0.2s',
        }}
        title={block.url || '#'}
      >
        🔗 {block.text || block.url || 'رابط'}
      </div>
    </div>
  );
}
