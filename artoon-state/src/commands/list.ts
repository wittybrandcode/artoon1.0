/**
 * List commands - list manipulation
 */

import type { Command, ContentNode, ListNode } from '../types';

/**
 * Toggle unordered list
 */
export const toggleBulletList: Command = (state, dispatch) => {
  return toggleList('ul')(state, dispatch);
};

/**
 * Toggle ordered list
 */
export const toggleOrderedList: Command = (state, dispatch) => {
  return toggleList('ol')(state, dispatch);
};

/**
 * Toggle definition list
 */
export const toggleDefinitionList: Command = (state, dispatch) => {
  return toggleList('dl')(state, dispatch);
};

/**
 * Generic toggle list command
 */
export function toggleList(listType: 'ul' | 'ol' | 'dl'): Command {
  return (state, dispatch) => {
    const { selection, doc } = state;
    const node = doc.nodeAt(selection.from);
    
    if (!node) return false;
    
    // If already in a list of this type, unwrap
    if (node.nodeType === 'list' && (node as ListNode).listType === listType) {
      return unwrapList(state, dispatch);
    }
    
    // If in a different list type, convert
    if (node.nodeType === 'list') {
      return convertList(listType)(state, dispatch);
    }
    
    // Wrap in list
    return wrapInList(listType)(state, dispatch);
  };
}

/**
 * Wrap selection in list
 */
export function wrapInList(listType: 'ul' | 'ol' | 'dl'): Command {
  return (state, dispatch) => {
    const { selection, doc } = state;
    const node = doc.nodeAt(selection.from);
    
    if (!node || node.nodeType !== 'text') {
      return false;
    }
    
    if (dispatch) {
      // Get text content from the node
      const textContent = (node as any).content || [];
      
      // Create list node with both type and nodeType for compatibility
      const listNode: ListNode = {
        type: 'list',
        nodeType: 'list',
        listType,
        direction: node.direction,
        line: node.line,
        items: [{
          itemType: listType === 'dl' ? 'dt' : 'li',
          content: textContent
        }]
      };
      
      const tr = state.tr.replaceWith(selection.from, selection.to, listNode);
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Unwrap list to paragraphs
 */
export const unwrapList: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'list') {
    return false;
  }
  
  if (dispatch) {
    const listNode = node as ListNode;
    
    // Convert each list item to a paragraph with both type and nodeType
    const paragraphs: ContentNode[] = listNode.items.map((item, i) => ({
      type: 'text' as const,
      nodeType: 'text' as const,
      textType: 'p' as const,
      direction: listNode.direction,
      line: listNode.line + i,
      content: item.content
    }));
    
    const tr = state.tr.replaceWith(selection.from, selection.to, paragraphs);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Convert list to different type
 */
export function convertList(listType: 'ul' | 'ol' | 'dl'): Command {
  return (state, dispatch) => {
    const { selection, doc } = state;
    const node = doc.nodeAt(selection.from);
    
    if (!node || node.nodeType !== 'list') {
      return false;
    }
    
    if (dispatch) {
      const oldList = node as ListNode;
      
      // Convert items to new type
      const newItems = oldList.items.map(item => ({
        ...item,
        itemType: listType === 'dl' ? 'dt' as const : 'li' as const
      }));
      
      const newList: ListNode = {
        ...oldList,
        listType,
        items: newItems
      };
      
      const tr = state.tr.replaceWith(selection.from, selection.to, newList);
      dispatch(tr);
    }
    
    return true;
  };
}

/**
 * Split list item at cursor
 */
export const splitListItem: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'list') {
    return false;
  }
  
  // Would need to split the current item into two
  // Complex operation - simplified for now
  return false;
};

/**
 * Lift list item (decrease indent)
 */
export const liftListItem: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'list') {
    return false;
  }
  
  // Would need to move item up in hierarchy
  return false;
};

/**
 * Sink list item (increase indent)
 */
export const sinkListItem: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'list') {
    return false;
  }
  
  // Would need to nest item under previous sibling
  return false;
};

/**
 * Add list item after current
 */
export const addListItemAfter: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'list') {
    return false;
  }
  
  if (dispatch) {
    const listNode = node as ListNode;
    
    // Add empty item
    const newItems = [
      ...listNode.items,
      {
        itemType: listNode.listType === 'dl' ? 'dt' as const : 'li' as const,
        content: []
      }
    ];
    
    const newList: ListNode = {
      ...listNode,
      items: newItems
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newList);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Add list item before current
 */
export const addListItemBefore: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'list') {
    return false;
  }
  
  if (dispatch) {
    const listNode = node as ListNode;
    
    // Add empty item at beginning
    const newItems = [
      {
        itemType: listNode.listType === 'dl' ? 'dt' as const : 'li' as const,
        content: []
      },
      ...listNode.items
    ];
    
    const newList: ListNode = {
      ...listNode,
      items: newItems
    };
    
    const tr = state.tr.replaceWith(selection.from, selection.to, newList);
    dispatch(tr);
  }
  
  return true;
};

/**
 * Delete current list item
 */
export const deleteListItem: Command = (state, dispatch) => {
  const { selection, doc } = state;
  const node = doc.nodeAt(selection.from);
  
  if (!node || node.nodeType !== 'list') {
    return false;
  }
  
  const listNode = node as ListNode;
  
  if (listNode.items.length <= 1) {
    // Last item - unwrap the list
    return unwrapList(state, dispatch);
  }
  
  // Would need to determine which item to delete
  return false;
};

/**
 * List keymap
 */
export const listKeymap: Record<string, Command> = {
  'Ctrl-Shift-8': toggleBulletList,
  'Ctrl-Shift-9': toggleOrderedList,
  'Tab': sinkListItem,
  'Shift-Tab': liftListItem
};

/**
 * All list commands
 */
export const listCommands = {
  toggleBulletList,
  toggleOrderedList,
  toggleDefinitionList,
  toggleList,
  wrapInList,
  unwrapList,
  convertList,
  splitListItem,
  liftListItem,
  sinkListItem,
  addListItemAfter,
  addListItemBefore,
  deleteListItem
};
