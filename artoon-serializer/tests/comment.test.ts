// ARTOON Serializer - Comment Node Tests

import { serializeComment } from '../src/nodes/comment';
import { CommentNode } from '@artoon/ast';

describe('serializeComment', () => {
  it('should serialize RTL comment', () => {
    const node: CommentNode = {
      type: 'comment',

      nodeType: 'comment',
      content: 'هذا تعليق',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeComment(node)).toBe('>.::: هذا تعليق');
  });
  
  it('should serialize LTR comment', () => {
    const node: CommentNode = {
      type: 'comment',

      nodeType: 'comment',
      content: 'This is a comment',
      direction: 'ltr',
      line: 1
    };
    
    expect(serializeComment(node)).toBe('<.::: This is a comment');
  });
  
  it('should serialize empty comment', () => {
    const node: CommentNode = {
      type: 'comment',

      nodeType: 'comment',
      content: '',
      direction: 'rtl',
      line: 1
    };
    
    expect(serializeComment(node)).toBe('>.::: ');
  });
});
