import type { Block } from '../../../types';

/**
 * Abbr block content
 */
interface AbbrBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function AbbrBlockContent({ block, isEditable, onUpdate }: AbbrBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <div className="block__content" dir={direction}>
      <abbr title={block.title || ''}>
        {block.abbr || ''}
      </abbr>
    </div>
  );
}
