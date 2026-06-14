import React, { useCallback, useRef } from 'react';
import type { CodeBlock, Block } from '../../../types';

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

  const handleLanguageChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onUpdate({ language: e.target.value } as Partial<CodeBlock>);
  }, [onUpdate]);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(block.code);
  }, [block.code]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
    }
  }, []);

  return (
    <div className="block__content code-block-wysiwyg">
      <div className="code-header">
        <select
          value={block.language || 'plaintext'}
          onChange={handleLanguageChange}
          disabled={!isEditable}
        >
          <option value="javascript">JavaScript</option>
          <option value="typescript">TypeScript</option>
          <option value="python">Python</option>
          <option value="java">Java</option>
          <option value="csharp">C#</option>
          <option value="cpp">C++</option>
          <option value="html">HTML</option>
          <option value="css">CSS</option>
          <option value="json">JSON</option>
          <option value="xml">XML</option>
          <option value="sql">SQL</option>
          <option value="bash">Bash</option>
          <option value="plaintext">Plain Text</option>
        </select>
        <button
          className="btn btn--icon"
          title="نسخ الكود"
          onClick={handleCopy}
        >
          📋
        </button>
      </div>
      <pre className={`language-${block.language || 'plaintext'}`} dir="ltr">
        <code
          ref={codeRef}
          contentEditable={isEditable}
          suppressContentEditableWarning
          onInput={handleCodeChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          dir="ltr"
          style={{
            direction: 'ltr',
            textAlign: 'left',
          }}
        >
          {block.code}
        </code>
      </pre>
    </div>
  );
}
