# 🧪 ملفات اختبار البلوكات

هذا المجلد يحتوي على ملفات اختبار منفصلة لكل نوع من أنواع البلوكات في ARTOON 2.0.

## 📁 الهيكل

```
test-blocks/
├── 00-README.md                    ← هذا الملف
├── 01-meta-block.artoon           ← META block (محجوز)
├── 02-code-block.artoon           ← CODE block (محجوز)
├── 03-alert-block.artoon          ← Alert block (مخصص)
├── 04-note-block.artoon           ← Note block (مخصص)
├── 05-info-block.artoon           ← Info block (مخصص)
├── 06-success-block.artoon        ← Success block (مخصص)
├── 07-error-block.artoon          ← Error block (مخصص)
├── 08-warning-block.artoon        ← Warning block (مخصص)
├── 09-quote-block.artoon          ← Quote block (مخصص)
├── 10-card-block.artoon           ← Card block (مخصص)
├── 11-article-block.artoon        ← Article block (مخصص)
├── 12-section-block.artoon        ← Section block (مخصص)
├── 13-box-block.artoon            ← Box block (مخصص)
├── 14-panel-block.artoon          ← Panel block (مخصص)
└── 15-container-block.artoon      ← Container block (مخصص)
```

## 🎯 الهدف

اختبار كل بلوك بشكل منفصل لتحديد:
- ✅ البلوكات التي تعمل بشكل صحيح
- ❌ البلوكات التي بها مشاكل
- 🐛 نوع المشكلة في كل بلوك

## 📋 كيفية الاختبار

### 1. افتح المحرر
```bash
cd AROON_2.0/artoon-typer
npm run dev
```

### 2. اختبر كل ملف
- افتح كل ملف في المحرر
- تحقق من العرض
- سجل أي مشاكل

### 3. وثّق النتائج
أنشئ ملف `TEST-RESULTS.md` وسجل:
- اسم الملف
- حالة البلوك (✅ يعمل / ❌ مشكلة)
- وصف المشكلة (إن وجدت)
- Screenshot (إن أمكن)

## 📊 قالب النتائج

```markdown
# نتائج اختبار البلوكات

## 01-meta-block.artoon
- **الحالة:** ✅ يعمل / ❌ مشكلة
- **الوصف:** [وصف]
- **الملاحظات:** [ملاحظات]

## 02-code-block.artoon
- **الحالة:** ✅ يعمل / ❌ مشكلة
- **الوصف:** [وصف]
- **الملاحظات:** [ملاحظات]

... (وهكذا لكل ملف)
```

## 🎯 الفائدة

- ✅ اختبار منهجي ومنظم
- ✅ سهولة تحديد المشاكل
- ✅ عزل المشاكل عن بعضها
- ✅ توثيق دقيق للنتائج

---

**التاريخ:** 2026-01-19  
**الغرض:** اختبار منهجي لجميع أنواع البلوكات
