# @artoon/typer

محرر بلوكات احترافي لصيغة ARTOON مستوحى من Notion و TipTap مع دعم RTL أصلي.

## الميزات

- 📝 محرر بلوكات كامل (فقرات، عناوين، قوائم، كود، جداول، وسائط)
- 🔄 استيراد/تصدير ARTOON
- ↩️ Undo/Redo كامل
- ⌨️ اختصارات لوحة المفاتيح
- 🖱️ سحب وإفلات البلوكات
- 🌙 سمات فاتحة/داكنة
- 🌍 دعم RTL أصلي

## التثبيت

```bash
npm install @artoon/typer
```

## الاستخدام السريع

```tsx
import { 
  EditorContainer, 
  ThemeProvider,
  useEditor,
  importARTOON,
  exportARTOON 
} from '@artoon/typer';
import '@artoon/typer/ui/styles/index.css';

function App() {
  const editor = useEditor({
    defaultDirection: 'rtl',
    onChange: (blocks) => console.log('Changed:', blocks),
  });

  return (
    <ThemeProvider defaultPreference="system">
      <EditorContainer {...editor} />
    </ThemeProvider>
  );
}
```

## استيراد/تصدير ARTOON

```typescript
import { importARTOON, exportARTOON } from '@artoon/typer';

// استيراد
const blocks = importARTOON('>.t1:: عنوان\n>.p:: فقرة');

// تصدير
const artoon = exportARTOON(blocks);
```

## أنواع البلوكات

| النوع | الوصف |
|-------|-------|
| `paragraph` | فقرة نصية |
| `heading1-6` | عناوين (6 مستويات) |
| `quote` | اقتباس |
| `bullet-list` | قائمة نقطية |
| `numbered-list` | قائمة مرقمة |
| `code` | كود برمجي |
| `table` | جدول |
| `image` | صورة |
| `video` | فيديو |
| `audio` | صوت |
| `divider` | فاصل |
| `meta` | بيانات وصفية (جديد في v2.0) |

## META Block Editor (جديد في v2.0)

بلوك META له واجهة تحرير خاصة لإدارة البيانات الوصفية للمستند.

### الميزات

- ✅ إضافة/تعديل/حذف الحقول
- ✅ حقول اسم وقيمة
- ✅ مخفي في لوحة المعاينة
- ✅ حفظ تلقائي
- ✅ واجهة مستخدم بديهية

### الواجهة

```
┌─────────────────────────────────┐
│ 📋 Document Metadata            │
├─────────────────────────────────┤
│ title    │ Test Document    │ × │
│ author   │ John Doe         │ × │
│ date     │ 2024-01-18       │ × │
├─────────────────────────────────┤
│         + Add Field             │
└─────────────────────────────────┘
```

### الاستخدام

```typescript
import { importARTOON, exportARTOON } from '@artoon/typer';

// استيراد مستند مع META
const source = `
<meta>.
>.-:title: My Document
>.-:author: Ahmad
>.-:date: 2026-01-18
.<meta>

>.t1:: Title
>.p:: Content
`;

const blocks = importARTOON(source);
// blocks[0] سيكون META block مع واجهة تحرير خاصة

// تصدير
const output = exportARTOON(blocks);
// META block يُصدّر بشكل صحيح مع الحقول
```

### في المعاينة

META blocks مخفية تلقائياً في لوحة المعاينة:

```typescript
// في المحرر: يظهر META block مع واجهة التحرير
// في المعاينة: META مخفي تماماً
```

### الحقول الشائعة

يمكنك إضافة أي حقول تريدها، لكن هذه هي الأكثر شيوعاً:

- **المستند:** `title`, `description`, `summary`
- **المؤلف:** `author`, `email`, `organization`
- **التواريخ:** `date`, `modified`, `published`
- **التصنيف:** `tags`, `keywords`, `category`
- **اللغة:** `lang`, `dir`, `locale`

## اختصارات لوحة المفاتيح

| الاختصار | الوظيفة |
|----------|---------|
| `Ctrl+B` | عريض |
| `Ctrl+I` | مائل |
| `Ctrl+U` | تسطير |
| `Ctrl+Z` | تراجع |
| `Ctrl+Y` | إعادة |
| `Ctrl+D` | تكرار البلوك |
| `Ctrl+Shift+↑/↓` | نقل البلوك |

## السمات

```tsx
import { ThemeProvider, useTheme } from '@artoon/typer';

function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button onClick={toggle}>
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
```

## API

### EditorController

```typescript
const controller = createEditorController({
  defaultDirection: 'rtl',
  initialBlocks: [],
  onChange: (blocks) => {},
});

controller.addBlock(block);
controller.removeBlock(id);
controller.updateBlock(id, updates);
controller.moveBlock(id, newIndex);
controller.duplicateBlock(id);
controller.undo();
controller.redo();
```

### useEditor Hook

```typescript
const {
  blocks,
  focusedBlockId,
  addBlock,
  removeBlock,
  updateBlock,
  moveBlock,
  duplicateBlock,
  undo,
  redo,
} = useEditor(options);
```

## التبعيات

- `@artoon/parser` - تحليل صيغة ARTOON
- `@artoon/serializer` - تحويل إلى صيغة ARTOON
- `@artoon/ast` - أنواع AST
- `@artoon/state` - إدارة الحالة

## الترخيص

MIT
