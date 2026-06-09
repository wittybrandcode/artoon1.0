# ⚠️ DEPRECATED

هذه الحزمة مهجورة وتم دمجها في `@artoon/core`.

## البديل

استخدم `@artoon/core` بدلاً من هذه الحزمة:

```typescript
// قديم (مهجور)
import type { Document, TextNode } from '@artoon/ast';

// جديد
import type { Document, TextNode } from '@artoon/core';
```

## سبب الإهجار

تم توحيد كل الحزم الأساسية في `@artoon/core` لـ:
- تقليل التكرار
- تبسيط الاعتماديات
- توحيد الـ API

## التاريخ

- **2026-01-10**: تم الإهجار لصالح `@artoon/core`
