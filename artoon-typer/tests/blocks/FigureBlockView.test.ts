/**
 * FigureBlockView Tests
 */

import { FigureBlockView, createFigureBlockView } from '../../src/blocks/views/FigureBlockView';
import type { FigureBlock } from '../../src/types';

describe('FigureBlockView', () => {
  const createBlock = (overrides?: Partial<FigureBlock>): FigureBlock => ({
    id: 'test-figure-1',
    type: 'figure',
    direction: 'rtl',
    mediaType: 'image',
    src: '',
    alt: '',
    caption: [],
    ...overrides,
  });
  
  describe('render', () => {
    test('renders figure block', () => {
      const block = createBlock();
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      expect(element).toBeTruthy();
      expect(element.querySelector('figure')).toBeTruthy();
    });
    
    test('renders figcaption element', () => {
      const block = createBlock();
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      expect(element.querySelector('figcaption')).toBeTruthy();
    });
    
    test('applies correct CSS classes', () => {
      const block = createBlock();
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      expect(element.classList.contains('artoon-block')).toBe(true);
      expect(element.classList.contains('artoon-block--figure')).toBe(true);
    });
  });
  
  describe('media rendering', () => {
    test('renders image when mediaType is image', () => {
      const block = createBlock({ 
        mediaType: 'image', 
        src: 'test.jpg',
        alt: 'Test image'
      });
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      const img = element.querySelector('img');
      expect(img).toBeTruthy();
      expect(img?.src).toContain('test.jpg');
      expect(img?.alt).toBe('Test image');
    });
    
    test('renders video when mediaType is video', () => {
      const block = createBlock({ 
        mediaType: 'video', 
        src: 'test.mp4' 
      });
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      const video = element.querySelector('video');
      expect(video).toBeTruthy();
      expect(video?.controls).toBe(true);
    });
    
    test('renders audio when mediaType is audio', () => {
      const block = createBlock({ 
        mediaType: 'audio', 
        src: 'test.mp3' 
      });
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      const audio = element.querySelector('audio');
      expect(audio).toBeTruthy();
      expect(audio?.controls).toBe(true);
    });
    
    test('shows upload area when no src', () => {
      const block = createBlock({ src: '' });
      const view = createFigureBlockView({ block, readOnly: false });
      const element = view.render();
      
      const uploadArea = element.querySelector('.artoon-figure-upload');
      expect(uploadArea).toBeTruthy();
    });
  });
  
  describe('caption', () => {
    test('renders caption content', () => {
      const block = createBlock({ 
        caption: [{ type: 'plain', value: 'وصف الصورة' }] 
      });
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      const caption = element.querySelector('figcaption');
      expect(caption?.textContent).toContain('وصف الصورة');
    });
    
    test('makes caption editable when not readonly', () => {
      const block = createBlock();
      const view = createFigureBlockView({ block, readOnly: false });
      const element = view.render();
      
      const caption = element.querySelector('figcaption');
      expect(caption?.contentEditable).toBe('true');
    });
  });
  
  describe('figure number', () => {
    test('shows figure number badge when set', () => {
      const block = createBlock({ number: 1 });
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      const badge = element.querySelector('.artoon-figure-number');
      expect(badge).toBeTruthy();
      expect(badge?.textContent).toContain('1');
    });
    
    test('hides figure number badge when not set', () => {
      const block = createBlock({ number: undefined });
      const view = createFigureBlockView({ block });
      const element = view.render();
      
      const badge = element.querySelector('.artoon-figure-number');
      expect(badge).toBeFalsy();
    });
  });
});
