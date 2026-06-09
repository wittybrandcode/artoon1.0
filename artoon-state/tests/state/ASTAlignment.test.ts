import type { ARTOONDocument } from '@artoon/ast';
import { EditorStateImpl } from '../../src/state/EditorState';

describe('AST Alignment', () => {
  it('keeps @artoon/ast document shape through state create/toAST', () => {
    const ast: ARTOONDocument = {
      version: '2.0',
      content: [
        {
          type: 'text',
          nodeType: 'text',
          textType: 't1',
          direction: 'rtl',
          line: 1,
          content: [{ type: 'plain', value: 'عنوان' }]
        },
        {
          type: 'list',
          nodeType: 'list',
          listType: 'ul',
          direction: 'rtl',
          line: 2,
          items: [
            {
              itemType: 'li',
              content: [{ type: 'plain', value: 'عنصر' }]
            }
          ]
        },
        {
          type: 'media',
          nodeType: 'media',
          mediaType: 'img',
          src: 'https://example.com/image.jpg',
          direction: 'ltr',
          line: 3
        }
      ]
    };

    const state = EditorStateImpl.create({ doc: ast });
    const out = state.doc.toAST();

    expect(out.version).toBe(ast.version);
    expect(out.content).toHaveLength(3);
    expect(out.content[0].nodeType).toBe('text');
    expect(out.content[1].nodeType).toBe('list');
    expect(out.content[2].nodeType).toBe('media');
  });
});
