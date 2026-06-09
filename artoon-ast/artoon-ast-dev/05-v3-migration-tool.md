# 📝 المهمة 5: التخلص التام من ديون التوافقية (The v3.0 Migration)

## 🎯 الهدف

تمهيد الطريق لحذف ملف `compat.ts` العبقري، وتقليل وزن وتعقيد النواة في التحديث المستقبلي (Version 3.0). يتحقق ذلك عن طريق بناء "أداة ترحيل مستقلة" (Standalone Migration CLI Command) تقوم بتحديث ملفات الـ JSON/AST المحفوظة لدى المستخدمين إلى أحدث صيغة.

## 📍 مكان التعديل

الملفات المعنية:

- `artoon-ast/src/migration/index.ts` (المنطق الداخلي)
- `artoon-cli/src/commands/migrate.ts` (واجهة سطر الأوامر)

## 🛠️ خطوات التنفيذ التقنية

### الخطوة 1: بناء منطق الترحيل العميق (Deep Migration Logic)

في مجلد جديد `artoon-ast/src/migration/`:

- قم بكتابة سكربت يقوم بعمل مرور عميق (Deep Traversal) لأي كائن `ARTOONDocument`.
- يمسح حرفياً خاصية `nodeType` القديمة من الكائنات.
- يتأكد أن `type` موجودة وثابتة.
- يحول عقد الـ `List` من صيغتها القديمة `children` المفرط بالـ `ListNode` لتصبح هيكلة `ListItem[]` نقية.
- يحول خواص الـ `SeparatorNode` لتتناسب مع V2 `separatorType` ويمسح مصفوفة `separators`.

```typescript
export function migrateToV2(oldDoc: any): ARTOONDocument {
  // 1. عمّل استنساخ عميق للكائن
  const doc = JSON.parse(JSON.stringify(oldDoc));
  
  // 2. غير رقم الإصدار
  doc.version = '2.0';

  // 3. قم بالمرور التراجعي العميق
  const migrateNode = (node: any) => {
    if(node.nodeType) {
       node.type = node.nodeType;
       delete node.nodeType; // الموت للتبعية!
    }
    //... تطبيق نفس السلوك الاستبدالي للقوائم والفواصل
  };

  visitNodes(doc.content, migrateNode);
  return doc as ARTOONDocument;
}
```

### الخطوة 2: ربط الأداة بأمر الطرفية (CLI Integration)

في حزمة `@artoon/cli`، افتح التصديرات وقم بإضافة الأمر الجديد الذي يستدعي الدالة.

```typescript
program
  .command('migrate <directory_or_file>')
  .description('Upgrade old ARTOON format documents to Version 2.0')
  .option('--dry-run', 'Preview changes without overwriting files')
  .action(async (path, options) => {
     // قراءة الملفات من المسار..
     // استدعاء migrateToV2
     // كتابة النتيجة إذا لم يكن dry-run
  });
```

### الخطوة 3: التوثيق للمستقبل (Future Proofing)

في ملف الـ `README.md` الخاص بالحزمة، قم بإضافة رسالة تحذير واضحة (Deprecation Warning):
> "إن الإصدار V2.x هو الملاذ الأخير لخاصية `nodeType`. ابتداءً من الإصدار V3.0 المقرر إطلاقه في مستقبلاً، سيتم إسقاط الـ Compat Layer نهائياً. تم توفير الأداة `artoon migrate` لتيسير انتقال مستنداتكم".

## 🧪 معايير القبول (Acceptance Criteria)

- [ ] سكربت الترحيل يستطيع أخذ شجرة JSON بصيغة `v1.0` وإخراج شجرة تتطابق 100% مع واجهات `Unified Types` المعزولة.
- [ ] لا تتبقى ذرة من خواص `nodeType` أو مصفوفات في فواصل الـ hr/br.
- [ ] المستخدم النهائي قادر على تنفيذ أمر `artoon migrate ./my-docs --dry-run` كأداة طرفية لرؤية النتائج دون دمار بياناته.
