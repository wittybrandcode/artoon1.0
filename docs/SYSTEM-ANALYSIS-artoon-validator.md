# System Analysis Report: `@artoon/validator`

> ARTOON document validator — semantic, structural, and philosophy rule enforcement.

---

## 1. Executive Summary

| Attribute | Value |
|-----------|-------|
| **Package** | `@artoon/validator` |
| **Version** | `2.0.0` (exports `VERSION = '1.0.0'`) |
| **Role** | Validate ARTOON documents against syntax, structure, semantic, constraint, and philosophy rules |
| **Status** | ✅ Functional, limited test coverage |
| **Lines of Code** | ~900 (src/) |

**Verdict:** A **well-designed validator with a powerful rule engine** and unique "philosophy breach" concept. However, it has **only 2 test files** for a validation system, which is insufficient for a tool that enforces correctness.

---

## 2. Architecture Overview

```
src/
├── index.ts           # Main entry — validate(), isValid(), validateStrict(), formatReport()
├── types.ts           # Validation types, error codes, attribute rules, philosophy keywords
├── engine/
│   └── index.ts       # Rule runner, result categorizer, report formatter
├── rules/
│   ├── index.ts       # Rule exports
│   ├── syntax.ts      # Syntax validation rules
│   ├── structure.ts   # Structure validation rules
│   ├── semantic.ts    # Semantic validation rules (~250 lines)
│   ├── constraint.ts  # Constraint validation rules
│   └── philosophy.ts  # Philosophy breach detection (~160 lines)
└── errors/
    └── index.ts       # Error utilities, templates, ERROR_CODES
```

### Pipeline

```
ARTOON Source + AST
    ↓
[Validation Engine] — validate()
    ↓
[Rule Categories] — run sequentially:
  1. Syntax Rules
  2. Structure Rules
  3. Semantic Rules
  4. Constraint Rules
  5. Philosophy Rules
    ↓
[Parser Errors] — merged from AST.errors
    ↓
[Categorization] — errors / warnings / philosophy breaches
    ↓
ValidationResult { valid, errors, warnings, philosophyBreaches, stats }
```

---

## 3. Rule System

### Rule Categories

| Category | Rules | Purpose |
|----------|-------|---------|
| **Syntax** | Missing space after separator, unclosed bracket, invalid direction marker, malformed component | Basic syntax correctness |
| **Structure** | Unclosed block, mismatched block name, orphan list item, invalid nesting, empty compound | Document structure integrity |
| **Semantic** | Modifier on non-text, invalid attribute, missing required attribute, unknown component, invalid modifier | Component semantics |
| **Constraint** | Inline list, nested inline, empty component | Format constraints |
| **Philosophy** | Presentation leak, behavior leak, semantic violation | ARTOON philosophy enforcement |

### Error Code System

```typescript
const ERROR_CODES = {
  // Syntax: SYN001-SYN004
  // Structure: STR001-STR005
  // Semantic: SEM001-SEM005
  // Constraint: CON001-CON003
  // Philosophy: PHI001-PHI003
};
```

**Each error includes:**
- `code` — machine-readable identifier
- `category` — rule category
- `severity` — error | warning | philosophy
- `line`, `column` — location
- `what` — what happened
- `why` — why it's an error
- `suggestion` — how to fix it

---

## 4. Philosophy Validation ⭐⭐⭐⭐⭐

This is the **unique differentiator** of ARTOON's validator.

### Presentation Leak Detection

```typescript
const PRESENTATION_KEYWORDS = [
  'color', 'font', 'size', 'style', 'class', 'css',
  'background', 'border', 'margin', 'padding',
  'width', 'height', 'display', 'position'
];
```

**Purpose:** Detects when presentation information leaks into semantic content. ARTOON describes "what it is" not "how it looks."

### Behavior Leak Detection

```typescript
const BEHAVIOR_KEYWORDS = [
  'onclick', 'onhover', 'onmouse', 'onkey', 'onfocus',
  'onload', 'onsubmit', 'onchange', 'oninput',
  'javascript:', 'href="#"'
];
```

**Purpose:** Detects JavaScript/behavior embedded in content.

**Smart exclusion:** Skips content inside code blocks (`isInsideCodeBlock` check).

---

## 5. Semantic Rules (`rules/semantic.ts`)

### Modifier Applicability Check

**Dual validation:** Checks both source text (regex) and AST (type guards):

```typescript
// Source check: catches parser-rejected combinations
const pattern = /\[([seu]|mark|sub|sup)(\+([seu]|mark|sub|sup))*\+img::/i;

// AST check: catches any that slipped through
if (item.modifiers.length > 0 && NO_MODIFIER.includes(component)) { ... }
```

### Required Attributes

```typescript
const REQUIRED_ATTRIBUTES = {
  img: ['path'], audio: ['path'], video: ['path'],
  file: ['path'], a: ['url'], abbr: ['short', 'full'],
  time: ['datetime'], c: ['code']
};
```

---

## 6. Public API

| Function | Purpose |
|----------|---------|
| `validate(ast, source?, options?)` | Full validation with all rules |
| `isValid(ast, source?)` | Quick true/false check |
| `validateStrict(ast, source?)` | Throws on any error |
| `formatReport(result)` | Human-readable report |

### Options

```typescript
interface ValidationOptions {
  strict?: boolean;           // Treat warnings as errors
  allowEmptyComponents?: boolean;
  checkPhilosophy?: boolean;  // Default: true
}
```

---

## 7. Test Coverage Assessment

| Test File | Tests | Focus |
|-----------|-------|-------|
| `integration.test.ts` | ~15 | End-to-end validation |
| `rules.test.ts` | ~18 | Individual rule testing |

**Total: ~33 tests**

**Critical Gap:** Only 2 test files for 5 rule categories. Each rule file should have its own test file.

---

## 8. Issues & Recommendations

### 🟡 Important

| # | Issue | Location | Impact | Fix |
|---|-------|----------|--------|-----|
| 1 | **`VERSION = '1.0.0'`** | `index.ts:29` | Version mismatch | Update to `'2.0.0'` |
| 2 | **Error messages in Arabic** | `rules/*.ts` | Inconsistent with English-first policy | Translate or provide bilingual |
| 3 | **Only 2 test files** | `tests/` | Insufficient coverage | Add tests per rule category |
| 4 | **No custom rule API** | — | Users can't add their own rules | Add `addRule()` API |

### 🟢 Enhancement

| # | Suggestion | Value |
|---|------------|-------|
| 5 | Add fix/suggestion auto-application | Auto-correct errors |
| 6 | Add severity override per rule | Fine-grained control |
| 7 | Add JSON output format | CI/CD integration |

---

## 9. Integration Points

### Consumers

| Package | Usage |
|---------|-------|
| `artoon-cli` | `validate` command |
| `artoon-editor-state` | Peer dependency (optional) — for editor validation |
| `vscode-artoon` | Real-time validation (mentioned in README) |

### Dependencies

```
artoon-validator
├── @artoon/parser (runtime)
└── @artoon/ast (runtime)
```

---

## 10. Scorecard

| Category | Score | Notes |
|----------|-------|-------|
| Rule Engine Design | 9/10 | Clean categorization, error codes, context-based |
| Philosophy Validation | 10/10 | Unique and powerful concept |
| Error Messages | 8/10 | what/why/suggestion format is excellent |
| Test Coverage | 4/10 | Only 2 files for 5 rule categories |
| Extensibility | 5/10 | No custom rule API |
| Documentation | 5/10 | Minimal README |
| **Overall** | **6.8/10** | Powerful but under-tested |

---

## 11. Action Items for Roadmap

### Phase 2 (Complete Existing Systems)
- [ ] Fix `VERSION` constant
- [ ] Translate error messages to English (or bilingual)
- [ ] Add dedicated test files for each rule category
- [ ] Add custom rule API

### Phase 3 (State Unification)
- [ ] Integrate with `artoon-state` for real-time validation
- [ ] Add validation as a plugin

---

*Analysis completed: 2026-04-27*
*Analyst: Qoder*
