# ARTOON-TYPER Theme System

## نظام الثيمات المزدوج الاحترافي

نظام ثيمات متقدم يفصل بين:
1. **ثيمات المحرر** (Editor Themes): للواجهة
2. **ثيمات المعاينة** (Preview Themes): لعرض المحتوى

---

## 📁 البنية

```
themes/
├── types.ts                    # تعريفات TypeScript
├── ThemeProvider.tsx           # React Context Provider
├── index.ts                    # Exports رئيسية
│
├── editor/                     # ثيمات المحرر
│   ├── light.ts               # Light mode
│   ├── dark.ts                # Dark mode
│   └── index.ts
│
└── preview/                    # ثيمات المعاينة
    ├── minimal.ts             # Minimal theme
    ├── blog.ts                # Blog theme
    ├── documentation.ts       # Documentation theme
    ├── academic.ts            # Academic theme
    └── index.ts
```

---

## 🎨 ثيمات المحرر

### Light Mode
```typescript
import { lightEditorTheme } from './themes/editor';
```
- واجهة فاتحة ومريحة
- مناسبة للعمل النهاري

### Dark Mode
```typescript
import { darkEditorTheme } from './themes/editor';
```
- واجهة داكنة
- مناسبة للعمل الليلي

---

## 📝 ثيمات المعاينة

### 1. Minimal
```typescript
import { minimalTheme } from './themes/preview';
```
- تنسيق بسيط جداً
- حد أدنى من التزيين
- مثالي للقراءة المركزة

**مثال:**
```
عنوان بسيط
نص عادي بدون تزيين كثير
```

### 2. Blog
```typescript
import { blogTheme } from './themes/preview';
```
- خطوط serif دافئة
- تباعد مريح
- مثالي للمقالات والمدونات

**مثال:**
```
عنوان جميل بخط Georgia
نص المقال بتباعد مريح وخط سهل القراءة
```

### 3. Documentation
```typescript
import { documentationTheme } from './themes/preview';
```
- واضح ومنظم
- عرض ممتاز للكود
- مثالي للتوثيق التقني

**مثال:**
```
# API Reference
واضح ومنظم مع عرض ممتاز للكود
```

### 4. Academic
```typescript
import { academicTheme } from './themes/preview';
```
- رسمي وأكاديمي
- خطوط تقليدية
- مثالي للأوراق البحثية

**مثال:**
```
عنوان البحث
نص أكاديمي رسمي بخط Times New Roman
```

---

## 🔧 الاستخدام

### في المكونات

```typescript
import { useTheme } from './themes';

function MyComponent() {
  const { 
    // ثيم المحرر
    editorMode,           // 'light' | 'dark'
    editorTheme,          // EditorTheme object
    toggleEditor,         // () => void
    setEditorPreference,  // (pref: 'light' | 'dark' | 'system') => void
    
    // ثيم المعاينة
    previewTheme,         // PreviewTheme object
    previewThemes,        // PreviewTheme[]
    setPreviewTheme,      // (id: string) => void
  } = useTheme();
  
  return (
    <div>
      <button onClick={toggleEditor}>
        {editorMode === 'light' ? '🌙' : '☀️'}
      </button>
      
      <select 
        value={previewTheme.id}
        onChange={(e) => setPreviewTheme(e.target.value)}
      >
        {previewThemes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.nameAr}
          </option>
        ))}
      </select>
    </div>
  );
}
```

### في التطبيق الرئيسي

```typescript
import { ThemeProvider } from './themes';

function App() {
  return (
    <ThemeProvider 
      defaultEditorPreference="light"
      defaultPreviewThemeId="minimal"
    >
      <YourApp />
    </ThemeProvider>
  );
}
```

---

## 🎨 إنشاء ثيم معاينة مخصص

```typescript
import type { PreviewTheme } from './themes/types';

const myTheme: PreviewTheme = {
  id: 'my-custom-theme',
  name: 'My Theme',
  nameAr: 'ثيمي المخصص',
  version: '1.0.0',
  description: 'My custom theme',
  descriptionAr: 'ثيمي المخصص',
  
  tokens: {
    colors: {
      primary: '#ff6b6b',
      secondary: '#4ecdc4',
      // ...
    },
    typography: {
      fontFamily: {
        heading: 'Montserrat, sans-serif',
        body: 'Open Sans, sans-serif',
        code: 'Fira Code, monospace',
      },
      // ...
    },
    // ...
  },
  
  customCSS: `
    body {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }
    
    h1 {
      text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
    }
  `,
};

// استخدام الثيم المخصص
const { setCustomPreviewTheme } = useTheme();
setCustomPreviewTheme(myTheme);
```

---

## 📊 Design Tokens

كل ثيم يستخدم Design Tokens:

```typescript
interface DesignTokens {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    text: { primary, secondary, tertiary, disabled };
    background: { primary, secondary, tertiary, hover, active };
    border: { default, hover, focus };
  };
  
  typography: {
    fontFamily: { heading, body, code };
    fontSize: { xs, sm, base, lg, xl, 2xl, 3xl, 4xl };
    fontWeight: { normal, medium, semibold, bold };
    lineHeight: { tight, normal, relaxed };
  };
  
  spacing: { xs, sm, md, lg, xl, 2xl, 3xl };
  radius: { sm, md, lg, full };
  shadows: { sm, md, lg, xl };
}
```

---

## 🔄 تحويل إلى CSS Variables

```typescript
import { tokensToCSSVariables } from './themes/types';

const variables = tokensToCSSVariables(theme.tokens);
// {
//   '--color-primary': '#2563eb',
//   '--font-body': 'system-ui, sans-serif',
//   '--spacing-md': '1rem',
//   // ...
// }
```

---

## 💾 الاستمرارية

الإعدادات تُحفظ تلقائياً في localStorage:

- `artoon-editor-preference`: تفضيل المحرر (light/dark/system)
- `artoon-preview-theme`: ثيم المعاينة المختار

---

## 🌐 دعم System Preference

المحرر يدعم تفضيل النظام:

```typescript
setEditorPreference('system'); // يتبع إعدادات النظام
setEditorPreference('light');  // فاتح دائماً
setEditorPreference('dark');   // داكن دائماً
```

---

## 📝 أمثلة

### مثال 1: تبديل المحرر

```typescript
const { editorMode, toggleEditor } = useTheme();

<button onClick={toggleEditor}>
  {editorMode === 'light' ? 'تفعيل الوضع الداكن' : 'تفعيل الوضع الفاتح'}
</button>
```

### مثال 2: اختيار ثيم المعاينة

```typescript
const { previewTheme, previewThemes, setPreviewTheme } = useTheme();

<select 
  value={previewTheme.id}
  onChange={(e) => setPreviewTheme(e.target.value)}
>
  {previewThemes.map(theme => (
    <option key={theme.id} value={theme.id}>
      {theme.nameAr} - {theme.description}
    </option>
  ))}
</select>
```

### مثال 3: عرض معلومات الثيم

```typescript
const { editorTheme, previewTheme } = useTheme();

<div>
  <p>المحرر: {editorTheme.nameAr}</p>
  <p>المعاينة: {previewTheme.nameAr}</p>
  <p>إصدار ثيم المعاينة: {previewTheme.version}</p>
</div>
```

---

## 🎯 الفلسفة

النظام يتبع فلسفة ARTOON:

1. **فصل المحتوى عن العرض**
   - المحرر محايد (light/dark فقط)
   - المعاينة تطبق الثيم المختار

2. **المرونة**
   - يمكن استخدام أي مزيج
   - Dark editor + Blog preview ✅
   - Light editor + Academic preview ✅

3. **القابلية للتوسع**
   - سهولة إضافة ثيمات جديدة
   - إمكانية إنشاء ثيمات مخصصة
   - API واضح وبسيط

---

## 📚 المراجع

- [RECOMMENDED-DECISIONS.md](../../PROFESSIONAL-EDITOR-PLAN/RECOMMENDED-DECISIONS.md) - القرارات الاستراتيجية
- [DUAL-THEME-IMPLEMENTATION.md](../../PROFESSIONAL-EDITOR-PLAN/DUAL-THEME-IMPLEMENTATION.md) - تقرير التنفيذ
- [types.ts](./types.ts) - تعريفات TypeScript
- [ThemeProvider.tsx](./ThemeProvider.tsx) - Implementation

---

**تاريخ الإنشاء**: 2026-01-18  
**الإصدار**: 1.0.0  
**الحالة**: ✅ مكتمل ومختبر
