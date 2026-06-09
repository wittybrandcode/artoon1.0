# 📝 المهمة 1: إزالة تكرار منطق تحليل الجداول (DRY)

## 🎯 الهدف

توحيد مصدر تحليل المكونات السطرية (Inline Parsing) لمنع تناقض السلوك. حالياً `artoon-ast` يعيد اختراع عجلة التحليل داخل الجداول، مما يجعله عرضة للأخطاء إذا تم تحديث لغة ARTOON في المستقبل.

## 📍 مكان التعديل

الملف المعني: `artoon-ast/src/transform/index.ts`
الدوال المعنية: `parseTableCellContent` و `parseInlineTokenForTable`

## 🛠️ خطوات التنفيذ التقنية

### الخطوة 1: استيراد المحلل الأصلي

أضف الاستيراد التالي في أعلى الملف (أو استخدام حقن التبعيات إذا كان هناك قلق بخصوص التبعية الدائرية Circular Dependency):

```typescript
import { parseInlineContent } from '@artoon/parser';
// قد تحتاج للتأكد من توافر هذا التصدير في حزمة @artoon/parser/src/inline/index.ts
```

*ملاحظة هامة:* إذا كانت حزمة `artoon-ast` لا يمكنها استيراد `artoon-parser` بسبب التبعية الدائرية (لأن Parser يعتمد على AST)، فيجب علينا **نقل** منطق `transform` بأكمله ليكون داخل `artoon-parser` بدلاً من `artoon-ast`. (وهذا هو الحل المعماري الأصح).

### الخطوة 2 (في حال نقل `transform`)

1. قم بنقل المجلد `artoon-ast/src/transform/` بكامله إلى `artoon-parser/src/ast/transform/`.
2. قم بتحديث كافة مسارات الاستيراد (Imports) للملفات المنقولة.
3. قم بمسح مجلد الـ `transform` من داخل الـ `ast`.

### الخطوة 3: تعديل كود `parseTableCellContent`

قم بحذف الكود الذي يحلل الأقواس المربعة يدوياً `[...]` واستبدله باستدعاء أداة التحليل الرسمية:

```typescript
function parseTableCellContent(cellText: string): InlineContent[] {
  // لا تعد تخترع العجلة! استخدم المحلل الأصلي الذي يفهم كافة حالات الهروب (escaping)
  // والمعدلات المتداخلة.
  const tokens = tokenizeLine(cellText); 
  return transformInlineContent(parseInlineContent(tokens));
}
```

### الخطوة 4: التخلص من الكود الميت

قم بمسح الدالة `parseInlineTokenForTable` بالكامل والتي تقع تحت الدالة السابقة، حيث لم يعد لها أي حاجة تقنياً.

## 🧪 معايير القبول (Acceptance Criteria)

- [ ] مجلد `transform` موجود في مكانه المعماري الصحيح (في Parser).
- [ ] الدالة السابقة `parseInlineTokenForTable` لم تعد موجودة في الـ Codebase.
- [ ] تشغيل اختبارات الوحدة (Unit tests) لحزمة Parser تعطي العلامة الخضراء بنسبة 100%.
- [ ] الجداول تستطيع الآن دعم حالات نادرة (Edge cases) كان يعجز المحلل القديم الساذج عن فهمها.
