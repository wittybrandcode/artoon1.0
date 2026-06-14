import React, { useCallback, useState } from 'react';
import type { Block } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';
import { sanitizeUrl } from '@artoon/core';

interface FigureBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

const inlineRenderer = createInlineRenderer();

export function FigureBlockContent({ block, isEditable, onUpdate }: FigureBlockContentProps) {
  const [mediaStatus, setMediaStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const captionHtml = block.caption ? inlineRenderer.render(block.caption) : '';

  const handleMediaLoad = useCallback(() => {
    setMediaStatus('loaded');
  }, []);

  const handleMediaError = useCallback(() => {
    setMediaStatus('error');
    console.error('Failed to load figure media:', block.src);
  }, [block.src]);

  const handleRetry = useCallback(() => {
    setMediaStatus('loading');
    onUpdate({ src: block.src + (block.src.includes('?') ? '&' : '?') + 'retry=' + Date.now() });
  }, [block.src, onUpdate]);

  const renderMedia = () => {
    const safeSrc = sanitizeUrl(block.src || '');
    switch (block.mediaType) {
      case 'image':
        return (
          <>
            {mediaStatus === 'loading' && (
              <div style={{ padding: '40px', background: '#f8f9fa', textAlign: 'center', borderRadius: '8px' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>جاري تحميل الصورة...</div>
              </div>
            )}
            {mediaStatus === 'error' && (
              <div style={{ padding: '40px', background: '#fff3cd', border: '2px dashed #ffc107', textAlign: 'center', borderRadius: '8px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>فشل تحميل الصورة</div>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                  }}
                >
                  🔄 إعادة المحاولة
                </button>
              </div>
            )}
            <img
              src={safeSrc}
              alt={block.alt || ''}
              onLoad={handleMediaLoad}
              onError={handleMediaError}
              style={{
                maxWidth: '100%',
                display: mediaStatus === 'loaded' ? 'block' : 'none',
              }}
            />
          </>
        );
      case 'video':
        return (
          <video
            src={safeSrc}
            controls
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
            style={{ maxWidth: '100%' }}
          />
        );
      case 'audio':
        return (
          <audio
            src={safeSrc}
            controls
            onLoadedData={handleMediaLoad}
            onError={handleMediaError}
          />
        );
      default:
        return <img src={safeSrc} alt={block.alt || ''} style={{ maxWidth: '100%' }} />;
    }
  };

  return (
    <div className="block__content">
      <figure>
        {block.src ? renderMedia() : <div style={{ padding: '20px', background: '#f0f0f0', textAlign: 'center' }}>🖼️ لا توجد وسائط</div>}
        {captionHtml && mediaStatus === 'loaded' && (
          <figcaption
            contentEditable={isEditable}
            suppressContentEditableWarning
            style={{ marginTop: '8px', fontStyle: 'italic', fontSize: '0.9em' }}
            dangerouslySetInnerHTML={{ __html: captionHtml }}
          />
        )}
      </figure>
    </div>
  );
}
