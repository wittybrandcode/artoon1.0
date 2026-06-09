# @artoon/cli

أداة سطر الأوامر لـ ARTOON - صيغة المحتوى الدلالي.

## التثبيت

```bash
npm install -g @artoon/cli
```

## الاستخدام

### Parse - تحليل الملف إلى AST

```bash
# إخراج AST إلى stdout
artoon parse file.artoon

# حفظ في ملف
artoon parse file.artoon -o output.json

# JSON مضغوط
artoon parse file.artoon --compact

# AST المحوَّل (Canonical)
artoon parse file.artoon --transformed
```

### Render - تصيير إلى HTML

```bash
# إخراج HTML إلى stdout
artoon render file.artoon

# حفظ في ملف
artoon render file.artoon -o output.html

# مستند HTML كامل
artoon render file.artoon --full

# بدون سمات الاتجاه
artoon render file.artoon --no-direction
```

### Validate - التحقق من صحة الملف

```bash
# التحقق من الملف
artoon validate file.artoon

# الوضع الصارم (التحذيرات كأخطاء)
artoon validate file.artoon --strict

# إخراج JSON
artoon validate file.artoon --json

# إخراج هادئ (الأخطاء فقط)
artoon validate file.artoon --quiet
```

### Lint - اختصار للتحقق

```bash
artoon lint file.artoon
```

## أكواد الخروج

| الكود | المعنى |
|-------|--------|
| 0 | نجاح |
| 1 | خطأ في الصيغة |
| 2 | خطأ في التحقق |
| 3 | انتهاك فلسفي |
| 4 | الملف غير موجود |
| 5 | خطأ في القراءة/الكتابة |

## أمثلة

### تحويل ملف ARTOON إلى HTML

```bash
artoon render document.artoon --full -o document.html
```

### التحقق من جميع الملفات في مجلد

```bash
for file in *.artoon; do
  artoon validate "$file" --quiet
done
```

### استخراج AST للمعالجة

```bash
artoon parse document.artoon --transformed | jq '.content'
```

## الترخيص

MIT
