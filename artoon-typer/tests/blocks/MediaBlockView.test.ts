/**
 * MediaBlockView Tests
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MediaBlockView, createMediaBlockView } from '../../src/blocks/views/MediaBlockView';
import type { MediaBlock, InlineContent } from '../../src/types';

// Helper to create a test block
function createTestBlock(
  type: 'image' | 'video' | 'audio' = 'image',
  src: string = 'test.jpg'
): MediaBlock {
  return {
    id: 'test-media-1',
    type,
    direction: 'rtl',
    src,
    alt: 'صورة اختبار',
  };
}

describe('MediaBlockView', () => {
  let view: MediaBlockView;
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (view) {
      view.destroy();
    }
    container.remove();
  });

  describe('creation', () => {
    it('should create a view', () => {
      const block = createTestBlock();
      view = createMediaBlockView({ block });
      
      expect(view).toBeInstanceOf(MediaBlockView);
      expect(view.id).toBe('test-media-1');
    });

    it('should render figure element', () => {
      const block = createTestBlock();
      view = createMediaBlockView({ block });
      
      const element = view.render();
      
      expect(element.tagName).toBe('FIGURE');
    });
  });

  describe('image', () => {
    it('should render image element', () => {
      const block = createTestBlock('image', 'photo.jpg');
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const img = element.querySelector('img');
      
      expect(img).not.toBeNull();
      expect(img?.src).toContain('photo.jpg');
    });

    it('should set alt text', () => {
      const block = createTestBlock('image');
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const img = element.querySelector('img');
      
      expect(img?.alt).toBe('صورة اختبار');
    });

    it('should apply dimensions', () => {
      const block: MediaBlock = {
        ...createTestBlock('image'),
        width: '300px',
        height: '200px',
      };
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const img = element.querySelector('img') as HTMLImageElement;
      
      expect(img?.style.width).toBe('300px');
      expect(img?.style.height).toBe('200px');
    });
  });

  describe('video', () => {
    it('should render video element', () => {
      const block = createTestBlock('video', 'video.mp4');
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const video = element.querySelector('video');
      
      expect(video).not.toBeNull();
      expect(video?.src).toContain('video.mp4');
    });

    it('should have controls', () => {
      const block = createTestBlock('video');
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const video = element.querySelector('video');
      
      expect(video?.controls).toBe(true);
    });
  });

  describe('audio', () => {
    it('should render audio element', () => {
      const block = createTestBlock('audio', 'audio.mp3');
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const audio = element.querySelector('audio');
      
      expect(audio).not.toBeNull();
      expect(audio?.src).toContain('audio.mp3');
    });

    it('should have controls', () => {
      const block = createTestBlock('audio');
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const audio = element.querySelector('audio');
      
      expect(audio?.controls).toBe(true);
    });
  });

  describe('mediaType', () => {
    it('should return image for image block', () => {
      const block = createTestBlock('image');
      view = createMediaBlockView({ block });
      
      expect(view.mediaType).toBe('image');
    });

    it('should return video for video block', () => {
      const block = createTestBlock('video');
      view = createMediaBlockView({ block });
      
      expect(view.mediaType).toBe('video');
    });

    it('should return audio for audio block', () => {
      const block = createTestBlock('audio');
      view = createMediaBlockView({ block });
      
      expect(view.mediaType).toBe('audio');
    });
  });

  describe('getSrc', () => {
    it('should return source', () => {
      const block = createTestBlock('image', 'my-image.png');
      view = createMediaBlockView({ block });
      
      expect(view.getSrc()).toBe('my-image.png');
    });
  });

  describe('getAlt', () => {
    it('should return alt text', () => {
      const block = createTestBlock();
      view = createMediaBlockView({ block });
      
      expect(view.getAlt()).toBe('صورة اختبار');
    });

    it('should return empty string if no alt', () => {
      const block: MediaBlock = { ...createTestBlock(), alt: undefined };
      view = createMediaBlockView({ block });
      
      expect(view.getAlt()).toBe('');
    });
  });

  describe('caption', () => {
    it('should render caption', () => {
      const block: MediaBlock = {
        ...createTestBlock(),
        caption: [{ type: 'plain', value: 'وصف الصورة' }],
      };
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const caption = element.querySelector('figcaption');
      
      expect(caption).not.toBeNull();
      expect(caption?.textContent).toContain('وصف الصورة');
    });

    it('should not render caption if empty', () => {
      const block = createTestBlock();
      view = createMediaBlockView({ block });
      
      const element = view.render();
      const caption = element.querySelector('figcaption');
      
      expect(caption).toBeNull();
    });

    it('should make caption editable when not readonly', () => {
      const block: MediaBlock = {
        ...createTestBlock(),
        caption: [{ type: 'plain', value: 'وصف' }],
      };
      view = createMediaBlockView({ block, readOnly: false });
      
      const element = view.render();
      const caption = element.querySelector('figcaption');
      
      expect(caption?.contentEditable).toBe('true');
    });
  });

  describe('setSrc', () => {
    it('should update source', () => {
      const block = createTestBlock('image', 'old.jpg');
      view = createMediaBlockView({ block });
      view.render();
      
      view.setSrc('new.jpg');
      
      expect(view.getSrc()).toBe('new.jpg');
    });

    it('should call onSrcChange', () => {
      const onSrcChange = vi.fn();
      const block = createTestBlock();
      view = createMediaBlockView({ block, onSrcChange });
      view.render();
      
      view.setSrc('new.jpg');
      
      expect(onSrcChange).toHaveBeenCalledWith('new.jpg');
    });
  });

  describe('setAlt', () => {
    it('should update alt text', () => {
      const block = createTestBlock('image');
      view = createMediaBlockView({ block });
      view.render();
      
      view.setAlt('وصف جديد');
      
      expect(view.getAlt()).toBe('وصف جديد');
    });
  });

  describe('setCaption', () => {
    it('should update caption', () => {
      const block: MediaBlock = {
        ...createTestBlock(),
        caption: [{ type: 'plain', value: 'قديم' }],
      };
      view = createMediaBlockView({ block });
      view.render();
      
      const newCaption: InlineContent[] = [{ type: 'plain', value: 'جديد' }];
      view.setCaption(newCaption);
      
      expect(view.getCaption()).toEqual(newCaption);
    });
  });

  describe('setDimensions', () => {
    it('should update dimensions', () => {
      const block = createTestBlock('image');
      view = createMediaBlockView({ block });
      const element = view.render();
      
      view.setDimensions('500px', '300px');
      
      const img = element.querySelector('img') as HTMLImageElement;
      expect(img?.style.width).toBe('500px');
      expect(img?.style.height).toBe('300px');
    });

    it('should call onResize', () => {
      const onResize = vi.fn();
      const block = createTestBlock('image');
      view = createMediaBlockView({ block, onResize });
      view.render();
      
      view.setDimensions('500px', '300px');
      
      expect(onResize).toHaveBeenCalledWith('500px', '300px');
    });
  });

  describe('CSS classes', () => {
    it('should have media block class', () => {
      const block = createTestBlock();
      view = createMediaBlockView({ block });
      
      const element = view.render();
      
      expect(element.classList.contains('artoon-media-block')).toBe(true);
    });

    it('should have type-specific class', () => {
      const block = createTestBlock('video');
      view = createMediaBlockView({ block });
      
      const element = view.render();
      
      expect(element.classList.contains('artoon-media-block--video')).toBe(true);
    });
  });

  describe('update', () => {
    it('should update block', () => {
      const block = createTestBlock('image', 'old.jpg');
      view = createMediaBlockView({ block });
      view.render();
      
      const newBlock: MediaBlock = { ...block, src: 'new.jpg' };
      view.update(newBlock);
      
      expect(view.getSrc()).toBe('new.jpg');
    });
  });
});
