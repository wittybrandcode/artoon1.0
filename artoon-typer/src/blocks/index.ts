/**
 * Blocks Module
 * 
 * Contains block definitions and implementations:
 * - Text blocks: paragraph, heading, quote
 * - List blocks: bullet-list, numbered-list
 * - Code blocks: code with syntax highlighting
 * - Table blocks: tables with cells
 * - Media blocks: image, video, audio
 * - Other blocks: divider
 */

// Block definitions
export { 
  defaultBlockDefinitions,
  getDefinition,
  getDefinitionsByCategory,
  // Individual definitions
  paragraphDefinition,
  heading1Definition,
  heading2Definition,
  heading3Definition,
  heading4Definition,
  heading5Definition,
  heading6Definition,
  quoteDefinition,
  bulletListDefinition,
  numberedListDefinition,
  imageDefinition,
  videoDefinition,
  audioDefinition,
  codeDefinition,
  tableDefinition,
  dividerDefinition,
} from './definitions';

// Block views (Phase 2) ✅
export { 
  BaseBlockView, 
  type BlockViewOptions,
} from './views/BaseBlockView';

export { 
  TextBlockView, 
  createTextBlockView,
  type TextBlockViewOptions,
} from './views/TextBlockView';

// Phase 3 exports will be added here
// export { ListBlockView } from './views/ListBlockView';
// export { CodeBlockView } from './views/CodeBlockView';
// export { TableBlockView } from './views/TableBlockView';
