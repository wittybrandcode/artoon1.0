# 📝 المهمة 4: بناء محرك الإنشاء المتسلسل (Fluent Builder API)

## 🎯 الهدف

توفير Class أنيق واحترافي يتيح للمبرمجين الآخرين إنشاء مستندات ARTOON بكتابة كود نظيف ومتسلسل يشبه اللغة الإنجليزية (Chainable Methods)، بعيداً عن الغوص في تعقيدات إنشاء الـ JSON الهيكلي أو كائنات الواجهات المعقدة.

## 📍 مكان التعديل

الملفات المعنية:

- إنشاء ملف جديد: `artoon-ast/src/builder/ARTOONBuilder.ts`
- إنشاء ملف جديد: `artoon-ast/src/builder/index.ts`
- تحديث التصديرات: `artoon-ast/src/index.ts`

## 🛠️ خطوات التنفيذ التقنية

### الخطوة 1: تصميم المحرك الكلي (The Core Builder)

قم ببرمجة فئة (Class) تحافظ على اتجاه المستند وسطور المحتوى داخلياً (Stateful):

```typescript
import { ContentNode, DocumentMeta, Direction, ARTOONDocument } from '../types';

export class ARTOONBuilder {
  private content: ContentNode[] = [];
  private metaInfo?: DocumentMeta;
  private currentDir: Direction = 'rtl';
  private lineCounter = 1;

  constructor(defaultDirection: Direction = 'rtl') {
    this.currentDir = defaultDirection;
  }

  // السماح بتغيير الاتجاه
  public ltr(): this { this.currentDir = 'ltr'; return this; }
  public rtl(): this { this.currentDir = 'rtl'; return this; }
  
  // دالة تصدير المستند
  public build(): ARTOONDocument {
    return {
      version: '2.0',
      meta: this.metaInfo,
      content: this.content
    };
  }
}
```

### الخطوة 2: إضافة دوال بناء المكونات الأساسية (Node Methods)

كل دالة من هذه ستعيد الكائن `this` للاستمرار بالتسلسل (Chaining).

```typescript
  // داخل الكلاس ARTOONBuilder:
  
  public addMeta(meta: DocumentMeta): this {
    this.metaInfo = meta;
    return this;
  }

  public paragraph(text: string): this {
    // استخدم `createTextNode` و `createPlainText`
    const node = createTextNode('p', [createPlainText(text)], this.currentDir, this.lineCounter++);
    this.content.push(node);
    return this;
  }

  public heading(level: 1|2|3|4|5|6, text: string): this {
    const node = createTextNode(`t${level}` as any, [createPlainText(text)], this.currentDir, this.lineCounter++);
    this.content.push(node);
    return this;
  }
  
  public separator(type: 'hr' | 'br' | 'wbr' = 'hr'): this {
    const node = createSeparatorNode([type], this.currentDir, this.lineCounter++);
    this.content.push(node);
    return this;
  }
```

### الخطوة 3: بناء دوال الجداول والقوائم (Complex Nodes Builder)

لأن القوائم والجداول تحتاج محتويات متداخلة، يفضل تمرير رد نداء (Callback) أو مصفوفة نصوص.

```typescript
  public list(type: 'ul'|'ol', items: string[]): this {
     // نقوم ببناء الـ ListNode عبر المرور على الـ items ...
     return this;
  }
```

### الخطوة 4: تصدير المحرك (Exporting)

في `artoon-ast/src/index.ts`، قم بتصدير المُنشئ بوضوح:

```typescript
export { ARTOONBuilder } from './builder';
```

## 🧪 معايير القبول (Acceptance Criteria)

- [ ] يمكن للمطور إنشاء مستند كامل مع Meta و 3 فقرات وفاصل بصياغة برمجية تقل عن 10 أسطر متسلسلة بشكل نظيف.
- [ ] الكود المصدّر من دالة `.build()` يجب أن يتوافق شكلياً وكلياً مع واجهة `ARTOONDocument`.
- [ ] إنشاء حزمة مصغرة من اختبارات الوحدة (Unit tests) تتأكد من سلامة عدّاد الأسطر (Line counter) و تبديل الاتجاه `ltr()` و `rtl()`.
