# 📝 المهمة 2: حماية شجرة البيانات (Readonly AST)

## 🎯 الهدف

تطبيق مبدأ (Data Immutability) بجعل كافة واجهات TypeScript للقراءة فقط. هذا سيمكّن فريق التطوير من اكتشاف أي محاولة لتعديل الشجرة عن طريق الخطأ (عبر المحرر البصري أو الإضافات) أثناء كتابة الكود وقبل إطلاقه.

## 📍 مكان التعديل

الملف المعني: `artoon-ast/src/types.ts` ومجلد `artoon-ast/src/unified/`

## 🛠️ خطوات التنفيذ التقنية

### الخطوة 1: تعديل الـ Base Node

قم بتحويل خاصيات الـ Base Node الأساسية لتكون `readonly`:

```typescript
export interface BaseNode {
  readonly type: string;
  readonly nodeType?: string;
  readonly line: number;
  readonly direction: Direction;
  readonly id?: string;
}
```

### الخطوة 2: تعديل المكونات السطرية (Inline Content)

```typescript
export interface PlainText {
  readonly type: 'plain';
  readonly value: string;
}

export interface InlineComponent {
  readonly type: 'inline';
  readonly component?: InlineComponentType;
  readonly modifiers?: ReadonlyArray<Modifier>;
  readonly attributes: Readonly<Record<string, string>>;
  readonly value?: string;
}

export type InlineContent = PlainText | InlineComponent;
```

### الخطوة 3: تعديل كل واجهات العقد (Nodes)

افتح ملف الـ `types` وقم بالمرور يدوياً على كل من: (TextNode, SeparatorNode, ListNode, TableNode ... إلخ).

- حوّل أي خاصية إلى `readonly`.
- حوّل أي مصفوفة `[]` إلى `ReadonlyArray<T>`.
- حوّل الكائنات الداخلية إلى `Readonly<Record<string, T>>`.

مثال للمخرجات المتوقعة في `ListNode`:

```typescript
export interface ListNode extends BaseNode {
  readonly type: 'list';
  readonly listType: ListType;
  readonly items: ReadonlyArray<ListItem>;
}
```

### الخطوة 4: تحديث منشئي العقد (Node Builders)

نظراً لأننا منعنا التعديل (Mutation)، يجب علينا التأكد من أن دوال `create...Node` (في مجلد `nodes/index.ts`) تقوم بإنشاء كائنات تلتزم بهذه الأنواع، دون أي رسائل أخطاء من الـ TS Compiler.

## 🧪 معايير القبول (Acceptance Criteria)

- [ ] الـ Compiler يلقي خطأ واضح إذا حاولت كتابة `ast.direction = 'ltr'`.
- [ ] تم تطبيق `ReadonlyArray` بشكل شامل (لمنع استخدام دوال مثل `push` أو `pop` داخل مصفوفات المكونات).
- [ ] المحرر البصري `artoon-typer` يمكن بناؤه (Build) دون أخطاء (قد تظهر بعض التنبيهات نتيجة أخطاء برمجية قديمة في المحرر تعتمد على الـ Mutation ويجب إصلاحها بنسخ البيانات Deep Clone).
