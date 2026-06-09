# تحليل البنية الحالية (01-analysis.md)

## نظرة عامة على الـ Validator الحالي

نظام `@artoon/validator` مكتوب بطريقة مثيرة للاهتمام، فهو يجمع بين طريقتين للتحقق:

1. **Source String Regex Analysis:** الفحص المباشر للنص المصدري لاكتشاف الأخطاء النحوية والهيكلية (Syntax & Constraint).
2. **AST Tree Traversal:** السير داخل شجرة الـ AST للتحقق من الأخطاء الدلالية (Semantic).

## ملفات القواعد (Rules)

يحتوي مجلد `src/rules/` على:

- `syntax.ts`: يفحص أخطاء النص (مسافة بعد `::`، أقواس غير مغلقة). **لا يحتاج تعديل معماري.**
- `structure.ts`: يتأكد أن البلوكات مغلقة وأن القوائم لا تقفز مستويات. معظمها نصي (Regex) وقليل منها AST لتفقد الـ Compounds. **يحتاج تعديل طفيف ليتعرف على التغيرات في `type`.**
- `constraint.ts`: قواعد صارمة مثل منع تداخل المكونات أو القوائم السطرية (`Inline Lists`). يعتمد كلياً على فحص النص المصدري بـ Regex. **لا يحتاج أي تعديل.**
- `semantic.ts`: هنا يكمن العمل الحقيقي، فهو يتجول (Traverses) داخل الـ AST للتأكد من استخدام الـ Modifiers بشكل صحيح، وتوفر الخصائص المطلوبة. **يحتاج تعديل جوهري ليتعامل مع الـ V2 AST (نظام `type` بدلا من `nodeType` وتسوية الـ `ListItem`).**

## التحدي الأساسي مع V2.0

المشكلة الحقيقية في `semantic.ts` و `structure.ts` هي أن حلقة التكرار (Recursion) تعتمد على وجود خاصية `node.children` بتنسيقها القديم (تغليف بـ `ListNode`) أو تعتمد على `nodeType`.

يجب علينا:

1. تعديل `semantic.ts` ليعتمد `type` المعيار الجديد بدلا من `nodeType`.
2. تنظيف عمليات الـ Recursion للتعامل مع `ListItem.children` كمصفوفة فلات (Array).
3. تجنب الـ TS `readonly` Compile Errors أثناء الفحص.

---

# مقترح الحل لـ (02-v2-rules.md)

لن نقوم بتكسير النظام القديم بالكامل، بل سنجعله متوافقاً بطريقة (Isomorphic) تقبل كلا الإصدارين (Backward Compatibility).

**التعديلات المستهدفة:**
في ملف `src/rules/semantic.ts` و `src/rules/structure.ts`:

1. أينما يوجد:

```typescript
if (node.nodeType === 'text' || node.type === 'text')
```

الشرط يبدو مهيأ مسبقاً لاستقبال `type`، لكننا نحتاج للتأكد من أن تعريفات الـ Types (`src/types.ts`) تقبل ذلك!

1. معالجة `ListItem` المُسطّح:

```typescript
// القديم:
if (node.children && Array.isArray(node.children)) {
    node.children.forEach((c: any) => {
    if (c.node) checkNode(c.node); // كان V1 يحتوي على wrapper
    else checkNode(c);
    });
}

// الجديد (V2.0):
if (node.children && Array.isArray(node.children)) {
    // V2 ListItems هي Arrays مباشرة
    node.children.forEach(checkNode);
}
```

1. إصلاح `src/types.ts` ليستقبل الواجهات المحدثة من `@artoon/ast` (أو يعمل لها `Import` حقيقي بدلاً من إعادة كتابتها).
