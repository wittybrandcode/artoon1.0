# ARTOON Improvement & Correction Plan (خطة التحسين والتصحيح)
**Version:** 1.0
**Author:** Lead Software Architect
**Date:** June 2026

---

## 1. IMMEDIATE CORRECTIONS (تصحيحات فورية)
*These must be addressed within the next 30 days.*

### A. Security: URL Protocol Sanitization
- **Issue:** Link and Media components render `href` and `src` attributes without checking the protocol. This allows `javascript:alert(1)` attacks.
- **Action:** Implement a whitelist of safe protocols (`http:`, `https:`, `mailto:`, `tel:`, `data:image/`) in `@artoon/renderer-html` and `artoon-typer`.
- **Implementation:** Add a `sanitizeUrl` utility function and apply it to all link/media renderers.

### B. Stability: Resolve Parser Type Errors
- **Issue:** The `@artoon/parser` package has failing tests due to mismatched TypeScript interfaces (specifically the `line` property in `BaseNode`).
- **Action:** Standardize the `BaseNode` interface across `@artoon/ast` and `@artoon/parser`. Eliminate the shadowed types in the parser's internal definitions.

### C. Maintenance: Modularize `BlockRenderer.tsx`
- **Issue:** This file is >1500 lines, making it a "God Component". It is extremely difficult to debug or extend.
- **Action:** Decompose `BlockRenderer` into atomic component files (e.g., `TextBlock.tsx`, `MediaBlock.tsx`, `ListBlock.tsx`) under a new directory `src/ui/components/blocks/`.

---

## 2. TECHNICAL IMPROVEMENTS (تحسينات تقنية)
*Target: Next 3-6 months.*

### A. Complete Type Unification
- **Goal:** Reach 0 occurrences of `as any`.
- **Action:** Refactor the AST Builder to strictly use the Canonical AST types from `@artoon/ast`. Replace type assertions with proper type guards.

### B. Performance Optimization
- **Goal:** Improve responsiveness for documents >500 nodes.
- **Action:**
  - Implement memoization for `nodeSize` calculations in `@artoon/state`.
  - Use virtualization (e.g., `react-window`) for the block list in the Typer editor.
  - Switch recursive traversals to iterative stacks where possible.

### C. Logic Consolidation
- **Goal:** Single source of truth for utility logic.
- **Action:** Move the `escapeHtml` logic into a shared `@artoon/utils` package or keep it only in `@artoon/ast` to be used by both `renderer-html` and `typer`.

---

## 3. STRATEGIC ADVANCEMENTS (تطورات استراتيجية)
*Target: 6-12 months.*

### A. Full Custom Block Nesting
- **Goal:** Allow `<card>.<note>.content.<note>.<card>`.
- **Action:** Upgrade the Context Stack in `@artoon/parser` to support arbitrary recursive depth for custom block types.

### B. Tree-sitter Grammar
- **Goal:** Industrial-grade parsing for IDEs and high-performance editors.
- **Action:** Create an official Tree-sitter ARTOON grammar. This will provide instantaneous syntax highlighting and better error recovery in the VS Code extension.

### C. Collaborative Editing
- **Goal:** Real-time collaboration.
- **Action:** Integrate **Yjs** or **Automerge** with the `@artoon/state` kernel to support multi-user editing.

---

## 4. ADVICE FOR THE TEAM (نصائح للفريق)

1.  **"Core First" Philosophy:** Never add a feature to the editor (`typer`) before it is fully specified in `@artoon/ast` and `@artoon/parser`. The format is the product; the editor is the tool.
2.  **AI Validation:** Continuously run "Adversarial AI" tests. Ask an LLM to try and break the format syntax and use the results to harden the parser's error recovery.
3.  **Community Standards:** Before the public launch, ensure every public API has TSDoc comments. High-quality documentation is the only way a new language survives.
4.  **Bidi Testing:** Make Arabic (RTL) the default testing direction. If it works in Arabic, it will work in English. If you test only in English, you will break the Bidi logic.

---
---

# (النسخة العربية - Arabic Version)

# خطة التحسين والتصحيح لمشروع ARTOON
**الإصدار:** 1.0
**التاريخ:** يونيو 2026

---

## 1. تصحيحات فورية (عاجلة)
*يجب تنفيذها خلال الـ 30 يوماً القادمة.*

### أ. الأمان: تنقية روابط URL
- **المشكلة:** يتم عرض الروابط دون التحقق من البروتوكول، مما يسمح بهجمات XSS عبر `javascript:`.
- **الإجراء:** إعداد قائمة بيضاء للبروتوكولات المسموحة (`http`, `https`, إلخ) في حزم العرض والمحرر.

### ب. الاستقرار: إصلاح أخطاء الأنواع (Types) في المحلل
- **المشكلة:** وجود تعارض في تعريف واجهة `BaseNode` يؤدي لفشل الاختبارات البرمجية.
- **الإجراء:** توحيد واجهات البرمجة بين حزمة `AST` وحزمة `Parser` بشكل نهائي وحذف التعريفات المكررة.

### ج. الصيانة: تفكيك ملف `BlockRenderer.tsx`
- **المشكلة:** الملف ضخم جداً (أكثر من 1500 سطر) مما يجعله "نقطة فشل مركزية".
- **الإجراء:** تقسيم المكون إلى ملفات صغيرة ومنفصلة لكل نوع من أنواع البلوكات.

---

## 2. تحسينات تقنية (المدى المتوسط)
*الهدف: خلال 3-6 أشهر.*

### أ. توحيد الأنواع البرمجية بالكامل
- **الهدف:** الوصول إلى صفر استخدام لتعبيرات `as any`.
- **الإجراء:** إعادة بناء "باني الـ AST" ليعتمد بشكل صارم على الأنواع الموحدة واستخدام "حراس الأنواع" (Type Guards).

### ب. تحسين الأداء
- **الهدف:** سلاسة المحرر في المستندات الضخمة.
- **الإجراء:** استخدام تقنيات التخزين المؤقت (Memoization) لحسابات أحجام العقد، واستخدام العرض الافتراضي (Virtualization) للقوائم الطويلة.

---

## 3. نصائح استراتيجية للفريق

1.  **فلسفة "النواة أولاً":** لا تضف أي ميزة للمحرر المرئي قبل أن يتم توثيقها وبرمجتها بالكامل في حزمة اللغة (Parser) وحزمة الهيكل (AST). اللغة هي المنتج الحقيقي، والمحرر هو مجرد أداة.
2.  **اختبارات الذكاء الاصطناعي العدائية:** اطلب من نماذج الذكاء الاصطناعي محاولة "كسر" قواعد اللغة واستخدم النتائج لتقوية قدرة المحلل على التعافي من الأخطاء.
3.  **أولوية اللغة العربية:** اجعل الاتجاه من اليمين إلى اليسار (RTL) هو الاتجاه الافتراضي للاختبارات. إذا نجحت الميزة في العربية، ستنجح حتماً في الإنجليزية.

---
