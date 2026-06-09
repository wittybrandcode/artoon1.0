import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { DocumentImpl, EditorStateImpl } from '@artoon/state';
import { createRenderer, render, renderState } from '../src';

describe('State Compatibility', () => {
  test('render() accepts Document.toAST() output', () => {
    const source = '>.p:: مرحبا من الحالة';
    const ast = transform(parse(source));
    const stateDocAst = DocumentImpl.create(ast).toAST();

    const html = render(stateDocAst);
    expect(html).toContain('<p>مرحبا من الحالة</p>');
  });

  test('renderState() renders EditorState-like input', () => {
    const source = '<.p:: from editor state';
    const ast = transform(parse(source));
    const state = EditorStateImpl.create({ doc: ast });

    const html = renderState(state);
    expect(html).toContain('<p dir="ltr">from editor state</p>');
  });

  test('createRenderer().renderState() applies default options', () => {
    const source = '>.p:: نص';
    const ast = transform(parse(source));
    const state = EditorStateImpl.create({ doc: ast });

    const renderer = createRenderer({ defaultDirection: 'ltr' });
    const html = renderer.renderState(state);
    expect(html).toContain('<p dir="rtl">نص</p>');
  });
});
