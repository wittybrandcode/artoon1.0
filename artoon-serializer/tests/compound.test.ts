// ARTOON Serializer - Compound Node Tests

import { serializeCompound } from '../src/nodes/compound';
import { CompoundNode } from '@artoon/ast';

describe('serializeCompound', () => {
  it('should serialize figure with image and caption', () => {
    const node: CompoundNode = {
      type: 'compound',

      nodeType: 'compound',
      compoundType: 'figure',
      direction: 'rtl',
      line: 1,
      children: [
        {
          role: 'content',
          node: {
            type: 'media',

            nodeType: 'media',
            mediaType: 'img',
            src: 'photo.jpg',
            alt: 'وصف',
            direction: 'rtl',
            line: 2
          }
        },
        {
          role: 'caption',
          node: {
            type: 'text',

            nodeType: 'text',
            textType: 'p',
            direction: 'rtl',
            line: 3,
            content: [{ type: 'plain', value: 'تعليق الصورة' }]
          }
        }
      ]
    };
    
    expect(serializeCompound(node)).toBe(
      '>.figure::\n' +
      '>.-img:: photo.jpg; وصف\n' +
      '>.-caption:: تعليق الصورة'
    );
  });
  
  it('should serialize details with summary', () => {
    const node: CompoundNode = {
      type: 'compound',

      nodeType: 'compound',
      compoundType: 'details',
      direction: 'rtl',
      line: 1,
      children: [
        {
          role: 'summary',
          node: {
            type: 'text',

            nodeType: 'text',
            textType: 'p',
            direction: 'rtl',
            line: 1,
            content: [{ type: 'plain', value: 'ملخص' }]
          }
        },
        {
          role: 'content',
          node: {
            type: 'text',

            nodeType: 'text',
            textType: 'p',
            direction: 'rtl',
            line: 2,
            content: [{ type: 'plain', value: 'المحتوى المخفي' }]
          }
        }
      ]
    };
    
    expect(serializeCompound(node)).toBe(
      '>.details:: ملخص\n' +
      '>.p:: المحتوى المخفي'
    );
  });
  
  it('should serialize figure with video', () => {
    const node: CompoundNode = {
      type: 'compound',

      nodeType: 'compound',
      compoundType: 'figure',
      direction: 'ltr',
      line: 1,
      children: [
        {
          role: 'content',
          node: {
            type: 'media',

            nodeType: 'media',
            mediaType: 'video',
            src: 'video.mp4',
            title: 'Tutorial',
            direction: 'ltr',
            line: 2
          }
        },
        {
          role: 'caption',
          node: {
            type: 'text',

            nodeType: 'text',
            textType: 'p',
            direction: 'ltr',
            line: 3,
            content: [{ type: 'plain', value: 'Video caption' }]
          }
        }
      ]
    };
    
    expect(serializeCompound(node)).toBe(
      '<.figure::\n' +
      '<.-video:: video.mp4; Tutorial\n' +
      '<.-caption:: Video caption'
    );
  });
});
