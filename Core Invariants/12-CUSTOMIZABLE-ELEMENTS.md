# Core Invariant 12: العناصر القابلة للتخصيص

> المحتوى ثابت، العرض مرن — الفصل الكامل بين البيانات والتقديم

---

## 🎯 المبدأ الأساسي

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   ملف ARTOON = مصدر الحقيقة (Source of Truth)                          │
│   ─────────────────────────────────────────────────────────────────     │
│   لا يتغير أبداً بسبب طريقة العرض                                       │
│                                                                         │
│   المحرر/Renderer/Plugin = طبقة العرض (Presentation Layer)             │
│   ─────────────────────────────────────────────────────────────────     │
│   يُخصص العرض بناءً على الأسماء                                        │
│   يختار نوع الـ tag في HTML بحرية تامة                                 │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 العناصر الثلاثة

| العنصر | الصيغة | Class الافتراضي | السلوك الافتراضي | Tag قابل للتخصيص |
|--------|--------|-----------------|------------------|------------------|
| **customBlock** | `<name>. ... .<name>` | `{name}` | ظاهر | ✓ أي tag |
| **hiddenField** | `>.-:field: value` | `{field}` | مخفي | ✓ أي tag |
| **comment** | `>.::: text` | `comment` (ثابت) | مخفي | ✓ أي tag |

---

## 3. القواعد الثابتة (Invariants)

### 1. الاسم يُحفظ دائماً

```typescript
// Parser يحفظ اسم البلوك/الحقل كما هو
{ type: 'customBlock', attrs: { name: 'profile' } }
{ type: 'hiddenField', attrs: { name: 'location', value: 'algeria' } }
```

### 2. الاسم يُخرج كـ class (الافتراضي)

```
ARTOON                              HTML (افتراضي)
─────────────────────────────────────────────────────────────
<profile>.                    →     <div class="profile">
>.p:: content                       <p>content</p>
.<profile>                          </div>

>.-:location: algeria         →     <div class="location" hidden>algeria</div>

>.::: هذا تعليق               →     <div class="comment" hidden>هذا تعليق</div>
```

### 3. Tag قابل للتخصيص بالكامل

المحرر/Renderer يمكنه اختيار أي tag من HTML:

```
ARTOON                              HTML (مخصص)
─────────────────────────────────────────────────────────────
<profile>.                    →     <section class="profile">
.<profile>                          </section>

<profile>.                    →     <article class="profile">
.<profile>                          </article>

<nav>.                        →     <nav class="nav">
.<nav>                              </nav>

>.-:location: algeria         →     <span class="location">algeria</span>
>.-:author: أحمد              →     <address class="author">أحمد</address>

>.::: تعليق                   →     <!-- تعليق -->
>.::: تعليق                   →     <aside class="comment">تعليق</aside>
```

### 4. العرض الافتراضي

- البلوكات المخصصة: **ظاهرة** (tag: div)
- الحقول المخفية: **مخفية** (hidden attribute)
- التعليقات: **مخفية** (hidden attribute)

### 5. التخصيص خارج الملف

```css
/* CSS/Plugin يُخصص العرض */
.profile { border: 2px solid blue; }
.location { display: inline-block !important; color: green; }
.comment { display: block !important; background: yellow; }
```

### 6. الملف يبقى ثابتاً

نفس ملف ARTOON يُعرض بطرق مختلفة في بيئات مختلفة:
- المحرر: يُظهر التعليقات والحقول المخفية
- الموقع: يُخفي التعليقات، يُظهر بعض الحقول
- التطبيق: يستخدم الحقول المخفية كـ metadata

---

## 📊 أمثلة HTML Output

### customBlock

```
ARTOON:
<profile>.
>.p:: أحمد محمد
.<profile>

HTML (خيارات متعددة):
─────────────────────────────────────────────────────────────
<div class="profile">                    ← div (افتراضي)
  <p>أحمد محمد</p>
</div>

<section class="profile">                ← section
  <p>أحمد محمد</p>
</section>

<article class="profile">                ← article
  <p>أحمد محمد</p>
</article>

<aside class="profile">                  ← aside
  <p>أحمد محمد</p>
</aside>
```

### hiddenField

```
ARTOON:
>.-:location: algeria

HTML (خيارات متعددة):
─────────────────────────────────────────────────────────────
<div class="location" hidden>algeria</div>     ← div (افتراضي، مخفي)
<span class="location">algeria</span>          ← span (ظاهر)
<address class="location">algeria</address>   ← address
<data class="location" value="algeria">algeria</data>  ← data
```

### comment

```
ARTOON:
>.::: هذا تعليق للمطورين

HTML (خيارات متعددة):
─────────────────────────────────────────────────────────────
<div class="comment" hidden>هذا تعليق للمطورين</div>  ← div (افتراضي، مخفي)
<!-- هذا تعليق للمطورين -->                            ← HTML comment
<aside class="comment">هذا تعليق للمطورين</aside>     ← aside (ظاهر)
```

---

## 🚀 الإمكانيات

هذا النظام يفتح الباب لـ:

1. **اختيار Tag المناسب** — div, section, article, aside, nav, header, footer, main, span, address, data...
2. **Plugins للمحرر** — تخصيص عرض بلوكات معينة
3. **Themes** — تغيير شكل كل البلوكات
4. **Domain-specific rendering** — عرض مختلف لنفس الملف
5. **Progressive enhancement** — إضافة تفاعلية بـ JS
6. **Accessibility** — إضافة ARIA attributes
7. **Analytics** — تتبع بلوكات معينة
8. **Validation** — التحقق من حقول معينة

---

## ⚠️ ما لا يجب فعله

```
❌ تغيير ملف ARTOON بناءً على طريقة العرض
❌ تخزين معلومات العرض في الملف
❌ تجاهل الحقول المخفية أو التعليقات في Parser
```

---

## ✅ ما يجب فعله

```
✅ حفظ كل العناصر الثلاثة في Parser
✅ إخراج كل العناصر بـ class صحيح في Renderer
✅ السماح باختيار tag من HTML
✅ ترك التخصيص لـ CSS/JS/Plugins
✅ الحفاظ على ثبات ملف ARTOON
```

---

## 📋 ملخص

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      العناصر القابلة للتخصيص                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  customBlock:                                                          │
│  ├─ الصيغة: <name>. ... .<name>                                        │
│  ├─ Class: {name}                                                      │
│  ├─ Tag: أي tag (div افتراضي)                                          │
│  └─ السلوك: ظاهر                                                       │
│                                                                         │
│  hiddenField:                                                          │
│  ├─ الصيغة: >.-:field: value                                           │
│  ├─ Class: {field}                                                     │
│  ├─ Tag: أي tag (div افتراضي)                                          │
│  └─ السلوك: مخفي افتراضياً                                             │
│                                                                         │
│  comment:                                                              │
│  ├─ الصيغة: >.::: text                                                 │
│  ├─ Class: comment (ثابت)                                              │
│  ├─ Tag: أي tag أو HTML comment                                        │
│  └─ السلوك: مخفي افتراضياً                                             │
│                                                                         │
│  المبدأ: الملف ثابت، العرض مرن                                         │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

**Core Invariant 12: العناصر القابلة للتخصيص**
**تاريخ التحديث:** 2026-01-11
**الحالة:** معتمد
