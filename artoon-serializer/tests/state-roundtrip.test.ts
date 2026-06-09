import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { EditorStateImpl } from '@artoon/state';
import { serializeState } from '../src';

describe('State Roundtrip', () => {
  test('parse -> state -> serialize -> parse preserves structure', () => {
    const source = `>.t1:: عنوان

>.p:: فقرة مع [s:: نص] و [a:: https://example.com; رابط]

>.ul::
li:: عنصر أول
li:: عنصر ثاني`;

    const parsed1 = parse(source);
    expect(parsed1.errors).toHaveLength(0);
    const ast1 = transform(parsed1);

    const state = EditorStateImpl.create({ doc: ast1 });
    const serialized = serializeState(state, { blankLinesBetween: false });

    const parsed2 = parse(serialized);
    expect(parsed2.errors).toHaveLength(0);
    const ast2 = transform(parsed2);

    expect(ast2.content.length).toBe(ast1.content.length);
    expect(ast2.content[0].nodeType).toBe(ast1.content[0].nodeType);
    expect(ast2.content[1].nodeType).toBe(ast1.content[1].nodeType);
    expect(ast2.content[2].nodeType).toBe(ast1.content[2].nodeType);
  });
});
