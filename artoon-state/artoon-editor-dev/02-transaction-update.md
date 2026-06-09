# تحديث منطق المعاملات (02-transaction-update.md)

## الهدف (Objective)

التأكد من أن `Transaction.ts` والملفات المرتبطة به تعالج الـ AST بطريقة Immutable تماماً (دون إحداث Mutation على المصفوفات المقفلة بـ Readonly).

## الأخطاء البرمجية المرصودة (TypeScript Compile Errors)

بناءً على مخرجات بناء أداة `tsc` للحزمة، تم رصد 5 أخطاء رئيسية:

### الخطأ الأول والثاني: `src/state/Document.ts` (الأساس)

يشتكي המترجم من أن مصفوفة الـ `ast.content` محجوزة بـ Readonly، ولا يمكن تمريرها لمن يبحث عن مصفوفة قابلة للتعديل.

- **في السطر 23:** يقوم منشئ (Constructor) الوثيقة بحقن محتوى الـ AST.
- **في السطر 71:** محاولة الوصول لتفاصيل النص عبر دالة `resolvePos`.
- **الحل المقترح:** تغيير واجهة كلاس الـ `Document` و الـ `FragmentImpl` الداخلي ليقبل المصفوفات من نوع `readonly ContentNode[]`.

### الخطأ الثالث والرابع: `src/selection/Selection.ts` (المؤشرات)

- **في السطر 53:** `resolvePos` تتلقى `this._doc.ast.content`.
- **الحل المقترح:** توحيد نوع الإدخال في `resolvePos` (إذا كانت دالة مساعدة Utilities) ليقبل `readonly ContentNode[]`.

### الخطأ الخامس: `src/transaction/Transaction.ts` (التعديلات)

- **في السطر 134:** `const textNodeTyped = textNode as { content: any[] };`
التعديل (Typecast) هنا يحاول كسر الـ Types القوية وجعل المصفوفة `any[]` (قابلة للتعديل)، وهذا يتعارض بمسار تصادمي مع V2.0 AST.
- **الحل المقترح:** بدلاً من كسر النوع وحقن عناصر في `any[]`، يجب إنشاء نسخة جديدة `[...textNode.content]` وإضافة التعديلات عليها، ثم صنع كائن (Node) جديد وإدخاله في الشجرة كـ Copy-on-write.

## الخطة التنفيذية (Execution Plan)

بمجرد الموافقة:

1. الدخول لمسار `src/state/` وتعديل تعريفات الـ Types.
2. الدخول لملف `src/utils/resolvePos.ts` (إن وُجد) وتأمين الواجهة بـ `readonly`.
3. الدخول لـ `Transaction.ts` واستبدال أي `Mutation` (مثل `.push()` أو `.splice()`) بعمليات `Spread Operator` و `.slice()` لإرجاع نسخة جديدة بديلة.
4. إجراء Test شامل للحزمة المستقلة قبل دمجها.
