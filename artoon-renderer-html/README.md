# @artoon/renderer-html

> HTML Renderer for ARTOON documents.
>
> HTML Renderer مرجعي لـ ARTOON.

## التثبيت

```bash
npm install @artoon/renderer-html
```

## الاستخدام

```typescript
import { parse } from '@artoon/parser';
import { transform } from '@artoon/ast';
import { render, renderFull, createRenderer } from '@artoon/renderer-html';

const source = `>.t1:: عنوان
>.p:: فقرة مع [s:: نص مهم]`;

// تحليل وتحويل
const doc = transform(parse(source));

// تصيير HTML
const html = render(doc);
// <h1>عنوان</h1>
// <p>فقرة مع <strong>نص مهم</strong></p>

// تصيير مستند HTML كامل
const fullHtml = renderFull(doc);
// <!DOCTYPE html><html>...</html>
```

## الخيارات

```typescript
const options = {
  fullDocument: false,      // تضمين html, head, body
  title: 'عنوان',           // عنوان المستند
  includeDirection: true,   // إضافة dir attribute
  defaultDirection: 'rtl',  // الاتجاه الافتراضي
  indent: true,             // تنسيق الإخراج
  indentSize: 2,            // حجم المسافة البادئة
  includeComments: false,   // تضمين التعليقات
  classPrefix: 'artoon-',   // بادئة الـ classes
  addSemanticClasses: false,// إضافة classes دلالية
  metaHandling: 'hide'      // معالجة META: 'hide' | 'tags' | 'comment'
};

const html = render(doc, options);
```

## معالجة META Block (جديد في v2.0)

بلوكات META مخفية افتراضياً في HTML output.

### السلوك الافتراضي (hide)

```typescript
const source = `
<meta>.
>.-:title: My Document
>.-:author: Ahmad
.<meta>

>.t1:: Title
`;

const html = render(parse(source));
// <h1>Title</h1>
// (META مخفي)
```

### الخيارات

#### 1. Hide (الافتراضي)
```typescript
render(doc, { metaHandling: 'hide' });
// META لا يظهر في HTML
```

#### 2. Tags (كـ meta tags)
```typescript
render(doc, { metaHandling: 'tags' });
// <meta name="title" content="My Document">
// <meta name="author" content="Ahmad">
```

#### 3. Comment (كتعليق HTML)
```typescript
render(doc, { metaHandling: 'comment' });
// <!-- META: title: My Document -->
// <!-- META: author: Ahmad -->
```

### مثال كامل

```typescript
import { parse } from '@artoon/parser';
import { render } from '@artoon/renderer-html';

const source = `
<meta>.
>.-:title: دليل ARTOON
>.-:author: فريق التطوير
>.-:date: 2026-01-18
>.-:lang: ar
.<meta>

>.t1:: دليل ARTOON
>.p:: مرحباً بك
`;

const result = parse(source);

// مخفي (افتراضي)
const html1 = render(result.ast);
// <h1>دليل ARTOON</h1>
// <p>مرحباً بك</p>

// كـ meta tags
const html2 = render(result.ast, { metaHandling: 'tags' });
// <meta name="title" content="دليل ARTOON">
// <meta name="author" content="فريق التطوير">
// <meta name="date" content="2026-01-18">
// <meta name="lang" content="ar">
// <h1>دليل ARTOON</h1>
// <p>مرحباً بك</p>

// كتعليق
const html3 = render(result.ast, { metaHandling: 'comment' });
// <!-- META: title: دليل ARTOON -->
// <!-- META: author: فريق التطوير -->
// <!-- META: date: 2026-01-18 -->
// <!-- META: lang: ar -->
// <h1>دليل ARTOON</h1>
// <p>مرحباً بك</p>
```

## إنشاء Renderer مخصص

```typescript
const renderer = createRenderer({
  defaultDirection: 'ltr',
  includeDirection: true
});

const html = renderer.render(doc);
const fullHtml = renderer.renderFull(doc);
```

## جدول التحويل

### المكونات النصية

| ARTOON | HTML |
|--------|------|
| `p` | `<p>` |
| `t1`-`t6` | `<h1>`-`<h6>` |
| `q` | `<blockquote>` |
| `pre` | `<pre>` |

### المُعدِّلات

| ARTOON | HTML |
|--------|------|
| `s` | `<strong>` |
| `e` | `<em>` |
| `u` | `<u>` |
| `d` | `<del>` |
| `mark` | `<mark>` |
| `sub` | `<sub>` |
| `sup` | `<sup>` |

### القوائم

| ARTOON | HTML |
|--------|------|
| `ul` | `<ul>` |
| `ol` | `<ol>` |
| `dl` | `<dl>` |
| `li` | `<li>` |
| `dt` | `<dt>` |
| `dd` | `<dd>` |

### الجداول

| ARTOON | HTML |
|--------|------|
| `table` | `<table>` |
| `th` | `<th>` |
| `tr` | `<tr>` / `<td>` |

### المكونات الداخلية

| ARTOON | HTML |
|--------|------|
| `a` | `<a>` |
| `img` | `<img>` |
| `audio` | `<audio>` |
| `video` | `<video>` |
| `abbr` | `<abbr>` |
| `time` | `<time>` |
| `c` | `<code>` |

### الفواصل

| ARTOON | HTML |
|--------|------|
| `br` | `<br>` |
| `hr` | `<hr>` |
| `wbr` | `<wbr>` |

### المكونات المركبة

| ARTOON | HTML |
|--------|------|
| `figure` | `<figure>` |
| `details` | `<details>` |

## معالجة الاتجاه

```typescript
// RTL افتراضي - لا يُضاف dir للعناصر RTL
const html = render(doc, { defaultDirection: 'rtl' });

// LTR افتراضي - يُضاف dir="rtl" للعناصر العربية
const html = render(doc, { defaultDirection: 'ltr' });
```

## Lossless

هذا الـ Renderer هو **Lossless** — لا يفقد أي معلومات من الـ AST.

## الترخيص

MIT
