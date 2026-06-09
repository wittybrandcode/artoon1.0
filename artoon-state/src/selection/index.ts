/**
 * Selection module exports
 */

export { 
  TextSelectionImpl, 
  NodeSelectionImpl, 
  AllSelectionImpl,
  selectionFromJSON 
} from './Selection';

export {
  findSelectionNear,
  findSelectionAtStart,
  findSelectionAtEnd,
  findSelectionIn,
  atBlockBoundary,
  selectionDepth
} from './helpers';
