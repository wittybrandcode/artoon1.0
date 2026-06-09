/**
 * Block Views
 * 
 * Visual representations of blocks in the editor.
 */

export { BaseBlockView, type BlockViewOptions } from './BaseBlockView';
export { TextBlockView, createTextBlockView, type TextBlockViewOptions } from './TextBlockView';
export { ListBlockView, createListBlockView, type ListBlockViewOptions } from './ListBlockView';
export { CodeBlockView, createCodeBlockView, type CodeBlockViewOptions } from './CodeBlockView';
export { MediaBlockView, createMediaBlockView, type MediaBlockViewOptions } from './MediaBlockView';
export { DividerBlockView, createDividerBlockView, type DividerBlockViewOptions } from './DividerBlockView';
export { TableBlockView, createTableBlockView, type TableBlockViewOptions } from './TableBlockView';

// Phase 2: New block views
export { PreBlockView, createPreBlockView, type PreBlockViewOptions } from './PreBlockView';
export { LineBreakBlockView, createLineBreakBlockView, type LineBreakBlockViewOptions } from './LineBreakBlockView';
export { DefinitionListBlockView, createDefinitionListBlockView, type DefinitionListBlockViewOptions } from './DefinitionListBlockView';
export { FigureBlockView, createFigureBlockView, type FigureBlockViewOptions } from './FigureBlockView';
export { FileBlockView, createFileBlockView, type FileBlockViewOptions } from './FileBlockView';

// Phase 3: Advanced block views
export { DetailsBlockView, createDetailsBlockView, type DetailsBlockViewOptions } from './DetailsBlockView';
export { TimeBlockView, createTimeBlockView, type TimeBlockViewOptions } from './TimeBlockView';
export { AbbrBlockView, createAbbrBlockView, type AbbrBlockViewOptions } from './AbbrBlockView';
export { MetaBlockView, createMetaBlockView, type MetaBlockViewOptions } from './MetaBlockView';

// Phase 4: Additional block views
export { LinkBlockView, createLinkBlockView, type LinkBlockViewOptions } from './LinkBlockView';
export { CustomBlockView, createCustomBlockView, type CustomBlockViewOptions } from './CustomBlockView';
export { WordBreakBlockView, createWordBreakBlockView, type WordBreakBlockViewOptions } from './WordBreakBlockView';
