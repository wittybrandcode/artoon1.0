import React from 'react';
import type { TableBlock, Block } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';

interface TableBlockContentProps {
  block: TableBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

const inlineRenderer = createInlineRenderer();

export function TableBlockContent({ block, isEditable, onUpdate }: TableBlockContentProps) {
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  return (
    <div className="block__content" dir={direction} style={{ direction, textAlign: isRTL ? 'right' : 'left' }} data-block-id={block.id}>
      <table>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell) => {
                const html = inlineRenderer.render(cell.content);
                const CellTag = row.isHeader ? 'th' : 'td';

                return (
                  <CellTag
                    key={cell.id}
                    contentEditable={isEditable}
                    suppressContentEditableWarning
                    dir={direction}
                    style={{ direction, textAlign: isRTL ? 'right' : 'left' }}
                    data-block-id={block.id}
                    dangerouslySetInnerHTML={{ __html: html }}
                  />
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
