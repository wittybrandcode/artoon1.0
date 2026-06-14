import React, { useCallback, useEffect, useState } from 'react';
import type { MediaBlock, Block } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';
import { sanitizeUrl } from '@artoon/core';

interface MediaBlockContentProps {
  block: MediaBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

const inlineRenderer = createInlineRenderer();

export function MediaBlockContent({ block, isEditable, onUpdate }: MediaBlockContentProps) {
  const [imageStatus, setImageStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [imageSrc, setImageSrc] = useState(block.src);
  const captionHtml = block.caption ? inlineRenderer.render(block.caption) : '';

  useEffect(() => {
    setImageStatus('loading');
    setImageSrc(block.src);
  }, [block.src]);

  const handleImageLoad = useCallback(() => {
    setImageStatus('loaded');
  }, []);

  const handleImageError = useCallback(() => {
    setImageStatus('error');
    console.error('Failed to load media:', block.src);
  }, [block.src]);

  const handleRetry = useCallback(() => {
    setImageStatus('loading');
    setImageSrc(block.src + (block.src.includes('?') ? '&' : '?') + 'retry=' + Date.now());
  }, [block.src]);

  const renderMedia = () => {
    const safeSrc = sanitizeUrl(imageSrc);

    switch (block.type) {
      case 'image':
        return (
          <>
            {imageStatus === 'loading' && (
              <div
                className="media-loading"
                style={{
                  padding: '40px',
                  background: '#f8f9fa',
                  textAlign: 'center',
                  borderRadius: '8px',
                  border: '2px dashed #dee2e6',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>⏳</div>
                <div style={{ color: '#6c757d', fontSize: '14px' }}>
                  جاري تحميل الصورة...
                </div>
              </div>
            )}

            {imageStatus === 'error' && (
              <div
                className="media-error"
                style={{
                  padding: '40px',
                  background: '#fff3cd',
                  border: '2px dashed #ffc107',
                  textAlign: 'center',
                  borderRadius: '8px',
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>❌</div>
                <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#856404' }}>
                  فشل تحميل الصورة
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: '#856404',
                    wordBreak: 'break-all',
                    marginBottom: '16px',
                    padding: '8px',
                    background: 'rgba(0,0,0,0.05)',
                    borderRadius: '4px',
                  }}
                >
                  {block.src}
                </div>
                <button
                  onClick={handleRetry}
                  style={{
                    padding: '8px 16px',
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  🔄 إعادة المحاولة
                </button>
              </div>
            )}

            <img
              src={safeSrc}
              alt={block.alt || ''}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                width: block.width || 'auto',
                height: block.height || 'auto',
                maxWidth: '100%',
                display: imageStatus === 'loaded' ? 'block' : 'none',
              }}
            />
          </>
        );
      case 'video':
        return (
          <video
            src={safeSrc}
            controls
            onLoadedData={handleImageLoad}
            onError={handleImageError}
            style={{
              width: block.width || '100%',
              height: block.height || 'auto',
              maxWidth: '100%',
            }}
          />
        );
      case 'audio':
        return (
          <audio
            src={safeSrc}
            controls
            onLoadedData={handleImageLoad}
            onError={handleImageError}
            style={{ width: '100%' }}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="block__content">
      {block.src ? (
        <>
          {renderMedia()}
          {captionHtml && imageStatus === 'loaded' && (
            <div
              className="image-caption"
              contentEditable={isEditable}
              suppressContentEditableWarning
              dangerouslySetInnerHTML={{ __html: captionHtml }}
            />
          )}
        </>
      ) : (
        <div className="media-placeholder">
          {block.type === 'image' && '🖼 انقر لإضافة صورة'}
          {block.type === 'video' && '🎬 انقر لإضافة فيديو'}
          {block.type === 'audio' && '🔊 انقر لإضافة صوت'}
        </div>
      )}
    </div>
  );
}
