/**
 * BlockRenderer
 * 
 * Renders the content of a block based on its type.
 * Handles contenteditable for text blocks.
 */

import React from 'react';
import type {
  Block,
  TextBlock,
  ListBlock,
  CodeBlock,
  TableBlock,
  MediaBlock,
} from '../../types';
import {
  AbbrBlockContent,
  LineBreakBlockContent,
  MetaBlockContent,
  TimeBlockContent,
  WordBreakBlockContent,
  TextBlockContent,
  ListBlockContent,
  CodeBlockContent,
  TableBlockContent,
  MediaBlockContent,
  DefinitionListBlockContent,
  FigureBlockContent,
  FileBlockContent,
  DividerBlockContent,
  DetailsBlockContent,
  LinkBlockContent,
  CustomBlockContent,
  PreformattedBlockContent,
} from './block-renderers';

export interface BlockRendererProps {
  block: Block;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
  onInsertBlock?: (type: string) => void;
  onSplitListBlock?: (itemsA: ListBlock['items'], itemsB: ListBlock['items']) => void;
}

export function BlockRenderer({ block, isEditable, onUpdate, onInsertBlock, onSplitListBlock }: BlockRendererProps) {
  switch (block.type) {
    case 'paragraph':
    case 'heading1':
    case 'heading2':
    case 'heading3':
    case 'heading4':
    case 'heading5':
    case 'heading6':
    case 'quote':
      return (
        <TextBlockContent
          block={block as TextBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'preformatted':
      return (
        <PreformattedBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'line-break':
      return <LineBreakBlockContent />;

    case 'word-break':
      return <WordBreakBlockContent />;

    case 'list':
    case 'bullet-list':
    case 'numbered-list':
      return (
        <ListBlockContent
          block={block as ListBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
          onInsertBlock={onInsertBlock}
          onSplitListBlock={onSplitListBlock}
        />
      );

    case 'definition-list':
      return (
        <DefinitionListBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'code':
      return (
        <CodeBlockContent
          block={block as CodeBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'table':
      return (
        <TableBlockContent
          block={block as TableBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'image':
    case 'video':
    case 'audio':
      return (
        <MediaBlockContent
          block={block as MediaBlock}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'figure':
      return (
        <FigureBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'file':
      return (
        <FileBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'divider':
      return <DividerBlockContent />;

    case 'details':
      return (
        <DetailsBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'time-block':
      return (
        <TimeBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'abbr-block':
      return (
        <AbbrBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'meta':
      return (
        <MetaBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'link-block':
      return (
        <LinkBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    case 'custom':
      return (
        <CustomBlockContent
          block={block as any}
          isEditable={isEditable}
          onUpdate={onUpdate}
        />
      );

    default:
      return <div className="block__content">نوع بلوك غير معروف: {(block as any).type}</div>;
  }
}

export default BlockRenderer;
