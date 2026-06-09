// ARTOON Context Stack Tests

import { ContextStack, createContextStack, Context } from '../src/context';

describe('ContextStack - Basic Operations', () => {
  
  let stack: ContextStack;
  
  beforeEach(() => {
    stack = createContextStack();
  });
  
  test('initially empty', () => {
    expect(stack.isEmpty()).toBe(true);
    expect(stack.size()).toBe(0);
  });
  
  test('push and peek', () => {
    const ctx: Context = {
      type: 'list',
      name: 'ul',
      direction: 'rtl',
      depth: 0,
      line: 1
    };
    
    stack.push(ctx);
    
    expect(stack.isEmpty()).toBe(false);
    expect(stack.size()).toBe(1);
    expect(stack.peek()).toEqual(ctx);
  });
  
  test('push and pop', () => {
    const ctx: Context = {
      type: 'list',
      name: 'ul',
      direction: 'rtl',
      depth: 0,
      line: 1
    };
    
    stack.push(ctx);
    const popped = stack.pop();
    
    expect(popped).toEqual(ctx);
    expect(stack.isEmpty()).toBe(true);
  });
  
  test('multiple push/pop', () => {
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    stack.push({ type: 'list', name: 'ol', direction: 'rtl', depth: 1, line: 2 });
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 2, line: 3 });
    
    expect(stack.size()).toBe(3);
    expect(stack.peek()?.depth).toBe(2);
    
    stack.pop();
    expect(stack.peek()?.depth).toBe(1);
  });
  
});

describe('ContextStack - Close Operations', () => {
  
  let stack: ContextStack;
  
  beforeEach(() => {
    stack = createContextStack();
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    stack.push({ type: 'list', name: 'ol', direction: 'rtl', depth: 1, line: 2 });
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 2, line: 3 });
  });
  
  test('closeUntilDepth', () => {
    const closed = stack.closeUntilDepth(1);
    
    expect(closed).toHaveLength(1);
    expect(closed[0].depth).toBe(2);
    expect(stack.size()).toBe(2);
  });
  
  test('closeAllLists', () => {
    const closed = stack.closeAllLists();
    
    expect(closed).toHaveLength(3);
    expect(stack.isEmpty()).toBe(true);
  });
  
  test('closeUntilType', () => {
    stack.push({ type: 'block', name: 'meta', direction: 'ltr', depth: 0, line: 4 });
    
    const closed = stack.closeUntilType('block');
    
    expect(closed).toHaveLength(0); // block is on top
    expect(stack.peek()?.type).toBe('block');
  });
  
});

describe('ContextStack - Find Operations', () => {
  
  let stack: ContextStack;
  
  beforeEach(() => {
    stack = createContextStack();
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    stack.push({ type: 'block', name: 'meta', direction: 'ltr', depth: 0, line: 2 });
  });
  
  test('findByType', () => {
    const found = stack.findByType('list');
    expect(found?.name).toBe('ul');
  });
  
  test('findByName', () => {
    const found = stack.findByName('meta');
    expect(found?.type).toBe('block');
  });
  
  test('isInside', () => {
    expect(stack.isInside('list')).toBe(true);
    expect(stack.isInside('block')).toBe(true);
    expect(stack.isInside('compound')).toBe(false);
  });
  
  test('isInsideNamed', () => {
    expect(stack.isInsideNamed('ul')).toBe(true);
    expect(stack.isInsideNamed('meta')).toBe(true);
    expect(stack.isInsideNamed('ol')).toBe(false);
  });
  
});

describe('ContextStack - Direction Inheritance', () => {
  
  test('getInheritedDirection', () => {
    const stack = createContextStack();
    
    expect(stack.getInheritedDirection()).toBeNull();
    
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    expect(stack.getInheritedDirection()).toBe('rtl');
    
    stack.push({ type: 'list', name: 'ol', direction: 'ltr', depth: 1, line: 2 });
    expect(stack.getInheritedDirection()).toBe('ltr');
  });
  
  test('getCurrentListDepth', () => {
    const stack = createContextStack();
    
    expect(stack.getCurrentListDepth()).toBe(-1);
    
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    expect(stack.getCurrentListDepth()).toBe(0);
    
    stack.push({ type: 'list', name: 'ol', direction: 'rtl', depth: 2, line: 2 });
    expect(stack.getCurrentListDepth()).toBe(2);
  });
  
});

describe('ContextStack - Utility', () => {
  
  test('getAll returns copy', () => {
    const stack = createContextStack();
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    
    const all = stack.getAll();
    expect(all).toHaveLength(1);
    
    // Modifying returned array shouldn't affect stack
    (all as Context[]).pop();
    expect(stack.size()).toBe(1);
  });
  
  test('clear', () => {
    const stack = createContextStack();
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    stack.push({ type: 'block', name: 'meta', direction: 'ltr', depth: 0, line: 2 });
    
    stack.clear();
    
    expect(stack.isEmpty()).toBe(true);
  });
  
  test('clone', () => {
    const stack = createContextStack();
    stack.push({ type: 'list', name: 'ul', direction: 'rtl', depth: 0, line: 1 });
    
    const cloned = stack.clone();
    
    expect(cloned.size()).toBe(1);
    
    // Modifying clone shouldn't affect original
    cloned.pop();
    expect(stack.size()).toBe(1);
  });
  
});
