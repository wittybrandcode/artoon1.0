# مزامنة مخطط البيانات (03-schema-sync.md)

## الهدف

تحسين ومزامنة مخطط التحقق الفعلي (`Source Parsing` أو `Types`) مع الواجهات الجديدة للـ V2.0 والتأكد من توافق المخرجات وتحديث الـ Documentation الداخلية للحزمة.

## الخطوات التنفيذية

### 1. استيراد الأنواع الموحدة (Unified Types)

**الملف:** `src/types.ts`

- **التحدي:** الواجهات حالياً تُعرّف محلياً داخل الـ Validator بمعزل عن الأنواع المركزية في `artoon-ast`.
- **الحل:**
  - تدمير التعريفات اليدوية (`TextNode`, `ListNode` الخ) من `src/types.ts` الخاص بالـ Validator.
  - استيراد `* from '@artoon/ast'` للاستفادة من واجهات الـ `Readonly<T>` الجديدة بشكل مباشر.
  - تعريف واجهات فرعية إضافية **فقط** إذا كانت تخص الـ Syntax Text Validation.

### 2. تنظيف الـ "Magic Strings"

- في النظام الحالي نتحقق من:
  `if (node.nodeType === 'text')`
- يجب تغييره ليستخدم دوال الـ Compatibility من V2.0 أو التحقق المباشر من النوع (Type Discriminant):
  `if (node.type === 'text' || node.nodeType === 'text')`
- لكن الأفضل هو الاعتماد على دوال الفحص (Type Guards) التي بنيناها: `isTextNode(node)`، `isListNode(node)`.

## النتيجة المتوقعة

بعد الانتهاء من هذه الخطوة، سيكون نظام الـ Types داخل المُدقق (Validator) هو نفس النظام الموجود في الـ AST، مما يقضي على أي مشكلات تتعلق بتعارض النسخ (Version/Type mismatch) ويسمح باكتشاف الأخطاء مبكراً أثناء بناء البرنامج (Compile Time).
