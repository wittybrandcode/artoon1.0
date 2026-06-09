# @artoon/serializer

> Converts ARTOON AST to ARTOON text format.
>
> تحويل AST إلى نص ARTOON

## التثبيت

```bash
npm install @artoon/serializer
```

## الاستخدام

```typescript
import { serialize } from '@artoon/serializer';
import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';

// Parse ARTOON text
const result = parse('>.p:: مرحباً بالعالم');
const doc = transform(result);

// Serialize back to text
const text = serialize(doc);
console.log(text); // >.p:: مرحباً بالعالم
```

## API

### `serialize(doc, options?)`

تحويل مستند ARTOON إلى نص.

```typescript
function serialize(
  doc: ARTOONDocument,
  options?: SerializeOptions
): string;
```

### `serializeNode(node, options?)`

تحويل عقدة واحدة إلى نص.

```typescript
function serializeNode(
  node: ContentNode,
  options?: SerializeOptions
): string;
```

### `serializeInlineContent(content)`

تحويل محتوى سطري إلى نص.

```typescript
function serializeInlineContent(
  content: InlineContent[]
): string;
```

## الخيارات

```typescript
interface SerializeOptions {
  // نهاية السطر (افتراضي: '\n')
  lineEnding?: '\n' | '\r\n';
  
  // أسطر فارغة بين العناصر (افتراضي: true)
  blankLinesBetween?: boolean;
  
  // الحفاظ على التعليقات (افتراضي: true)
  preserveComments?: boolean;
}
```

## أمثلة

### نص بسيط

```typescript
const doc = {
  version: '1.0',
  content: [{
    nodeType: 'text',
    textType: 'p',
    direction: 'rtl',
    line: 1,
    content: [{ type: 'plain', value: 'مرحباً' }]
  }]
};

serialize(doc); // '>.p:: مرحباً'
```

### META Block (جديد في v2.0)

```typescript
const doc = {
  version: '1.0',
  meta: {
    type: 'block',
    blockName: 'meta',
    isCode: false,
    fields: [
      { name: 'title', value: 'My Document', direction: 'rtl' },
      { name: 'author', value: 'Ahmad', direction: 'rtl' },
      { name: 'date', value: '2026-01-18', direction: 'ltr' }
    ],
    content: ''
  },
  content: [...]
};

serialize(doc);
// <meta>.
// >.-:title: My Document
// >.-:author: Ahmad
// <.-:date: 2026-01-18
// .<meta>
```

**ملاحظات:**
- META blocks تُسلسل بحقولها فقط (لا محتوى)
- الاتجاه يُحدد لكل حقل بشكل مستقل
- الحقول تستخدم صيغة `>.-:field:` أو `<.-:field:`

### Round-trip مع META

```typescript
import { parse } from '@artoon/parser';
import { serialize } from '@artoon/serializer';

const source = `<meta>.
>.-:title: Test
.<meta>

>.p:: Content`;

const result = parse(source);
const output = serialize(result.ast);

// output يحافظ على البنية الأصلية
console.log(output);
// <meta>.
// >.-:title: Test
// .<meta>
//
// >.p:: Content
```

### قائمة

```typescript
const doc = {
  version: '1.0',
  content: [{
    nodeType: 'list',
    listType: 'ul',
    direction: 'rtl',
    line: 1,
    items: [
      { itemType: 'li', content: [{ type: 'plain', value: 'عنصر 1' }] },
      { itemType: 'li', content: [{ type: 'plain', value: 'عنصر 2' }] }
    ]
  }]
};

serialize(doc);
// '>.ul::\nli:: عنصر 1\nli:: عنصر 2'
```

### Round-trip

```typescript
import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { serialize } from '@artoon/serializer';

const source = '>.t1:: عنوان\n>.p:: فقرة';
const result = parse(source);
const doc = transform(result);
const output = serialize(doc, { blankLinesBetween: false });

console.log(output === source); // true
```

## الأنواع المدعومة

| النوع | المثال |
|-------|--------|
| Text (p, t1-t6, q, pre) | `>.p:: نص` |
| Separator (br, hr, wbr) | `>.hr` |
| List (ul, ol, dl) | `>.ul::\nli:: عنصر` |
| Table | `>.table::\nth:: عمود\ntr:: قيمة` |
| Block (code, meta, custom) | `<code:js>.\ncode\n.<code>` |
| Compound (figure, details) | `>.figure::\n>.-img:: path` |
| Media (img, video, audio, file) | `>.img:: path; alt` |
| Link | `>.a:: url; text` |
| Code (inline) | `[c:: code]` |
| Comment | `>.::: تعليق` |

## مبدأ الاتجاه

ARTOON يدعم RTL و LTR بشكل متساوٍ:

- `>` = RTL container
- `<` = LTR container

المحتوى المختلط يتبع Unicode BiDi algorithm تلقائياً.

```
>.p:: هذه جملة عربية تحتوي على كلمة English وتستمر
      ↑
      الحاوي RTL، لكن "English" تُعرض LTR تلقائياً
```

## الترخيص

MIT
