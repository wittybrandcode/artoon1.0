// ARTOON Serializer - Media Node Tests

import { serializeMedia } from '../src/nodes/media';
import { MediaNode } from '@artoon/ast';

describe('serializeMedia', () => {
  it('should serialize image with all attributes', () => {
    const node: MediaNode = {
      type: 'media',

      nodeType: 'media',
      mediaType: 'img',
      src: 'photo.jpg',
      alt: 'وصف الصورة',
      title: 'عنوان الصورة',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeMedia(node)).toBe('>.img:: photo.jpg; وصف الصورة; عنوان الصورة');
  });
  
  it('should serialize image with only src', () => {
    const node: MediaNode = {
      type: 'media',

      nodeType: 'media',
      mediaType: 'img',
      src: 'photo.jpg',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeMedia(node)).toBe('>.img:: photo.jpg');
  });
  
  it('should serialize image with src and alt', () => {
    const node: MediaNode = {
      type: 'media',

      nodeType: 'media',
      mediaType: 'img',
      src: 'photo.jpg',
      alt: 'وصف',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeMedia(node)).toBe('>.img:: photo.jpg; وصف');
  });
  
  it('should serialize video', () => {
    const node: MediaNode = {
      type: 'media',

      nodeType: 'media',
      mediaType: 'video',
      src: 'video.mp4',
      title: 'فيديو تعليمي',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeMedia(node)).toBe('>.video:: video.mp4; فيديو تعليمي');
  });
  
  it('should serialize audio', () => {
    const node: MediaNode = {
      type: 'media',

      nodeType: 'media',
      mediaType: 'audio',
      src: 'audio.mp3',
      title: 'ملف صوتي',
      direction: 'ltr',
      line: 1
    };
    
    expect(serializeMedia(node)).toBe('<.audio:: audio.mp3; ملف صوتي');
  });
  
  it('should serialize file', () => {
    const node: MediaNode = {
      type: 'media',

      nodeType: 'media',
      mediaType: 'file',
      src: 'document.pdf',
      label: 'تحميل الملف',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeMedia(node)).toBe('>.file:: document.pdf; تحميل الملف');
  });
});
