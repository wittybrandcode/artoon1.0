# @artoon/validator

> Validation engine for ARTOON documents.
>
> محرك التحقق من صحة مستندات ARTOON.

## التثبيت

```bash
npm install @artoon/validator
```

## الاستخدام

```typescript
import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { validate, isValid, validateStrict, formatReport } from '@artoon/validator';

const source = `>.t1:: عنوان
>.p:: فقرة مع [s:: نص مهم]`;

// تحليل المستند
const parseResult = parse(source);
const ast = transform(parseResult);

// التحقق الأساسي
const result = validate(ast, source);
console.log(result.valid);  // true/false
console.log(result.errors); // قائمة الأخطاء

// التحقق السريع
if (isValid(ast, source)) {
  console.log('المستند صحيح');
}

// التحقق الصارم (يرمي استثناء عند وجود أخطاء)
try {
  validateStrict(ast, source);
} catch (e) {
  console.error(e.message);
}

// تقرير مفصل
const report = formatReport(result);
console.log(report);
```

## خيارات التحقق

```typescript
const options = {
  strict: false,           // معاملة التحذيرات كأخطاء
  allowEmptyComponents: false,  // السماح بالمكونات الفارغة
  checkPhilosophy: true    // فحص انتهاكات الفلسفة
};

const result = validate(ast, source, options);
```

## فئات القواعد

### 1. قواعد الصياغة (Syntax)
- `SYN001`: مسافة مفقودة بعد `::`
- `SYN002`: قوس `[` غير مغلق
- `SYN003`: علامة اتجاه غير صالحة

### 2. قواعد البنية (Structure)
- `STR001`: بلوك غير مغلق
- `STR002`: اسم إغلاق بلوك غير مطابق
- `STR003`: عنصر قائمة يتيم
- `STR004`: قفز في مستوى التداخل
- `STR005`: مكون مركب فارغ

### 3. قواعد الدلالة (Semantic)
- `SEM001`: مُعدِّل على مكون غير نصي
- `SEM002`: سمة غير صالحة
- `SEM003`: سمة مطلوبة مفقودة
- `SEM004`: مكون غير معروف
- `SEM005`: مُعدِّل غير صالح

### 4. قواعد القيود (Constraint)
- `CON001`: قائمة داخل inline
- `CON002`: تداخل في المكونات الداخلية
- `CON003`: مكون فارغ

### 5. قواعد الفلسفة (Philosophy) - الأهم!
- `PHI001`: تسرب عرضي (presentation leak)
- `PHI002`: تسرب سلوكي (behavior leak)
- `PHI003`: انتهاك دلالي

## مستويات الخطورة

| المستوى | الوصف |
|---------|-------|
| `error` | خطأ يمنع صحة المستند |
| `warning` | تحذير لا يمنع الصحة |
| `philosophy` | انتهاك فلسفي - الأخطر! |

## نتيجة التحقق

```typescript
interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
  philosophyBreaches: ValidationError[];
  stats: {
    totalIssues: number;
    errorCount: number;
    warningCount: number;
    breachCount: number;
  };
}
```

## المُعدِّلات والمكونات

### المُعدِّلات الصالحة
`s`, `e`, `u`, `d`, `mark`, `sub`, `sup`

### المكونات التي تقبل المُعدِّلات
النصوص فقط: `p`, `t1-t6`, `q`, `pre`, `a`, `abbr`, `time`

### المكونات التي لا تقبل المُعدِّلات
الوسائط والكود: `img`, `audio`, `video`, `file`, `c`

## الكلمات المحظورة (فلسفياً)

### كلمات العرض
`color`, `font`, `size`, `style`, `class`, `css`, `background`, `border`, `margin`, `padding`, `width`, `height`, `display`, `position`

### كلمات السلوك
`onclick`, `onhover`, `onmouse`, `onkey`, `onfocus`, `onload`, `onsubmit`, `onchange`, `oninput`, `javascript:`, `href="#"`

## الترخيص

MIT
