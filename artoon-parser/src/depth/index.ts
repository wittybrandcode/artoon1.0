// ARTOON Depth Engine
// Handles dash-based nesting for lists

import { Direction } from '../types';
import { Token } from '../ast/types';
import { ContextStack, Context } from '../context';

/**
 * Depth change result
 */
export interface DepthChange {
  action: 'open' | 'close' | 'same' | 'reset';
  closedContexts: Context[];
  newDepth: number;
  listType?: 'ul' | 'ol' | 'dl';
}

/**
 * Calculate depth change from token
 */
export function calculateDepthChange(
  token: Token,
  contextStack: ContextStack
): DepthChange {
  const currentDepth = contextStack.getCurrentListDepth();
  const tokenDepth = token.depth;
  
  // Not a list-related token
  if (!isListRelated(token)) {
    // Close all list contexts when non-list component appears
    if (token.hasComponent && !token.isChildElement) {
      const closed = contextStack.closeAllLists();
      return {
        action: closed.length > 0 ? 'reset' : 'same',
        closedContexts: closed,
        newDepth: -1
      };
    }
    return {
      action: 'same',
      closedContexts: [],
      newDepth: currentDepth
    };
  }
  
  // List container (ul, ol, dl)
  if (isListContainer(token.componentType)) {
    return {
      action: 'open',
      closedContexts: [],
      newDepth: tokenDepth,
      listType: token.componentType as 'ul' | 'ol' | 'dl'
    };
  }
  
  // List item (li, dt, dd)
  if (isListItem(token.componentType)) {
    // Deeper nesting
    if (tokenDepth > currentDepth) {
      return {
        action: 'open',
        closedContexts: [],
        newDepth: tokenDepth
      };
    }
    
    // Same level
    if (tokenDepth === currentDepth) {
      return {
        action: 'same',
        closedContexts: [],
        newDepth: tokenDepth
      };
    }
    
    // Going back up
    const closed = contextStack.closeUntilDepth(tokenDepth);
    return {
      action: 'close',
      closedContexts: closed,
      newDepth: tokenDepth
    };
  }
  
  return {
    action: 'same',
    closedContexts: [],
    newDepth: currentDepth
  };
}

/**
 * Check if token is list-related
 */
export function isListRelated(token: Token): boolean {
  const type = token.componentType;
  return isListContainer(type) || isListItem(type);
}

/**
 * Check if type is list container
 */
export function isListContainer(type: string | null): boolean {
  return type === 'ul' || type === 'ol' || type === 'dl';
}

/**
 * Check if type is list item
 */
export function isListItem(type: string | null): boolean {
  return type === 'li' || type === 'dt' || type === 'dd';
}

/**
 * Get expected item type for list container
 */
export function getExpectedItemType(listType: string): string[] {
  switch (listType) {
    case 'ul':
    case 'ol':
      return ['li'];
    case 'dl':
      return ['dt', 'dd'];
    default:
      return [];
  }
}

/**
 * Count leading dashes in a string
 */
export function countLeadingDashes(str: string): number {
  let count = 0;
  for (const char of str) {
    if (char === '-') count++;
    else break;
  }
  return count;
}

/**
 * Validate list structure
 */
export function validateListStructure(
  itemType: string,
  parentListType: string | null
): { valid: boolean; message?: string } {
  if (!parentListType) {
    return { valid: true }; // No parent, item creates implicit list
  }
  
  const expected = getExpectedItemType(parentListType);
  
  if (!expected.includes(itemType)) {
    return {
      valid: false,
      message: `${itemType} not valid inside ${parentListType}. Expected: ${expected.join(' or ')}`
    };
  }
  
  return { valid: true };
}
