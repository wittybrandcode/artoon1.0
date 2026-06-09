# تطبيق قواعد V2.0 الجديدة (02-v2-rules.md)

## الهدف

تحديث محرك التحقق (Validator Engine) والقواعد المرتبطة به ليعترف بنظام V2.0 بشكل كامل، مع الحفاظ على دعم ملفات V1.0 القديمة. هذا يضمن عدم تعطل أي مشاريع مستخدمين تعتمد على النسخة السابقة.

## الخطوات التنفيذية

### 1. ترقية نظام الأنواع (Type System Upgrade)

**الملف:** `src/types.ts`

- **التحدي:** الواجهات الحالية في הـ Validator مكتوبة يدوياً (Hardcoded) بخصائص V1.0 (مثل `nodeType` وإجبار `ListItem.children` أن يكون `ListNode`).
- **الحل:**
  - استيراد `ContentNode`, `ARTOONDocument`, `ListItem` مباشرة من حزمة `@artoon/ast` (الإصدار 2.0).
  - استخدام `Type Guards` (مثل `isTextNode`) المتوفرة في V2.0 بدلاً من فحص `node.nodeType` يدوياً.

### 2. التحديث المعماري للقواعد الدلالية (Semantic Rules)

**الملف:** `src/rules/semantic.ts`

- **الدالة المستهدفة:** `checkModifierApplicability` و `checkRequiredAttributes`.
- **التعديل:**
  - الدالة المعنية تقوم بـ `Traversal` (المرور عبر العقد).
  - يجب تغيير منطق السير داخل القوائم ليتعامل بسلاسة مع الـ Flat Arrays `ListItem[]` في V2، أو الـ `ListNode` المغلف في V1.
  - إيقاف أخطاء الـ TypeScript (عبر إعلام الملف أن المصفوفات هي `ReadonlyArray`).

### 3. التحديث المعماري للقواعد الهيكلية (Structure Rules)

**الملف:** `src/rules/structure.ts`

- **الدالة المستهدفة:** `checkEmptyCompounds`.
- **التعديل:**
  - الدالة تقوم حالياً بفحص `node.nodeType === 'compound'`.
  - سيتم التوسيع لتشمل `node.type === 'compound'`.
  - التأكد من أن التكرار (Recursion) يعمل لكل من الـ `Children` المُسطّحة والمُغلفة.

## النتيجة المتوقعة

عند اكتمال هذا الملف، يجب أن يقبل الـ Validator أي شجرة (AST) شرعية مصنّعة باستخدام `ARTOONBuilder` الخاص بنا في الإصدار 2.0 دون أي أخطاء من نوع "Missing required attribute" أو "Invalid structure".
