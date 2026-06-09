// ARTOON AST Types Tests
// Version 2.0 - Tests both old (nodeType) and new (type) formats

import {
  isTextNode,
  isListNode,
  isTableNode,
  isCompoundNode,
  isBlockNode,
  isMediaNode,
  isLinkNode,
  isCodeNode,
  isSeparatorNode,
  isCommentNode,
  isPlainText,
  isInlineComponent,
  isTimeTextNode,
  isAbbrTextNode,
  TextNode,
  ListNode,
  ContentNode,
  InlineContent
} from '../src/types';

describe('Type Guards - New Format (type)', () => {
  
  const textNode: TextNode = {
    type: 'text',
    line: 1,
    direction: 'rtl',
    textType: 'p',
    content: []
  };
  
  const listNode: ListNode = {
    type: 'list',
    line: 1,
    direction: 'rtl',
    listType: 'ul',
    items: []
  };
  
  test('isTextNode', () => {
    expect(isTextNode(textNode)).toBe(true);
    expect(isTextNode(listNode)).toBe(false);
  });
  
  test('isListNode', () => {
    expect(isListNode(listNode)).toBe(true);
    expect(isListNode(textNode)).toBe(false);
  });
  
  test('isTableNode', () => {
    const tableNode: ContentNode = {
      type: 'table',
      line: 1,
      direction: 'rtl',
      rows: []
    } as any;
    
    expect(isTableNode(tableNode)).toBe(true);
    expect(isTableNode(textNode)).toBe(false);
  });
  
  test('isCompoundNode', () => {
    const compoundNode: ContentNode = {
      type: 'compound',
      line: 1,
      direction: 'rtl',
      compoundType: 'figure',
      children: []
    } as any;
    
    expect(isCompoundNode(compoundNode)).toBe(true);
    expect(isCompoundNode(textNode)).toBe(false);
  });
  
  test('isBlockNode', () => {
    const blockNode: ContentNode = {
      type: 'block',
      line: 1,
      direction: 'ltr',
      blockName: 'code',
      isCode: true,
      content: ''
    } as any;
    
    expect(isBlockNode(blockNode)).toBe(true);
    expect(isBlockNode(textNode)).toBe(false);
  });
  
  test('isMediaNode', () => {
    const mediaNode: ContentNode = {
      type: 'media',
      line: 1,
      direction: 'rtl',
      mediaType: 'img',
      src: 'photo.jpg'
    } as any;
    
    expect(isMediaNode(mediaNode)).toBe(true);
    expect(isMediaNode(textNode)).toBe(false);
  });
  
  test('isLinkNode', () => {
    const linkNode: ContentNode = {
      type: 'link',
      line: 1,
      direction: 'rtl',
      url: 'https://example.com',
      modifiers: []
    } as any;
    
    expect(isLinkNode(linkNode)).toBe(true);
    expect(isLinkNode(textNode)).toBe(false);
  });
  
  test('isCodeNode', () => {
    const codeNode: ContentNode = {
      type: 'code',
      line: 1,
      direction: 'ltr',
      code: 'const x = 1;'
    } as any;
    
    expect(isCodeNode(codeNode)).toBe(true);
    expect(isCodeNode(textNode)).toBe(false);
  });
  
  test('isSeparatorNode', () => {
    const sepNode: ContentNode = {
      type: 'separator',
      line: 1,
      direction: 'rtl',
      separatorType: 'br'
    } as any;
    
    expect(isSeparatorNode(sepNode)).toBe(true);
    expect(isSeparatorNode(textNode)).toBe(false);
  });
  
  test('isCommentNode', () => {
    const commentNode: ContentNode = {
      type: 'comment',
      line: 1,
      direction: 'rtl',
      content: 'comment'
    } as any;
    
    expect(isCommentNode(commentNode)).toBe(true);
    expect(isCommentNode(textNode)).toBe(false);
  });
  
});

describe('Type Guards - Legacy Format (nodeType)', () => {
  
  test('isTextNode with nodeType', () => {
    const legacyNode = {
      nodeType: 'text',
      line: 1,
      direction: 'rtl',
      textType: 'p',
      content: []
    } as any;
    
    expect(isTextNode(legacyNode)).toBe(true);
  });
  
  test('isListNode with nodeType', () => {
    const legacyNode = {
      nodeType: 'list',
      line: 1,
      direction: 'rtl',
      listType: 'ul',
      items: []
    } as any;
    
    expect(isListNode(legacyNode)).toBe(true);
  });
  
  test('isSeparatorNode with nodeType', () => {
    const legacyNode = {
      nodeType: 'separator',
      line: 1,
      direction: 'rtl',
      separators: ['br']
    } as any;
    
    expect(isSeparatorNode(legacyNode)).toBe(true);
  });
  
});

describe('Inline Content Type Guards', () => {
  
  test('isPlainText', () => {
    const plain: InlineContent = { type: 'plain', value: 'text' };
    const inline: InlineContent = { type: 'inline', attributes: {} };
    
    expect(isPlainText(plain)).toBe(true);
    expect(isPlainText(inline)).toBe(false);
  });
  
  test('isInlineComponent', () => {
    const plain: InlineContent = { type: 'plain', value: 'text' };
    const inline: InlineContent = { type: 'inline', attributes: {} };
    
    expect(isInlineComponent(inline)).toBe(true);
    expect(isInlineComponent(plain)).toBe(false);
  });
  
});

describe('TextType Specific Guards', () => {
  
  test('isTimeTextNode', () => {
    const timeNode: TextNode = {
      type: 'text',
      line: 1,
      direction: 'rtl',
      textType: 'time',
      content: [{ type: 'plain', value: '2026-01-15' }]
    };
    
    const paragraphNode: TextNode = {
      type: 'text',
      line: 1,
      direction: 'rtl',
      textType: 'p',
      content: []
    };
    
    expect(isTimeTextNode(timeNode)).toBe(true);
    expect(isTimeTextNode(paragraphNode)).toBe(false);
  });
  
  test('isAbbrTextNode', () => {
    const abbrNode: TextNode = {
      type: 'text',
      line: 1,
      direction: 'rtl',
      textType: 'abbr',
      content: [{ type: 'plain', value: 'HTML' }]
    };
    
    const headingNode: TextNode = {
      type: 'text',
      line: 1,
      direction: 'rtl',
      textType: 't1',
      content: []
    };
    
    expect(isAbbrTextNode(abbrNode)).toBe(true);
    expect(isAbbrTextNode(headingNode)).toBe(false);
  });
  
  test('TextType includes time and abbr', () => {
    // Verify that time and abbr are valid TextType values
    const validTextTypes = ['p', 't1', 't2', 't3', 't4', 't5', 't6', 'q', 'pre', 'time', 'abbr'];
    
    validTextTypes.forEach(textType => {
      const node: TextNode = {
        type: 'text',
        line: 1,
        direction: 'rtl',
        textType: textType as any,
        content: []
      };
      expect(isTextNode(node)).toBe(true);
    });
  });
  
});
