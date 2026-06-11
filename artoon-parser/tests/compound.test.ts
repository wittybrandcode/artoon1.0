// ARTOON Compound Component Tests

import {
  isCompoundComponent,
  isChildElement,
  createCompoundState,
  addCompoundChild,
  buildCompoundNode,
  shouldCloseCompound,
  validateCompoundChild,
  COMPOUND_CHILDREN
} from '../src/compound';
import { Token } from '../src/ast/types';

describe('Compound - Type Checks', () => {
  
  test('isCompoundComponent', () => {
    expect(isCompoundComponent('figure')).toBe(true);
    expect(isCompoundComponent('details')).toBe(true);
    expect(isCompoundComponent('p')).toBe(false);
    expect(isCompoundComponent(null)).toBe(false);
  });
  
  test('valid children for figure', () => {
    expect(COMPOUND_CHILDREN.figure).toContain('img');
    expect(COMPOUND_CHILDREN.figure).toContain('video');
    expect(COMPOUND_CHILDREN.figure).toContain('caption');
  });
  
  test('valid children for details', () => {
    expect(COMPOUND_CHILDREN.details).toContain('summary');
    expect(COMPOUND_CHILDREN.details).toContain('p');
  });
  
});

describe('Compound - Child Element Detection', () => {
  
  test('isChildElement with >.-', () => {
    const token: Token = {
      line: 1,
      raw: '>.-img:: photo.jpg',
      direction: 'rtl',
      hasComponent: true,
      componentType: 'img',
      isChildElement: true,
      depth: 0,
      separator: '::',
      content: 'photo.jpg',
      isBlockStart: false,
      isBlockEnd: false,
      blockName: null,
      blockLang: null,
      isComment: false
    };
    
    expect(isChildElement(token)).toBe(true);
  });
  
  test('isChildElement without >.-', () => {
    const token: Token = {
      line: 1,
      raw: '>.img:: photo.jpg',
      direction: 'rtl',
      hasComponent: true,
      componentType: 'img',
      isChildElement: false,
      depth: 0,
      separator: '::',
      content: 'photo.jpg',
      isBlockStart: false,
      isBlockEnd: false,
      blockName: null,
      blockLang: null,
      isComment: false
    };
    
    expect(isChildElement(token)).toBe(false);
  });
  
});

describe('Compound - State Management', () => {
  
  test('create compound state', () => {
    const state = createCompoundState('figure', 'rtl', 5);
    
    expect(state.type).toBe('figure');
    expect(state.direction).toBe('rtl');
    expect(state.startLine).toBe(5);
    expect(state.children).toHaveLength(0);
  });
  
  test('add child to compound', () => {
    const state = createCompoundState('figure', 'rtl', 1);
    
    addCompoundChild(state, {
      type: 'media',
      line: 2,
      direction: 'rtl',
      mediaType: 'img',
      src: 'photo.jpg'
    } as any);
    
    expect(state.children).toHaveLength(1);
  });
  
  test('build compound node', () => {
    const state = createCompoundState('figure', 'rtl', 1);
    addCompoundChild(state, {
      type: 'media',
      line: 2,
      direction: 'rtl',
      mediaType: 'img',
      src: 'photo.jpg'
    } as any);
    
    const node = buildCompoundNode(state);
    
    expect(node.type).toBe('compound');
    expect(node.compoundType).toBe('figure');
    expect(node.children).toHaveLength(1);
  });
  
});

describe('Compound - Validation', () => {
  
  test('valid child for figure', () => {
    const result = validateCompoundChild('figure', 'img', 1);
    expect(result.valid).toBe(true);
  });
  
  test('invalid child for figure', () => {
    const result = validateCompoundChild('figure', 'p', 1);
    expect(result.valid).toBe(false);
    expect(result.error?.type).toBe('semantic');
  });
  
  test('valid child for details', () => {
    const result = validateCompoundChild('details', 'summary', 1);
    expect(result.valid).toBe(true);
  });
  
});

describe('Compound - Close Detection', () => {
  
  test('should close on new component', () => {
    const token: Token = {
      line: 1,
      raw: '>.p:: text',
      direction: 'rtl',
      hasComponent: true,
      componentType: 'p',
      isChildElement: false,
      depth: 0,
      separator: '::',
      content: 'text',
      isBlockStart: false,
      isBlockEnd: false,
      blockName: null,
      blockLang: null,
      isComment: false
    };
    
    expect(shouldCloseCompound(token)).toBe(true);
  });
  
  test('should not close on child element', () => {
    const token: Token = {
      line: 1,
      raw: '>.-caption:: text',
      direction: 'rtl',
      hasComponent: true,
      componentType: 'caption',
      isChildElement: true,
      depth: 0,
      separator: '::',
      content: 'text',
      isBlockStart: false,
      isBlockEnd: false,
      blockName: null,
      blockLang: null,
      isComment: false
    };
    
    expect(shouldCloseCompound(token)).toBe(false);
  });
  
  test('should close on block start', () => {
    const token: Token = {
      line: 1,
      raw: '<meta>.',
      direction: 'ltr',
      hasComponent: false,
      componentType: null,
      isChildElement: false,
      depth: 0,
      separator: null,
      content: '',
      isBlockStart: true,
      isBlockEnd: false,
      blockName: 'meta',
      blockLang: null,
      isComment: false
    };
    
    expect(shouldCloseCompound(token)).toBe(true);
  });
  
});
