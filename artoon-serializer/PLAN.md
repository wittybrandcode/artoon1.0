# @artoon/serializer — خطة البناء

> تحويل AST إلى نص ARTOON

---

## 1. الهدف

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   AST (شجرة)  ──────────────────────►  نص ARTOON                       │
│                                                                         │
│   {                                    >.t1:: عنوان                     │
│     nodeType: 'text',                  >.p:: فقرة أولى                  │
│     textType: 't1',          ───►      >.p:: فقرة ثانية                 │
│     content: [...]                                                      │
│   }                                                                     │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 2. المتطلبات

### 2.1 Round-trip Fidelity

```typescript
// المعادلة الذهبية
const original = '>.p:: مرحباً بالعالم';
const ast = parse(original);
const serialized = serialize(ast);
const reparsed = parse(serialized);

// يجب أن يتحقق:
deepEqual(ast, reparsed) === true
```

### 2.2 الدوال المطلوبة

```typescript
// الدالة الرئيسية
serialize(doc: ARTOONDocument, options?: SerializeOptions): string

// دوال مساعدة
serializeNode(node: ContentNode): string
serializeInline(content: InlineContent[]): string
```

### 2.3 الخيارات

```typescript
interface SerializeOptions {
  // تنسيق
  lineEnding?: '\n' | '\r\n';        // نهاية السطر
  blankLinesBetween?: boolean;        // أسطر فارغة بين العناصر
  
  // الحفاظ على المعلومات
  preserveComments?: boolean;         // الحفاظ على التعليقات
}
```

### 2.4 مبدأ الاتجاه في ARTOON

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         مبدأ الاتجاه في ARTOON                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  الاتجاه يُحدد على مستوى العنصر (الفقرة/السطر):                        │
│  ─────────────────────────────────────────────                         │
│  ✓ كل سطر/فقرة يحدد اتجاه العنصر الحاوي (container direction)         │
│  ✓ > = RTL container                                                   │
│  ✓ < = LTR container                                                   │
│                                                                         │
│  المحتوى المختلط (Mixed Content):                                      │
│  ─────────────────────────────────                                     │
│  ✓ الفقرة قد تحتوي خلط بين لغات مختلفة                                 │
│  ✓ الاتجاه في أول السطر يحدد اتجاه الحاوي فقط                          │
│  ✓ الكلمات الأجنبية تندمج تلقائياً (Unicode BiDi algorithm)            │
│                                                                         │
│  مثال:                                                                  │
│  >.p:: هذه جملة عربية تحتوي على كلمة English وتستمر                    │
│        ↑                                                               │
│        الحاوي RTL، لكن "English" تُعرض LTR تلقائياً                     │
│                                                                         │
│  <.p:: This is English with كلمة عربية inside                          │
│        ↑                                                               │
│        الحاوي LTR، لكن "كلمة عربية" تُعرض RTL تلقائياً                  │
│                                                                         │
│  الخلاصة:                                                               │
│  ─────────                                                             │
│  ✓ الاتجاه = اتجاه الحاوي (container)                                  │
│  ✓ المحتوى الداخلي يتبع Unicode BiDi                                   │
│  ✓ لا تأثير على اللغات المختلطة داخل النص                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**للـ Serializer:** يقرأ `node.direction` ويكتب `>` أو `<` — المحتوى يبقى كما هو.

---

## 3. تسلسل كل نوع

### 3.1 Text Nodes

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
TextNode {                             >.p:: محتوى الفقرة
  nodeType: 'text',
  textType: 'p',
  direction: 'rtl',
  content: [{ type: 'plain', value: 'محتوى الفقرة' }]
}

TextNode {                             <.t1:: Heading
  nodeType: 'text',
  textType: 't1',
  direction: 'ltr',
  content: [{ type: 'plain', value: 'Heading' }]
}

TextNode {                             >.q:: نص مقتبس
  nodeType: 'text',
  textType: 'q',
  ...
}

TextNode {                             >.pre:: نص محفوظ التنسيق
  nodeType: 'text',
  textType: 'pre',
  ...
}
```

**القاعدة:**
```
{direction}.{textType}:: {content}

حيث:
- direction: > للـ RTL، < للـ LTR
- textType: p, t1-t6, q, pre
- :: ثم مسافة ثم المحتوى
```

**أنواع النص (من AST):**
- `p` — فقرة
- `t1` إلى `t6` — عناوين
- `q` — اقتباس (blockquote)
- `pre` — نص محفوظ التنسيق

### 3.2 Inline Content

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
[                                      نص عادي مع [s:: كلمة مهمة] داخله
  { type: 'plain', value: 'نص عادي مع ' },
  { type: 'inline', modifiers: ['s'], value: 'كلمة مهمة' },
  { type: 'plain', value: ' داخله' }
]

[                                      زر [a:: https://example.com; الرابط]
  { type: 'plain', value: 'زر ' },
  { type: 'inline', component: 'a', 
    attributes: { url: 'https://example.com', text: 'الرابط' } }
]

[                                      [s+e:: مهم ومؤكد]
  { type: 'inline', modifiers: ['s', 'e'], value: 'مهم ومؤكد' }
]

[                                      [s+time:: 2026-01-05; تاريخ مهم]
  { type: 'inline', modifiers: ['s'], component: 'time',
    attributes: { datetime: '2026-01-05', display: 'تاريخ مهم' } }
]
```

**المتحكمات (Modifiers):**
| الرمز | المعنى |
|-------|--------|
| `s` | أهمية قوية (strong) |
| `e` | تأكيد (emphasis) |
| `u` | تسطير |
| `d` | شطب (deleted) |
| `mark` | تمييز/تظليل |
| `sub` | نص منخفض |
| `sup` | نص مرتفع |

**الأنواع التي تقبل modifiers:**
- `time`, `abbr`, `a`

**الأنواع التي لا تقبل modifiers:**
- `img`, `audio`, `video`, `file`, `c`

**القواعد:**
```
Plain text     →  النص كما هو
Modifier فقط   →  [mod:: value]
Modifiers متعددة → [mod1+mod2:: value]
Modifier+Type  →  [mod+type:: attrs]
Component فقط  →  [type:: attrs]
```

**ترتيب القيم (من Core Invariants):**
| النوع | الترتيب |
|-------|---------|
| `a` | url; text |
| `img` | path; alt; title |
| `video` | path; title |
| `audio` | path; title |
| `file` | path; label |
| `time` | ISO; display |
| `abbr` | short; full |
| `c` | code; lang |

### 3.3 Lists

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
ListNode {                             >.ul::
  listType: 'ul',                      li:: عنصر أول
  items: [                             li:: عنصر ثاني
    { itemType: 'li', content: [...] },  -li:: فرعي
    { itemType: 'li', content: [...],    li:: عنصر ثالث
      children: ListNode {...} },
    { itemType: 'li', content: [...] }
  ]
}
```

**القواعد:**
```
List container  →  {dir}.{listType}::
List item       →  {depth}{itemType}:: {content}
Nested depth    →  - prefix per level
```

### 3.4 Tables

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
TableNode {                            >.table::
  headers: { cells: [...] },           th:: العمود 1; العمود 2
  rows: [                              tr:: قيمة 1; قيمة 2
    { cells: [...] },                  tr:: قيمة 3; قيمة 4
    { cells: [...] }
  ]
}
```

**القواعد:**
```
Table start  →  {dir}.table::
Header row   →  th:: cell1; cell2; ...
Data row     →  tr:: cell1; cell2; ...
```

### 3.5 Blocks

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
BlockNode {                            <code:js>.
  blockName: 'code',                   const x = 1;
  language: 'js',                      console.log(x);
  content: 'const x = 1;\n...'         .<code>
}

BlockNode {                            <meta>.
  blockName: 'meta',                   >.-:title: عنوان
  fields: [                            >.-:author: المؤلف
    { name: 'title', value: 'عنوان' }, .<meta>
    { name: 'author', value: 'المؤلف' }
  ]
}

BlockNode {                            <profile>.
  blockName: 'profile',                >.-:location: algeria
  fields: [...],                       >.p:: أحمد محمد
  content: '>.p:: أحمد محمد'           .<profile>
}
```

**القواعد:**
```
Block start   →  <{name}>.  أو  <{name}:{lang}>.
Block end     →  .<{name}>
Hidden field  →  >.-:{field}: {value}
Code content  →  كما هو (raw)
Other content →  تسلسل عادي
```

### 3.6 Compound (figure, details)

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
CompoundNode {                         >.figure::
  compoundType: 'figure',              >.-img:: photo.jpg; وصف
  children: [                          >.-caption:: تعليق
    { role: 'content', node: MediaNode },
    { role: 'caption', node: TextNode }
  ]
}

CompoundNode {                         >.details:: ملخص
  compoundType: 'details',             >.p:: المحتوى المخفي
  children: [
    { role: 'summary', node: TextNode },
    { role: 'content', node: TextNode }
  ]
}
```

### 3.7 Separators

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
SeparatorNode {                        >.br
  separators: ['br']
}

SeparatorNode {                        >.hr
  separators: ['hr']
}

SeparatorNode {                        >.wbr
  separators: ['wbr']
}

SeparatorNode {                        >.br;hr;br
  separators: ['br', 'hr', 'br']
}
```

**ملاحظة مهمة:** الفواصل لا تحتاج `::` لأنها بدون محتوى.

**الأنواع (من AST):**
- `br` — سطر جديد
- `hr` — فاصل أفقي
- `wbr` — نقطة كسر كلمة

### 3.8 Comments

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
CommentNode {                          >.::: هذا تعليق
  content: 'هذا تعليق'
}
```

### 3.9 Media

```
AST                                    ARTOON
───────────────────────────────────────────────────────────────
MediaNode {                            >.img:: photo.jpg; وصف; عنوان
  mediaType: 'img',
  src: 'photo.jpg',
  alt: 'وصف',
  title: 'عنوان'
}

MediaNode {                            >.video:: video.mp4; عنوان
  mediaType: 'video',
  src: 'video.mp4',
  title: 'عنوان'
}
```

---

## 4. البنية المقترحة

```
artoon-serializer/
├── src/
│   ├── index.ts              # نقطة الدخول + serialize()
│   ├── types.ts              # SerializeOptions
│   ├── nodes/
│   │   ├── text.ts           # serializeText()
│   │   ├── list.ts           # serializeList()
│   │   ├── table.ts          # serializeTable()
│   │   ├── block.ts          # serializeBlock()
│   │   ├── compound.ts       # serializeCompound()
│   │   ├── separator.ts      # serializeSeparator()
│   │   ├── media.ts          # serializeMedia()
│   │   ├── comment.ts        # serializeComment()
│   │   └── index.ts          # serializeNode() dispatcher
│   ├── inline/
│   │   ├── content.ts        # serializeInlineContent()
│   │   ├── modifiers.ts      # serializeModifiers()
│   │   └── components.ts     # serializeInlineComponent()
│   └── utils/
│       ├── direction.ts      # getDirectionMarker()
│       └── escape.ts         # escapeSpecialChars()
├── tests/
│   ├── roundtrip.test.ts     # اختبارات الذهاب والإياب
│   ├── text.test.ts
│   ├── list.test.ts
│   ├── table.test.ts
│   ├── block.test.ts
│   ├── compound.test.ts
│   ├── inline.test.ts
│   └── integration.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## 5. الواجهة البرمجية (API)

```typescript
// === نقطة الدخول الرئيسية ===

/**
 * تحويل مستند ARTOON إلى نص
 */
export function serialize(
  doc: ARTOONDocument,
  options?: SerializeOptions
): string;

/**
 * تحويل عقدة واحدة إلى نص
 */
export function serializeNode(
  node: ContentNode,
  options?: SerializeOptions
): string;

/**
 * تحويل محتوى سطري إلى نص
 */
export function serializeInline(
  content: InlineContent[],
  options?: SerializeOptions
): string;


// === الخيارات ===

export interface SerializeOptions {
  /** نهاية السطر (افتراضي: '\n') */
  lineEnding?: '\n' | '\r\n';
  
  /** إضافة أسطر فارغة بين العناصر (افتراضي: true) */
  blankLinesBetween?: boolean;
  
  /** الحفاظ على التعليقات (افتراضي: true) */
  preserveComments?: boolean;
}

export const DEFAULT_OPTIONS: SerializeOptions = {
  lineEnding: '\n',
  blankLinesBetween: true,
  preserveComments: true
};

// === مبدأ الاتجاه ===
// لا يوجد defaultDirection!
// كل عقدة تحمل اتجاهها في node.direction
// الـ Serializer يكتب الاتجاه كما هو — بدون افتراضات
```

---

## 6. خطة التنفيذ

### المرحلة 1: الأساسيات
1. إعداد المشروع (package.json, tsconfig)
2. تنفيذ `serializeText()`
3. تنفيذ `serializeInlineContent()`
4. اختبارات النصوص

### المرحلة 2: القوائم والجداول
5. تنفيذ `serializeList()`
6. تنفيذ `serializeTable()`
7. اختبارات القوائم والجداول

### المرحلة 3: البلوكات
8. تنفيذ `serializeBlock()`
9. تنفيذ `serializeCompound()`
10. اختبارات البلوكات

### المرحلة 4: الباقي
11. تنفيذ `serializeSeparator()`
12. تنفيذ `serializeMedia()`
13. تنفيذ `serializeComment()`

### المرحلة 5: التكامل
14. تنفيذ `serialize()` الرئيسية
15. اختبارات Round-trip
16. اختبارات التكامل

---

## 7. اختبارات Round-trip

```typescript
// الاختبار الأساسي
function testRoundtrip(source: string) {
  const ast1 = parse(source);
  const serialized = serialize(ast1);
  const ast2 = parse(serialized);
  
  expect(ast2).toEqual(ast1);
}

// أمثلة
testRoundtrip('>.p:: مرحباً');
testRoundtrip('>.t1:: عنوان\n>.p:: فقرة');
testRoundtrip('>.ul::\nli:: عنصر 1\nli:: عنصر 2');
testRoundtrip('<code:js>.\nconst x = 1;\n.<code>');
testRoundtrip('<meta>.\n>.-:title: عنوان\n.<meta>');
```

---

## 8. التحديات المتوقعة

### 8.1 الحفاظ على التنسيق
- المسافات البيضاء
- الأسطر الفارغة
- الترتيب

### 8.2 الأحرف الخاصة
- `[` و `]` في النص العادي
- `;` في الجداول
- `::` في المحتوى

### 8.3 الاتجاهات

```
✓ كل عقدة تحمل اتجاهها — لا افتراضات
✓ الـ Serializer يقرأ node.direction ويكتب > أو <
✓ ARTOON محايد للاتجاه
```

---

## 9. الاعتماديات

```json
{
  "dependencies": {},
  "peerDependencies": {
    "@artoon/ast": "^1.0.0"
  },
  "devDependencies": {
    "@artoon/parser": "^1.0.0",
    "typescript": "^5.0.0",
    "jest": "^29.0.0",
    "ts-jest": "^29.0.0"
  }
}
```

---

## 10. معايير النجاح

```
✓ كل أنواع العقد تُسلسَل بشكل صحيح
✓ Round-trip يعمل لكل الحالات
✓ الخيارات تعمل كما هو متوقع
✓ الأداء مقبول للمستندات الكبيرة
✓ تغطية اختبارات > 90%
```

---

## 11. التحقق من التوافق مع الأنظمة الموجودة

### 11.1 التوافق مع @artoon/ast ✅

| نوع العقدة في AST | مدعوم في الخطة |
|-------------------|----------------|
| `TextNode` | ✅ |
| `SeparatorNode` | ✅ |
| `ListNode` | ✅ |
| `TableNode` | ✅ |
| `CompoundNode` | ✅ |
| `BlockNode` | ✅ |
| `MediaNode` | ✅ |
| `LinkNode` | ✅ |
| `CodeNode` | ✅ |
| `CommentNode` | ✅ |

### 11.2 التوافق مع Core Invariants ✅

| المبدأ | مدعوم |
|--------|-------|
| بنية السطر `{dir}.{type}:: {content}` | ✅ |
| المسافة بعد `::` إلزامية | ✅ |
| الفواصل بدون `::` | ✅ |
| مستويات التداخل بالشرطات | ✅ |
| التعليقات `>.:::` | ✅ |
| البلوكات `<name>.` و `.<name>` | ✅ |
| الحقول المخفية `>.-:field:` | ✅ |
| Modifiers `[s:: ]` | ✅ |
| Modifiers متعددة `[s+e:: ]` | ✅ |
| Modifier+Type `[s+time:: ]` | ✅ |
| القيم المتعددة بـ `;` | ✅ |

### 11.3 التوافق مع @artoon/parser ✅

الـ Serializer يجب أن يُنتج نصاً يمكن للـ Parser قراءته:

```typescript
// Round-trip test
const original = '>.p:: مرحباً';
const ast = parse(original);
const serialized = serialize(ast);
const reparsed = parse(serialized);

assert(deepEqual(ast, reparsed));
```

---

**@artoon/serializer Plan v1.0**
**تاريخ الإنشاء:** 2026-01-11
