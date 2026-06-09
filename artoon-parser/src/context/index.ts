// ARTOON Context Stack
// Tracks open contexts (lists, blocks, compounds)

import { Direction } from '../types';

/**
 * Context types
 */
export type ContextType = 'list' | 'block' | 'compound' | 'table';

/**
 * Context entry
 */
export interface Context {
  type: ContextType;
  name: string;           // ul, ol, dl, figure, details, meta, code, table
  direction: Direction;
  depth: number;          // for lists
  line: number;           // where it started
}

/**
 * Context Stack Manager
 */
export class ContextStack {
  private stack: Context[] = [];
  
  /**
   * Push new context
   */
  push(context: Context): void {
    this.stack.push(context);
  }
  
  /**
   * Pop current context
   */
  pop(): Context | undefined {
    return this.stack.pop();
  }
  
  /**
   * Peek current context without removing
   */
  peek(): Context | undefined {
    return this.stack[this.stack.length - 1];
  }
  
  /**
   * Check if stack is empty
   */
  isEmpty(): boolean {
    return this.stack.length === 0;
  }
  
  /**
   * Get stack size
   */
  size(): number {
    return this.stack.length;
  }
  
  /**
   * Close all contexts until reaching specified depth
   * Returns closed contexts
   */
  closeUntilDepth(targetDepth: number): Context[] {
    const closed: Context[] = [];
    
    while (!this.isEmpty()) {
      const current = this.peek();
      if (!current || current.type !== 'list') break;
      if (current.depth <= targetDepth) break;
      
      closed.push(this.pop()!);
    }
    
    return closed;
  }
  
  /**
   * Close all list contexts
   */
  closeAllLists(): Context[] {
    const closed: Context[] = [];
    
    while (!this.isEmpty()) {
      const current = this.peek();
      if (!current || current.type !== 'list') break;
      closed.push(this.pop()!);
    }
    
    return closed;
  }
  
  /**
   * Close until specific context type
   */
  closeUntilType(type: ContextType): Context[] {
    const closed: Context[] = [];
    
    while (!this.isEmpty()) {
      const current = this.peek();
      if (!current) break;
      if (current.type === type) break;
      closed.push(this.pop()!);
    }
    
    return closed;
  }
  
  /**
   * Find context by type
   */
  findByType(type: ContextType): Context | undefined {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].type === type) {
        return this.stack[i];
      }
    }
    return undefined;
  }
  
  /**
   * Find context by name
   */
  findByName(name: string): Context | undefined {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      if (this.stack[i].name === name) {
        return this.stack[i];
      }
    }
    return undefined;
  }
  
  /**
   * Check if inside specific context type
   */
  isInside(type: ContextType): boolean {
    return this.findByType(type) !== undefined;
  }
  
  /**
   * Check if inside specific named context
   */
  isInsideNamed(name: string): boolean {
    return this.findByName(name) !== undefined;
  }
  
  /**
   * Get current list depth
   */
  getCurrentListDepth(): number {
    const listContext = this.findByType('list');
    return listContext ? listContext.depth : -1;
  }
  
  /**
   * Get inherited direction from parent context
   */
  getInheritedDirection(): Direction | null {
    for (let i = this.stack.length - 1; i >= 0; i--) {
      return this.stack[i].direction;
    }
    return null;
  }
  
  /**
   * Get all open contexts (for debugging)
   */
  getAll(): readonly Context[] {
    return [...this.stack];
  }
  
  /**
   * Clear all contexts
   */
  clear(): void {
    this.stack = [];
  }
  
  /**
   * Clone the stack
   */
  clone(): ContextStack {
    const newStack = new ContextStack();
    newStack.stack = [...this.stack];
    return newStack;
  }
}

/**
 * Create new context stack
 */
export function createContextStack(): ContextStack {
  return new ContextStack();
}
