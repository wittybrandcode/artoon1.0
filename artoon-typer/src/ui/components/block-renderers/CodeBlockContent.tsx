import React, { useRef, useCallback } from 'react';
import type { Block, CodeBlock } from '../../../types';

interface CodeBlockContentProps {
  block: CodeBlock;
  isEditable: boolean;
  onUpdate: (updates: Partial<Block>) => void;
}

export function CodeBlockContent({ block, isEditable, onUpdate }: CodeBlockContentProps) {
  const codeRef = useRef<HTMLElement>(null);

  const handleCodeChange = useCallback(() => {
    if (codeRef.current) {
      const newCode = codeRef.current.textContent || '';
      onUpdate({ code: newCode } as Partial<CodeBlock>);
    }
  }, [onUpdate]);

  return (
    <div className="block__content" dir="ltr">
      <pre className="code-block">
        <code
          ref={codeRef}
          contentEditable={isEditable}
          suppressContentEditableWarning
          onBlur={handleCodeChange}
          className={block.language ? `language-${block.language}` : ''}
        >
          {block.code}
        </code>
      </pre>
      {block.language && (
        <div className="code-block__lang">{block.language}</div>
      )}
    </div>
  );
}
