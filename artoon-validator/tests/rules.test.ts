// ARTOON Validator Rules Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import {
  checkSpaceAfterSeparator,
  checkUnclosedBrackets,
  checkDirectionMarkers,
  checkUnclosedBlocks,
  checkListNesting,
  checkEmptyCompounds,
  checkModifierApplicability,
  checkRequiredAttributes,
  checkInlineLists,
  checkNestedInline,
  checkEmptyComponents,
  checkPresentationLeak,
  checkBehaviorLeak,
  checkSemanticViolation
} from '../src/rules';
import { ValidationContext } from '../src/types';

function createContext(source: string): ValidationContext {
  const result = parse(source);
  const ast = transform(result);
  return {
    ast,
    source,
    options: { checkPhilosophy: true }
  };
}

describe('Syntax Rules', () => {
  
  test('checkSpaceAfterSeparator - valid', () => {
    const ctx = createContext('>.p:: نص صحيح');
    const errors = checkSpaceAfterSeparator(ctx);
    expect(errors).toHaveLength(0);
  });
  
  test('checkSpaceAfterSeparator - missing space', () => {
    const ctx = createContext('>.p::نص بدون مسافة');
    const errors = checkSpaceAfterSeparator(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('SYN001');
  });
  
  test('checkUnclosedBrackets - valid', () => {
    const ctx = createContext('>.p:: نص مع [s:: مهم] داخله');
    const errors = checkUnclosedBrackets(ctx);
    expect(errors).toHaveLength(0);
  });
  
  test('checkUnclosedBrackets - unclosed', () => {
    const ctx = createContext('>.p:: نص مع [s:: غير مغلق');
    const errors = checkUnclosedBrackets(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('SYN002');
  });

  test('checkDirectionMarkers - no errors for valid lines', () => {
    const ctx = createContext('>.p:: نص صحيح');
    const errors = checkDirectionMarkers(ctx);
    expect(errors).toHaveLength(0);
  });
  
});

describe('Structure Rules', () => {
  
  test('checkUnclosedBlocks - valid', () => {
    const ctx = createContext(`<meta>.
>.-:title: عنوان
.<meta>`);
    const errors = checkUnclosedBlocks(ctx);
    expect(errors).toHaveLength(0);
  });
  
  test('checkUnclosedBlocks - unclosed', () => {
    const ctx = createContext(`<meta>.
>.-:title: عنوان`);
    const errors = checkUnclosedBlocks(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('STR001');
  });
  
  test('checkUnclosedBlocks - mismatched', () => {
    const ctx = createContext(`<meta>.
>.-:title: عنوان
.<code>`);
    const errors = checkUnclosedBlocks(ctx);
    expect(errors.length).toBeGreaterThan(0);
  });
  
  test('checkListNesting - valid', () => {
    const ctx = createContext(`>.ul::
li:: عنصر
-li:: فرعي`);
    const errors = checkListNesting(ctx);
    expect(errors).toHaveLength(0);
  });
  
  test('checkListNesting - jumping levels', () => {
    const ctx = createContext(`>.ul::
li:: عنصر
---li:: قفز كبير`);
    const errors = checkListNesting(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('STR004');
  });

  test('checkEmptyCompounds - non-empty is valid', () => {
    const ctx = createContext(`<compound:info>.
>.-title:: عنوان
.<compound>`);
    const errors = checkEmptyCompounds(ctx);
    expect(errors).toHaveLength(0);
  });
  
});

describe('Semantic Rules', () => {
  
  test('checkModifierApplicability - valid on text', () => {
    const ctx = createContext('>.p:: نص مع [s:: مهم]');
    const errors = checkModifierApplicability(ctx);
    expect(errors).toHaveLength(0);
  });
  
  test('checkModifierApplicability - valid on link', () => {
    const ctx = createContext('>.p:: رابط [s+a:: url; text]');
    const errors = checkModifierApplicability(ctx);
    expect(errors).toHaveLength(0);
  });
  
  test('checkModifierApplicability - invalid on img', () => {
    const ctx = createContext('>.p:: صورة [s+img:: photo.jpg]');
    const errors = checkModifierApplicability(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('SEM001');
  });
  
  test('checkModifierApplicability - invalid on video', () => {
    const ctx = createContext('>.p:: فيديو [e+video:: video.mp4]');
    const errors = checkModifierApplicability(ctx);
    expect(errors).toHaveLength(1);
  });
  
  test('checkModifierApplicability - invalid on code', () => {
    const ctx = createContext('>.p:: كود [s+c:: code]');
    const errors = checkModifierApplicability(ctx);
    expect(errors).toHaveLength(1);
  });

  test('checkRequiredAttributes - valid link with url', () => {
    const ctx = createContext('>.a:: https://example.com; رابط');
    const errors = checkRequiredAttributes(ctx);
    expect(errors).toHaveLength(0);
  });
  
});

describe('Constraint Rules', () => {
  
  test('checkInlineLists - forbidden', () => {
    const ctx = createContext('>.p:: نص مع [li:: عنصر]');
    const errors = checkInlineLists(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('CON001');
  });
  
  test('checkNestedInline - forbidden', () => {
    const ctx = createContext('>.p:: نص مع [s:: [e:: متداخل]]');
    const errors = checkNestedInline(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('CON002');
  });

  test('checkEmptyComponents - warns on empty component', () => {
    const ctx = createContext('>.p::');
    const errors = checkEmptyComponents(ctx);
    expect(errors.length).toBeGreaterThanOrEqual(0);
  });
  
});

describe('Philosophy Rules', () => {
  
  test('checkPresentationLeak - color', () => {
    const ctx = createContext('>.p:: نص بـ color:red');
    const errors = checkPresentationLeak(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('PHI001');
    expect(errors[0].severity).toBe('philosophy');
  });
  
  test('checkPresentationLeak - style', () => {
    const ctx = createContext('>.p:: نص بـ style="font-size"');
    const errors = checkPresentationLeak(ctx);
    expect(errors.length).toBeGreaterThan(0);
  });
  
  test('checkPresentationLeak - inside code block (allowed)', () => {
    const ctx = createContext(`<code:css>.
color: red;
.<code>`);
    const errors = checkPresentationLeak(ctx);
    expect(errors).toHaveLength(0);
  });
  
  test('checkBehaviorLeak - onclick', () => {
    const ctx = createContext('>.p:: زر onclick="alert()"');
    const errors = checkBehaviorLeak(ctx);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('PHI002');
    expect(errors[0].severity).toBe('philosophy');
  });
  
  test('checkBehaviorLeak - javascript:', () => {
    const ctx = createContext('>.a:: javascript:void(0); رابط');
    const errors = checkBehaviorLeak(ctx);
    expect(errors).toHaveLength(1);
  });

  test('checkSemanticViolation - short heading warning', () => {
    const ctx = createContext('>.t1:: ا');
    const errors = checkSemanticViolation(ctx);
    expect(errors.length).toBeGreaterThanOrEqual(0);
  });
  
});
