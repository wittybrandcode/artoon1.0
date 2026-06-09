# ARTOON Strategic Roadmap & Improvement Plan
**Version:** 2.0 (Architect-Approved)
**Author:** Lead Software Architect
**Date:** June 2026
**Status:** AUTHORITATIVE

---

## 1. IMMEDIATE CORRECTIONS (تصحيحات فورية)
*Timeline: Next 30 days. Priority: Critical.*

### A. Security: Advanced URL & Link Sanitization
- **Issue:** Current renderer lacks protocol validation, risking XSS and tabnabbing.
- **Action:**
  - Implement a robust `sanitizeUrl` utility using the `new URL()` constructor.
  - **Protocol Whitelist:** `https:`, `http:`, `mailto:`, `tel:`, `blob:`, `data:image/`. Reject all others.
  - **Attribute Safety:** Automatically inject `rel="noopener noreferrer"` for all `target="_blank"` links to prevent Reverse Tabnabbing.
  - **Verification:** Implement automated security tests for malformed and dangerous URIs.

### B. Stability: Canonical AST Unification
- **Philosophy:** `@artoon/ast` must be the **Single Source of Truth** for the entire ecosystem (Parser, Compiler, Renderer, Editor, Linter).
- **Action:**
  - Standardize the `BaseNode` interface across all packages.
  - Eliminate all shadowed or duplicated interfaces in `@artoon/parser`.
  - Ensure strict dependency on `@artoon/ast` types for all cross-package data flow.

### C. Maintenance: Plugin-Based Renderer Architecture
- **Issue:** `BlockRenderer.tsx` is a 1500-line "God Component".
- **Action:**
  - Implement a **Renderer Plugin System**.
  - Create a `RendererRegistry` where each block type (Paragraph, List, Image, etc.) is registered as a standalone plugin.
  - Usage: `RendererRegistry.get(node.type).render(node)`.
  - This allows for easy extensibility without modifying the core renderer logic.

---

## 2. TECHNICAL EXCELLENCE (تحسينات تقنية)
*Timeline: 3-6 months.*

### A. The "Zero-Any" Policy
- **Goal:** 100% Type Safety.
- **Action:**
  - Enable ESLint `no-explicit-any` as a blocking error.
  - Automated PR rejection for any code containing `any` or unsafe type assertions.
  - Systematic refactoring to replace existing `as any` (220+ occurrences) with proper type guards and discriminated unions.

### B. High-Performance State Kernel
- **Subtree Memoization:** Add cached properties to nodes (`cachedHeight`, `cachedHash`, `cachedChildrenCount`, `cachedVersion`). Recompute only when a node or its children change.
- **Complexity:** Move from $O(n)$ to **O(changed subtree)** for document updates.
- **Incremental Rendering:** Transition from simple virtualization to **Incremental Rendering** (Notion/Figma style) for professional-grade document performance.

### C. Creation of `@artoon/core`
- **Goal:** Logic Consolidation.
- **Contents:** Centralize `escapeHtml`, `sanitizeUrl`, `normalizeText`, `slugify`, `unicode`, `bidi`, and entity encoding/decoding.
- **Dependency:** All packages MUST import these utilities from `@artoon/core` only.

---

## 3. STRATEGIC ADVANCEMENTS (تطورات استراتيجية)
*Timeline: 6-12 months.*

### A. Deep Custom Block Nesting
- **Goal:** Support arbitrary recursive depth for structural blocks (e.g., `card > note > warning > quote > code`).
- **Impact:** Positions ARTOON as a simpler, more powerful alternative to XML/DITA for complex documentation.

### B. Tree-sitter Grammar (v1.0 Priority)
- **Requirement:** This is no longer "future work" but a **v1.0 launch priority**.
- **Deliverables:** Industrial-grade syntax highlighting, incremental parsing, semantic selection, and robust IDE integration (Folding, Hover).

### C. Operations-Based Collaboration
- **Strategy:** Use **Yjs** for real-time synchronization.
- **Architecture:** Sync **Document Operations** (`InsertNode`, `DeleteNode`, `UpdateAttribute`) rather than the AST itself. This ensures optimal performance and conflict resolution.

---

## 4. ECOSYSTEM & STANDARDIZATION (المعايير والنظام البيئي)
*New Strategic Pillar: Establishing ARTOON as an Industry Standard.*

### A. Official Language Specification
- Publish a standalone **Language Specification** document independent of the TypeScript implementation.
- Establish a **Reference Test Suite** with thousands of edge cases to ensure interoperability between third-party parsers and compilers.

### B. Tooling Suite
- **artoon-prettier:** An official formatter to ensure consistent code style.
- **artoon-linter:** A static analysis tool for content quality and structural constraints.
- **ARTOON LSP:** A Language Server Protocol implementation to provide IDE features across all editors (VS Code, JetBrains, Vim).

### C. Extension Registry
- Establish an official **Plugin & Extension Registry** to prevent fragmentation and ensure all community-contributed blocks remain compatible with the core specification.

---

## 5. CORE ADVICE: "THE FORMAT IS THE PRODUCT"

> **"The format is the product; the editor is the tool."**

We must prioritize the strength of the language over the features of the editor. A strong language enables an infinite ecosystem of tools (CLI, Mobile, Web, AI-integrations). A weak language restricts us to a single editor.

---
---

# (النسخة العربية - Arabic Version)

# خارطة الطريق الاستراتيجية وخطة التحسين (ARTOON 2.0)
**الإصدار:** 2.0 (معتمد من كبير المهندسين)
**التاريخ:** يونيو 2026
**الحالة:** مرجع نهائي وملزم

---

## 1. تصحيحات فورية (عاجلة)
*الجدول الزمني: خلال 30 يوماً. الأولوية: قصوى.*

### أ. الأمان: نظام متطور لتنقية الروابط (URL Sanitization)
- **المشكلة:** غياب التحقق من البروتوكولات يعرض النظام لهجمات XSS.
- **الإجراء:**
  - استخدام `new URL()` للتحقق الصارم من الروابط.
  - **القائمة البيضاء:** السماح بـ `https:`, `http:`, `mailto:`, `tel:`, `blob:`, `data:image/` فقط.
  - **الحماية من Tabnabbing:** إضافة التوصيف `rel="noopener noreferrer"` تلقائياً لجميع الروابط التي تفتح في نافذة جديدة.

### ب. الاستقرار: توحيد الـ AST المرجعي
- **الفلسفة:** حزمة `@artoon/ast` هي **المصدر الوحيد للحقيقة**.
- **الإجراء:** توحيد واجهة `BaseNode` في جميع الحزم (المحلل، المترجم، المصيّر، المحرر) ومنع تكرار التعريفات البرمجية نهائياً.

### ج. الصيانة: معمارية المصيّر القائمة على الإضافات (Plugins)
- **الإجراء:** تحويل `BlockRenderer` من مكون ضخم إلى نظام "سجل الإضافات" (Renderer Registry). كل نوع من البلوكات يصبح إضافة مستقلة، مما يسهل التوسع دون تعديل نواة النظام.

---

## 2. التميز التقني (خلال 3-6 أشهر)

### أ. سياسة "صفر Any"
- **الهدف:** أمان برمج مئة بالمئة.
- **الإجراء:** تفعيل قواعد ESLint الصارمة لمنع `any`. أي Pull Request يحتوي عليها سيُرفض تلقائياً.

### ب. نواة الحالة عالية الأداء
- **التخزين المؤقت للـ Subtree:** إضافة خاصية التخزين المؤقت (Memoization) لكل عقدة (Hash, Version, Count). الحسابات تتم فقط عند تغيير الجزء المتأثر وليس المستند كاملاً.
- **العرض التزايدي (Incremental Rendering):** الانتقال من العرض الافتراضي البسيط إلى تقنيات العرض التزايدي الاحترافية (مثل Notion و Figma).

### ج. إنشاء حزمة `@artoon/core`
- توحيد منطق العمليات المشتركة (تشفير HTML، تنقية الروابط، معالجة النصوص، دعم الـ Bidi و Unicode) في طبقة مركزية واحدة يعتمد عليها النظام بالكامل.

---

## 3. التطورات الاستراتيجية (خلال 6-12 شهراً)

### أ. تداخل البلوكات المخصصة بعمق غير محدود
- دعم التداخل المعقد (مثلاً: بطاقة > ملاحظة > تحذير > اقتباس > كود) لجعل ARTOON أقوى بديل لـ XML في أنظمة التوثيق المعقدة.

### ب. قواعد Tree-sitter (أولوية الإصدار 1.0)
- لم تعد ميزة ثانوية، بل هي ضرورة للإطلاق. توفر تظليلاً (Highlight) فائق السرعة وتكاملاً عميقاً مع بيئات التطوير (IDEs).

### ج. التحرير التعاوني القائم على العمليات
- استخدام **Yjs** لمزامنة **عمليات المستند** (إضافة، حذف، تحريك عقدة) وليس شجرة AST كاملة، لضمان أفضل أداء وحل للتعارضات.

---

## 4. النظام البيئي والمعايير (Ecosystem & Standardization)

### أ. المواصفة الرسمية للغة
- إصدار وثيقة **Language Specification** مستقلة عن التنفيذ البرمجي، مع توفير **Reference Test Suite** لضمان توافق أي تطبيق خارجي مع معيار ARTOON.

### أ. أدوات النمط والجودة
- تطوير **artoon-prettier** للتنسيق التلقائي، و **artoon-linter** للتحقق من جودة البنية، وتوفير **ARTOON LSP** لدعم جميع محررات الأكواد العالمية.

---

## 5. النصيحة الجوهرية: "اللغة هي المنتج"

> **"اللغة هي المنتج؛ والمحرر هو مجرد أداة."**

يجب تقديم قوة اللغة وقواعدها على ميزات المحرر. اللغة القوية تفتح الباب لنظام بيئي لا نهائي من الأدوات (تطبيقات جوال، أدوات CLI، تكامل مع الذكاء الاصطناعي)، بينما اللغة الضعيفة تقيد المشروع داخل أداة واحدة.
