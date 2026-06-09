# 📝 المهمة 3: الصرامة القصوى (Eliminate `any`)

## 🎯 الهدف

سد الثغرات الناتجة عن التفاف مترجم TypeScript في طبقة التحويل (Transformation Layer). حالياً يوجد استخدام مكثف لـ `any` في ملفات التحويل، مما يجردنا من قوة اكتشاف الأخطاء بوقت الترجمة (Compile Time).

## 📍 مكان التعديل

الملفات المعنية:

- `artoon-ast/src/transform/index.ts`
- ملف جديد لتعريف أنواع الـ Parser: `artoon-ast/src/transform/parser-types.ts`

## 🛠️ خطوات التنفيذ التقنية

### الخطوة 1: استخلاص أو إنشاء الـ Parser Interfaces

بدلاً من استقبال مخرجات Parser كـ `any`، يجب علينا استيراد النوع الصحيح `ParseResult` من `@artoon/parser` (شريطة نقل `transform` للمكان الصحيح للمهمة 1).
إذا لم يتم النقل، قم بإنشاء ملف منفصل `parser-types.ts` يصف بدقة بالغة ماهية مخرجات الـ Parser الخامس.

مثلاً:

```typescript
export interface RawParserTextNode {
  type: 'text';
  componentType: TextType;
  line: number;
  direction: 'rtl' | 'ltr';
  content: { text: string; inlines: any[] } | any[]; // تفادي any هنا قدر الإمكان!
}
//... وهكذا لبقية العُقد المنتجة من المُحلل الخام.
```

### الخطوة 2: تحديث توقيعات الدوال (Function Signatures)

قم بفتح `transform/index.ts` واستبدل أي توقيع دالة يحتوي على `any`.

*قبل:*

```typescript
function transformTextNode(node: any): TextNode { ... }
```

*بعد:*

```typescript
function transformTextNode(node: RawParserTextNode): TextNode { ... }
```

### الخطوة 3: التنقية والتنظيف (Refactoring `meta.fields`)

حاليًا، حقل الـ Meta يستخدم `meta: any`. قم بتعريف بنيته:

```typescript
interface RawParserMeta {
  type: 'block';
  blockName: 'meta';
  fields: Array<{ name: string; value: string; direction: Direction }>;
}
```

استخدم هذه الواجهة الصارمة في دالة `transformMeta`.

### الخطوة 4: تشغيل المدقق (Type Checker)

عند إزالة كل الـ `any`، قم بتشغيل أوامر التحقق:

```bash
npx tsc --noEmit
```

قم بحل أي تعارضات (Conflicts) تظهر نتيجة اكتشاف المترجم أن هناك أخطاء مخفية في كيفية إرسال/استقبال البيانات بين الدَوَال.

## 🧪 معايير القبول (Acceptance Criteria)

- [ ] البحث عن كلمة `any` داخل مجلد `transform` يظهر الصفر من النتائج!
- [ ] الـ TS Compiler يتأكد بشكل تام (100% Type Coverage) للبيانات الداخلة والخارجة في طبقة التحويل.
- [ ] لا يوجد استخدام لقاعدة `// @ts-ignore` لتهريب الأخطاء بشكل متعمد.
