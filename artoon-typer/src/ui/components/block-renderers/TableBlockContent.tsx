import React, { useMemo } from 'react';
import type { Block, TableBlock } from '../../../types';
import { createInlineRenderer } from '../../../inline/InlineRenderer';

const inlineRenderer = createInlineRenderer();

const TableCellComponent = (React.memo || ((c: any) => c))(({ cell, isHeader, isEditable, direction, isRTL }: any) => {
  const html = useMemo(() => inlineRenderer.render(cell.content), [cell.content]);
  const CellTag = isHeader ? 'th' : 'td';

  return (
    <CellTag
      contentEditable={isEditable}
      suppressContentEditableWarning
      dangerouslySetInnerHTML={{ __html: html }}
      style={{ direction, textAlign: isRTL ? 'right' : 'left', outline: 'none' }}
    />
  );
});

interface TableBlockContentProps {
  block: TableBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function TableBlockContent({ block, isEditable, onUpdate }: TableBlockContentProps) {
  const direction = block.direction || 'rtl';
  const isRTL = direction === 'rtl';

  return (
    <div className="block__content" dir={direction}>
      <table>
        <tbody>
          {block.rows.map((row) => (
            <tr key={row.id}>
              {row.cells.map((cell) => (
                <TableCellComponent
                  key={cell.id}
                  cell={cell}
                  isHeader={row.isHeader}
                  isEditable={isEditable}
                  direction={direction}
                  isRTL={isRTL}
                />
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
