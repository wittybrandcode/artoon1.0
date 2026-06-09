# 03 — NON-RESPONSIBILITIES

```yaml
FILE: 03-NON-RESPONSIBILITIES.md
SYSTEM: @artoon/cli
AI_PRIORITY: CRITICAL
LAST_UPDATED: 2026-01-12
```

<!-- AI_INSTRUCTION: This file defines what CLI DOES NOT do. Critical for understanding boundaries. -->

---

## 🚫 NON-RESPONSIBILITY MATRIX

| ID | Non-Responsibility | Reason | Who Does It |
|----|-------------------|--------|-------------|
| N1 | Parsing logic | CLI is orchestrator only | @artoon/parser |
| N2 | Validation rules | CLI is orchestrator only | @artoon/validator |
| N3 | Rendering logic | CLI is orchestrator only | @artoon/renderer-html |
| N4 | AST transformation | CLI is orchestrator only | @artoon/ast |
| N5 | Semantic decisions | CLI has no domain knowledge | Core systems |
| N6 | Watch mode | CLI is single-run tool | Build tools |
| N7 | Configuration files | CLI uses command-line only | Future feature |
| N8 | Plugin system | CLI is minimal | Future feature |

---

## 🚫 N1: NO PARSING LOGIC

```typescript
// ❌ CLI NEVER DOES THIS:
function parseArtoon(text: string) {
  // Tokenize...
  // Build AST...
}

// ✅ CLI ONLY DOES THIS:
import { parse } from '@artoon/parser';
const result = parse(text);
```

### Why?

```
Parsing is complex domain logic.
CLI is just the interface.
@artoon/parser owns all parsing logic.
```

---

## 🚫 N2: NO VALIDATION RULES

```typescript
// ❌ CLI NEVER DOES THIS:
function validateNode(node) {
  if (node.direction === undefined) {
    return { error: 'Missing direction' };
  }
}

// ✅ CLI ONLY DOES THIS:
import { validate } from '@artoon/validator';
const result = validate(ast, source, options);
```

### Why?

```
Validation rules are domain knowledge.
CLI doesn't know what's valid or invalid.
@artoon/validator owns all validation logic.
```

---

## 🚫 N3: NO RENDERING LOGIC

```typescript
// ❌ CLI NEVER DOES THIS:
function renderToHtml(node) {
  if (node.nodeType === 'text') {
    return `<p>${node.content}</p>`;
  }
}

// ✅ CLI ONLY DOES THIS:
import { render } from '@artoon/renderer-html';
const html = render(ast, options);
```

### Why?

```
Rendering is complex transformation.
CLI doesn't know HTML mapping.
@artoon/renderer-html owns all rendering logic.
```

---

## 🚫 N4: NO AST TRANSFORMATION

```typescript
// ❌ CLI NEVER DOES THIS:
function transformAst(parserAst) {
  // Normalize nodes...
  // Add metadata...
}

// ✅ CLI ONLY DOES THIS:
import { transform } from '@artoon/ast';
const canonicalAst = transform(parserAst);
```

### Why?

```
AST transformation is domain logic.
CLI doesn't know AST structure.
@artoon/ast owns all transformation logic.
```

---

## 🚫 N5: NO SEMANTIC DECISIONS

```typescript
// ❌ CLI NEVER DECIDES:
// - What is a valid ARTOON document
// - How to interpret direction markers
// - What HTML element maps to what node
// - What constitutes a philosophy breach

// ✅ CLI ONLY:
// - Calls the appropriate system
// - Reports what the system returns
// - Formats output for humans/machines
```

---

## 🚫 N6: NO WATCH MODE

```bash
# ❌ CLI DOES NOT SUPPORT:
artoon watch document.artoon  # NO WATCH MODE

# ✅ USE BUILD TOOLS INSTEAD:
# nodemon, chokidar, or build system watch
nodemon --exec "artoon validate" document.artoon
```

### Why?

```
Watch mode requires:
- File system watchers
- Process management
- Debouncing

This is build tool territory, not CLI.
```

---

## 🚫 N7: NO CONFIGURATION FILES

```bash
# ❌ CLI DOES NOT READ:
# .artoonrc
# artoon.config.js
# artoon.json

# ✅ CLI USES COMMAND-LINE ONLY:
artoon validate --strict document.artoon
```

### Why?

```
Configuration files add complexity.
CLI is designed to be simple and predictable.
All options are explicit on command line.
```

---

## 🚫 N8: NO PLUGIN SYSTEM

```typescript
// ❌ CLI DOES NOT SUPPORT:
// Custom commands
// Custom validators
// Custom renderers

// ✅ CLI IS FIXED:
// parse, validate, render, lint
// That's it.
```

### Why?

```
Plugins add complexity and security concerns.
CLI is minimal by design.
Extend via programmatic API instead.
```

---

## 📊 BOUNDARY SUMMARY

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CLI BOUNDARY DIAGRAM                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│   OUTSIDE CLI (Core Systems):                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  Parsing  │  Validation  │  Rendering  │  AST Transform        │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                         │
│   INSIDE CLI:                                                           │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  File I/O  │  Orchestration  │  Output Format  │  Exit Codes   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│   ─────────────────────────────────────────────────────────────────     │
│                                                                         │
│   OUTSIDE CLI (Future/Other Tools):                                     │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  Watch Mode  │  Config Files  │  Plugins  │  IDE Integration   │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 💡 KEY PRINCIPLE

```
@artoon/cli = ORCHESTRATION ONLY

لا parsing logic
لا validation rules
لا rendering logic

فقط: File I/O + Call Systems + Format Output + Exit Codes
```
