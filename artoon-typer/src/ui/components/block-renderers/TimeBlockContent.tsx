import type { Block } from '../../../types';

/**
 * Time block content
 */
interface TimeBlockContentProps {
  block: any;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function TimeBlockContent({ block, isEditable, onUpdate }: TimeBlockContentProps) {
  const direction = block.direction || 'rtl';

  return (
    <div className="block__content" dir={direction}>
      <time dateTime={block.datetime || ''}>
        {block.displayText || block.datetime || ''}
      </time>
    </div>
  );
}
