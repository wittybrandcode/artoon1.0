import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { EditorStateImpl } from '@artoon/state';
import {
  validate,
  validateState,
  isValidState,
  validateStateStrict,
} from '../src/engine';

describe('State Compatibility', () => {
  test('validate() works with state document model via toAST()', () => {
    const source = '>.p:: محتوى صالح';
    const parsed = parse(source);
    const ast = transform(parsed);
    const state = EditorStateImpl.create({ doc: ast });

    const result = validate(state.doc.toAST(), source);
    expect(result.valid).toBe(true);
  });

  test('validateState() validates EditorState-like input', () => {
    const source = '>.p:: نص بـ color:red';
    const parsed = parse(source);
    const ast = transform(parsed);
    const state = EditorStateImpl.create({ doc: ast });

    const result = validateState(state, source);
    expect(result.valid).toBe(false);
    expect(result.philosophyBreaches.length).toBeGreaterThan(0);
  });

  test('isValidState() and validateStateStrict() follow strict behavior', () => {
    const source = '>.p:: نص بـ onclick="bad"';
    const parsed = parse(source);
    const ast = transform(parsed);
    const state = EditorStateImpl.create({ doc: ast });

    expect(isValidState(state, source)).toBe(false);
    expect(() => validateStateStrict(state, source)).toThrow();
  });
});
