/**
 * Inline Module
 * 
 * Contains inline formatting logic:
 * - InlineParser: Parse inline content from DOM
 * - InlineRenderer: Render inline content to DOM
 * - MarkManager: Manage marks (bold, italic, etc.)
 * 
 * IMPORTANT: Uses InlineContent[] from @artoon/ast directly
 */

export { 
  InlineParser, 
  createInlineParser, 
  parseHtmlToInline,
  type ParseOptions,
} from './InlineParser';

export { 
  InlineRenderer, 
  createInlineRenderer, 
  renderInlineContent,
  type RenderOptions,
} from './InlineRenderer';

export { 
  MarkManager, 
  createMarkManager,
} from './MarkManager';
