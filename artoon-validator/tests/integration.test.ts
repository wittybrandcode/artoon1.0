// ARTOON Validator Integration Tests

import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import {
  validate,
  isValid,
  validateStrict,
  formatReport,
  formatReportJSON,
  addRule,
  removeRule,
  clearRules,
  listRules
} from '../src/engine';

describe('Validation Engine', () => {
  
  test('valid document', () => {
    const source = `>.t1:: عنوان
>.p:: فقرة صحيحة`;
    
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    
    expect(validation.valid).toBe(true);
    expect(validation.stats.errorCount).toBe(0);
  });
  
  test('document with syntax error', () => {
    const source = '>.p::بدون مسافة';
    
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    
    expect(validation.valid).toBe(false);
    expect(validation.errors.length).toBeGreaterThan(0);
  });
  
  test('document with philosophy breach', () => {
    const source = '>.p:: نص بـ color:red';
    
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    
    expect(validation.valid).toBe(false);
    expect(validation.philosophyBreaches.length).toBeGreaterThan(0);
  });
  
  test('isValid helper', () => {
    const validSource = '>.p:: نص صحيح';
    const invalidSource = '>.p:: نص بـ onclick="bad"';
    
    const validResult = parse(validSource);
    const invalidResult = parse(invalidSource);
    
    expect(isValid(transform(validResult), validSource)).toBe(true);
    expect(isValid(transform(invalidResult), invalidSource)).toBe(false);
  });
  
  test('validateStrict throws on error', () => {
    const source = '>.p:: نص بـ style="bad"';
    const result = parse(source);
    const ast = transform(result);
    
    expect(() => validateStrict(ast, source)).toThrow();
  });
  
  test('strict mode treats warnings as errors', () => {
    const source = '>.p:: ';  // Empty component (warning)
    const result = parse(source);
    const ast = transform(result);
    
    const normalValidation = validate(ast, source);
    const strictValidation = validate(ast, source, { strict: true });
    
    // In strict mode, warnings become errors
    expect(strictValidation.errors.length).toBeGreaterThanOrEqual(
      normalValidation.warnings.length
    );
  });
  
});

describe('Format Report', () => {
  
  test('valid document report', () => {
    const source = '>.p:: نص صحيح';
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    const report = formatReport(validation);
    
    expect(report).toContain('Document is valid');
  });
  
  test('invalid document report', () => {
    const source = '>.p:: نص بـ onclick="bad"';
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    const report = formatReport(validation);
    
    expect(report).toContain('Document has issues');
    expect(report).toContain('PHILOSOPHY BREACHES');
  });

  test('json report for CI contains stats and issue groups', () => {
    const source = '>.p:: نص بـ onclick=\"bad\"';
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    const report = formatReportJSON(validation);
    const parsed = JSON.parse(report);

    expect(parsed).toHaveProperty('valid');
    expect(parsed).toHaveProperty('stats');
    expect(parsed).toHaveProperty('issues.errors');
    expect(parsed).toHaveProperty('issues.warnings');
    expect(parsed).toHaveProperty('issues.philosophyBreaches');
  });
  
});

describe('Custom Rules API', () => {
  afterEach(() => {
    clearRules();
  });

  test('addRule applies and removeRule disables it', () => {
    addRule({
      id: 'CUSTOM001',
      category: 'semantic',
      severity: 'warning',
      check: () => [
        {
          code: 'CUSTOM001',
          category: 'semantic',
          severity: 'warning',
          line: 1,
          what: 'Custom warning',
          why: 'Custom rule fired'
        }
      ]
    });

    expect(listRules()).toContain('CUSTOM001');

    const source = '>.p:: نص صحيح';
    const ast = transform(parse(source));
    const withRule = validate(ast, source);
    expect(withRule.warnings.some(w => w.code === 'CUSTOM001')).toBe(true);

    removeRule('CUSTOM001');
    expect(listRules()).not.toContain('CUSTOM001');

    const withoutRule = validate(ast, source);
    expect(withoutRule.warnings.some(w => w.code === 'CUSTOM001')).toBe(false);
  });
});

describe('Complete Document Validation', () => {
  
  test('validate complete valid document', () => {
    const source = `<meta>.
>.-:title: مستند صحيح
>.-:author: كاتب
.<meta>

>.t1:: العنوان الرئيسي

>.p:: فقرة مع [s:: نص مهم] و [a:: https://example.com; رابط].

>.ul::
li:: عنصر أول
li:: عنصر ثاني
-li:: فرعي

>.table::
th:: العمود 1; العمود 2
tr:: قيمة 1; قيمة 2

<code:js>.
const x = 1;
console.log(x);
.<code>`;
    
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    
    expect(validation.valid).toBe(true);
    expect(validation.stats.errorCount).toBe(0);
    expect(validation.stats.breachCount).toBe(0);
  });
  
  test('validate document with multiple issues', () => {
    const source = `>.p::بدون مسافة
>.p:: نص بـ color:red
>.p:: نص مع [s+img:: photo.jpg]
>.p:: نص مع [li:: قائمة]`;
    
    const result = parse(source);
    const ast = transform(result);
    const validation = validate(ast, source);
    
    expect(validation.valid).toBe(false);
    expect(validation.stats.totalIssues).toBeGreaterThan(3);
  });
  
});

describe('Options', () => {
  
  test('allowEmptyComponents option', () => {
    const source = '>.p:: ';
    const result = parse(source);
    const ast = transform(result);
    
    const withoutOption = validate(ast, source);
    const withOption = validate(ast, source, { allowEmptyComponents: true });
    
    // With option, empty component warning should be suppressed
    expect(withOption.warnings.length).toBeLessThanOrEqual(withoutOption.warnings.length);
  });
  
  test('checkPhilosophy option', () => {
    const source = '>.p:: نص بـ color:red';
    const result = parse(source);
    const ast = transform(result);
    
    const withCheck = validate(ast, source, { checkPhilosophy: true });
    const withoutCheck = validate(ast, source, { checkPhilosophy: false });
    
    expect(withCheck.philosophyBreaches.length).toBeGreaterThan(0);
    expect(withoutCheck.philosophyBreaches.length).toBe(0);
  });
  
});
